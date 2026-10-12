import api from './client';
import { smartcareStore } from './smartcareStore';

export interface User {
  userId: number;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'CLINIC_ADMIN' | 'DOCTOR' | 'PATIENT' | 'RECEPTIONIST' | 'PHARMACY' | 'TRIAGE_NURSE';
  accountStatus: string;
  clinicId?: number;
  clinicName?: string;
  patientId?: number;
  doctorId?: number;
}


export interface Patient {
  patientId: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
}

export interface Doctor {
  doctorId: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  licenseNo: string;
  specialty: string;
  qualification: string;
  availability: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY';
  experienceYears?: number;
  clinicHospital?: string;
  location?: string;
  consultationFee?: number;
  consultationDuration?: number;
  workingDays?: string;
  workingStartTime?: string;
  workingEndTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
  currentDelayMinutes?: number;
  photoUrl?: string;
  currentWaitingPatients?: number;
  estimatedWaitMinutes?: number;
  nextAvailableSlot?: string;
}

export interface DoctorSchedule {
  workingDays?: string;
  workingStartTime?: string;
  workingEndTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
  consultationDuration?: number;
  consultationFee?: number;
  currentDelayMinutes?: number;
  availability?: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY';
}

export interface Slot {
  time: string;
  displayTime: string;
  endTime: string;
  displayEndTime: string;
  status: 'AVAILABLE' | 'BOOKED' | 'BREAK' | 'PAST';
  available: boolean;
  fee: number;
  durationMinutes: number;
}

export interface Appointment {
  appointmentId: number;
  patientId: number;
  patientName: string;
  patientPhone?: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  doctorQualification?: string;
  scheduledAt: string;
  type: 'SCHEDULED' | 'WALK_IN';
  status: 'AVAILABLE' | 'BOOKED' | 'CONFIRMED' | 'CHECKED_IN' | 'WAITING' | 'CONSULTING' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';
  reason?: string;
  notes?: string;
  durationMinutes?: number;
  consultationFee?: number;
  clinicHospital?: string;
  tokenNumber?: number;
  queuePosition?: number;
  patientsAhead?: number;
  estimatedWaitMinutes?: number;
  checkInTime?: string;
  createdAt?: string;
}

export interface QueueEntry {
  queueEntryId: number;
  visitId: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  tokenNumber: number;
  priorityLevel: 'NORMAL' | 'PRIORITY' | 'URGENT';
  queueStatus: 'WAITING' | 'CALLED' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';
  joinedAt: string;
  calledAt?: string;
  estimatedWaitMinutes: number;
  patientsAhead: number;
}

export interface Consultation {
  consultationId: number;
  visitId: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  startedAt: string;
  endedAt?: string;
  symptoms?: string;
  diagnosisNotes?: string;
  clinicalNotes?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface PrescriptionItem {
  prescriptionItemId?: number;
  medicineId: number;
  medicineName?: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  timing?: string;
  durationDays: number;
  quantity: number;
  prescribedQuantity?: number;
  dispensedQuantity?: number;
  reservedQuantity?: number;
  remainingQuantity?: number;
  availableStock?: number;
  stockStatus?: 'IN_STOCK' | 'PARTIAL_STOCK' | 'OUT_OF_STOCK';
  unitPrice?: number;
  instructions?: string;
}

export interface Prescription {
  prescriptionId: number;
  consultationId: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  issuedAt: string;
  status: 'DRAFT' | 'ISSUED' | 'SENT_TO_PHARMACY' | 'DISPENSED' | 'CANCELLED';
  version?: number;
  isLatestActive?: boolean;
  previousPrescriptionId?: number;
  isVerifiedByClinic?: boolean;
  verificationStatus?: 'VERIFIED_IN_STOCK' | 'PARTIALLY_AVAILABLE' | 'OUT_OF_STOCK' | 'PENDING_VERIFICATION';
  instructions?: string;
  items: PrescriptionItem[];
}

export interface MedicationReconciliation {
  patientId: number;
  patientName: string;
  currentMedicines: PrescriptionItem[];
  previousMedicines: PrescriptionItem[];
  duplicateWarnings: string[];
  safetyAlerts: string[];
  prescriptionHistory: Prescription[];
}

export interface MedicationSchedule {
  scheduleId: number;
  patientId: number;
  prescriptionId: number;
  prescriptionItemId?: number;
  medicineName: string;
  dosage?: string;
  frequency?: string;
  timing?: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'SCHEDULED' | 'TAKEN' | 'MISSED' | 'SKIPPED';
  actionTimestamp?: string;
  notes?: string;
}

export interface EligibleCartItem {
  prescriptionItemId: number;
  prescriptionId: number;
  prescriptionVersion: number;
  medicineId: number;
  medicineName: string;
  genericName: string;
  dosage: string;
  frequency: string;
  prescribedQuantity: number;
  dispensedQuantity: number;
  remainingEligibleQuantity: number;
  availableStock: number;
  unitPrice: number;
  isAvailableInStock: boolean;
}

export interface PatientOrderRequest {
  patientId: number;
  items: {
    prescriptionItemId: number;
    medicineId: number;
    quantity: number;
  }[];
  deliveryNotes?: string;
}

export interface PharmacyOrder {
  pharmacyOrderId: number;
  prescriptionId: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  orderNumber?: string;
  status: 'RECEIVED' | 'PROCESSING' | 'READY' | 'DISPENSED' | 'COLLECTED' | 'CANCELLED';
  queuePosition?: number;
  estimatedWaitMinutes?: number;
  estimatedProcessingMinutes?: number;
  receivedAt?: string;
  createdAt?: string;
  readyAt?: string;
  collectedAt?: string;
  dispensedAt?: string;
  notes?: string;
  items: {
    medicineName: string;
    genericName?: string;
    dosage: string;
    frequency?: string;
    durationDays?: number;
    quantity: number;
    prescribedQuantity?: number;
    dispensedQuantity?: number;
    availableStock: number;
    instructions?: string;
  }[];
}

export interface IntelligenceDashboard {
  totalVisitsToday: number;
  activeQueueCount: number;
  completedConsultationsToday: number;
  activePharmacyOrders: number;
  averageWaitMinutes: number;
  averageConsultationMinutes: number;
  averagePharmacyMinutes: number;
  bottleneckAlerts: {
    severity: string;
    module: string;
    title: string;
    description: string;
    recommendation: string;
  }[];
  doctorWorkloads: {
    doctorId: number;
    doctorName: string;
    specialty: string;
    waitingPatients: number;
    completedPatients: number;
    avgConsultationMinutes: number;
    status: string;
  }[];
  pharmacyFlow: {
    ordersReceived: number;
    ordersProcessing: number;
    ordersReady: number;
    ordersCollected: number;
    isCongested?: boolean;
  };
  inventoryAlerts: {
    medicineId: number;
    medicineName: string;
    availableQuantity: number;
    reorderLevel: number;
    urgency: string;
  }[];
}

export interface InventoryItem {
  inventoryId: number;
  medicineId: number;
  medicineName: string;
  genericName?: string;
  manufacturer?: string;
  dosageForm?: string;
  strength?: string;
  unit?: string;
  batchNumber: string;
  quantity?: number;
  availableQuantity?: number;
  reservedQuantity?: number;
  dispensedQuantity?: number;
  expiryDate: string;
  unitPrice?: number;
  reorderLevel: number;
  status?: 'IN_STOCK' | 'LOW_STOCK' | 'EXPIRED' | 'DEPLETED';
  lowStock?: boolean;
  isLowStock?: boolean;
  isExpired?: boolean;
  isNearExpiry?: boolean;
}

export interface Medicine {
  medicineId: number;
  name: string;
  genericName: string;
  category: string;
  dosageForm?: string;
  strength?: string;
  manufacturer: string;
  unit: string;
  isPrescriptionRequired?: boolean;
  price?: number;
  isActive?: boolean;
}

export interface FollowUp {
  followUpId: number;
  visitId: number;
  patientId: number;
  patientName: string;
  scheduledDate: string;
  reason?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'RESCHEDULED' | 'CANCELLED';
  completedAt?: string;
}

export interface Notification {
  notificationId: number;
  patientId: number;
  message: string;
  type: string;
  status: 'READ' | 'UNREAD';
  createdAt: string;
}

export interface AuditLog {
  auditLogId: number;
  userId: number;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: number;
  details: string;
  timestamp: string;
}

// Service definitions
export const authService = {
  login: (data: any) => api.post('/auth/login', data).then(res => res.data),
  register: (data: any) => api.post('/auth/register', data).then(res => res.data),
  clerkSync: (data: { email: string; name?: string; phone?: string; role?: string; clerkUserId?: string }) => 
    api.post('/auth/clerk-sync', data).then(res => res.data),
};

export const patientService = {
  getAll: () => api.get('/patients').then(res => res.data.data).catch(() => {
    return smartcareStore.getPatients().map(p => ({
      patientId: p.id,
      userId: p.userId,
      name: p.name,
      email: p.email,
      phone: p.phone,
      dob: p.dob,
      gender: p.gender,
      bloodGroup: p.bloodGroup,
      address: p.address,
    }));
  }),
  getById: (id: number) => api.get(`/patients/${id}`).then(res => res.data.data).catch(() => {
    const p = smartcareStore.getPatientById(id) || smartcareStore.getPatients()[0];
    return {
      patientId: p.id,
      userId: p.userId,
      name: p.name,
      email: p.email,
      phone: p.phone,
      dob: p.dob,
      gender: p.gender,
      bloodGroup: p.bloodGroup,
      address: p.address,
    };
  }),
  create: (data: any) => api.post('/patients', data).then(res => res.data.data),
  update: (id: number, data: any) => api.put(`/patients/${id}`, data).then(res => res.data.data),
  getByUserId: (userId: number) => api.get(`/patients/user/${userId}`).then(res => res.data.data).catch(() => {
    const p = smartcareStore.getPatients().find(pt => pt.userId === userId) || smartcareStore.getPatients()[0];
    return {
      patientId: p.id,
      userId: p.userId,
      name: p.name,
      email: p.email,
      phone: p.phone,
      dob: p.dob,
      gender: p.gender,
      bloodGroup: p.bloodGroup,
      address: p.address,
    };
  }),
};

export const doctorService = {
  getAll: () => api.get('/doctors').then(res => res.data.data).catch(() => {
    return smartcareStore.getDoctors().map(d => ({
      doctorId: d.id,
      userId: 900 + d.id,
      name: d.name,
      email: d.name.toLowerCase().replace(/[^a-z]/g, '.') + '@smartcare.demo',
      phone: '9840100000',
      licenseNo: d.registrationNumber,
      specialty: d.specialty,
      qualification: d.qualification,
      availability: d.availability as any,
      experienceYears: 12,
      clinicHospital: 'SmartCare Medical Centre, Kovilpatti',
      location: 'Kovilpatti, Tamil Nadu',
      consultationFee: d.consultationFee,
      consultationDuration: 15,
      workingDays: 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY',
      workingStartTime: '09:00',
      workingEndTime: '18:00',
      currentDelayMinutes: d.delayMinutes,
    }));
  }),
  getById: (id: number) => api.get(`/doctors/${id}`).then(res => res.data.data).catch(() => {
    const d = smartcareStore.getDoctorById(id) || smartcareStore.getDoctors()[0];
    return {
      doctorId: d.id,
      userId: 900 + d.id,
      name: d.name,
      email: d.name.toLowerCase().replace(/[^a-z]/g, '.') + '@smartcare.demo',
      phone: '9840100000',
      licenseNo: d.registrationNumber,
      specialty: d.specialty,
      qualification: d.qualification,
      availability: d.availability as any,
      experienceYears: 12,
      clinicHospital: 'SmartCare Medical Centre, Kovilpatti',
      location: 'Kovilpatti, Tamil Nadu',
      consultationFee: d.consultationFee,
      consultationDuration: 15,
      workingDays: 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY',
      workingStartTime: '09:00',
      workingEndTime: '18:00',
      currentDelayMinutes: d.delayMinutes,
    };
  }),
  getByUserId: (userId: number) => api.get(`/doctors/user/${userId}`).then(res => res.data.data).catch(() => {
    const d = smartcareStore.getDoctors()[0];
    return {
      doctorId: d.id,
      userId: 900 + d.id,
      name: d.name,
      email: d.name.toLowerCase().replace(/[^a-z]/g, '.') + '@smartcare.demo',
      phone: '9840100000',
      licenseNo: d.registrationNumber,
      specialty: d.specialty,
      qualification: d.qualification,
      availability: d.availability as any,
      clinicHospital: 'SmartCare Medical Centre, Kovilpatti',
      location: 'Kovilpatti, Tamil Nadu',
      consultationFee: d.consultationFee,
      consultationDuration: 15,
    };
  }),
  search: (params?: { query?: string; specialty?: string; clinic?: string; location?: string; maxFee?: number; availability?: string }) => {
    let q = '/doctors/search?';
    if (params?.query) q += `query=${encodeURIComponent(params.query)}&`;
    if (params?.specialty) q += `specialty=${encodeURIComponent(params.specialty)}&`;
    if (params?.clinic) q += `clinic=${encodeURIComponent(params.clinic)}&`;
    if (params?.location) q += `location=${encodeURIComponent(params.location)}&`;
    if (params?.maxFee) q += `maxFee=${params.maxFee}&`;
    if (params?.availability) q += `availability=${params.availability}&`;
    return api.get(q).then(res => res.data.data).catch(() => {
      let list = smartcareStore.getDoctors();
      if (params?.specialty && params.specialty !== 'ALL') {
        list = list.filter(d => d.specialty.toLowerCase().includes(params.specialty!.toLowerCase()));
      }
      return list.map(d => ({
        doctorId: d.id,
        userId: 900 + d.id,
        name: d.name,
        email: d.name.toLowerCase().replace(/[^a-z]/g, '.') + '@smartcare.demo',
        phone: '9840100000',
        licenseNo: d.registrationNumber,
        specialty: d.specialty,
        qualification: d.qualification,
        availability: d.availability as any,
        clinicHospital: 'SmartCare Medical Centre, Kovilpatti',
        location: 'Kovilpatti, Tamil Nadu',
        consultationFee: d.consultationFee,
        consultationDuration: 15,
      }));
    });
  },
  updateAvailability: (id: number, availability: string) => 
    api.put(`/doctors/${id}/availability?availability=${availability}`).then(res => res.data.data).catch(() => {
      smartcareStore.updateDoctorAvailability(id, availability as any);
      return { doctorId: id, availability };
    }),
  updateSchedule: (id: number, schedule: DoctorSchedule) =>
    api.put(`/doctors/${id}/schedule`, schedule).then(res => res.data.data),
  updateDelay: (id: number, delayMinutes: number) =>
    api.put(`/doctors/${id}/delay?delayMinutes=${delayMinutes}`).then(res => res.data.data),
};

export const appointmentService = {
  getAll: (doctorId?: number, patientId?: number) => {
    let url = '/appointments';
    if (doctorId) url += `?doctorId=${doctorId}`;
    else if (patientId) url += `?patientId=${patientId}`;
    return api.get(url).then(res => res.data.data).catch(() => {
      return smartcareStore.getQueue(doctorId).map(q => ({
        appointmentId: q.appointmentId,
        patientId: q.patientId,
        patientName: q.patientName,
        doctorId: q.doctorId,
        doctorName: q.doctorName,
        doctorSpecialty: q.department,
        scheduledAt: '2026-10-09T10:00:00',
        type: 'SCHEDULED' as const,
        status: (q.queueStatus === 'BOOKED' ? 'BOOKED' : q.queueStatus === 'COMPLETED' ? 'COMPLETED' : 'CONFIRMED') as any,
        tokenNumber: Number(q.tokenNumber.replace(/\D/g, '') || q.id),
      }));
    });
  },
  getById: (id: number) => api.get(`/appointments/${id}`).then(res => res.data.data),
  getSlots: (doctorId: number, date: string): Promise<Slot[]> =>
    api.get(`/appointments/slots?doctorId=${doctorId}&date=${date}`).then(res => res.data.data).catch(() => {
      return [
        { time: '09:30:00', displayTime: '09:30 AM', endTime: '09:45:00', displayEndTime: '09:45 AM', status: 'AVAILABLE', available: true, fee: 400, durationMinutes: 15 },
        { time: '10:00:00', displayTime: '10:00 AM', endTime: '10:15:00', displayEndTime: '10:15 AM', status: 'AVAILABLE', available: true, fee: 400, durationMinutes: 15 },
        { time: '10:30:00', displayTime: '10:30 AM', endTime: '10:45:00', displayEndTime: '10:45 AM', status: 'AVAILABLE', available: true, fee: 400, durationMinutes: 15 },
        { time: '11:00:00', displayTime: '11:00 AM', endTime: '11:15:00', displayEndTime: '11:15 AM', status: 'AVAILABLE', available: true, fee: 400, durationMinutes: 15 },
        { time: '11:30:00', displayTime: '11:30 AM', endTime: '11:45:00', displayEndTime: '11:45 AM', status: 'AVAILABLE', available: true, fee: 400, durationMinutes: 15 },
        { time: '16:30:00', displayTime: '04:30 PM', endTime: '16:45:00', displayEndTime: '04:45 PM', status: 'AVAILABLE', available: true, fee: 400, durationMinutes: 15 },
        { time: '17:00:00', displayTime: '05:00 PM', endTime: '17:15:00', displayEndTime: '05:15 PM', status: 'AVAILABLE', available: true, fee: 400, durationMinutes: 15 },
      ];
    }),
  create: (data: any): Promise<Appointment> => api.post('/appointments', data).then(res => res.data.data),
  book: (data: any): Promise<Appointment> => api.post('/appointments', data).then(res => res.data.data),
  checkIn: (id: number): Promise<Appointment> => api.post(`/appointments/${id}/check-in`).then(res => res.data.data),
  reschedule: (id: number, newScheduledAt: string, reason?: string): Promise<Appointment> =>
    api.post(`/appointments/${id}/reschedule`, { newScheduledAt, reason }).then(res => res.data.data),
  cancel: (id: number, reason?: string): Promise<Appointment> =>
    api.post(`/appointments/${id}/cancel`, { reason }).then(res => res.data.data),
  updateStatus: (id: number, status: string) => 
    api.put(`/appointments/${id}/status?status=${status}`).then(res => res.data.data),
};

export const queueService = {
  checkIn: (data: any) => api.post('/visits/check-in', data).then(res => res.data.data),
  getAll: () => api.get('/queue').then(res => res.data.data).catch(() => {
    return smartcareStore.getActiveQueueSorted().map(q => ({
      queueEntryId: q.id,
      visitId: q.appointmentId,
      patientId: q.patientId,
      patientName: q.patientName,
      doctorId: q.doctorId,
      doctorName: q.doctorName,
      tokenNumber: Number(q.tokenNumber.replace(/\D/g, '') || q.id),
      priorityLevel: q.priorityLevel === 'EMERGENCY' ? 'URGENT' : q.priorityLevel === 'HIGH_PRIORITY' ? 'PRIORITY' : 'NORMAL',
      queueStatus: q.queueStatus as any,
      joinedAt: q.joinedQueueAt,
      calledAt: q.calledAt,
      estimatedWaitMinutes: q.estimatedWaitMinutes,
      patientsAhead: q.patientsAhead,
    }));
  }),
  getForDoctor: (doctorId: number) => api.get(`/queue/${doctorId}/status`).then(res => res.data.data).catch(() => {
    return smartcareStore.getActiveQueueSorted(doctorId).map(q => ({
      queueEntryId: q.id,
      visitId: q.appointmentId,
      patientId: q.patientId,
      patientName: q.patientName,
      doctorId: q.doctorId,
      doctorName: q.doctorName,
      tokenNumber: Number(q.tokenNumber.replace(/\D/g, '') || q.id),
      priorityLevel: q.priorityLevel === 'EMERGENCY' ? 'URGENT' : q.priorityLevel === 'HIGH_PRIORITY' ? 'PRIORITY' : 'NORMAL',
      queueStatus: q.queueStatus as any,
      joinedAt: q.joinedQueueAt,
      calledAt: q.calledAt,
      estimatedWaitMinutes: q.estimatedWaitMinutes,
      patientsAhead: q.patientsAhead,
    }));
  }),
  getActiveForDoctor: (doctorId: number) => api.get(`/queue/${doctorId}/active`).then(res => res.data.data).catch(() => {
    return smartcareStore.getActiveQueueSorted(doctorId).map(q => ({
      queueEntryId: q.id,
      visitId: q.appointmentId,
      patientId: q.patientId,
      patientName: q.patientName,
      doctorId: q.doctorId,
      doctorName: q.doctorName,
      tokenNumber: Number(q.tokenNumber.replace(/\D/g, '') || q.id),
      priorityLevel: q.priorityLevel === 'EMERGENCY' ? 'URGENT' : q.priorityLevel === 'HIGH_PRIORITY' ? 'PRIORITY' : 'NORMAL',
      queueStatus: q.queueStatus as any,
      joinedAt: q.joinedQueueAt,
      calledAt: q.calledAt,
      estimatedWaitMinutes: q.estimatedWaitMinutes,
      patientsAhead: q.patientsAhead,
    }));
  }),
  getPublicForDoctor: (doctorId: number) => api.get(`/queue/${doctorId}/public`).then(res => res.data.data),
  getForPatient: (patientId: number): Promise<QueueEntry | null> =>
    api.get(`/queue/patient/${patientId}`).then(res => res.data.data),
  updateStatus: (id: number, status: string) => 
    api.put(`/queue/${id}/status?status=${status}`).then(res => res.data.data),
  getByVisitId: (visitId: number) => api.get(`/queue/visit/${visitId}`).then(res => res.data.data),
  startConsultation: (queueEntryId: number) =>
    api.post(`/queue/${queueEntryId}/start`).then(res => res.data.data),
  completeConsultation: (queueEntryId: number) =>
    api.post(`/queue/${queueEntryId}/complete`).then(res => res.data.data),
  markNoShow: (queueEntryId: number) =>
    api.post(`/queue/${queueEntryId}/no-show`).then(res => res.data.data),
  callNextPatient: (doctorId: number) =>
    api.post(`/queue/doctor/${doctorId}/call-next`).then(res => res.data.data),
};

export const consultationService = {
  start: (visitId: number) => api.post(`/consultations/start/${visitId}`).then(res => res.data.data),
  save: (data: any) => api.put('/consultations', data).then(res => res.data.data),
  getById: (id: number) => api.get(`/consultations/${id}`).then(res => res.data.data),
  getByVisit: (visitId: number) => api.get(`/consultations/visit/${visitId}`).then(res => res.data.data),
  getByPatient: (patientId: number) => api.get(`/consultations/patient/${patientId}`).then(res => res.data.data),
};

export const prescriptionService = {
  create: (data: any): Promise<Prescription> => api.post('/prescriptions', data).then(res => res.data.data),
  getById: (id: number): Promise<Prescription> => api.get(`/prescriptions/${id}`).then(res => res.data.data),
  getByConsultation: (consultationId: number): Promise<Prescription> => api.get(`/prescriptions/consultation/${consultationId}`).then(res => res.data.data),
  getByPatient: (patientId: number): Promise<Prescription[]> => api.get(`/prescriptions/patient/${patientId}`).then(res => res.data.data),
  getActiveByPatient: (patientId: number): Promise<Prescription[]> => api.get(`/prescriptions/patient/${patientId}/active`).then(res => res.data.data),
  getReconciliation: (patientId: number): Promise<MedicationReconciliation> => api.get(`/prescriptions/reconciliation/${patientId}`).then(res => res.data.data),
  verifyPrescription: (id: number): Promise<Prescription> => api.put(`/prescriptions/${id}/verify`).then(res => res.data.data),
  getAll: (): Promise<Prescription[]> => api.get('/prescriptions').then(res => res.data.data),
};

export const medicationService = {
  getTodaySchedule: (patientId: number): Promise<MedicationSchedule[]> =>
    api.get(`/medication/schedule/today/${patientId}`).then(res => res.data.data),
  getMedicationHistory: (patientId: number): Promise<MedicationSchedule[]> =>
    api.get(`/medication/schedule/history/${patientId}`).then(res => res.data.data),
  recordAdherence: (scheduleId: number, status: 'TAKEN' | 'MISSED' | 'SKIPPED', notes?: string, userId?: number, userName?: string): Promise<MedicationSchedule> =>
    api.put(`/medication/schedule/${scheduleId}/adherence`, { status, notes, userId, userName }).then(res => res.data.data),
};

export const pharmacyService = {
  getAllOrders: () => api.get('/pharmacy/orders').then(res => res.data.data),
  getActiveOrders: () => api.get('/pharmacy/orders/active').then(res => res.data.data),
  getOrdersByPatient: (patientId: number): Promise<PharmacyOrder[]> => api.get(`/pharmacy/orders/patient/${patientId}`).then(res => res.data.data),
  getOrderById: (id: number) => api.get(`/pharmacy/orders/${id}`).then(res => res.data.data),
  updateOrderStatus: (id: number, status: string) => 
    api.put(`/pharmacy/orders/${id}/status?status=${status}`).then(res => res.data.data),
  getEligibleCart: (patientId: number): Promise<EligibleCartItem[]> =>
    api.get(`/pharmacy/cart/eligible/${patientId}`).then(res => res.data.data),
  createPatientOrder: (data: PatientOrderRequest, userId?: number, userName?: string): Promise<PharmacyOrder> => {
    let url = '/pharmacy/cart/order?';
    if (userId) url += `userId=${userId}&`;
    if (userName) url += `userName=${encodeURIComponent(userName)}&`;
    return api.post(url, data).then(res => res.data.data);
  },
};

export const inventoryService = {
  getAllInventory: (): Promise<InventoryItem[]> => api.get('/inventory').then(res => res.data.data),
  getLowStock: (): Promise<InventoryItem[]> => api.get('/inventory/low-stock').then(res => res.data.data),
  getMedicines: (): Promise<Medicine[]> => api.get('/medicines').then(res => res.data.data),
  searchMedicines: (query: string): Promise<Medicine[]> => api.get(`/medicines/search?query=${query}`).then(res => res.data.data),
  updateQuantity: (id: number, quantity: number): Promise<InventoryItem> => 
    api.put(`/inventory/${id}/quantity?quantity=${quantity}`).then(res => res.data.data),
};

export const auditService = {
  getRecentLogs: (): Promise<AuditLog[]> => api.get('/audit').then(res => res.data.data),
  getLogsByUser: (userId: number): Promise<AuditLog[]> => api.get(`/audit/user/${userId}`).then(res => res.data.data),
};

export const followUpService = {
  getAll: () => api.get('/follow-ups').then(res => res.data.data),
  getByPatient: (patientId: number) => api.get(`/follow-ups/patient/${patientId}`).then(res => res.data.data),
  schedule: (data: any) => api.post('/follow-ups', data).then(res => res.data.data),
  updateStatus: (id: number, status: string) => 
    api.put(`/follow-ups/${id}/status?status=${status}`).then(res => res.data.data),
};

export const notificationService = {
  getByPatient: (patientId: number) => api.get(`/notifications/patient/${patientId}`).then(res => res.data.data),
  getUnreadByPatient: (patientId: number) => api.get(`/notifications/patient/${patientId}/unread`).then(res => res.data.data),
  markAsRead: (id: number) => api.put(`/notifications/${id}/read`).then(res => res.data.data),
};

export const intelligenceService = {
  getDashboard: () => api.get('/intelligence/dashboard').then(res => res.data.data),
};

export interface Clinic {
  clinicId: number;
  clinicName: string;
  clinicIdentifier: string;
  contactInformation?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt?: string;
  updatedAt?: string;
}

export const clinicService = {
  getAll: (): Promise<Clinic[]> => api.get('/clinics').then(res => res.data.data),
  getActive: (): Promise<Clinic[]> => api.get('/clinics/active').then(res => res.data.data),
  getById: (id: number): Promise<Clinic> => api.get(`/clinics/${id}`).then(res => res.data.data),
  getByIdentifier: (identifier: string): Promise<Clinic> => api.get(`/clinics/identifier/${identifier}`).then(res => res.data.data),
  create: (data: Partial<Clinic>): Promise<Clinic> => api.post('/clinics', data).then(res => res.data.data),
};

