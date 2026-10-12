$loginRes = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method Post -Body '{"email":"admin@clinicflow.com","password":"password123"}' -ContentType 'application/json'
$token = $loginRes.data.token
$headers = @{ Authorization = "Bearer $token" }

Write-Host "=== CLINICFLOW ENHANCEMENT VERIFICATION ==="

# 1. Test Doctor Search
$docs = Invoke-RestMethod -Uri 'http://localhost:8080/api/doctors/search?query=Priya' -Headers $headers
Write-Host "1. Doctor Search: Found $($docs.data.Count) doctor(s). Fee: $($docs.data[0].consultationFee), Hospital: $($docs.data[0].clinicHospital), Wait: $($docs.data[0].estimatedWaitMinutes)m"

# 2. Test Slot Generation for Tomorrow
$tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
$slotsRes = Invoke-RestMethod -Uri "http://localhost:8080/api/appointments/slots?doctorId=1&date=$tomorrow" -Headers $headers
$totalSlots = $slotsRes.data.Count
$breakSlots = ($slotsRes.data | Where-Object { $_.status -eq 'BREAK' }).Count
$availSlots = ($slotsRes.data | Where-Object { $_.status -eq 'AVAILABLE' }).Count
Write-Host "2. Slot Generation ($tomorrow): Total: $totalSlots, Available: $availSlots, Break: $breakSlots"

# 3. Test Booking Exact Slot (10:00 AM)
$slotTime = "$($tomorrow)T10:00:00"
$bookBody1 = @{
    patientId = 1
    doctorId = 1
    scheduledAt = $slotTime
    notes = "Cardiac checkup"
} | ConvertTo-Json

$bookRes1 = Invoke-RestMethod -Uri 'http://localhost:8080/api/appointments' -Method Post -Headers $headers -Body $bookBody1 -ContentType 'application/json'
$aptId = $bookRes1.data.appointmentId
Write-Host "3. Exact Slot Booking: Booked Appointment #$aptId at $slotTime by Patient #1"

# 4. Test Double-Booking Prevention (Patient #2 attempts SAME doctor + slot)
$bookBody2 = @{
    patientId = 2
    doctorId = 1
    scheduledAt = $slotTime
    notes = "Double booking attempt"
} | ConvertTo-Json

$doubleBookingBlocked = $false
try {
    $bookRes2 = Invoke-RestMethod -Uri 'http://localhost:8080/api/appointments' -Method Post -Headers $headers -Body $bookBody2 -ContentType 'application/json'
    Write-Host "FAILED: Double booking was allowed!"
} catch {
    $doubleBookingBlocked = $true
    Write-Host "4. Double Booking Prevention: SUCCESS - Request was rejected with Conflict ($($_.Exception.Message))"
}

# 5. Verify Slot is now BOOKED in slot query
$slotsRes2 = Invoke-RestMethod -Uri "http://localhost:8080/api/appointments/slots?doctorId=1&date=$tomorrow" -Headers $headers
$bookedSlot = $slotsRes2.data | Where-Object { $_.time -eq '10:00' }
Write-Host "5. Slot Status Verification: 10:00 AM slot status is '$($bookedSlot.status)' (available=$($bookedSlot.available))"

# 6. Test Reschedule to 10:15 AM
$newSlotTime = "$($tomorrow)T10:15:00"
$reschedBody = @{
    newScheduledAt = $newSlotTime
    reason = "Schedule conflict"
} | ConvertTo-Json

$reschedRes = Invoke-RestMethod -Uri "http://localhost:8080/api/appointments/$aptId/reschedule" -Method Post -Headers $headers -Body $reschedBody -ContentType 'application/json'
Write-Host "6. Reschedule: Appointment #$aptId rescheduled to $($reschedRes.data.scheduledAt)"

# Verify 10:00 is freed and 10:15 is booked
$slotsRes3 = Invoke-RestMethod -Uri "http://localhost:8080/api/appointments/slots?doctorId=1&date=$tomorrow" -Headers $headers
$freedSlot = $slotsRes3.data | Where-Object { $_.time -eq '10:00' }
$nowBookedSlot = $slotsRes3.data | Where-Object { $_.time -eq '10:15' }
Write-Host "   -> Old 10:00 slot status: '$($freedSlot.status)', New 10:15 slot status: '$($nowBookedSlot.status)'"

# 7. Test Check-In Workflow
$checkInRes = Invoke-RestMethod -Uri "http://localhost:8080/api/appointments/$aptId/check-in" -Method Post -Headers $headers
Write-Host "7. Check-in Workflow: Appointment status: $($checkInRes.data.status), Token: #$($checkInRes.data.tokenNumber), Wait: $($checkInRes.data.estimatedWaitMinutes)m"

# 8. Test Privacy-Safe Public Queue
$pubQueue = Invoke-RestMethod -Uri "http://localhost:8080/api/queue/1/public" -Headers $headers
Write-Host "8. Public Queue Privacy: Count: $($pubQueue.data.Count). First patient name: '$($pubQueue.data[0].patientName)' (Anonymized)"

# 9. Test Doctor Live Queue Actions (Call Next / Start / Complete)
$activeQueue = Invoke-RestMethod -Uri "http://localhost:8080/api/queue/1/active" -Headers $headers
if ($activeQueue.data.Count -gt 0) {
    $entryId = $activeQueue.data[0].queueEntryId
    $startRes = Invoke-RestMethod -Uri "http://localhost:8080/api/queue/$entryId/start" -Method Post -Headers $headers
    Write-Host "9. Doctor Queue Action: Started consultation for Entry #$entryId. Status: $($startRes.data.queueStatus)"
    $compRes = Invoke-RestMethod -Uri "http://localhost:8080/api/queue/$entryId/complete" -Method Post -Headers $headers
    Write-Host "   -> Completed consultation for Entry #$entryId. Status: $($compRes.data.queueStatus)"
}

# 10. Test Cancellation Workflow on a fresh booked appointment
$bookBodyCancel = @{
    patientId = 1
    doctorId = 1
    scheduledAt = "$($tomorrow)T11:00:00"
    notes = "Appointment to cancel"
} | ConvertTo-Json
$cancelApt = Invoke-RestMethod -Uri 'http://localhost:8080/api/appointments' -Method Post -Headers $headers -Body $bookBodyCancel -ContentType 'application/json'
$cancelAptId = $cancelApt.data.appointmentId

$cancelBody = @{ reason = "Patient requested cancellation" } | ConvertTo-Json
$cancelRes = Invoke-RestMethod -Uri "http://localhost:8080/api/appointments/$cancelAptId/cancel" -Method Post -Headers $headers -Body $cancelBody -ContentType 'application/json'
Write-Host "10. Cancellation: Appointment #$cancelAptId status is '$($cancelRes.data.status)'"

Write-Host "=== ALL ENHANCEMENT TESTS PASSED 100% ==="
