# ClinicFlow AI: Clinic Creation & Multi-Tenant Validation Test

$BaseUrl = "http://localhost:8080/api"

Write-Host "=== TEST 1: Retrieve All Clinics ===" -ForegroundColor Cyan
$clinicsResp = Invoke-RestMethod -Uri "$BaseUrl/clinics" -Method Get
Write-Host "Found $($clinicsResp.data.Count) registered clinics:"
foreach ($c in $clinicsResp.data) {
    Write-Host " - [$($c.clinicIdentifier)] $($c.clinicName) (ID: $($c.clinicId), Status: $($c.status))"
}

if ($clinicsResp.data.Count -lt 3) {
    Write-Error "Expected at least 3 clinics"
    exit 1
}

Write-Host "`n=== TEST 2: Create New Clinic ===" -ForegroundColor Cyan
$newClinic = @{
    clinicName = "Lotus Specialty Heart Center"
    clinicIdentifier = "CLINIC-CARDIO-004"
    contactInformation = "+91-80-99887766 / cardiology@lotuscare.com"
    address = "Cardio Wing, Floor 4, Indiranagar, Bangalore 560038"
    status = "ACTIVE"
} | ConvertTo-Json

$createResp = Invoke-RestMethod -Uri "$BaseUrl/clinics" -Method Post -Body $newClinic -ContentType "application/json"
Write-Host "Created Clinic: $($createResp.data.clinicName) (ID: $($createResp.data.clinicId), Identifier: $($createResp.data.clinicIdentifier))"

if ($createResp.data.clinicIdentifier -ne "CLINIC-CARDIO-004") {
    Write-Error "Failed to verify created clinic identifier"
    exit 1
}

Write-Host "`n=== TEST 3: Duplicate Clinic Identifier Rejection ===" -ForegroundColor Cyan
try {
    $dupResp = Invoke-RestMethod -Uri "$BaseUrl/clinics" -Method Post -Body $newClinic -ContentType "application/json"
    Write-Error "Duplicate identifier should have been rejected!"
    exit 1
} catch {
    Write-Host "Duplicate clinic identifier successfully rejected with HTTP $($_.Exception.Response.StatusCode)" -ForegroundColor Green
}

Write-Host "`n=== TEST 4: Get Clinic By Identifier ===" -ForegroundColor Cyan
$getByIdentifier = Invoke-RestMethod -Uri "$BaseUrl/clinics/identifier/CLINIC-CARDIO-004" -Method Get
Write-Host "Retrieved Clinic: $($getByIdentifier.data.clinicName), Address: $($getByIdentifier.data.address)"

Write-Host "`n=== ALL CLINIC FOUNDATION TESTS PASSED 100% ===" -ForegroundColor Green
