import React from 'react';
import { Sparkles, FileText, Check } from 'lucide-react';

export interface ClinicalTemplate {
  id: string;
  name: string;
  category: string;
  chiefComplaint: string;
  observations: string;
  diagnosis: string;
  recommendedTests: string;
  advice: string;
}

export const CLINICAL_TEMPLATES: ClinicalTemplate[] = [
  {
    id: 'general-fever',
    name: 'Acute Viral URI / Fever',
    category: 'General OPD',
    chiefComplaint: 'Fever for 3 days, dry cough, sore throat, mild body aches, runny nose.',
    observations: 'Throat erythematous, no tonsillar exudates. Chest: Bilaterally clear breath sounds. Pulse: 84/min, Temp: 100.2°F, BP: 120/80 mmHg.',
    diagnosis: 'Acute Upper Respiratory Tract Infection (Viral Pharyngitis)',
    recommendedTests: 'CBC with Differential, Rapid Strep Test (if symptoms persist > 5 days)',
    advice: 'Warm saline gargles 3x daily. Adequate hydration (3L fluids/day). Steam inhalation. Return immediately if high fever > 102°F or breathlessness develops.',
  },
  {
    id: 'hypertension-followup',
    name: 'Hypertension Routine Follow-up',
    category: 'Cardiovascular',
    chiefComplaint: 'Routine blood pressure review. Denies chest pain, palpitations, dizziness, or shortness of breath.',
    observations: 'BP: 136/84 mmHg (sitting, right arm). Heart sounds S1 S2 heard, no murmurs. No pedal edema. Fundoscopy: Grade 1 hypertensive changes.',
    diagnosis: 'Primary Essential Hypertension (Stage 1 - Moderately Controlled)',
    recommendedTests: 'Serum Electrolytes, Serum Creatinine, Fasting Lipid Profile, Spot Urine Microalbumin',
    advice: 'Low sodium diet (< 2g/day). 30 mins moderate aerobic exercise 5 days/week. Continue home BP log twice weekly. Avoid NSAIDs without doctor consultation.',
  },
  {
    id: 'type2-diabetes',
    name: 'Type 2 Diabetes Mellitus Review',
    category: 'Endocrine',
    chiefComplaint: 'Quarterly glycemic evaluation. Reports mild post-prandial fatigue. No polyuria, polydipsia, or peripheral neuropathy symptoms.',
    observations: 'Foot examination: Normal monofilament sensation, peripheral pulses palpable. BMI: 27.2. BP: 128/82 mmHg. Temp: 98.4°F.',
    diagnosis: 'Type 2 Diabetes Mellitus (Stable Glycemic Control)',
    recommendedTests: 'HbA1c, Fasting Blood Glucose, Urine Albumin-to-Creatinine Ratio (ACR), eGFR',
    advice: 'Follow carbohydrate-controlled dietary plan. Daily foot self-inspection. Footwear check. Exercise 150 mins/week. Repeat HbA1c in 3 months.',
  },
  {
    id: 'acute-gastroenteritis',
    name: 'Acute Gastroenteritis / Diarrhea',
    category: 'Gastroenterology',
    chiefComplaint: 'Loose watery stools (4-5 episodes) over 24 hours, mild cramping abdominal pain, nausea.',
    observations: 'Abdomen: Soft, non-tender, hyperactive bowel sounds, no guarding or rebound tenderness. Tongue mildly dry, capillary refill < 2s.',
    diagnosis: 'Acute Infective Gastroenteritis (Mild Dehydration)',
    recommendedTests: 'Stool Routine & Microscopy, Serum Electrolytes',
    advice: 'Oral Rehydration Salts (ORS) after each loose stool. Light BRAT diet (Banana, Rice, Applesauce, Toast). Avoid dairy, spicy, and greasy foods for 48 hours.',
  },
  {
    id: 'allergic-rhinitis',
    name: 'Allergic Rhinitis / Sinusitis',
    category: 'ENT / Allergy',
    chiefComplaint: 'Sneezing paroxysms, clear watery nasal discharge, itchy eyes, nasal congestion worse in the morning.',
    observations: 'Nasal mucosa pale and edematous, clear secretions. Mild tenderness over maxillary sinus region. Oropharynx clear.',
    diagnosis: 'Seasonal Allergic Rhinitis with mild sinus congestion',
    recommendedTests: 'Allergy Skin Prick Test or Serum IgE (optional if persistent)',
    advice: 'Saline nasal rinse twice daily. Minimize dust mite exposure, wash bed linens in hot water. Keep windows closed during high pollen hours.',
  },
];

export interface ClinicConsultationTemplatesProps {
  onSelectTemplate: (template: ClinicalTemplate) => void;
  selectedTemplateId?: string;
}

export const ClinicConsultationTemplates: React.FC<ClinicConsultationTemplatesProps> = ({
  onSelectTemplate,
  selectedTemplateId,
}) => {
  return (
    <div
      style={{
        background: 'var(--bg-input)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem',
        marginBottom: '1.25rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Sparkles size={16} color="var(--primary)" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-heading)' }}>
            One-Click Clinical Templates
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            (Pre-fill standard assessment & recommendations)
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {CLINICAL_TEMPLATES.map((tmpl) => {
          const isSelected = selectedTemplateId === tmpl.id;
          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => onSelectTemplate(tmpl)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.42rem 0.85rem',
                borderRadius: 'var(--radius)',
                border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                background: isSelected ? 'var(--primary-bg)' : 'var(--bg-card)',
                color: isSelected ? 'var(--primary-dark)' : 'var(--text-heading)',
                fontSize: '0.78rem',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 1px 4px rgba(13, 148, 136, 0.15)' : 'var(--shadow-xs)',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--primary-border)';
                  e.currentTarget.style.background = 'var(--bg-card-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.background = 'var(--bg-card)';
                }
              }}
            >
              {isSelected ? <Check size={13} color="var(--primary)" /> : <FileText size={13} color="var(--text-muted)" />}
              <span>{tmpl.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
