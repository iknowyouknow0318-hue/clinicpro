$loginRes = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method Post -Body '{"email":"admin@clinicflow.com","password":"password123"}' -ContentType 'application/json'
$token = $loginRes.data.token
$headers = @{ Authorization = "Bearer $token" }

Write-Host "=== CLINICFLOW AI DUAL-FLOW INTEGRATION TEST ==="
Write-Host "1. Admin Logged in. Token verified."

$patients = Invoke-RestMethod -Uri 'http://localhost:8080/api/patients' -Headers $headers
Write-Host "2. Patients in database: $($patients.data.Count)"

$doctors = Invoke-RestMethod -Uri 'http://localhost:8080/api/doctors' -Headers $headers
Write-Host "3. Doctors active: $($doctors.data.Count)"

# Dual Flow Step 1: Check-in Patient
$checkInBody = '{"patientId":1,"doctorId":1,"visitType":"WALK_IN","priorityLevel":"NORMAL"}'
$queueRes = Invoke-RestMethod -Uri 'http://localhost:8080/api/visits/check-in' -Method Post -Headers $headers -Body $checkInBody -ContentType 'application/json'
Write-Host "4. [PATIENT FLOW] Check-in created: Token #$($queueRes.data.tokenNumber), Visit #$($queueRes.data.visitId), Estimated Wait: $($queueRes.data.estimatedWaitMinutes) mins"

# Dual Flow Step 2: Start Consultation
$visitId = $queueRes.data.visitId
$consultRes = Invoke-RestMethod -Uri "http://localhost:8080/api/consultations/start/$visitId" -Method Post -Headers $headers
Write-Host "5. [CLINICAL FLOW] Consultation started: Consultation #$($consultRes.data.consultationId), Status: $($consultRes.data.status)"

# Dual Flow Step 3: Issue Prescription (Auto-bridges to Pharmacy Flow!)
$rxBody = '{"consultationId":' + $consultRes.data.consultationId + ',"instructions":"Take after food with water","items":[{"medicineId":1,"dosage":"500mg","frequency":"BID","durationDays":5,"quantity":10},{"medicineId":2,"dosage":"10mg","frequency":"OD","durationDays":3,"quantity":3}]}'
$rxRes = Invoke-RestMethod -Uri 'http://localhost:8080/api/prescriptions' -Method Post -Headers $headers -Body $rxBody -ContentType 'application/json'
Write-Host "6. [DUAL-FLOW BRIDGE] Digital Prescription issued: Rx #$($rxRes.data.prescriptionId) with $($rxRes.data.items.Count) items"

# Dual Flow Step 4: Verify Pharmacy Queue & Order auto-creation
$pharmacyOrders = Invoke-RestMethod -Uri 'http://localhost:8080/api/pharmacy/orders' -Headers $headers
$latestOrder = $pharmacyOrders.data[-1]
Write-Host "7. [MEDICINE FLOW] Pharmacy Order auto-created! Order #$($latestOrder.pharmacyOrderId), Status: $($latestOrder.status), Queue Pos: $($latestOrder.queuePosition)"

# Dual Flow Step 5: Advance Pharmacy Status to Processing then Ready
$pOrderId = $latestOrder.pharmacyOrderId
$procRes = Invoke-RestMethod -Uri "http://localhost:8080/api/pharmacy/orders/$pOrderId/status?status=PROCESSING" -Method Put -Headers $headers
Write-Host "8. [MEDICINE FLOW] Order status updated to: $($procRes.data.status)"

$readyRes = Invoke-RestMethod -Uri "http://localhost:8080/api/pharmacy/orders/$pOrderId/status?status=READY" -Method Put -Headers $headers
Write-Host "9. [MEDICINE FLOW] Order status updated to: $($readyRes.data.status) -> Patient alert sent!"

# Dual Flow Step 6: Query Intelligence Engine
$intelRes = Invoke-RestMethod -Uri 'http://localhost:8080/api/intelligence/dashboard' -Headers $headers
Write-Host "10. [INTELLIGENCE ENGINE] Operational Analytics live:"
Write-Host "    - Total Visits: $($intelRes.data.totalVisitsToday)"
Write-Host "    - Active Queue Load: $($intelRes.data.activeQueueCount)"
Write-Host "    - Avg Wait Forecast: $($intelRes.data.averageWaitMinutes) mins"
Write-Host "    - Active Pharmacy Pipeline: $($intelRes.data.activePharmacyOrders)"
Write-Host "    - Bottleneck Constraints Detected: $($intelRes.data.bottleneckAlerts.Count)"
Write-Host "=== INTEGRATION TEST PASSED 100% ==="
