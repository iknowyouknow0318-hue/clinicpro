-- ============================================================
-- ClinicFlow AI — Seed Data for Development & Demo
-- ============================================================

USE clinicflow_db;

-- ============================================================
-- 1. USERS (password = 'password123' hashed with BCrypt)
-- ============================================================
-- BCrypt hash for 'password123': $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO `user` (name, phone, email, password_hash, role, account_status) VALUES
-- Admin
('Dr. Admin Kumar',    '+91-9876543210', 'admin@clinicflow.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN',        'ACTIVE'),
-- Doctors
('Dr. Priya Sharma',   '+91-9876543211', 'priya.sharma@clinic.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'DOCTOR',       'ACTIVE'),
('Dr. Rahul Patel',    '+91-9876543212', 'rahul.patel@clinic.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'DOCTOR',       'ACTIVE'),
('Dr. Ananya Desai',   '+91-9876543213', 'ananya.desai@clinic.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'DOCTOR',       'ACTIVE'),
-- Receptionists
('Meera Nair',         '+91-9876543214', 'meera.nair@clinic.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'RECEPTIONIST', 'ACTIVE'),
('Arjun Singh',        '+91-9876543215', 'arjun.singh@clinic.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'RECEPTIONIST', 'ACTIVE'),
-- Pharmacy
('Kavitha Reddy',      '+91-9876543216', 'kavitha.reddy@clinic.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PHARMACY',     'ACTIVE'),
-- Patients
('Vikram Malhotra',    '+91-9876543217', 'vikram.m@email.com',       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PATIENT',      'ACTIVE'),
('Sunita Iyer',        '+91-9876543218', 'sunita.i@email.com',       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PATIENT',      'ACTIVE'),
('Ravi Krishnan',      '+91-9876543219', 'ravi.k@email.com',         '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PATIENT',      'ACTIVE'),
('Deepa Menon',        '+91-9876543220', 'deepa.m@email.com',        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PATIENT',      'ACTIVE'),
('Amit Joshi',         '+91-9876543221', 'amit.j@email.com',         '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PATIENT',      'ACTIVE');

-- ============================================================
-- 2. DOCTOR PROFILES
-- ============================================================

INSERT INTO doctor (user_id, license_no, specialty, qualification, availability) VALUES
(2, 'MCI-2024-001', 'General Medicine',  'MBBS, MD (General Medicine)',  'AVAILABLE'),
(3, 'MCI-2024-002', 'Pediatrics',        'MBBS, MD (Pediatrics)',        'AVAILABLE'),
(4, 'MCI-2024-003', 'Dermatology',       'MBBS, MD (Dermatology)',       'AVAILABLE');

-- ============================================================
-- 3. PATIENT PROFILES
-- ============================================================

INSERT INTO patient (user_id, dob, gender, blood_group, address) VALUES
(8,  '1985-03-15', 'MALE',   'B+',  '42 MG Road, Bangalore 560001'),
(9,  '1990-07-22', 'FEMALE', 'A+',  '15 Anna Nagar, Chennai 600040'),
(10, '1978-11-08', 'MALE',   'O+',  '88 Banjara Hills, Hyderabad 500034'),
(11, '1995-01-30', 'FEMALE', 'AB-', '7 Koramangala, Bangalore 560034'),
(12, '2000-06-12', 'MALE',   'A-',  '23 Jubilee Hills, Hyderabad 500033');

-- ============================================================
-- 4. STAFF PROFILES
-- ============================================================

INSERT INTO staff (user_id, department, designation) VALUES
(5, 'Front Desk',  'Senior Receptionist'),
(6, 'Front Desk',  'Receptionist'),
(7, 'Pharmacy',    'Chief Pharmacist');

-- ============================================================
-- 5. MEDICINES
-- ============================================================

INSERT INTO medicine (name, generic_name, manufacturer, category, unit) VALUES
('Paracetamol 500mg',      'Paracetamol',      'Cipla',            'Analgesic',        'tablet'),
('Amoxicillin 500mg',      'Amoxicillin',      'Sun Pharma',       'Antibiotic',       'capsule'),
('Cetirizine 10mg',        'Cetirizine',       'Dr. Reddys',       'Antihistamine',    'tablet'),
('Omeprazole 20mg',        'Omeprazole',       'Lupin',            'Antacid',          'capsule'),
('Metformin 500mg',        'Metformin',        'USV',              'Antidiabetic',     'tablet'),
('Azithromycin 500mg',     'Azithromycin',     'Cipla',            'Antibiotic',       'tablet'),
('Ibuprofen 400mg',        'Ibuprofen',        'Mankind',          'NSAID',            'tablet'),
('Pantoprazole 40mg',      'Pantoprazole',     'Alkem',            'Antacid',          'tablet'),
('Montelukast 10mg',       'Montelukast',      'Sun Pharma',       'Anti-asthmatic',   'tablet'),
('Vitamin D3 60000IU',     'Cholecalciferol',  'Cadila',           'Supplement',       'capsule'),
('Cough Syrup (Dextro)',   'Dextromethorphan', 'Cipla',            'Antitussive',      'ml'),
('ORS Sachets',            'Electrolytes',     'FDC',              'Rehydration',      'sachet'),
('Betadine Ointment',      'Povidone-Iodine',  'Win-Medicare',     'Antiseptic',       'tube'),
('Eye Drops (Moxiflox)',   'Moxifloxacin',     'Alcon',            'Ophthalmic',       'ml'),
('Derma Cream (Clob)',     'Clobetasol',       'Glenmark',         'Dermatological',   'tube');

-- ============================================================
-- 6. MEDICINE INVENTORY (batches with stock)
-- ============================================================

INSERT INTO medicine_inventory (medicine_id, batch_number, available_quantity, reorder_level, expiry_date, purchase_date, unit_price) VALUES
(1,  'BATCH-PC-2026-A',  500, 50,  '2027-12-31', '2026-01-15', 2.50),
(1,  'BATCH-PC-2026-B',  300, 50,  '2028-06-30', '2026-06-01', 2.75),
(2,  'BATCH-AM-2026-A',  200, 30,  '2027-09-30', '2026-02-10', 8.00),
(3,  'BATCH-CT-2026-A',  400, 40,  '2028-03-31', '2026-03-05', 3.50),
(4,  'BATCH-OM-2026-A',  150, 25,  '2027-11-30', '2026-01-20', 5.00),
(5,  'BATCH-MF-2026-A',  600, 60,  '2028-12-31', '2026-04-12', 4.00),
(6,  'BATCH-AZ-2026-A',  100, 20,  '2027-08-31', '2026-05-01', 15.00),
(7,  'BATCH-IB-2026-A',  350, 35,  '2028-01-31', '2026-02-28', 3.00),
(8,  'BATCH-PT-2026-A',  250, 30,  '2027-10-31', '2026-03-15', 6.50),
(9,  'BATCH-ML-2026-A',  180, 20,  '2028-05-31', '2026-04-20', 9.00),
(10, 'BATCH-VD-2026-A',  120, 15,  '2027-07-31', '2026-01-10', 25.00),
(11, 'BATCH-CS-2026-A',  80,  10,  '2027-06-30', '2026-05-15', 45.00),
(12, 'BATCH-OR-2026-A',  1000, 100, '2028-09-30', '2026-06-01', 12.00),
(13, 'BATCH-BD-2026-A',  60,  10,  '2027-04-30', '2026-03-01', 35.00),
-- Low stock item (for alerts demo)
(14, 'BATCH-ED-2026-A',  5,   15,  '2027-03-31', '2026-02-15', 55.00),
-- Near-expiry item (for alerts demo)
(15, 'BATCH-DC-2026-A',  40,  10,  '2026-10-15', '2026-01-05', 120.00);

-- ============================================================
-- 7. SAMPLE APPOINTMENTS (for today's demo)
-- ============================================================

INSERT INTO appointment (patient_id, doctor_id, scheduled_at, type, status) VALUES
(1, 1, NOW() + INTERVAL 1 HOUR,   'SCHEDULED', 'BOOKED'),
(2, 1, NOW() + INTERVAL 2 HOUR,   'SCHEDULED', 'BOOKED'),
(3, 2, NOW() + INTERVAL 1 HOUR,   'SCHEDULED', 'CONFIRMED'),
(4, 3, NOW() + INTERVAL 30 MINUTE,'SCHEDULED', 'BOOKED'),
(5, 2, NOW() + INTERVAL 3 HOUR,   'SCHEDULED', 'BOOKED');
