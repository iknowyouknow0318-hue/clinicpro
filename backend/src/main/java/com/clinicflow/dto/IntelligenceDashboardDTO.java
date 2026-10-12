package com.clinicflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntelligenceDashboardDTO {
    // KPI Cards
    private Long totalVisitsToday;
    private Long activeQueueCount;
    private Long completedConsultationsToday;
    private Long activePharmacyOrders;
    private Double averageWaitMinutes;
    private Double averageConsultationMinutes;
    private Double averagePharmacyMinutes;

    // Bottlenecks & Alerts
    private List<BottleneckAlert> bottleneckAlerts;

    // Doctor Workload
    private List<DoctorWorkload> doctorWorkloads;

    // Pharmacy Flow
    private PharmacyFlowStatus pharmacyFlow;

    // Inventory Alerts
    private List<InventoryAlert> inventoryAlerts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BottleneckAlert {
        private String severity; // INFO, WARNING, CRITICAL
        private String module;   // QUEUE, DOCTOR, PHARMACY, INVENTORY
        private String title;
        private String description;
        private String recommendation;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorWorkload {
        private Long doctorId;
        private String doctorName;
        private String specialty;
        private Long waitingPatients;
        private Long completedPatients;
        private Double avgConsultationMinutes;
        private String status; // NORMAL, BUSY, CONGESTED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PharmacyFlowStatus {
        private Long ordersReceived;
        private Long ordersProcessing;
        private Long ordersReady;
        private Long ordersCollected;
        private boolean isCongested;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryAlert {
        private Long medicineId;
        private String medicineName;
        private Integer availableQuantity;
        private Integer reorderLevel;
        private String urgency;
    }
}
