package com.clinicflow.config;

import com.clinicflow.entity.*;
import com.clinicflow.repository.*;
import com.clinicflow.service.AuditService;
import com.clinicflow.service.MedicationScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;

/**
 * Seeds the H2 database with demo data on application startup.
 * This only runs when no users exist in the database (first run).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ClinicRepository clinicRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final StaffRepository staffRepository;
    private final MedicineRepository medicineRepository;
    private final MedicineInventoryRepository inventoryRepository;
    private final AppointmentRepository appointmentRepository;
    private final ConsultationRepository consultationRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final VisitRepository visitRepository;
    private final MedicationScheduleService medicationScheduleService;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initialization.");
            return;
        }

        log.info("=== Seeding ClinicFlow AI Database ===");

        // --- Clinics ---
        Clinic mainClinic = clinicRepository.save(Clinic.builder()
                .clinicName("City Care Central Clinic")
                .clinicIdentifier("CLINIC-MAIN-001")
                .contactInformation("+91-80-23456789 / info@citycare.com")
                .address("Main Healthcare Block, Floor 2, 42 MG Road, Bangalore 560001")
                .status(Clinic.Status.ACTIVE)
                .build());

        Clinic pedClinic = clinicRepository.save(Clinic.builder()
                .clinicName("Rainbow Children Wing")
                .clinicIdentifier("CLINIC-PED-002")
                .contactInformation("+91-80-23456790 / pediatrics@citycare.com")
                .address("Pediatrics Wing, Floor 1, 15 Anna Nagar, Chennai 600040")
                .status(Clinic.Status.ACTIVE)
                .build());

        Clinic dermClinic = clinicRepository.save(Clinic.builder()
                .clinicName("Skin & Aesthetics Suite")
                .clinicIdentifier("CLINIC-DERM-003")
                .contactInformation("+91-80-23456791 / derma@citycare.com")
                .address("Dermatology Suite, Floor 3, 88 Banjara Hills, Hyderabad 500034")
                .status(Clinic.Status.ACTIVE)
                .build());

        log.info("Created {} clinics", clinicRepository.count());

        String encodedPassword = passwordEncoder.encode("password123");

        // --- Users ---
        createUser("Dr. Admin Kumar", "+91-9876543210", "admin@clinicflow.com", encodedPassword, User.Role.ADMIN, mainClinic);
        createUser("Sujan S (Staff & Admin)", "+91-9876500000", "sgsrsujan@gmail.com", encodedPassword, User.Role.ADMIN, mainClinic);
        User doc1 = createUser("Dr. Priya Sharma", "+91-9876543211", "priya.sharma@clinic.com", encodedPassword, User.Role.DOCTOR, mainClinic);
        User doc2 = createUser("Dr. Rahul Patel", "+91-9876543212", "rahul.patel@clinic.com", encodedPassword, User.Role.DOCTOR, pedClinic);
        User doc3 = createUser("Dr. Ananya Desai", "+91-9876543213", "ananya.desai@clinic.com", encodedPassword, User.Role.DOCTOR, dermClinic);
        User rec1 = createUser("Meera Nair", "+91-9876543214", "meera.nair@clinic.com", encodedPassword, User.Role.RECEPTIONIST, mainClinic);
        User rec2 = createUser("Arjun Singh", "+91-9876543215", "arjun.singh@clinic.com", encodedPassword, User.Role.RECEPTIONIST, pedClinic);
        User pharma = createUser("Kavitha Reddy", "+91-9876543216", "kavitha.reddy@clinic.com", encodedPassword, User.Role.PHARMACY, mainClinic);
        User pat1 = createUser("Vikram Malhotra", "+91-9876543217", "vikram.m@email.com", encodedPassword, User.Role.PATIENT, mainClinic);
        User pat2 = createUser("Sunita Iyer", "+91-9876543218", "sunita.i@email.com", encodedPassword, User.Role.PATIENT, mainClinic);
        User pat3 = createUser("Ravi Krishnan", "+91-9876543219", "ravi.k@email.com", encodedPassword, User.Role.PATIENT, pedClinic);
        User pat4 = createUser("Deepa Menon", "+91-9876543220", "deepa.m@email.com", encodedPassword, User.Role.PATIENT, dermClinic);
        User pat5 = createUser("Amit Joshi", "+91-9876543221", "amit.j@email.com", encodedPassword, User.Role.PATIENT, pedClinic);

        log.info("Created {} users", userRepository.count());

        // --- Doctors ---
        Doctor doctor1 = doctorRepository.save(Doctor.builder()
                .user(doc1)
                .clinic(mainClinic)
                .licenseNo("MCI-2024-001")
                .specialty("General Medicine")
                .qualification("MBBS, MD (General Medicine)")
                .availability(Doctor.Availability.AVAILABLE)
                .experienceYears(12)
                .clinicHospital("City Care Central Clinic")
                .location("Room 201, Floor 2")
                .consultationFee(new BigDecimal("500.00"))
                .consultationDuration(15)
                .workingDays("MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY")
                .workingStartTime(java.time.LocalTime.of(9, 0))
                .workingEndTime(java.time.LocalTime.of(17, 0))
                .breakStartTime(java.time.LocalTime.of(13, 0))
                .breakEndTime(java.time.LocalTime.of(14, 0))
                .currentDelayMinutes(0)
                .build());

        Doctor doctor2 = doctorRepository.save(Doctor.builder()
                .user(doc2)
                .clinic(pedClinic)
                .licenseNo("MCI-2024-002")
                .specialty("Pediatrics")
                .qualification("MBBS, MD (Pediatrics), DCH")
                .availability(Doctor.Availability.AVAILABLE)
                .experienceYears(9)
                .clinicHospital("Rainbow Children Wing")
                .location("Room 105, Floor 1")
                .consultationFee(new BigDecimal("600.00"))
                .consultationDuration(15)
                .workingDays("MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY")
                .workingStartTime(java.time.LocalTime.of(9, 0))
                .workingEndTime(java.time.LocalTime.of(17, 0))
                .breakStartTime(java.time.LocalTime.of(13, 0))
                .breakEndTime(java.time.LocalTime.of(14, 0))
                .currentDelayMinutes(0)
                .build());

        Doctor doctor3 = doctorRepository.save(Doctor.builder()
                .user(doc3)
                .clinic(dermClinic)
                .licenseNo("MCI-2024-003")
                .specialty("Dermatology")
                .qualification("MBBS, DVD, MD (Dermatology)")
                .availability(Doctor.Availability.AVAILABLE)
                .experienceYears(14)
                .clinicHospital("Skin & Aesthetics Suite")
                .location("Room 302, Floor 3")
                .consultationFee(new BigDecimal("750.00"))
                .consultationDuration(20)
                .workingDays("MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY")
                .workingStartTime(java.time.LocalTime.of(10, 0))
                .workingEndTime(java.time.LocalTime.of(18, 0))
                .breakStartTime(java.time.LocalTime.of(13, 30))
                .breakEndTime(java.time.LocalTime.of(14, 30))
                .currentDelayMinutes(0)
                .build());

        // --- Patients ---
        Patient p1 = patientRepository.save(Patient.builder().user(pat1).clinic(mainClinic).dob(LocalDate.of(1985, 3, 15)).gender(Patient.Gender.MALE).bloodGroup("B+").address("42 MG Road, Bangalore 560001").build());
        Patient p2 = patientRepository.save(Patient.builder().user(pat2).clinic(mainClinic).dob(LocalDate.of(1990, 7, 22)).gender(Patient.Gender.FEMALE).bloodGroup("A+").address("15 Anna Nagar, Chennai 600040").build());
        Patient p3 = patientRepository.save(Patient.builder().user(pat3).clinic(pedClinic).dob(LocalDate.of(1978, 11, 8)).gender(Patient.Gender.MALE).bloodGroup("O+").address("88 Banjara Hills, Hyderabad 500034").build());
        Patient p4 = patientRepository.save(Patient.builder().user(pat4).clinic(dermClinic).dob(LocalDate.of(1995, 1, 30)).gender(Patient.Gender.FEMALE).bloodGroup("AB-").address("7 Koramangala, Bangalore 560034").build());
        Patient p5 = patientRepository.save(Patient.builder().user(pat5).clinic(pedClinic).dob(LocalDate.of(2000, 6, 12)).gender(Patient.Gender.MALE).bloodGroup("A-").address("23 Jubilee Hills, Hyderabad 500033").build());

        // --- Staff ---
        staffRepository.save(Staff.builder().user(rec1).clinic(mainClinic).department("Front Desk").designation("Senior Receptionist").build());
        staffRepository.save(Staff.builder().user(rec2).clinic(pedClinic).department("Front Desk").designation("Receptionist").build());
        staffRepository.save(Staff.builder().user(pharma).clinic(mainClinic).department("Pharmacy").designation("Chief Pharmacist").build());

        log.info("Created profiles: {} doctors, {} patients, {} staff", doctorRepository.count(), patientRepository.count(), staffRepository.count());

        // --- Medicine Master Database ---
        Medicine m1  = createMedicine("Paracetamol 500mg", "Paracetamol", "Cipla", "Analgesic", "Tablet", "500 mg", "tablet", false, new BigDecimal("2.50"));
        Medicine m2  = createMedicine("Amoxicillin 500mg", "Amoxicillin", "Sun Pharma", "Antibiotic", "Capsule", "500 mg", "capsule", true, new BigDecimal("8.00"));
        Medicine m3  = createMedicine("Cetirizine 10mg", "Cetirizine", "Dr. Reddys", "Antihistamine", "Tablet", "10 mg", "tablet", false, new BigDecimal("3.50"));
        Medicine m4  = createMedicine("Omeprazole 20mg", "Omeprazole", "Lupin", "Antacid", "Capsule", "20 mg", "capsule", true, new BigDecimal("5.00"));
        Medicine m5  = createMedicine("Metformin 500mg", "Metformin", "USV", "Antidiabetic", "Tablet", "500 mg", "tablet", true, new BigDecimal("4.00"));
        Medicine m6  = createMedicine("Azithromycin 500mg", "Azithromycin", "Cipla", "Antibiotic", "Tablet", "500 mg", "tablet", true, new BigDecimal("15.00"));
        Medicine m7  = createMedicine("Ibuprofen 400mg", "Ibuprofen", "Mankind", "NSAID", "Tablet", "400 mg", "tablet", false, new BigDecimal("3.00"));
        Medicine m8  = createMedicine("Pantoprazole 40mg", "Pantoprazole", "Alkem", "Antacid", "Tablet", "40mg", "tablet", true, new BigDecimal("6.50"));
        Medicine m9  = createMedicine("Montelukast 10mg", "Montelukast", "Sun Pharma", "Anti-asthmatic", "Tablet", "10 mg", "tablet", true, new BigDecimal("9.00"));
        Medicine m10 = createMedicine("Vitamin D3 60000IU", "Cholecalciferol", "Cadila", "Supplement", "Capsule", "60k IU", "capsule", false, new BigDecimal("25.00"));
        Medicine m11 = createMedicine("Cough Syrup (Dextro)", "Dextromethorphan", "Cipla", "Antitussive", "Syrup", "100 ml", "ml", false, new BigDecimal("45.00"));
        Medicine m12 = createMedicine("ORS Sachets", "Electrolytes", "FDC", "Rehydration", "Powder", "21.8 g", "sachet", false, new BigDecimal("12.00"));
        Medicine m13 = createMedicine("Betadine Ointment", "Povidone-Iodine", "Win-Medicare", "Antiseptic", "Ointment", "20 g", "tube", false, new BigDecimal("35.00"));
        Medicine m14 = createMedicine("Eye Drops (Moxiflox)", "Moxifloxacin", "Alcon", "Ophthalmic", "Drops", "5 ml", "ml", true, new BigDecimal("55.00"));
        Medicine m15 = createMedicine("Derma Cream (Clob)", "Clobetasol", "Glenmark", "Dermatological", "Cream", "15 g", "tube", true, new BigDecimal("120.00"));

        log.info("Created {} medicines in Master Catalogue", medicineRepository.count());

        // --- Inventory Batches (FEFO Tracking & Stock Management) ---
        createInventory(mainClinic, m1, "BATCH-PC-2026-A", 500, 50, LocalDate.of(2027, 12, 31), new BigDecimal("2.50"));
        createInventory(mainClinic, m2, "BATCH-AM-2026-A", 200, 30, LocalDate.of(2027, 9, 30), new BigDecimal("8.00"));
        createInventory(mainClinic, m3, "BATCH-CT-2026-A", 400, 40, LocalDate.of(2028, 3, 31), new BigDecimal("3.50"));
        createInventory(mainClinic, m4, "BATCH-OM-2026-A", 150, 25, LocalDate.of(2027, 11, 30), new BigDecimal("5.00"));
        createInventory(mainClinic, m5, "BATCH-MF-2026-A", 600, 60, LocalDate.of(2028, 12, 31), new BigDecimal("4.00"));
        createInventory(mainClinic, m6, "BATCH-AZ-2026-A", 100, 20, LocalDate.of(2027, 8, 31), new BigDecimal("15.00"));
        createInventory(mainClinic, m7, "BATCH-IB-2026-A", 350, 35, LocalDate.of(2028, 1, 31), new BigDecimal("3.00"));
        createInventory(mainClinic, m8, "BATCH-PT-2026-A", 250, 30, LocalDate.of(2027, 10, 31), new BigDecimal("6.50"));
        createInventory(mainClinic, m9, "BATCH-ML-2026-A", 180, 20, LocalDate.of(2028, 5, 31), new BigDecimal("9.00"));
        createInventory(mainClinic, m10, "BATCH-VD-2026-A", 120, 15, LocalDate.of(2027, 7, 31), new BigDecimal("25.00"));
        createInventory(mainClinic, m11, "BATCH-CS-2026-A", 80, 10, LocalDate.of(2027, 6, 30), new BigDecimal("45.00"));
        createInventory(mainClinic, m12, "BATCH-OR-2026-A", 1000, 100, LocalDate.of(2028, 9, 30), new BigDecimal("12.00"));
        createInventory(mainClinic, m13, "BATCH-BD-2026-A", 60, 10, LocalDate.of(2027, 4, 30), new BigDecimal("35.00"));
        createInventory(mainClinic, m14, "BATCH-ED-2026-A", 5, 15, LocalDate.of(2027, 3, 31), new BigDecimal("55.00"));
        createInventory(mainClinic, m15, "BATCH-DC-2026-A", 40, 10, LocalDate.of(2026, 10, 15), new BigDecimal("120.00"));

        log.info("Created {} inventory batches", inventoryRepository.count());

        // --- Sample Appointments ---
        LocalDateTime now = LocalDateTime.now();
        appointmentRepository.save(Appointment.builder().patient(p1).doctor(doctor1).clinic(mainClinic).scheduledAt(now.plusHours(1)).type(Appointment.AppointmentType.SCHEDULED).status(Appointment.AppointmentStatus.CONFIRMED).durationMinutes(15).consultationFee(doctor1.getConsultationFee()).clinicHospital(doctor1.getClinicHospital()).build());
        appointmentRepository.save(Appointment.builder().patient(p2).doctor(doctor1).clinic(mainClinic).scheduledAt(now.plusHours(2)).type(Appointment.AppointmentType.SCHEDULED).status(Appointment.AppointmentStatus.CONFIRMED).durationMinutes(15).consultationFee(doctor1.getConsultationFee()).clinicHospital(doctor1.getClinicHospital()).build());
        appointmentRepository.save(Appointment.builder().patient(p3).doctor(doctor2).clinic(pedClinic).scheduledAt(now.plusHours(1)).type(Appointment.AppointmentType.SCHEDULED).status(Appointment.AppointmentStatus.CONFIRMED).durationMinutes(15).consultationFee(doctor2.getConsultationFee()).clinicHospital(doctor2.getClinicHospital()).build());
        appointmentRepository.save(Appointment.builder().patient(p4).doctor(doctor3).clinic(dermClinic).scheduledAt(now.plusMinutes(30)).type(Appointment.AppointmentType.SCHEDULED).status(Appointment.AppointmentStatus.CONFIRMED).durationMinutes(20).consultationFee(doctor3.getConsultationFee()).clinicHospital(doctor3.getClinicHospital()).build());
        appointmentRepository.save(Appointment.builder().patient(p5).doctor(doctor2).clinic(pedClinic).scheduledAt(now.plusHours(3)).type(Appointment.AppointmentType.SCHEDULED).status(Appointment.AppointmentStatus.CONFIRMED).durationMinutes(15).consultationFee(doctor2.getConsultationFee()).clinicHospital(doctor2.getClinicHospital()).build());

        // --- Initial Visit, Consultation, Prescription & Schedules for Patient Vikram (p1) ---
        Visit v1 = visitRepository.save(Visit.builder()
                .patient(p1)
                .doctor(doctor1)
                .visitDate(LocalDate.now())
                .visitType(Visit.VisitType.APPOINTMENT)
                .status(Visit.VisitStatus.IN_CONSULTATION)
                .checkInTime(now.minusHours(1))
                .build());

        Consultation cons1 = consultationRepository.save(Consultation.builder()
                .visit(v1)
                .doctor(doctor1)
                .patient(p1)
                .clinic(mainClinic)
                .startedAt(now.minusMinutes(45))
                .status(Consultation.ConsultationStatus.IN_PROGRESS)
                .symptoms("Acute fever, mild cough, body aches for 3 days")
                .diagnosisNotes("Upper Respiratory Tract Viral Infection")
                .clinicalNotes("Hydration, rest, symptomatic medication prescribed. Monitor temperature.")
                .build());

        Prescription initRx = Prescription.builder()
                .consultation(cons1)
                .patient(p1)
                .doctor(doctor1)
                .clinic(mainClinic)
                .issuedAt(now.minusMinutes(30))
                .status(Prescription.PrescriptionStatus.ISSUED)
                .version(1)
                .isLatestActive(true)
                .isVerifiedByClinic(true)
                .instructions("Take medications after food with plenty of warm water. Complete antibiotic course.")
                .items(new ArrayList<>())
                .build();

        PrescriptionItem it1 = PrescriptionItem.builder()
                .prescription(initRx)
                .medicine(m1)
                .dosage("1 Tablet (500mg)")
                .frequency("1-0-1 (Twice Daily)")
                .timing("Morning (After Food), Night (After Food)")
                .durationDays(5)
                .quantity(10)
                .prescribedQuantity(10)
                .dispensedQuantity(0)
                .reservedQuantity(0)
                .instructions("Take when temperature exceeds 99°F")
                .build();

        PrescriptionItem it2 = PrescriptionItem.builder()
                .prescription(initRx)
                .medicine(m3)
                .dosage("1 Tablet (10mg)")
                .frequency("0-0-1 (Nightly)")
                .timing("Night (Before Bed)")
                .durationDays(5)
                .quantity(5)
                .prescribedQuantity(5)
                .dispensedQuantity(0)
                .reservedQuantity(0)
                .instructions("For allergic rhinitis and nasal congestion")
                .build();

        PrescriptionItem it3 = PrescriptionItem.builder()
                .prescription(initRx)
                .medicine(m11)
                .dosage("10 ml")
                .frequency("1-1-1 (Thrice Daily)")
                .timing("Morning, Afternoon, Night")
                .durationDays(5)
                .quantity(1)
                .prescribedQuantity(1)
                .dispensedQuantity(0)
                .reservedQuantity(0)
                .instructions("Soothing dry cough syrup")
                .build();

        initRx.getItems().add(it1);
        initRx.getItems().add(it2);
        initRx.getItems().add(it3);

        Prescription savedRx = prescriptionRepository.save(initRx);
        medicationScheduleService.generateScheduleForPrescription(savedRx);

        auditService.logAction(
                doc1.getUserId(),
                "Dr. Priya Sharma",
                "DOCTOR",
                "PRESCRIPTION_CREATED_V1",
                "Prescription",
                savedRx.getPrescriptionId(),
                "Issued initial prescription (v1) with 3 medications for Patient Vikram Malhotra"
        );

        auditService.logAction(
                pharma.getUserId(),
                "Kavitha Reddy",
                "PHARMACY",
                "PRESCRIPTION_VERIFIED",
                "Prescription",
                savedRx.getPrescriptionId(),
                "Clinic verified FEFO batch stock availability for Prescription #1"
        );

        log.info("Created sample consultation #{} and Prescription v1 with live schedule", cons1.getConsultationId());
        log.info("=== ClinicFlow AI Database Seeding Complete ===");
    }

    private User createUser(String name, String phone, String email, String password, User.Role role, Clinic clinic) {
        return userRepository.save(User.builder()
                .name(name).phone(phone).email(email)
                .passwordHash(password).role(role)
                .clinic(clinic)
                .accountStatus(User.AccountStatus.ACTIVE).build());
    }

    private Medicine createMedicine(String name, String generic, String manufacturer, String category,
                                   String dosageForm, String strength, String unit, boolean rxReq, BigDecimal price) {
        return medicineRepository.save(Medicine.builder()
                .name(name)
                .genericName(generic)
                .manufacturer(manufacturer)
                .category(category)
                .dosageForm(dosageForm)
                .strength(strength)
                .unit(unit)
                .isPrescriptionRequired(rxReq)
                .price(price)
                .isActive(true)
                .build());
    }

    private void createInventory(Clinic clinic, Medicine medicine, String batch, int qty, int reorder, LocalDate expiry, BigDecimal price) {
        inventoryRepository.save(MedicineInventory.builder()
                .clinic(clinic)
                .medicine(medicine).batchNumber(batch)
                .availableQuantity(qty).reorderLevel(reorder)
                .expiryDate(expiry).purchaseDate(LocalDate.now().minusMonths(3))
                .unitPrice(price).build());
    }
}
