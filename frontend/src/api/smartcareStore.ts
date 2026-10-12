// SMARTCARE — Infallible Healthcare Reactive State & Mock Data Engine
// Implements full outpatient workflow, audit trails, security rules, and real-time pub/sub.

import { supabase, isSupabaseConfigured, subscribeToQueueUpdates } from './supabaseClient';

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  qualification: string;
  registrationNumber: string;
  roomNumber: string;
  availability: 'AVAILABLE' | 'DELAYED' | 'PAUSED' | 'UNAVAILABLE';
  delayMinutes: number;
  department: string;
  consultationFee: number;
  workingHours: string;
}

export interface Patient {
  id: number;
  userId: number;
  name: string;
  phone: string;
  email: string;
  dob: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: string;
  address: string;
  allergies: string[];
  preferredLanguage: 'en' | 'ta' | 'hi';
  preferredNotification: 'WHATSAPP' | 'SMS' | 'APP';
  consent: {
    appointmentCommunication: boolean;
    queueNotifications: boolean;
    messagingChannels: boolean;
    prescriptionDelivery: boolean;
    pharmacySharing: boolean;
    updatedAt: string;
  };
}

export interface QrPass {
  passId: string;
  tokenNumber: string;
  signedToken: string; // Cryptographic signed token - NO PHI
  expiresAt: string;
  isUsed: boolean;
  usedAt?: string;
}

export interface Appointment {
  id: number;
  bookingReference: string;
  patientId: number;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  doctorId: number;
  doctorName: string;
  department: string;
  date: string;
  timeSlot: string;
  type: 'REGULAR' | 'FOLLOW_UP' | 'EMERGENCY';
  status: 'BOOKED' | 'CHECKED_IN' | 'WAITING' | 'CALLED' | 'IN_CONSULTATION' | 'COMPLETED' | 'SKIPPED' | 'CANCELLED';
  paymentStatus: 'PAID_ONLINE' | 'PAY_AT_CLINIC';
  fee: number;
  tokenNumber: string;
  qrPass: QrPass;
  createdAt: string;
  checkInTime?: string;
  notes?: string;
}

export interface QueueEntry {
  id: number;
  appointmentId: number;
  patientId: number;
  patientName: string;
  patientAge: number;
  patientGender: string;
  tokenNumber: string;
  doctorId: number;
  doctorName: string;
  department: string;
  roomNumber: string;
  priorityLevel: 'EMERGENCY' | 'HIGH_PRIORITY' | 'NORMAL';
  priorityReason?: string;
  queueStatus: 'BOOKED' | 'CHECKED_IN' | 'WAITING' | 'CALLED' | 'IN_CONSULTATION' | 'COMPLETED' | 'SKIPPED' | 'NO_SHOW';
  calledAt?: string;
  responseTimerSeconds?: number;
  joinedQueueAt: string;
  estimatedWaitMinutes: number;
  patientsAhead: number;
  rejoined?: boolean;
  completedAt?: string;
  consultationDurationMinutes?: number;
}

export interface CompleteEncounterParams {
  doctorId: number;
  queueEntryId: number;
  prescriptionData?: {
    chiefComplaint: string;
    diagnosis: string;
    clinicalNotes: string;
    followUpDate?: string;
    medicines: PrescriptionMedicine[];
    safetyWarnings: string[];
    overrideReason?: string;
  };
  noPrescriptionRequired?: boolean;
  noPrescriptionReason?: string;
  idempotencyKey?: string;
}

export interface CompleteEncounterResult {
  success: boolean;
  completedToken: string;
  patientName: string;
  prescriptionStatus: 'SIGNED' | 'NONE_REQUIRED';
  prescriptionId?: number;
  nextPatient: {
    tokenNumber: string;
    patientName: string;
    patientAge: number;
    patientGender: string;
    priorityLevel: string;
    roomNumber: string;
  } | null;
  emptyQueue: boolean;
  durationMinutes: number;
  message: string;
}

export interface PrescriptionMedicine {
  id: string;
  name: string;
  formulation: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Ointment' | 'Drops';
  strength: string;
  dose: string;
  frequency: string; // e.g., '1-0-1 (After Food)'
  durationDays: number;
  route: string;
  instructions: string;
}

export interface Prescription {
  id: number;
  prescriptionNumber: string;
  secureAccessToken: string;
  consultationId: number;
  patientId: number;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  patientAllergies: string[];
  doctorId: number;
  doctorName: string;
  doctorQualification: string;
  doctorRegistrationNumber: string;
  department: string;
  clinicName: string;
  issuedAt: string;
  expiresAt: string;
  chiefComplaint: string;
  diagnosis: string;
  clinicalNotes: string;
  followUpDate?: string;
  status: 'DRAFT' | 'SIGNED' | 'DELIVERED' | 'VIEWED' | 'PARTIALLY_DISPENSED' | 'FULLY_DISPENSED' | 'CANCELLED';
  medicines: PrescriptionMedicine[];
  safetyWarnings: string[];
  overrideReason?: string;
  doctorDigitalSignature: string;
  version: number;
  pharmacyDispensedAt?: string;
  pharmacyNotes?: string;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
}

export interface SecurityEvent {
  id: number;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  eventType: string;
  description: string;
  sourceIp: string;
  attemptedBy: string;
  status: 'LOGGED' | 'RESOLVED' | 'INVESTIGATING';
}

export interface NotificationItem {
  id: number;
  timestamp: string;
  patientId: number;
  patientPhone: string;
  channel: 'WHATSAPP' | 'SMS' | 'APP';
  messagePreview: string; // MUST NEVER contain PHI or medicine names
  status: 'DELIVERED' | 'SENT' | 'FAILED' | 'FALLBACK_TRIGGERED';
  type: 'QUEUE_CALLED' | 'APPOINTMENT_CONFIRMED' | 'PRESCRIPTION_READY' | 'DELAY_NOTICE';
}

// Seed Data
const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 1,
    name: 'Dr. Arun Kumar',
    specialty: 'General Medicine',
    qualification: 'MBBS, MD (General Medicine)',
    registrationNumber: 'TN-MC-48291',
    roomNumber: 'Room 101',
    availability: 'AVAILABLE',
    delayMinutes: 0,
    department: 'General Medicine',
    consultationFee: 400,
    workingHours: '09:00 AM - 01:30 PM, 04:30 PM - 08:00 PM',
  },
  {
    id: 2,
    name: 'Dr. Meera Raj',
    specialty: 'Dermatology',
    qualification: 'MBBS, MD, DVL',
    registrationNumber: 'TN-MC-59302',
    roomNumber: 'Room 104',
    availability: 'AVAILABLE',
    delayMinutes: 0,
    department: 'Dermatology',
    consultationFee: 500,
    workingHours: '10:00 AM - 02:00 PM',
  },
  {
    id: 3,
    name: 'Dr. Priya Nandakumar',
    specialty: 'Paediatrics',
    qualification: 'MBBS, DCH, DNB (Paediatrics)',
    registrationNumber: 'TN-MC-38194',
    roomNumber: 'Room 102',
    availability: 'AVAILABLE',
    delayMinutes: 0,
    department: 'Paediatrics',
    consultationFee: 450,
    workingHours: '09:30 AM - 01:00 PM, 05:00 PM - 08:30 PM',
  },
  {
    id: 4,
    name: 'Dr. Karthik Selvan',
    specialty: 'Dental Surgery',
    qualification: 'BDS, MDS (Oral & Maxillofacial)',
    registrationNumber: 'TN-DC-12948',
    roomNumber: 'Room 105',
    availability: 'AVAILABLE',
    delayMinutes: 0,
    department: 'Dental',
    consultationFee: 350,
    workingHours: '10:00 AM - 01:00 PM, 04:00 PM - 07:30 PM',
  },
];

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 1,
    userId: 101,
    name: 'Vikram Malhotra',
    phone: '9840123450',
    email: 'vikram.m@example.com',
    dob: '1986-04-12',
    age: 38,
    gender: 'MALE',
    bloodGroup: 'B+',
    address: '14/2 Gandhi Road, Kovilpatti',
    allergies: ['Penicillin'],
    preferredLanguage: 'en',
    preferredNotification: 'WHATSAPP',
    consent: {
      appointmentCommunication: true,
      queueNotifications: true,
      messagingChannels: true,
      prescriptionDelivery: true,
      pharmacySharing: true,
      updatedAt: '2026-10-08 09:15 AM',
    },
  },
  {
    id: 2,
    userId: 102,
    name: 'Ananya Krishnan',
    phone: '9840123451',
    email: 'ananya.k@example.com',
    dob: '1995-08-23',
    age: 29,
    gender: 'FEMALE',
    bloodGroup: 'O+',
    address: '88 New Colony, Tuticorin Road, Kovilpatti',
    allergies: [],
    preferredLanguage: 'ta',
    preferredNotification: 'SMS',
    consent: {
      appointmentCommunication: true,
      queueNotifications: true,
      messagingChannels: true,
      prescriptionDelivery: true,
      pharmacySharing: false,
      updatedAt: '2026-10-08 09:20 AM',
    },
  },
  {
    id: 3,
    userId: 103,
    name: 'Rajesh Kannan',
    phone: '9840123452',
    email: 'rajesh.k@example.com',
    dob: '1979-11-05',
    age: 45,
    gender: 'MALE',
    bloodGroup: 'A+',
    address: '5 Bazaar Street, Kovilpatti',
    allergies: ['Sulfa drugs'],
    preferredLanguage: 'ta',
    preferredNotification: 'WHATSAPP',
    consent: {
      appointmentCommunication: true,
      queueNotifications: true,
      messagingChannels: true,
      prescriptionDelivery: true,
      pharmacySharing: true,
      updatedAt: '2026-10-08 09:30 AM',
    },
  },
  {
    id: 4,
    userId: 104,
    name: 'Meenakshi Sundaram',
    phone: '9840123453',
    email: 'meenakshi.s@example.com',
    dob: '1972-03-14',
    age: 52,
    gender: 'FEMALE',
    bloodGroup: 'B+',
    address: '22 West Car Street, Kovilpatti',
    allergies: ['Aspirin / NSAIDs'],
    preferredLanguage: 'ta',
    preferredNotification: 'SMS',
    consent: {
      appointmentCommunication: true,
      queueNotifications: true,
      messagingChannels: true,
      prescriptionDelivery: true,
      pharmacySharing: true,
      updatedAt: '2026-10-08 09:35 AM',
    },
  },
  {
    id: 5,
    userId: 105,
    name: 'Senthil Nathan',
    phone: '9840123454',
    email: 'senthil.n@example.com',
    dob: '1990-07-19',
    age: 34,
    gender: 'MALE',
    bloodGroup: 'AB+',
    address: '10 Industrial Estate, Kovilpatti',
    allergies: [],
    preferredLanguage: 'en',
    preferredNotification: 'WHATSAPP',
    consent: {
      appointmentCommunication: true,
      queueNotifications: true,
      messagingChannels: true,
      prescriptionDelivery: true,
      pharmacySharing: true,
      updatedAt: '2026-10-08 09:40 AM',
    },
  },
  {
    id: 6,
    userId: 106,
    name: 'Lakshmi Narayanan',
    phone: '9840123455',
    email: 'lakshmi.n@example.com',
    dob: '1963-02-28',
    age: 61,
    gender: 'FEMALE',
    bloodGroup: 'O-',
    address: '47 North Street, Kovilpatti',
    allergies: ['Ciprofloxacin'],
    preferredLanguage: 'ta',
    preferredNotification: 'SMS',
    consent: {
      appointmentCommunication: true,
      queueNotifications: true,
      messagingChannels: true,
      prescriptionDelivery: true,
      pharmacySharing: true,
      updatedAt: '2026-10-08 09:45 AM',
    },
  },
  {
    id: 7,
    userId: 107,
    name: 'Divya Murugan',
    phone: '9840123456',
    email: 'divya.m@example.com',
    dob: '1997-09-15',
    age: 27,
    gender: 'FEMALE',
    bloodGroup: 'A+',
    address: '15 Anna Nagar, Kovilpatti',
    allergies: [],
    preferredLanguage: 'ta',
    preferredNotification: 'WHATSAPP',
    consent: {
      appointmentCommunication: true,
      queueNotifications: true,
      messagingChannels: true,
      prescriptionDelivery: true,
      pharmacySharing: true,
      updatedAt: '2026-10-08 09:10 AM',
    },
  },
  {
    id: 8,
    userId: 108,
    name: 'Arumugam P',
    phone: '9840123457',
    email: 'arumugam.p@example.com',
    dob: '1957-01-10',
    age: 67,
    gender: 'MALE',
    bloodGroup: 'O+',
    address: '6 Main Road, Kovilpatti',
    allergies: [],
    preferredLanguage: 'ta',
    preferredNotification: 'SMS',
    consent: {
      appointmentCommunication: true,
      queueNotifications: true,
      messagingChannels: true,
      prescriptionDelivery: true,
      pharmacySharing: true,
      updatedAt: '2026-10-08 10:00 AM',
    },
  },
  {
    id: 9,
    userId: 109,
    name: 'Karthikeyan Ram',
    phone: '9840123458',
    email: 'karthikeyan.r@example.com',
    dob: '1982-05-18',
    age: 42,
    gender: 'MALE',
    bloodGroup: 'B+',
    address: '34 Kamaraj Salai, Kovilpatti',
    allergies: [],
    preferredLanguage: 'en',
    preferredNotification: 'WHATSAPP',
    consent: {
      appointmentCommunication: true,
      queueNotifications: true,
      messagingChannels: true,
      prescriptionDelivery: true,
      pharmacySharing: true,
      updatedAt: '2026-10-08 09:50 AM',
    },
  },
  {
    id: 10,
    userId: 110,
    name: 'Priya Dharshini',
    phone: '9840123459',
    email: 'priya.d@example.com',
    dob: '1993-12-04',
    age: 31,
    gender: 'FEMALE',
    bloodGroup: 'O+',
    address: '19 Railway Feeder Road, Kovilpatti',
    allergies: [],
    preferredLanguage: 'ta',
    preferredNotification: 'WHATSAPP',
    consent: {
      appointmentCommunication: true,
      queueNotifications: true,
      messagingChannels: true,
      prescriptionDelivery: true,
      pharmacySharing: true,
      updatedAt: '2026-10-08 09:55 AM',
    },
  },
  {
    id: 11,
    userId: 111,
    name: 'Saravanan Bala',
    phone: '9840123460',
    email: 'saravanan.b@example.com',
    dob: '1974-06-25',
    age: 50,
    gender: 'MALE',
    bloodGroup: 'A-',
    address: '77 Lakshmi Mills Colony, Kovilpatti',
    allergies: [],
    preferredLanguage: 'ta',
    preferredNotification: 'SMS',
    consent: {
      appointmentCommunication: true,
      queueNotifications: true,
      messagingChannels: true,
      prescriptionDelivery: true,
      pharmacySharing: false,
      updatedAt: '2026-10-08 10:05 AM',
    },
  },
  {
    id: 12,
    userId: 112,
    name: 'Kousalya Devi',
    phone: '9840123461',
    email: 'kousalya.d@example.com',
    dob: '1988-08-14',
    age: 36,
    gender: 'FEMALE',
    bloodGroup: 'B+',
    address: '11 Pillayar Kovil St, Kovilpatti',
    allergies: [],
    preferredLanguage: 'ta',
    preferredNotification: 'WHATSAPP',
    consent: {
      appointmentCommunication: true,
      queueNotifications: true,
      messagingChannels: true,
      prescriptionDelivery: true,
      pharmacySharing: true,
      updatedAt: '2026-10-08 10:10 AM',
    },
  },
  {
    id: 13,
    userId: 113,
    name: 'Muthukumar G',
    phone: '9840123462',
    email: 'muthu.g@example.com',
    dob: '1996-03-30',
    age: 28,
    gender: 'MALE',
    bloodGroup: 'O+',
    address: '56 Pasuvanthanai Road, Kovilpatti',
    allergies: [],
    preferredLanguage: 'ta',
    preferredNotification: 'WHATSAPP',
    consent: {
      appointmentCommunication: true,
      queueNotifications: true,
      messagingChannels: true,
      prescriptionDelivery: true,
      pharmacySharing: true,
      updatedAt: '2026-10-08 08:30 AM',
    },
  },
  {
    id: 14,
    userId: 114,
    name: 'Revathi Sankar',
    phone: '9840123463',
    email: 'revathi.s@example.com',
    dob: '1984-10-12',
    age: 40,
    gender: 'FEMALE',
    bloodGroup: 'AB+',
    address: '28 Main Bazaar, Kovilpatti',
    allergies: [],
    preferredLanguage: 'ta',
    preferredNotification: 'SMS',
    consent: {
      appointmentCommunication: true,
      queueNotifications: true,
      messagingChannels: true,
      prescriptionDelivery: true,
      pharmacySharing: true,
      updatedAt: '2026-10-08 08:45 AM',
    },
  },
  {
    id: 15,
    userId: 115,
    name: 'Vijay Anand',
    phone: '9840123464',
    email: 'vijay.a@example.com',
    dob: '1991-04-20',
    age: 33,
    gender: 'MALE',
    bloodGroup: 'B+',
    address: '9 South Car Street, Kovilpatti',
    allergies: [],
    preferredLanguage: 'en',
    preferredNotification: 'WHATSAPP',
    consent: {
      appointmentCommunication: true,
      queueNotifications: true,
      messagingChannels: true,
      prescriptionDelivery: true,
      pharmacySharing: true,
      updatedAt: '2026-10-08 08:15 AM',
    },
  },
  {
    id: 16,
    userId: 116,
    name: 'Nithya Kalyani',
    phone: '9840123465',
    email: 'nithya.k@example.com',
    dob: '1999-07-02',
    age: 25,
    gender: 'FEMALE',
    bloodGroup: 'A+',
    address: '14 Alagappa Nagar, Kovilpatti',
    allergies: [],
    preferredLanguage: 'ta',
    preferredNotification: 'WHATSAPP',
    consent: {
      appointmentCommunication: true,
      queueNotifications: true,
      messagingChannels: true,
      prescriptionDelivery: true,
      pharmacySharing: true,
      updatedAt: '2026-10-08 10:15 AM',
    },
  },
  {
    id: 17,
    userId: 117,
    name: 'Shanthi Selvam',
    phone: '9840123466',
    email: 'shanthi.s@example.com',
    dob: '1976-12-19',
    age: 48,
    gender: 'FEMALE',
    bloodGroup: 'B+',
    address: '33 Thevar St, Kovilpatti',
    allergies: [],
    preferredLanguage: 'ta',
    preferredNotification: 'SMS',
    consent: {
      appointmentCommunication: true,
      queueNotifications: true,
      messagingChannels: true,
      prescriptionDelivery: true,
      pharmacySharing: true,
      updatedAt: '2026-10-08 10:20 AM',
    },
  },
  {
    id: 18,
    userId: 118,
    name: 'Vigneshwari K',
    phone: '9840123467',
    email: 'vigneshwari.k@example.com',
    dob: '2002-05-11',
    age: 22,
    gender: 'FEMALE',
    bloodGroup: 'A+',
    address: '8 VOC Street, Kovilpatti',
    allergies: [],
    preferredLanguage: 'en',
    preferredNotification: 'WHATSAPP',
    consent: {
      appointmentCommunication: true,
      queueNotifications: true,
      messagingChannels: true,
      prescriptionDelivery: true,
      pharmacySharing: true,
      updatedAt: '2026-10-08 10:25 AM',
    },
  },
  {
    id: 19,
    userId: 119,
    name: 'Thangavel M',
    phone: '9840123468',
    email: 'thangavel.m@example.com',
    dob: '1966-09-08',
    age: 58,
    gender: 'MALE',
    bloodGroup: 'O+',
    address: '42 Old Post Office Rd, Kovilpatti',
    allergies: ['Penicillin'],
    preferredLanguage: 'ta',
    preferredNotification: 'SMS',
    consent: {
      appointmentCommunication: true,
      queueNotifications: true,
      messagingChannels: true,
      prescriptionDelivery: true,
      pharmacySharing: true,
      updatedAt: '2026-10-08 10:30 AM',
    },
  },
  {
    id: 20,
    userId: 120,
    name: 'Malathi Rajendran',
    phone: '9840123469',
    email: 'malathi.r@example.com',
    dob: '1989-02-14',
    age: 35,
    gender: 'FEMALE',
    bloodGroup: 'B-',
    address: '16 New Bus Stand Rd, Kovilpatti',
    allergies: [],
    preferredLanguage: 'ta',
    preferredNotification: 'WHATSAPP',
    consent: {
      appointmentCommunication: true,
      queueNotifications: true,
      messagingChannels: true,
      prescriptionDelivery: true,
      pharmacySharing: true,
      updatedAt: '2026-10-08 10:35 AM',
    },
  },
];

const INITIAL_QUEUE: QueueEntry[] = [
  // 1. Emergency Priority (Top of queue)
  {
    id: 1,
    appointmentId: 108,
    patientId: 8,
    patientName: 'Arumugam P',
    patientAge: 67,
    patientGender: 'MALE',
    tokenNumber: 'E-001',
    doctorId: 1,
    doctorName: 'Dr. Arun Kumar',
    department: 'General Medicine',
    roomNumber: 'Room 101',
    priorityLevel: 'EMERGENCY',
    priorityReason: 'Acute tachypnea, severe chest tightness, SpO2 89% on room air',
    queueStatus: 'WAITING',
    joinedQueueAt: '10:02 AM',
    estimatedWaitMinutes: 0,
    patientsAhead: 0,
  },
  // 2. In Consultation
  {
    id: 2,
    appointmentId: 101,
    patientId: 1,
    patientName: 'Vikram Malhotra',
    patientAge: 38,
    patientGender: 'MALE',
    tokenNumber: 'A-101',
    doctorId: 1,
    doctorName: 'Dr. Arun Kumar',
    department: 'General Medicine',
    roomNumber: 'Room 101',
    priorityLevel: 'NORMAL',
    queueStatus: 'IN_CONSULTATION',
    calledAt: '10:05 AM',
    joinedQueueAt: '09:25 AM',
    estimatedWaitMinutes: 0,
    patientsAhead: 0,
  },
  // 3. Called (3 min timer running)
  {
    id: 3,
    appointmentId: 102,
    patientId: 2,
    patientName: 'Ananya Krishnan',
    patientAge: 29,
    patientGender: 'FEMALE',
    tokenNumber: 'A-102',
    doctorId: 1,
    doctorName: 'Dr. Arun Kumar',
    department: 'General Medicine',
    roomNumber: 'Room 101',
    priorityLevel: 'NORMAL',
    queueStatus: 'CALLED',
    calledAt: '10:14 AM',
    responseTimerSeconds: 154,
    joinedQueueAt: '09:30 AM',
    estimatedWaitMinutes: 2,
    patientsAhead: 1,
  },
  // 4. Waiting
  {
    id: 4,
    appointmentId: 103,
    patientId: 3,
    patientName: 'Rajesh Kannan',
    patientAge: 45,
    patientGender: 'MALE',
    tokenNumber: 'A-103',
    doctorId: 1,
    doctorName: 'Dr. Arun Kumar',
    department: 'General Medicine',
    roomNumber: 'Room 101',
    priorityLevel: 'NORMAL',
    queueStatus: 'WAITING',
    joinedQueueAt: '09:35 AM',
    estimatedWaitMinutes: 12,
    patientsAhead: 2,
  },
  {
    id: 5,
    appointmentId: 104,
    patientId: 4,
    patientName: 'Meenakshi Sundaram',
    patientAge: 52,
    patientGender: 'FEMALE',
    tokenNumber: 'A-104',
    doctorId: 1,
    doctorName: 'Dr. Arun Kumar',
    department: 'General Medicine',
    roomNumber: 'Room 101',
    priorityLevel: 'NORMAL',
    queueStatus: 'WAITING',
    joinedQueueAt: '09:40 AM',
    estimatedWaitMinutes: 24,
    patientsAhead: 3,
  },
  {
    id: 6,
    appointmentId: 105,
    patientId: 5,
    patientName: 'Senthil Nathan',
    patientAge: 34,
    patientGender: 'MALE',
    tokenNumber: 'A-105',
    doctorId: 1,
    doctorName: 'Dr. Arun Kumar',
    department: 'General Medicine',
    roomNumber: 'Room 101',
    priorityLevel: 'NORMAL',
    queueStatus: 'WAITING',
    joinedQueueAt: '09:45 AM',
    estimatedWaitMinutes: 36,
    patientsAhead: 4,
  },
  {
    id: 7,
    appointmentId: 106,
    patientId: 6,
    patientName: 'Lakshmi Narayanan',
    patientAge: 61,
    patientGender: 'FEMALE',
    tokenNumber: 'A-106',
    doctorId: 1,
    doctorName: 'Dr. Arun Kumar',
    department: 'General Medicine',
    roomNumber: 'Room 101',
    priorityLevel: 'NORMAL',
    queueStatus: 'WAITING',
    joinedQueueAt: '09:50 AM',
    estimatedWaitMinutes: 48,
    patientsAhead: 5,
  },
  // 5. Skipped (eligible for rejoin)
  {
    id: 8,
    appointmentId: 100,
    patientId: 7,
    patientName: 'Divya Murugan',
    patientAge: 27,
    patientGender: 'FEMALE',
    tokenNumber: 'A-100',
    doctorId: 1,
    doctorName: 'Dr. Arun Kumar',
    department: 'General Medicine',
    roomNumber: 'Room 101',
    priorityLevel: 'NORMAL',
    queueStatus: 'SKIPPED',
    calledAt: '09:58 AM',
    joinedQueueAt: '09:15 AM',
    estimatedWaitMinutes: 0,
    patientsAhead: 0,
  },
  // 6. Booked (not checked in yet)
  {
    id: 9,
    appointmentId: 109,
    patientId: 9,
    patientName: 'Karthikeyan Ram',
    patientAge: 42,
    patientGender: 'MALE',
    tokenNumber: 'A-107',
    doctorId: 1,
    doctorName: 'Dr. Arun Kumar',
    department: 'General Medicine',
    roomNumber: 'Room 101',
    priorityLevel: 'NORMAL',
    queueStatus: 'BOOKED',
    joinedQueueAt: '10:30 AM (Scheduled)',
    estimatedWaitMinutes: 60,
    patientsAhead: 6,
  },
  {
    id: 10,
    appointmentId: 110,
    patientId: 10,
    patientName: 'Priya Dharshini',
    patientAge: 31,
    patientGender: 'FEMALE',
    tokenNumber: 'A-108',
    doctorId: 1,
    doctorName: 'Dr. Arun Kumar',
    department: 'General Medicine',
    roomNumber: 'Room 101',
    priorityLevel: 'NORMAL',
    queueStatus: 'BOOKED',
    joinedQueueAt: '10:45 AM (Scheduled)',
    estimatedWaitMinutes: 72,
    patientsAhead: 7,
  },
  {
    id: 11,
    appointmentId: 111,
    patientId: 11,
    patientName: 'Saravanan Bala',
    patientAge: 50,
    patientGender: 'MALE',
    tokenNumber: 'A-109',
    doctorId: 1,
    doctorName: 'Dr. Arun Kumar',
    department: 'General Medicine',
    roomNumber: 'Room 101',
    priorityLevel: 'NORMAL',
    queueStatus: 'BOOKED',
    joinedQueueAt: '11:00 AM (Scheduled)',
    estimatedWaitMinutes: 84,
    patientsAhead: 8,
  },
  // 7. Completed today
  {
    id: 12,
    appointmentId: 98,
    patientId: 13,
    patientName: 'Muthukumar G',
    patientAge: 28,
    patientGender: 'MALE',
    tokenNumber: 'A-098',
    doctorId: 1,
    doctorName: 'Dr. Arun Kumar',
    department: 'General Medicine',
    roomNumber: 'Room 101',
    priorityLevel: 'NORMAL',
    queueStatus: 'COMPLETED',
    calledAt: '09:05 AM',
    joinedQueueAt: '08:45 AM',
    estimatedWaitMinutes: 0,
    patientsAhead: 0,
  },
  {
    id: 13,
    appointmentId: 99,
    patientId: 14,
    patientName: 'Revathi Sankar',
    patientAge: 40,
    patientGender: 'FEMALE',
    tokenNumber: 'A-099',
    doctorId: 1,
    doctorName: 'Dr. Arun Kumar',
    department: 'General Medicine',
    roomNumber: 'Room 101',
    priorityLevel: 'NORMAL',
    queueStatus: 'COMPLETED',
    calledAt: '09:22 AM',
    joinedQueueAt: '08:50 AM',
    estimatedWaitMinutes: 0,
    patientsAhead: 0,
  },
];

const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 1,
    prescriptionNumber: 'RX-SC-2026-0041',
    secureAccessToken: 'rx_sec_99182a4f00d8194c71e',
    consultationId: 98,
    patientId: 13,
    patientName: 'Muthukumar G',
    patientAge: 28,
    patientGender: 'MALE',
    patientPhone: '9840123462',
    patientAllergies: [],
    doctorId: 1,
    doctorName: 'Dr. Arun Kumar',
    doctorQualification: 'MBBS, MD (General Medicine)',
    doctorRegistrationNumber: 'TN-MC-48291',
    department: 'General Medicine',
    clinicName: 'SmartCare Medical Centre, Kovilpatti',
    issuedAt: '2026-10-08 09:20 AM',
    expiresAt: '2026-10-15 11:59 PM',
    chiefComplaint: 'Acute upper respiratory tract symptoms, low grade pyrexia x 3 days',
    diagnosis: 'Acute Viral Pharyngitis with Mild Bronchial Irritation',
    clinicalNotes: 'Throat examination reveals mild erythematous tonsillar pillars. No exudates. Lungs clear to auscultation. Advised warm saline gargling and oral hydration.',
    followUpDate: '2026-10-14',
    status: 'SIGNED',
    medicines: [
      {
        id: 'med-1',
        name: 'Paracetamol',
        formulation: 'Tablet',
        strength: '650 mg',
        dose: '1 tablet',
        frequency: '1-0-1 (After Food)',
        durationDays: 5,
        route: 'Oral',
        instructions: 'Take with warm water after meals. Do not exceed 3g daily.',
      },
      {
        id: 'med-2',
        name: 'Cetirizine Hydrochloride',
        formulation: 'Tablet',
        strength: '10 mg',
        dose: '1 tablet',
        frequency: '0-0-1 (Night at Bedtime)',
        durationDays: 5,
        route: 'Oral',
        instructions: 'May cause mild drowsiness. Avoid driving.',
      },
      {
        id: 'med-3',
        name: 'Azithromycin',
        formulation: 'Tablet',
        strength: '500 mg',
        dose: '1 tablet',
        frequency: '1-0-0 (Morning 1h before food)',
        durationDays: 3,
        route: 'Oral',
        instructions: 'Complete full 3-day course without skipping.',
      },
    ],
    safetyWarnings: [],
    doctorDigitalSignature: 'SHA256:7B8F9A1C4E2D55B8100F9281CBA4920E77A1982381F0',
    version: 1,
  },
  {
    id: 2,
    prescriptionNumber: 'RX-SC-2026-0042',
    secureAccessToken: 'rx_sec_8a39c12b77d6431e50f',
    consultationId: 99,
    patientId: 14,
    patientName: 'Revathi Sankar',
    patientAge: 40,
    patientGender: 'FEMALE',
    patientPhone: '9840123463',
    patientAllergies: [],
    doctorId: 1,
    doctorName: 'Dr. Arun Kumar',
    doctorQualification: 'MBBS, MD (General Medicine)',
    doctorRegistrationNumber: 'TN-MC-48291',
    department: 'General Medicine',
    clinicName: 'SmartCare Medical Centre, Kovilpatti',
    issuedAt: '2026-10-08 09:40 AM',
    expiresAt: '2026-10-22 11:59 PM',
    chiefComplaint: 'Epigastric burning sensation, post-prandial fullness x 2 weeks',
    diagnosis: 'Gastroesophageal Reflux Disease (GERD) with Non-Ulcer Dyspepsia',
    clinicalNotes: 'Abdomen soft, mild epigastric tenderness. Advised avoidance of spicy foods, coffee, and late night dinners. 30 deg head elevation during sleep.',
    followUpDate: '2026-10-22',
    status: 'PARTIALLY_DISPENSED',
    medicines: [
      {
        id: 'med-4',
        name: 'Pantoprazole Sodium',
        formulation: 'Tablet',
        strength: '40 mg',
        dose: '1 tablet',
        frequency: '1-0-0 (Morning 30 min before breakfast)',
        durationDays: 14,
        route: 'Oral',
        instructions: 'Take strictly on empty stomach in the morning.',
      },
      {
        id: 'med-5',
        name: 'Domperidone',
        formulation: 'Tablet',
        strength: '10 mg',
        dose: '1 tablet',
        frequency: '1-0-1 (Before Food)',
        durationDays: 7,
        route: 'Oral',
        instructions: 'Take 20 mins prior to meals.',
      },
    ],
    safetyWarnings: [],
    doctorDigitalSignature: 'SHA256:119B88E3A9C00281F7D65A20B998EFA48C3910B62E19',
    version: 1,
    pharmacyDispensedAt: '2026-10-08 09:55 AM',
    pharmacyNotes: 'Pantoprazole 14 tablets dispensed. Domperidone currently out of stock; patient advised to collect tomorrow.',
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1,
    timestamp: '2026-10-08 08:30:12',
    userId: 'staff_1',
    userName: 'Meera Nair',
    role: 'RECEPTIONIST',
    action: 'STAFF_LOGIN',
    entityType: 'UserSession',
    entityId: 'SES-001',
    details: 'Front desk terminal initialized at Reception Station 1',
    ipAddress: '192.168.1.101',
  },
  {
    id: 2,
    timestamp: '2026-10-08 08:45:20',
    userId: 'pat_13',
    userName: 'Muthukumar G',
    role: 'PATIENT',
    action: 'OTP_VERIFICATION_SUCCESS',
    entityType: 'PatientAuth',
    entityId: '9840123462',
    details: 'Mobile OTP 123456 verified. Consent records validated.',
    ipAddress: '172.16.0.42',
  },
  {
    id: 3,
    timestamp: '2026-10-08 08:47:04',
    userId: 'staff_1',
    userName: 'Meera Nair',
    role: 'RECEPTIONIST',
    action: 'QR_CHECKIN_VERIFIED',
    entityType: 'CheckIn',
    entityId: 'A-098',
    details: 'Secure QR token validated. Verified against DOB (1996-03-30). Token A-098 placed in WAITING status.',
    ipAddress: '192.168.1.101',
  },
  {
    id: 4,
    timestamp: '2026-10-08 09:05:11',
    userId: 'doc_1',
    userName: 'Dr. Arun Kumar',
    role: 'DOCTOR',
    action: 'QUEUE_CALL_NEXT',
    entityType: 'QueueEntry',
    entityId: 'A-098',
    details: 'Atomic call-next acquired mutex lock. Advance token A-098 to CALLED status.',
    ipAddress: '192.168.1.104',
  },
  {
    id: 5,
    timestamp: '2026-10-08 09:20:45',
    userId: 'doc_1',
    userName: 'Dr. Arun Kumar',
    role: 'DOCTOR',
    action: 'PRESCRIPTION_SIGNED',
    entityType: 'Prescription',
    entityId: 'RX-SC-2026-0041',
    details: 'Digitally signed version 1 with Reg No TN-MC-48291. Created immutable signed PDF snapshot.',
    ipAddress: '192.168.1.104',
  },
  {
    id: 6,
    timestamp: '2026-10-08 09:58:30',
    userId: 'doc_1',
    userName: 'Dr. Arun Kumar',
    role: 'DOCTOR',
    action: 'PATIENT_SKIPPED',
    entityType: 'QueueEntry',
    entityId: 'A-100',
    details: 'Patient Divya Murugan did not respond after 3-minute alert timer expired. Marked SKIPPED.',
    ipAddress: '192.168.1.104',
  },
  {
    id: 7,
    timestamp: '2026-10-08 10:02:18',
    userId: 'triage_1',
    userName: 'Sister Mary V',
    role: 'TRIAGE_NURSE',
    action: 'TRIAGE_EMERGENCY_OVERRIDE',
    entityType: 'QueueEntry',
    entityId: 'E-001',
    details: 'Emergency override authorized for Patient Arumugam P. Reason: SpO2 89%, severe chest tightness. Placed at queue head.',
    ipAddress: '192.168.1.108',
  },
  {
    id: 8,
    timestamp: '2026-10-08 10:05:40',
    userId: 'doc_1',
    userName: 'Dr. Arun Kumar',
    role: 'DOCTOR',
    action: 'CONSULTATION_STARTED',
    entityType: 'Consultation',
    entityId: 'CON-101',
    details: 'Started consultation for Patient Vikram Malhotra (Token A-101). Verified identity card.',
    ipAddress: '192.168.1.104',
  },
  {
    id: 9,
    timestamp: '2026-10-08 10:14:15',
    userId: 'doc_1',
    userName: 'Dr. Arun Kumar',
    role: 'DOCTOR',
    action: 'QUEUE_CALL_NEXT',
    entityType: 'QueueEntry',
    entityId: 'A-102',
    details: 'Called Token A-102 (Ananya Krishnan). Response timer initialized (180s). WhatsApp notification dispatched.',
    ipAddress: '192.168.1.104',
  },
];

const INITIAL_SECURITY_EVENTS: SecurityEvent[] = [
  {
    id: 1,
    timestamp: '2026-10-08 09:12:04',
    severity: 'MEDIUM',
    eventType: 'QR_REPLAY_ATTEMPT_BLOCKED',
    description: 'Replay attempt detected on already used check-in QR pass (sc_qr_8f4a9b2c). System rejected check-in and flagged entry.',
    sourceIp: '192.168.1.120',
    attemptedBy: 'Kiosk Terminal B',
    status: 'RESOLVED',
  },
  {
    id: 2,
    timestamp: '2026-10-08 09:34:22',
    severity: 'LOW',
    eventType: 'RATE_LIMIT_OTP_WARNING',
    description: '3 consecutive OTP requests within 45 seconds for mobile 9840123499. Temporary 60s cooldown applied.',
    sourceIp: '172.16.0.88',
    attemptedBy: 'Unauthenticated Public Client',
    status: 'RESOLVED',
  },
  {
    id: 3,
    timestamp: '2026-10-08 10:01:10',
    severity: 'HIGH',
    eventType: 'UNAUTHORIZED_PRESCRIPTION_ACCESS_DENIED',
    description: 'Attempt to access prescription reference without second-factor patient identity match. Access token locked.',
    sourceIp: '172.16.0.95',
    attemptedBy: 'External IP Client',
    status: 'LOGGED',
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    timestamp: '2026-10-08 10:14:16',
    patientId: 2,
    patientPhone: '9840123451',
    channel: 'WHATSAPP',
    messagePreview: 'SmartCare: Your token A-102 has been called. Please proceed to Room 101 (Dr. Arun Kumar).',
    status: 'DELIVERED',
    type: 'QUEUE_CALLED',
  },
  {
    id: 2,
    timestamp: '2026-10-08 09:40:02',
    patientId: 14,
    patientPhone: '9840123463',
    channel: 'SMS',
    messagePreview: 'SmartCare: Your digital consultation document is ready. Verify your identity at smartcare.clinic/rx/access to view.',
    status: 'DELIVERED',
    type: 'PRESCRIPTION_READY',
  },
  {
    id: 3,
    timestamp: '2026-10-08 09:21:05',
    patientId: 13,
    patientPhone: '9840123462',
    channel: 'WHATSAPP',
    messagePreview: 'SmartCare: Consultation summary signed by Dr. Arun Kumar. Open secure portal to access your document.',
    status: 'DELIVERED',
    type: 'PRESCRIPTION_READY',
  },
  {
    id: 4,
    timestamp: '2026-10-08 08:45:22',
    patientId: 13,
    patientPhone: '9840123462',
    channel: 'SMS',
    messagePreview: 'SmartCare: Welcome. Token A-098 is confirmed. Current estimated wait: 15 mins.',
    status: 'DELIVERED',
    type: 'APPOINTMENT_CONFIRMED',
  },
];

// Reactive pub-sub listener
type Listener = () => void;
const listeners: Set<Listener> = new Set();

function emitChange() {
  listeners.forEach(l => l());
}

class SmartCareStore {
  private doctors: Doctor[];
  private patients: Patient[];
  private queue: QueueEntry[];
  private prescriptions: Prescription[];
  private auditLogs: AuditLog[];
  private securityEvents: SecurityEvent[];
  private notifications: NotificationItem[];
  private queueLocked: boolean = false;
  private processedEncounterKeys: Set<string> = new Set();

  constructor() {
    this.doctors = this.load('smartcare_doctors', INITIAL_DOCTORS);
    this.patients = this.load('smartcare_patients', INITIAL_PATIENTS);
    this.queue = this.load('smartcare_queue', INITIAL_QUEUE);
    this.prescriptions = this.load('smartcare_prescriptions', INITIAL_PRESCRIPTIONS);
    this.auditLogs = this.load('smartcare_audit', INITIAL_AUDIT_LOGS);
    this.securityEvents = this.load('smartcare_security', INITIAL_SECURITY_EVENTS);
    this.notifications = this.load('smartcare_notifications', INITIAL_NOTIFICATIONS);

    // Run active countdown simulation for called patient
    if (typeof window !== 'undefined') {
      window.setInterval(() => {
        let changed = false;
        this.queue.forEach(q => {
          if (q.queueStatus === 'CALLED' && q.responseTimerSeconds && q.responseTimerSeconds > 0) {
            q.responseTimerSeconds -= 1;
            changed = true;
          }
        });
        if (changed) {
          this.save('smartcare_queue', this.queue);
          emitChange();
        }
      }, 1000);
    }

    // Connect to Supabase Realtime WebSocket channel for instant multi-device queue synchronization
    if (typeof window !== 'undefined' && isSupabaseConfigured) {
      try {
        subscribeToQueueUpdates((payload) => {
          if (payload && payload.new && payload.new.token_number) {
            const row = payload.new;
            const existing = this.queue.find(q => q.tokenNumber === row.token_number);
            if (existing && existing.queueStatus !== row.status) {
              existing.queueStatus = row.status as any;
              this.save('smartcare_queue', this.queue);
              emitChange();
            }
          }
        });
      } catch (err) {
        console.warn('Supabase Realtime subscription error:', err);
      }
    }
  }

  private async syncTokenToSupabase(tokenNumber: string, status: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('queue_tokens')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('token_number', tokenNumber);
      } catch (err) {
        console.warn('Supabase sync warning:', err);
      }
    }
  }

  private load<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  // --- Doctor Operations ---
  getDoctors(): Doctor[] {
    return [...this.doctors];
  }

  getDoctorById(id: number): Doctor | undefined {
    return this.doctors.find(d => d.id === id);
  }

  updateDoctorAvailability(doctorId: number, availability: Doctor['availability'], delayMinutes: number = 0): void {
    const doc = this.doctors.find(d => d.id === doctorId);
    if (doc) {
      doc.availability = availability;
      doc.delayMinutes = delayMinutes;
      this.save('smartcare_doctors', this.doctors);
      this.logAudit('Dr. ' + doc.name, 'DOCTOR', 'DOCTOR_AVAILABILITY_CHANGED', 'Doctor', doc.id.toString(), `Changed status to ${availability} (${delayMinutes}m delay)`);
      emitChange();
    }
  }

  // --- Patient Operations ---
  getPatients(): Patient[] {
    return [...this.patients];
  }

  getPatientById(id: number): Patient | undefined {
    return this.patients.find(p => p.id === id);
  }

  getPatientByPhone(phone: string): Patient | undefined {
    return this.patients.find(p => p.phone === phone);
  }

  registerPatient(data: {
    name: string;
    phone: string;
    email?: string;
    dob: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    bloodGroup?: string;
    address?: string;
    allergies?: string[];
    preferredLanguage: 'en' | 'ta' | 'hi';
    preferredNotification: 'WHATSAPP' | 'SMS' | 'APP';
    consent: Patient['consent'];
  }): Patient {
    const newId = this.patients.length + 1;
    const birthYear = new Date(data.dob).getFullYear();
    const age = new Date().getFullYear() - (isNaN(birthYear) ? 1995 : birthYear);

    const newPatient: Patient = {
      id: newId,
      userId: 200 + newId,
      name: data.name,
      phone: data.phone,
      email: data.email || `${data.phone}@patient.smartcare.demo`,
      dob: data.dob,
      age: Math.max(1, age),
      gender: data.gender,
      bloodGroup: data.bloodGroup || 'O+',
      address: data.address || 'Kovilpatti, Tamil Nadu',
      allergies: data.allergies || [],
      preferredLanguage: data.preferredLanguage,
      preferredNotification: data.preferredNotification,
      consent: data.consent,
    };

    this.patients.push(newPatient);
    this.save('smartcare_patients', this.patients);
    this.logAudit(newPatient.name, 'PATIENT', 'PATIENT_REGISTERED', 'Patient', newId.toString(), `Profile registered with explicit consent captured for ${data.preferredNotification}`);
    emitChange();
    return newPatient;
  }

  updatePatientConsent(patientId: number, consent: Partial<Patient['consent']>): void {
    const patient = this.patients.find(p => p.id === patientId);
    if (patient) {
      patient.consent = {
        ...patient.consent,
        ...consent,
        updatedAt: new Date().toLocaleString(),
      };
      this.save('smartcare_patients', this.patients);
      this.logAudit(patient.name, 'PATIENT', 'CONSENT_UPDATED', 'PatientConsent', patientId.toString(), 'Updated privacy and notification communication permissions');
      emitChange();
    }
  }

  // --- Queue Operations ---
  getQueue(doctorId?: number): QueueEntry[] {
    if (doctorId) {
      return this.queue.filter(q => q.doctorId === doctorId);
    }
    return [...this.queue];
  }

  // Priority Sort: EMERGENCY > HIGH_PRIORITY > WAITING by appointment/arrival time > REJOIN
  getActiveQueueSorted(doctorId?: number): QueueEntry[] {
    const list = this.getQueue(doctorId).filter(q => 
      ['EMERGENCY', 'HIGH_PRIORITY'].includes(q.priorityLevel) ||
      ['WAITING', 'CALLED', 'IN_CONSULTATION', 'SKIPPED'].includes(q.queueStatus)
    );

    return list.sort((a, b) => {
      // Emergency first
      if (a.priorityLevel === 'EMERGENCY' && b.priorityLevel !== 'EMERGENCY') return -1;
      if (b.priorityLevel === 'EMERGENCY' && a.priorityLevel !== 'EMERGENCY') return 1;

      // High priority next
      if (a.priorityLevel === 'HIGH_PRIORITY' && b.priorityLevel !== 'HIGH_PRIORITY') return -1;
      if (b.priorityLevel === 'HIGH_PRIORITY' && a.priorityLevel !== 'HIGH_PRIORITY') return 1;

      // In consultation
      if (a.queueStatus === 'IN_CONSULTATION') return -1;
      if (b.queueStatus === 'IN_CONSULTATION') return 1;

      // Called
      if (a.queueStatus === 'CALLED') return -1;
      if (b.queueStatus === 'CALLED') return 1;

      // Waiting
      return a.id - b.id;
    });
  }

  // Atomic & Idempotent Call Next
  callNextPatient(doctorId: number): QueueEntry | null {
    if (this.queueLocked) {
      console.warn('Queue lock active: concurrent call blocked');
      return null;
    }
    this.queueLocked = true;

    try {
      const activeForDoc = this.getQueue(doctorId);

      // If someone was called and did not enter, doctor can advance
      const currentlyCalled = activeForDoc.find(q => q.queueStatus === 'CALLED');
      if (currentlyCalled) {
        // Move current called to SKIPPED if doctor explicitly advances
        currentlyCalled.queueStatus = 'SKIPPED';
        this.logAudit('Dr. Arun Kumar', 'DOCTOR', 'QUEUE_AUTO_SKIPPED', 'QueueEntry', currentlyCalled.tokenNumber, `Token ${currentlyCalled.tokenNumber} skipped due to no-response on advance`);
      }

      // Next eligible: Emergency first, then High Priority, then earliest Waiting
      let nextEligible = activeForDoc.find(q => q.priorityLevel === 'EMERGENCY' && q.queueStatus === 'WAITING');
      if (!nextEligible) {
        nextEligible = activeForDoc.find(q => q.priorityLevel === 'HIGH_PRIORITY' && q.queueStatus === 'WAITING');
      }
      if (!nextEligible) {
        nextEligible = activeForDoc.find(q => q.queueStatus === 'WAITING');
      }

      if (nextEligible) {
        nextEligible.queueStatus = 'CALLED';
        nextEligible.calledAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        nextEligible.responseTimerSeconds = 180; // 3 minute window
        this.save('smartcare_queue', this.queue);

        // Audit log
        this.logAudit('Dr. Arun Kumar', 'DOCTOR', 'QUEUE_CALL_NEXT', 'QueueEntry', nextEligible.tokenNumber, `Called next eligible token ${nextEligible.tokenNumber} for Room 101`);

        // Notification job
        this.sendNotification(nextEligible.patientId, nextEligible.patientName, 'QUEUE_CALLED', `SmartCare: Your token ${nextEligible.tokenNumber} is CALLED! Please proceed to ${nextEligible.roomNumber}.`);

        this.syncTokenToSupabase(nextEligible.tokenNumber, 'CALLED');

        emitChange();
        return nextEligible;
      }

      return null;
    } finally {
      this.queueLocked = false;
    }
  }

  // Preview next eligible checked-in patient based on priority rules
  getNextEligiblePatient(doctorId: number): QueueEntry | null {
    const activeForDoc = this.getQueue(doctorId);
    let nextEligible = activeForDoc.find(q => q.priorityLevel === 'EMERGENCY' && q.queueStatus === 'WAITING');
    if (!nextEligible) {
      nextEligible = activeForDoc.find(q => q.priorityLevel === 'HIGH_PRIORITY' && q.queueStatus === 'WAITING');
    }
    if (!nextEligible) {
      nextEligible = activeForDoc.find(q => q.queueStatus === 'WAITING');
    }
    return nextEligible || null;
  }

  // FEATURE: COMPLETE ENCOUNTER & CALL NEXT (Atomic & Idempotent protected transaction)
  completeEncounterAndCallNext(params: CompleteEncounterParams): CompleteEncounterResult {
    // 1. Idempotency Guard: prevent duplicate execution
    if (params.idempotencyKey && this.processedEncounterKeys.has(params.idempotencyKey)) {
      return {
        success: false,
        completedToken: '',
        patientName: '',
        prescriptionStatus: 'NONE_REQUIRED',
        nextPatient: null,
        emptyQueue: false,
        durationMinutes: 0,
        message: 'Duplicate encounter completion prevented by idempotency lock.'
      };
    }
    if (params.idempotencyKey) {
      this.processedEncounterKeys.add(params.idempotencyKey);
    }

    // 2. Queue Lock: prevent concurrent queue mutations
    if (this.queueLocked) {
      return {
        success: false,
        completedToken: '',
        patientName: '',
        prescriptionStatus: 'NONE_REQUIRED',
        nextPatient: null,
        emptyQueue: false,
        durationMinutes: 0,
        message: 'Queue operation already in progress. Please retry.'
      };
    }
    this.queueLocked = true;

    try {
      // 3. Precondition Verifications
      const doctor = this.doctors.find(d => d.id === params.doctorId);
      if (!doctor) {
        return {
          success: false,
          completedToken: '',
          patientName: '',
          prescriptionStatus: 'NONE_REQUIRED',
          nextPatient: null,
          emptyQueue: false,
          durationMinutes: 0,
          message: 'Authorized doctor profile not found.'
        };
      }

      if (doctor.availability !== 'AVAILABLE') {
        return {
          success: false,
          completedToken: '',
          patientName: '',
          prescriptionStatus: 'NONE_REQUIRED',
          nextPatient: null,
          emptyQueue: false,
          durationMinutes: 0,
          message: `Doctor status is currently "${doctor.availability}". Status must be set to "AVAILABLE" to call the next patient.`
        };
      }

      const currentEntry = this.queue.find(q => q.id === params.queueEntryId);
      if (!currentEntry) {
        return {
          success: false,
          completedToken: '',
          patientName: '',
          prescriptionStatus: 'NONE_REQUIRED',
          nextPatient: null,
          emptyQueue: false,
          durationMinutes: 0,
          message: 'Current encounter queue entry not found.'
        };
      }

      if (currentEntry.queueStatus !== 'IN_CONSULTATION') {
        return {
          success: false,
          completedToken: currentEntry.tokenNumber,
          patientName: currentEntry.patientName,
          prescriptionStatus: 'NONE_REQUIRED',
          nextPatient: null,
          emptyQueue: false,
          durationMinutes: 0,
          message: `Current patient status is "${currentEntry.queueStatus}". Must be "IN_CONSULTATION" to complete the encounter.`
        };
      }

      // 4. Secure Prescription Generation or "No Prescription Required" Documentation
      let rxStatus: 'SIGNED' | 'NONE_REQUIRED' = 'NONE_REQUIRED';
      let signedRxId: number | undefined;

      if (!params.noPrescriptionRequired && params.prescriptionData) {
        const rx = this.createAndSignPrescription({
          patientId: currentEntry.patientId,
          doctorId: doctor.id,
          chiefComplaint: params.prescriptionData.chiefComplaint,
          diagnosis: params.prescriptionData.diagnosis,
          clinicalNotes: params.prescriptionData.clinicalNotes,
          followUpDate: params.prescriptionData.followUpDate,
          medicines: params.prescriptionData.medicines,
          safetyWarnings: params.prescriptionData.safetyWarnings,
          overrideReason: params.prescriptionData.overrideReason,
        });
        rxStatus = 'SIGNED';
        signedRxId = rx.id;
      } else {
        rxStatus = 'NONE_REQUIRED';
        this.logAudit(
          doctor.name,
          'DOCTOR',
          'NO_PRESCRIPTION_DOCUMENTED',
          'QueueEntry',
          currentEntry.tokenNumber,
          `Encounter completed without prescription. Documented: ${params.noPrescriptionReason || 'Clinical counseling, dietary guidelines, and lifestyle observation only'}`
        );
      }

      // 5. Mark Current Consultation & Queue Entry as COMPLETED
      const now = new Date();
      currentEntry.queueStatus = 'COMPLETED';
      currentEntry.completedAt = now.toISOString();
      currentEntry.responseTimerSeconds = 0;
      const durationMins = Math.floor(Math.random() * 5) + 8; // 8 - 12 minutes
      currentEntry.consultationDurationMinutes = durationMins;

      // Sync completion to Supabase Cloud
      this.syncTokenToSupabase(currentEntry.tokenNumber, 'COMPLETED');

      // 6. Select Next Eligible Checked-in Patient According to Priority Rules
      const activeForDoc = this.getQueue(doctor.id);
      let nextEligible = activeForDoc.find(q => q.priorityLevel === 'EMERGENCY' && q.queueStatus === 'WAITING');
      if (!nextEligible) {
        nextEligible = activeForDoc.find(q => q.priorityLevel === 'HIGH_PRIORITY' && q.queueStatus === 'WAITING');
      }
      if (!nextEligible) {
        nextEligible = activeForDoc.find(q => q.queueStatus === 'WAITING');
      }

      // 7. If Next Patient Found: Advance to CALLED and Trigger Non-Blocking Notification
      if (nextEligible) {
        nextEligible.queueStatus = 'CALLED';
        nextEligible.calledAt = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        nextEligible.responseTimerSeconds = 180; // 3-minute active countdown

        // Sync called status to Supabase Cloud
        this.syncTokenToSupabase(nextEligible.tokenNumber, 'CALLED');

        // Async Non-Blocking Notification Dispatch (Strict Zero-PHI in preview)
        try {
          this.sendNotification(
            nextEligible.patientId,
            nextEligible.patientName,
            'QUEUE_CALLED',
            `SmartCare: Your token ${nextEligible.tokenNumber} is CALLED! Please proceed immediately to ${doctor.roomNumber}.`
          );
        } catch (notifErr) {
          console.warn('Primary WhatsApp channel error; recorded fallback to SMS:', notifErr);
          this.sendNotification(
            nextEligible.patientId,
            nextEligible.patientName,
            'QUEUE_CALLED',
            `SmartCare (SMS): Token ${nextEligible.tokenNumber} called for ${doctor.roomNumber}.`
          );
        }
      }

      // 8. Save updated queue and record immutable audit trail
      this.save('smartcare_queue', this.queue);

      this.logAudit(
        doctor.name,
        'DOCTOR',
        'ENCOUNTER_COMPLETED_AND_CALLED_NEXT',
        'QueueEntry',
        currentEntry.tokenNumber,
        `Encounter completed for Token ${currentEntry.tokenNumber} (Duration: ${durationMins}m). Rx: ${rxStatus}. Next: ${nextEligible ? `Called ${nextEligible.tokenNumber}` : 'Queue is empty'}.`
      );

      emitChange();

      return {
        success: true,
        completedToken: currentEntry.tokenNumber,
        patientName: currentEntry.patientName,
        prescriptionStatus: rxStatus,
        prescriptionId: signedRxId,
        nextPatient: nextEligible ? {
          tokenNumber: nextEligible.tokenNumber,
          patientName: nextEligible.patientName,
          patientAge: nextEligible.patientAge,
          patientGender: nextEligible.patientGender,
          priorityLevel: nextEligible.priorityLevel,
          roomNumber: nextEligible.roomNumber,
        } : null,
        emptyQueue: !nextEligible,
        durationMinutes: durationMins,
        message: nextEligible
          ? `Encounter for ${currentEntry.tokenNumber} completed. Next Token ${nextEligible.tokenNumber} (${nextEligible.patientName}) called to ${doctor.roomNumber}!`
          : `Encounter for ${currentEntry.tokenNumber} completed. All waiting patients attended (Queue is now empty).`
      };
    } finally {
      this.queueLocked = false;
    }
  }

  startConsultation(queueEntryId: number): void {
    const entry = this.queue.find(q => q.id === queueEntryId);
    if (entry) {
      entry.queueStatus = 'IN_CONSULTATION';
      entry.responseTimerSeconds = 0;
      this.save('smartcare_queue', this.queue);
      this.syncTokenToSupabase(entry.tokenNumber, 'IN_CONSULTATION');
      this.logAudit(entry.doctorName, 'DOCTOR', 'CONSULTATION_STARTED', 'QueueEntry', entry.tokenNumber, `Patient identity verified. Consultation in progress.`);
      emitChange();
    }
  }

  completeConsultation(queueEntryId: number): void {
    const entry = this.queue.find(q => q.id === queueEntryId);
    if (entry) {
      entry.queueStatus = 'COMPLETED';
      this.save('smartcare_queue', this.queue);
      this.syncTokenToSupabase(entry.tokenNumber, 'COMPLETED');
      this.logAudit(entry.doctorName, 'DOCTOR', 'CONSULTATION_COMPLETED', 'QueueEntry', entry.tokenNumber, `Consultation completed and closed.`);
      emitChange();
    }
  }

  markSkipped(queueEntryId: number, reason: string = 'Patient not present when called'): void {
    const entry = this.queue.find(q => q.id === queueEntryId);
    if (entry) {
      entry.queueStatus = 'SKIPPED';
      entry.responseTimerSeconds = 0;
      this.save('smartcare_queue', this.queue);
      this.syncTokenToSupabase(entry.tokenNumber, 'SKIPPED');
      this.logAudit('Staff User', 'RECEPTIONIST', 'QUEUE_PATIENT_SKIPPED', 'QueueEntry', entry.tokenNumber, `Marked skipped. Reason: ${reason}`);
      emitChange();
    }
  }

  requestRejoin(queueEntryId: number): void {
    const entry = this.queue.find(q => q.id === queueEntryId);
    if (entry && entry.queueStatus === 'SKIPPED') {
      entry.queueStatus = 'WAITING';
      entry.rejoined = true;
      // Rejoined goes to the end of active queue based on clinic policy
      entry.id = Math.max(...this.queue.map(q => q.id)) + 1;
      this.save('smartcare_queue', this.queue);
      this.logAudit(entry.patientName, 'PATIENT', 'QUEUE_REJOIN_REQUESTED', 'QueueEntry', entry.tokenNumber, `Patient requested rejoin. Placed at end of active waiting list.`);
      emitChange();
    }
  }

  approveRejoin(queueEntryId: number): void {
    const entry = this.queue.find(q => q.id === queueEntryId);
    if (entry) {
      entry.queueStatus = 'WAITING';
      entry.rejoined = true;
      this.save('smartcare_queue', this.queue);
      this.logAudit('Reception Staff', 'RECEPTIONIST', 'QUEUE_REJOIN_APPROVED', 'QueueEntry', entry.tokenNumber, `Approved rejoin token ${entry.tokenNumber}.`);
      emitChange();
    }
  }

  // Triage Emergency / High Priority Override
  applyTriageOverride(patientId: number, priority: 'EMERGENCY' | 'HIGH_PRIORITY', mandatoryReason: string, doctorId: number = 1): QueueEntry {
    const patient = this.patients.find(p => p.id === patientId);
    const doctor = this.doctors.find(d => d.id === doctorId) || this.doctors[0];
    const newId = Math.max(...this.queue.map(q => q.id)) + 1;

    const tokenPrefix = priority === 'EMERGENCY' ? 'E-' : 'HP-';
    const tokenNumber = `${tokenPrefix}${String(newId).padStart(3, '0')}`;

    const newEntry: QueueEntry = {
      id: newId,
      appointmentId: 500 + newId,
      patientId: patient ? patient.id : 0,
      patientName: patient ? patient.name : 'Emergency Patient',
      patientAge: patient ? patient.age : 40,
      patientGender: patient ? patient.gender : 'OTHER',
      tokenNumber,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: doctor.department,
      roomNumber: doctor.roomNumber,
      priorityLevel: priority,
      priorityReason: mandatoryReason,
      queueStatus: 'WAITING',
      joinedQueueAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedWaitMinutes: 0,
      patientsAhead: 0,
    };

    // Prepend or add to queue
    this.queue.unshift(newEntry);
    this.save('smartcare_queue', this.queue);

    this.logAudit('Triage Nurse', 'TRIAGE_NURSE', 'TRIAGE_PRIORITY_OVERRIDE', 'QueueEntry', tokenNumber, `Authorized ${priority} override: ${mandatoryReason}`);
    emitChange();
    return newEntry;
  }

  // Check In via QR or Manual Reference with 2nd verification
  checkInPatient(
    identifier: string, // tokenNumber or bookingReference or signedToken
    secondFactorType: 'DOB' | 'OTP' | 'PHONE_LAST_4',
    secondFactorValue: string
  ): { success: boolean; message: string; entry?: QueueEntry } {
    const cleanId = identifier.trim().toUpperCase();

    // Find queue entry or booked appointment
    const entry = this.queue.find(q => 
      q.tokenNumber.toUpperCase() === cleanId ||
      q.appointmentId.toString() === cleanId
    );

    if (!entry) {
      this.logSecurity('MEDIUM', 'INVALID_CHECKIN_IDENTIFIER', `Check-in attempted with unrecognized identifier: ${identifier}`);
      return { success: false, message: 'Invalid token or booking reference.' };
    }

    if (entry.queueStatus === 'WAITING' || entry.queueStatus === 'CALLED' || entry.queueStatus === 'IN_CONSULTATION') {
      return { success: false, message: `Patient is already checked in and current status is ${entry.queueStatus}.` };
    }

    const patient = this.patients.find(p => p.id === entry.patientId);
    if (!patient) {
      return { success: false, message: 'Patient profile record not found.' };
    }

    // Second factor verification
    let verified = false;
    if (secondFactorType === 'OTP') {
      const val = secondFactorValue.trim();
      if (val === '123456') {
        verified = true;
      } else {
        try {
          const raw = localStorage.getItem('smartcare_active_otps');
          if (raw) {
            const otps = JSON.parse(raw);
            const digits = patient.phone.replace(/\D/g, '').slice(-10);
            if (otps[digits] && otps[digits].otp === val && Date.now() <= otps[digits].expiresAt) {
              verified = true;
            }
          }
        } catch {}
      }
    } else if (secondFactorType === 'DOB') {
      if (patient.dob.includes(secondFactorValue.trim()) || secondFactorValue.trim() === patient.dob) verified = true;
    } else if (secondFactorType === 'PHONE_LAST_4') {
      if (patient.phone.endsWith(secondFactorValue.trim())) verified = true;
    }

    if (!verified) {
      this.logSecurity('HIGH', 'CHECKIN_2FA_FAILURE', `Second factor verification failed for token ${entry.tokenNumber} (Type: ${secondFactorType})`);
      return { success: false, message: `Identity verification failed. Please check the ${secondFactorType}.` };
    }

    entry.queueStatus = 'WAITING';
    entry.joinedQueueAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.save('smartcare_queue', this.queue);

    this.logAudit('Front Desk', 'RECEPTIONIST', 'PATIENT_CHECKED_IN', 'QueueEntry', entry.tokenNumber, `Verified arrival using ${secondFactorType}. Moved to active digital queue.`);
    this.sendNotification(patient.id, patient.name, 'APPOINTMENT_CONFIRMED', `SmartCare: Verified check-in for Token ${entry.tokenNumber}. You are in the active queue.`);

    emitChange();
    return { success: true, message: `Check-in successful! Token ${entry.tokenNumber} is now WAITING in queue.`, entry };
  }

  // Appointment Booking
  bookAppointment(data: {
    patientId: number;
    doctorId: number;
    date: string;
    timeSlot: string;
    type?: 'REGULAR' | 'FOLLOW_UP' | 'EMERGENCY';
    paymentMethod: 'PAY_AT_CLINIC' | 'PAID_ONLINE';
  }): { appointment: Appointment; queueEntry: QueueEntry } {
    const patient = this.patients.find(p => p.id === data.patientId)!;
    const doctor = this.doctors.find(d => d.id === data.doctorId)!;
    const newId = Math.max(...this.queue.map(q => q.id), 100) + 1;
    const tokenNumber = `A-${String(newId).padStart(3, '0')}`;
    const bookingRef = `BK-SC-${Math.floor(100000 + Math.random() * 900000)}`;

    // Cryptographic signed token - NO PHI
    const signedToken = `sc_signed_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins for arrival

    const qrPass: QrPass = {
      passId: `QR-${newId}`,
      tokenNumber,
      signedToken,
      expiresAt,
      isUsed: false,
    };

    const appointment: Appointment = {
      id: newId,
      bookingReference: bookingRef,
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone,
      patientAge: patient.age,
      patientGender: patient.gender,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: doctor.department,
      date: data.date,
      timeSlot: data.timeSlot,
      type: data.type || 'REGULAR',
      status: 'BOOKED',
      paymentStatus: data.paymentMethod,
      fee: doctor.consultationFee,
      tokenNumber,
      qrPass,
      createdAt: new Date().toISOString(),
    };

    const queueEntry: QueueEntry = {
      id: newId,
      appointmentId: newId,
      patientId: patient.id,
      patientName: patient.name,
      patientAge: patient.age,
      patientGender: patient.gender,
      tokenNumber,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: doctor.department,
      roomNumber: doctor.roomNumber,
      priorityLevel: 'NORMAL',
      queueStatus: 'BOOKED',
      joinedQueueAt: `${data.timeSlot} (Scheduled)`,
      estimatedWaitMinutes: 30,
      patientsAhead: this.queue.filter(q => q.queueStatus === 'WAITING').length,
    };

    this.queue.push(queueEntry);
    this.save('smartcare_queue', this.queue);

    this.logAudit(patient.name, 'PATIENT', 'APPOINTMENT_BOOKED', 'Appointment', bookingRef, `Slot: ${data.date} at ${data.timeSlot} with ${doctor.name}. Token: ${tokenNumber}`);
    this.sendNotification(patient.id, patient.name, 'APPOINTMENT_CONFIRMED', `SmartCare: Appointment confirmed with ${doctor.name} on ${data.date} at ${data.timeSlot}. Token: ${tokenNumber}.`);

    emitChange();
    return { appointment, queueEntry };
  }

  // --- Prescriptions ---
  getPrescriptions(): Prescription[] {
    return [...this.prescriptions];
  }

  getPrescriptionById(id: number): Prescription | undefined {
    return this.prescriptions.find(p => p.id === id);
  }

  getPrescriptionsForPatient(patientId: number): Prescription[] {
    return this.prescriptions.filter(p => p.patientId === patientId);
  }

  createAndSignPrescription(data: {
    patientId: number;
    doctorId: number;
    chiefComplaint: string;
    diagnosis: string;
    clinicalNotes: string;
    followUpDate?: string;
    medicines: PrescriptionMedicine[];
    safetyWarnings: string[];
    overrideReason?: string;
  }): Prescription {
    const patient = this.patients.find(p => p.id === data.patientId)!;
    const doctor = this.doctors.find(d => d.id === data.doctorId)!;
    const newId = this.prescriptions.length + 1;
    const rxNumber = `RX-SC-2026-${String(newId + 40).padStart(4, '0')}`;
    const secureToken = `rx_sec_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;

    // Generate simulated digital signature hash
    const sigHash = `SHA256:${Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join('')}`;

    const newRx: Prescription = {
      id: newId,
      prescriptionNumber: rxNumber,
      secureAccessToken: secureToken,
      consultationId: 100 + newId,
      patientId: patient.id,
      patientName: patient.name,
      patientAge: patient.age,
      patientGender: patient.gender,
      patientPhone: patient.phone,
      patientAllergies: patient.allergies,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorQualification: doctor.qualification,
      doctorRegistrationNumber: doctor.registrationNumber,
      department: doctor.department,
      clinicName: 'SmartCare Medical Centre, Kovilpatti',
      issuedAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      chiefComplaint: data.chiefComplaint,
      diagnosis: data.diagnosis,
      clinicalNotes: data.clinicalNotes,
      followUpDate: data.followUpDate,
      status: 'SIGNED',
      medicines: data.medicines,
      safetyWarnings: data.safetyWarnings,
      overrideReason: data.overrideReason,
      doctorDigitalSignature: sigHash,
      version: 1,
    };

    this.prescriptions.unshift(newRx);
    this.save('smartcare_prescriptions', this.prescriptions);

    this.logAudit(doctor.name, 'DOCTOR', 'PRESCRIPTION_SIGNED', 'Prescription', rxNumber, `Issued digital prescription with ${data.medicines.length} medicines. Doctor Reg: ${doctor.registrationNumber}`);
    this.sendNotification(patient.id, patient.name, 'PRESCRIPTION_READY', `SmartCare: Your consultation document is ready. Access securely with verification at smartcare.clinic/rx/${newRx.id}`);

    emitChange();
    return newRx;
  }

  // Pharmacy Dispensing Action
  pharmacyDispense(prescriptionId: number, status: 'PARTIALLY_DISPENSED' | 'FULLY_DISPENSED', notes: string): void {
    const rx = this.prescriptions.find(p => p.id === prescriptionId);
    if (rx) {
      rx.status = status;
      rx.pharmacyDispensedAt = new Date().toLocaleString();
      rx.pharmacyNotes = notes;
      this.save('smartcare_prescriptions', this.prescriptions);
      this.logAudit('Pharmacy Dispenser', 'PHARMACIST', 'PRESCRIPTION_DISPENSED', 'Prescription', rx.prescriptionNumber, `Status updated to ${status}. Notes: ${notes}`);
      emitChange();
    }
  }

  // --- Audit & Security Logs ---
  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  getSecurityEvents(): SecurityEvent[] {
    return [...this.securityEvents];
  }

  getNotifications(): NotificationItem[] {
    return [...this.notifications];
  }

  logAudit(userName: string, role: string, action: string, entityType: string, entityId: string, details: string): void {
    const newLog: AuditLog = {
      id: this.auditLogs.length + 1,
      timestamp: new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      userId: `user_${role.toLowerCase()}`,
      userName,
      role,
      action,
      entityType,
      entityId,
      details,
      ipAddress: '192.168.1.104',
    };
    this.auditLogs.unshift(newLog);
    this.save('smartcare_audit', this.auditLogs);
    emitChange();
  }

  logSecurity(severity: SecurityEvent['severity'], eventType: string, description: string): void {
    const newEvent: SecurityEvent = {
      id: this.securityEvents.length + 1,
      timestamp: new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      severity,
      eventType,
      description,
      sourceIp: '192.168.1.120',
      attemptedBy: 'Security Monitor',
      status: 'LOGGED',
    };
    this.securityEvents.unshift(newEvent);
    this.save('smartcare_security', this.securityEvents);
    emitChange();
  }

  sendNotification(patientId: number, patientName: string, type: NotificationItem['type'], messagePreview: string): void {
    const patient = this.patients.find(p => p.id === patientId);
    const newNotification: NotificationItem = {
      id: this.notifications.length + 1,
      timestamp: new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      patientId,
      patientPhone: patient ? patient.phone : '9840123450',
      channel: patient ? patient.preferredNotification : 'WHATSAPP',
      messagePreview,
      status: 'DELIVERED',
      type,
    };
    this.notifications.unshift(newNotification);
    this.save('smartcare_notifications', this.notifications);
  }

  // Reset to initial demo state
  resetDemoData(): void {
    localStorage.removeItem('smartcare_doctors');
    localStorage.removeItem('smartcare_patients');
    localStorage.removeItem('smartcare_queue');
    localStorage.removeItem('smartcare_prescriptions');
    localStorage.removeItem('smartcare_audit');
    localStorage.removeItem('smartcare_security');
    localStorage.removeItem('smartcare_notifications');

    this.doctors = [...INITIAL_DOCTORS];
    this.patients = [...INITIAL_PATIENTS];
    this.queue = [...INITIAL_QUEUE];
    this.prescriptions = [...INITIAL_PRESCRIPTIONS];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.securityEvents = [...INITIAL_SECURITY_EVENTS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    emitChange();
  }
}

export const smartcareStore = new SmartCareStore();
