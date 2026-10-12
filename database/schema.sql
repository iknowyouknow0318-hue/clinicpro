-- ============================================================
-- ClinicFlow AI — Complete MySQL Schema
-- Database: clinicflow_db
-- ============================================================

CREATE DATABASE IF NOT EXISTS clinicflow_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE clinicflow_db;

-- ============================================================
-- 1. IDENTITY DOMAIN
-- ============================================================

-- 1.1 USER (core identity for all roles)
CREATE TABLE `user` (
    user_id         BIGINT          AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    phone           VARCHAR(20)     NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    role            ENUM('PATIENT','DOCTOR','RECEPTIONIST','PHARMACY','ADMIN') NOT NULL,
    account_status  ENUM('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_user_email (email),
    INDEX idx_user_role  (role)
) ENGINE=InnoDB;

-- 1.2 PATIENT profile
CREATE TABLE patient (
    patient_id  BIGINT          AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT          NOT NULL UNIQUE,
    dob         DATE            NULL,
    gender      ENUM('MALE','FEMALE','OTHER') NULL,
    blood_group VARCHAR(5)      NULL,
    address     TEXT            NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_patient_user FOREIGN KEY (user_id) REFERENCES `user`(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 1.3 DOCTOR profile
CREATE TABLE doctor (
    doctor_id       BIGINT          AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT          NOT NULL UNIQUE,
    license_no      VARCHAR(50)     NOT NULL UNIQUE,
    specialty       VARCHAR(100)    NOT NULL,
    qualification   VARCHAR(200)    NULL,
    availability    ENUM('AVAILABLE','BUSY','OFF_DUTY') NOT NULL DEFAULT 'AVAILABLE',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_doctor_user FOREIGN KEY (user_id) REFERENCES `user`(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 1.4 STAFF profile
CREATE TABLE staff (
    staff_id        BIGINT          AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT          NOT NULL UNIQUE,
    department      VARCHAR(100)    NOT NULL,
    designation     VARCHAR(100)    NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_staff_user FOREIGN KEY (user_id) REFERENCES `user`(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 2. OPERATIONS DOMAIN
-- ============================================================

-- 2.1 APPOINTMENT
CREATE TABLE appointment (
    appointment_id  BIGINT          AUTO_INCREMENT PRIMARY KEY,
    patient_id      BIGINT          NOT NULL,
    doctor_id       BIGINT          NOT NULL,
    scheduled_at    DATETIME        NOT NULL,
    type            ENUM('SCHEDULED','WALK_IN') NOT NULL DEFAULT 'SCHEDULED',
    status          ENUM('BOOKED','CONFIRMED','CHECKED_IN','CANCELLED','COMPLETED','NO_SHOW') NOT NULL DEFAULT 'BOOKED',
    notes           TEXT            NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_appointment_patient  (patient_id),
    INDEX idx_appointment_doctor   (doctor_id),
    INDEX idx_appointment_date     (scheduled_at),
    INDEX idx_appointment_status   (status),

    CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES patient(patient_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_appointment_doctor  FOREIGN KEY (doctor_id)  REFERENCES doctor(doctor_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 2.2 VISIT
CREATE TABLE visit (
    visit_id        BIGINT          AUTO_INCREMENT PRIMARY KEY,
    patient_id      BIGINT          NOT NULL,
    doctor_id       BIGINT          NOT NULL,
    appointment_id  BIGINT          NULL,
    visit_date      DATE            NOT NULL,
    visit_type      ENUM('APPOINTMENT','WALK_IN','FOLLOW_UP') NOT NULL,
    status          ENUM('CHECKED_IN','IN_QUEUE','IN_CONSULTATION','COMPLETED','CANCELLED') NOT NULL DEFAULT 'CHECKED_IN',
    check_in_time   DATETIME        NOT NULL,
    completed_at    DATETIME        NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_visit_patient (patient_id),
    INDEX idx_visit_doctor  (doctor_id),
    INDEX idx_visit_date    (visit_date),
    INDEX idx_visit_status  (status),

    CONSTRAINT fk_visit_patient     FOREIGN KEY (patient_id)     REFERENCES patient(patient_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_visit_doctor      FOREIGN KEY (doctor_id)      REFERENCES doctor(doctor_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_visit_appointment FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 2.3 PATIENT_QUEUE
CREATE TABLE patient_queue (
    queue_entry_id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    visit_id                BIGINT          NOT NULL UNIQUE,
    doctor_id               BIGINT          NOT NULL,
    token_number            INT             NOT NULL,
    priority_level          ENUM('NORMAL','PRIORITY','URGENT') NOT NULL DEFAULT 'NORMAL',
    queue_status            ENUM('WAITING','CALLED','IN_CONSULTATION','COMPLETED','CANCELLED') NOT NULL DEFAULT 'WAITING',
    joined_at               DATETIME        NOT NULL,
    called_at               DATETIME        NULL,
    estimated_wait_minutes  INT             NULL,
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_queue_doctor  (doctor_id),
    INDEX idx_queue_status  (queue_status),
    INDEX idx_queue_joined  (joined_at),

    CONSTRAINT fk_queue_visit   FOREIGN KEY (visit_id)  REFERENCES visit(visit_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_queue_doctor  FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 3. CLINICAL DOMAIN
-- ============================================================

-- 3.1 CONSULTATION
CREATE TABLE consultation (
    consultation_id BIGINT          AUTO_INCREMENT PRIMARY KEY,
    visit_id        BIGINT          NOT NULL UNIQUE,
    patient_id      BIGINT          NOT NULL,
    doctor_id       BIGINT          NOT NULL,
    started_at      DATETIME        NOT NULL,
    ended_at        DATETIME        NULL,
    symptoms        TEXT            NULL,
    diagnosis_notes TEXT            NULL,
    clinical_notes  TEXT            NULL,
    status          ENUM('IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'IN_PROGRESS',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_consultation_patient (patient_id),
    INDEX idx_consultation_doctor  (doctor_id),
    INDEX idx_consultation_status  (status),

    CONSTRAINT fk_consultation_visit   FOREIGN KEY (visit_id)   REFERENCES visit(visit_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_consultation_patient FOREIGN KEY (patient_id) REFERENCES patient(patient_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_consultation_doctor  FOREIGN KEY (doctor_id)  REFERENCES doctor(doctor_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 3.2 PRESCRIPTION
CREATE TABLE prescription (
    prescription_id BIGINT          AUTO_INCREMENT PRIMARY KEY,
    consultation_id BIGINT          NOT NULL UNIQUE,
    patient_id      BIGINT          NOT NULL,
    doctor_id       BIGINT          NOT NULL,
    issued_at       DATETIME        NOT NULL,
    status          ENUM('DRAFT','ISSUED','SENT_TO_PHARMACY','DISPENSED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
    instructions    TEXT            NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_prescription_patient (patient_id),
    INDEX idx_prescription_doctor  (doctor_id),
    INDEX idx_prescription_status  (status),

    CONSTRAINT fk_prescription_consultation FOREIGN KEY (consultation_id) REFERENCES consultation(consultation_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_prescription_patient      FOREIGN KEY (patient_id)      REFERENCES patient(patient_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_prescription_doctor       FOREIGN KEY (doctor_id)       REFERENCES doctor(doctor_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 3.3 MEDICINE
CREATE TABLE medicine (
    medicine_id     BIGINT          AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(200)    NOT NULL,
    generic_name    VARCHAR(200)    NULL,
    manufacturer    VARCHAR(200)    NULL,
    category        VARCHAR(100)    NULL,
    unit            VARCHAR(50)     NOT NULL DEFAULT 'tablet',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_medicine_name (name),
    INDEX idx_medicine_generic (generic_name)
) ENGINE=InnoDB;

-- 3.4 PRESCRIPTION_ITEM
CREATE TABLE prescription_item (
    prescription_item_id BIGINT      AUTO_INCREMENT PRIMARY KEY,
    prescription_id      BIGINT      NOT NULL,
    medicine_id          BIGINT      NOT NULL,
    dosage               VARCHAR(100) NOT NULL,
    frequency            VARCHAR(100) NOT NULL,
    duration_days        INT          NOT NULL,
    quantity             INT          NOT NULL,
    instructions         TEXT         NULL,
    created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_pi_prescription (prescription_id),
    INDEX idx_pi_medicine     (medicine_id),

    CONSTRAINT fk_pi_prescription FOREIGN KEY (prescription_id) REFERENCES prescription(prescription_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pi_medicine     FOREIGN KEY (medicine_id)     REFERENCES medicine(medicine_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 4. PHARMACY DOMAIN
-- ============================================================

-- 4.1 PHARMACY_ORDER
CREATE TABLE pharmacy_order (
    pharmacy_order_id   BIGINT          AUTO_INCREMENT PRIMARY KEY,
    prescription_id     BIGINT          NOT NULL UNIQUE,
    received_at         DATETIME        NOT NULL,
    processing_started_at DATETIME      NULL,
    ready_at            DATETIME        NULL,
    collected_at        DATETIME        NULL,
    status              ENUM('RECEIVED','CHECKING','PROCESSING','READY','COLLECTED','CANCELLED') NOT NULL DEFAULT 'RECEIVED',
    notes               TEXT            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_po_status (status),

    CONSTRAINT fk_po_prescription FOREIGN KEY (prescription_id) REFERENCES prescription(prescription_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 4.2 PHARMACY_QUEUE
CREATE TABLE pharmacy_queue (
    pharmacy_queue_id           BIGINT  AUTO_INCREMENT PRIMARY KEY,
    pharmacy_order_id           BIGINT  NOT NULL UNIQUE,
    queue_position              INT     NOT NULL,
    joined_at                   DATETIME NOT NULL,
    estimated_processing_minutes INT    NULL,
    status                      ENUM('WAITING','PROCESSING','READY','COLLECTED') NOT NULL DEFAULT 'WAITING',
    created_at                  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_pq_status (status),

    CONSTRAINT fk_pq_order FOREIGN KEY (pharmacy_order_id) REFERENCES pharmacy_order(pharmacy_order_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 4.3 MEDICINE_INVENTORY
CREATE TABLE medicine_inventory (
    inventory_id        BIGINT          AUTO_INCREMENT PRIMARY KEY,
    medicine_id         BIGINT          NOT NULL,
    batch_number        VARCHAR(100)    NOT NULL,
    available_quantity  INT             NOT NULL DEFAULT 0,
    reorder_level       INT             NOT NULL DEFAULT 10,
    expiry_date         DATE            NOT NULL,
    purchase_date       DATE            NULL,
    unit_price          DECIMAL(10,2)   NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_inv_medicine (medicine_id),
    INDEX idx_inv_expiry   (expiry_date),
    INDEX idx_inv_batch    (batch_number),

    CONSTRAINT fk_inv_medicine FOREIGN KEY (medicine_id) REFERENCES medicine(medicine_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 5. CONTINUITY DOMAIN
-- ============================================================

-- 5.1 FOLLOW_UP
CREATE TABLE follow_up (
    follow_up_id    BIGINT          AUTO_INCREMENT PRIMARY KEY,
    visit_id        BIGINT          NOT NULL,
    patient_id      BIGINT          NOT NULL,
    scheduled_date  DATE            NOT NULL,
    reason          TEXT            NULL,
    status          ENUM('SCHEDULED','COMPLETED','MISSED','RESCHEDULED','CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    completed_at    DATETIME        NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_fu_patient (patient_id),
    INDEX idx_fu_date    (scheduled_date),
    INDEX idx_fu_status  (status),

    CONSTRAINT fk_fu_visit   FOREIGN KEY (visit_id)   REFERENCES visit(visit_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_fu_patient FOREIGN KEY (patient_id) REFERENCES patient(patient_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 5.2 NOTIFICATION
CREATE TABLE notification (
    notification_id BIGINT          AUTO_INCREMENT PRIMARY KEY,
    patient_id      BIGINT          NOT NULL,
    message         TEXT            NOT NULL,
    type            ENUM('QUEUE_UPDATE','PHARMACY_READY','FOLLOW_UP_REMINDER','APPOINTMENT_REMINDER','GENERAL') NOT NULL,
    status          ENUM('UNREAD','READ','DISMISSED') NOT NULL DEFAULT 'UNREAD',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_notif_patient (patient_id),
    INDEX idx_notif_status  (status),
    INDEX idx_notif_type    (type),

    CONSTRAINT fk_notif_patient FOREIGN KEY (patient_id) REFERENCES patient(patient_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
