package com.clinicflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SlotDTO {
    private String time;           // e.g. "09:00"
    private String displayTime;    // e.g. "09:00 AM"
    private String endTime;        // e.g. "09:15"
    private String displayEndTime; // e.g. "09:15 AM"
    private String status;         // "AVAILABLE", "BOOKED", "BREAK", "PAST"
    private boolean available;
    private BigDecimal fee;
    private Integer durationMinutes;
}
