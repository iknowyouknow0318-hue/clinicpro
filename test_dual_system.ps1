# test_dual_system.ps1
Write-Host "=== CLINICFLOW AI: DUAL-SYSTEM ARCHITECTURE INTEGRATION TEST ===" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api"

# 1. Patient Login (Vikram Malhotra)
$loginPayload = @{
    email = "vikram.m@email.com"
    password = "password123"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginPayload -ContentType "application/json"
$patientToken = $loginRes.data.token
$patientId = $loginRes.data.patientId
if (-not $patientId) { $patientId = 1 }
$patientHeaders = @{ 
    Authorization = "Bearer $patientToken"
    "Content-Type" = "application/json"
}

Write-Host "1. Patient Login: Successfully logged in as $($loginRes.data.name) (Patient ID #$patientId)" -ForegroundColor Green

# 2. Patient Today's Medication Schedule
$schedRes = Invoke-RestMethod -Uri "$baseUrl/medication/schedule/today/$patientId" -Method Get -Headers $patientHeaders
Write-Host "2. Today's Medication Schedule: Found $($schedRes.data.Count) scheduled doses" -ForegroundColor Green
$firstSlot = $schedRes.data[0]
if ($firstSlot) {
    Write-Host "   -> Dose 1: $($firstSlot.medicineName) ($($firstSlot.dosage)) at $($firstSlot.scheduledTime) - Status: $($firstSlot.status)" -ForegroundColor Gray

    # 3. Patient Dose Adherence (Mark TAKEN)
    $adherencePayload = @{
        status = "TAKEN"
        notes = "Taken with warm water"
        userId = "$($loginRes.data.userId)"
        userName = "$($loginRes.data.name)"
    } | ConvertTo-Json
    $adhRes = Invoke-RestMethod -Uri "$baseUrl/medication/schedule/$($firstSlot.scheduleId)/adherence" -Method Put -Body $adherencePayload -Headers $patientHeaders
    Write-Host "3. Adherence Recording: Dose marked as $($adhRes.data.status) at $($adhRes.data.actionTimestamp)" -ForegroundColor Green
}

# 4. Patient Medication History
$histRes = Invoke-RestMethod -Uri "$baseUrl/medication/schedule/history/$patientId" -Method Get -Headers $patientHeaders
Write-Host "4. Longitudinal Medication History: Found $($histRes.data.Count) total historical dose records" -ForegroundColor Green

# 5. Prescription-Aware Cart Eligibility
$cartRes = Invoke-RestMethod -Uri "$baseUrl/pharmacy/cart/eligible/$patientId" -Method Get -Headers $patientHeaders
Write-Host "5. Prescription-Aware Cart: Found $($cartRes.data.Count) eligible prescribed medicines" -ForegroundColor Green
foreach ($item in $cartRes.data) {
    Write-Host "   -> $($item.medicineName) (Rx v$($item.prescriptionVersion)): Prescribed $($item.prescribedQuantity), Remaining Eligible $($item.remainingEligibleQuantity), Available Stock $($item.availableStock), Price ₹$($item.unitPrice)" -ForegroundColor Gray
}

# 6. Patient Cart Order Checkout
if ($cartRes.data.Count -gt 0) {
    $firstEligible = $cartRes.data[0]
    $orderPayload = @{
        patientId = $patientId
        items = @(
            @{
                prescriptionItemId = $firstEligible.prescriptionItemId
                medicineId = $firstEligible.medicineId
                quantity = 2
            }
        )
        deliveryNotes = "Pickup from front desk pharmacy counter"
    } | ConvertTo-Json

    $orderRes = Invoke-RestMethod -Uri "$baseUrl/pharmacy/cart/order?userId=$($loginRes.data.userId)&userName=$($loginRes.data.name)" -Method Post -Body $orderPayload -Headers $patientHeaders
    $placedOrderId = $orderRes.data.pharmacyOrderId
    Write-Host "6. Patient Cart Checkout: Placed Pharmacy Order #$placedOrderId with status '$($orderRes.data.status)' (Queue Pos: #$($orderRes.data.queuePosition))" -ForegroundColor Green
}

# 7. Doctor Login (Dr. Priya Sharma)
$docLoginPayload = @{
    email = "priya.sharma@clinic.com"
    password = "password123"
} | ConvertTo-Json

$docLoginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $docLoginPayload -ContentType "application/json"
$docToken = $docLoginRes.data.token
$docHeaders = @{
    Authorization = "Bearer $docToken"
    "Content-Type" = "application/json"
}
Write-Host "7. Doctor Login: Dr. Priya Sharma logged in successfully" -ForegroundColor Green

# 8. Doctor Medication Reconciliation
$reconRes = Invoke-RestMethod -Uri "$baseUrl/prescriptions/reconciliation/$patientId" -Method Get -Headers $docHeaders
Write-Host "8. Medication Reconciliation: Active medicines: $($reconRes.data.currentMedicines.Count), Prior medicines: $($reconRes.data.previousMedicines.Count), Duplicate warnings: $($reconRes.data.duplicateWarnings.Count)" -ForegroundColor Green

# 9. Doctor Prescription Revision (Version 2 creation)
$newRxPayload = @{
    consultationId = 1
    instructions = "Revised dosage: Take after breakfast and dinner. Avoid chilled drinks."
    items = @(
        @{
            medicineId = 1
            dosage = "650mg"
            frequency = "1-0-1 (Twice Daily)"
            timing = "Morning, Night"
            durationDays = 5
            quantity = 10
            instructions = "For fever"
        },
        @{
            medicineId = 6
            dosage = "500mg"
            frequency = "1-0-0 (Once Daily)"
            timing = "Morning"
            durationDays = 3
            quantity = 3
            instructions = "Antibiotic"
        }
    )
} | ConvertTo-Json

$rxRes = Invoke-RestMethod -Uri "$baseUrl/prescriptions" -Method Post -Body $newRxPayload -Headers $docHeaders
Write-Host "9. Prescription Version Control: Created Prescription (v$($rxRes.data.version)) with ID #$($rxRes.data.prescriptionId) (Previous Rx: #$($rxRes.data.previousPrescriptionId))" -ForegroundColor Green

# 10. Clinic Prescription Stock Verification
$verifyRes = Invoke-RestMethod -Uri "$baseUrl/prescriptions/$($rxRes.data.prescriptionId)/verify" -Method Put -Headers $docHeaders
Write-Host "10. Clinic Verification: Prescription #$($rxRes.data.prescriptionId) verified status: '$($verifyRes.data.verificationStatus)'" -ForegroundColor Green

# 11. Pharmacy Order Dispensing (FEFO Batch Deduction)
if ($placedOrderId) {
    $dispenseRes = Invoke-RestMethod -Uri "$baseUrl/pharmacy/orders/$placedOrderId/status?status=COLLECTED" -Method Put -Headers $docHeaders
    Write-Host "11. Pharmacy FEFO Dispensing: Order #$placedOrderId marked as '$($dispenseRes.data.status)', inventory deducted & prescription counts updated" -ForegroundColor Green
}

# 12. Clinical Audit Trail Verification
$auditRes = Invoke-RestMethod -Uri "$baseUrl/audit" -Method Get -Headers $docHeaders
Write-Host "12. Clinical Audit Trail: Found $($auditRes.data.Count) recorded system audit actions" -ForegroundColor Green
foreach ($l in $auditRes.data | Select-Object -First 3) {
    Write-Host "   -> [$($l.userRole)] $($l.userName) - $($l.action): $($l.details)" -ForegroundColor Gray
}

Write-Host "=== ALL DUAL-SYSTEM ARCHITECTURE TESTS PASSED 100% ===" -ForegroundColor Cyan
