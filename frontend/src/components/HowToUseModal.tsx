import React, { useState } from 'react';
import { 
  X, ChevronRight, ChevronLeft, CheckCircle2, Shield, MapPin, 
  Trash2, AlertTriangle, Truck, BarChart2, Cpu, HelpCircle, Sparkles
} from 'lucide-react';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

interface StepData {
  step: string;
  title: string;
  icon: string;
  badge: string;
  accentColor: string;
  summary: string;
  details: string[];
  actionLabel?: string;
  targetTab?: string;
}

const STEPS: StepData[] = [
  {
    step: '01',
    title: 'Authentication & Role-Based Access',
    icon: '🔐',
    badge: 'Security & Access',
    accentColor: 'var(--accent-purple)',
    summary: 'EcoBin features multi-tier access for Citizens, Fleet Truck Drivers, and Municipal Smart Waste Authorities.',
    details: [
      'Citizens can access civic rewards, QR scanning, and community black-spot reporting.',
      'Municipal operators monitor real-time bin telemetry and dispatch dynamic collection routes.',
      'Role-based permissions protect municipal control grids and sensitive infrastructure.'
    ],
    actionLabel: 'Citizen Portal',
    targetTab: 'citizen'
  },
  {
    step: '02',
    title: 'Executive Real-Time Dashboard',
    icon: '📊',
    badge: 'Operations Hub',
    accentColor: 'var(--accent-cyan)',
    summary: 'The main dashboard provides unified visibility into municipal waste nodes, critical fill thresholds, and environmental savings.',
    details: [
      'Animated KPI cards track active bins, critical overflows, and XGBoost 24h predictive risks.',
      'Live carbon offset (CO2) and fuel conservation stats update automatically.',
      'Use the top bar city selector to filter by Hyderabad, Bangalore, Mumbai, Delhi, or National Grid.'
    ],
    actionLabel: 'View Overview',
    targetTab: 'overview'
  },
  {
    step: '03',
    title: 'Interactive GIS Map & Bin Locator',
    icon: '🗺️',
    badge: 'Spatial Intelligence',
    accentColor: '#0ea5e9',
    summary: 'Full interactive GIS map displaying real-time smart waste bins color-coded by fill percentage.',
    details: [
      'Green (< 50% fill), Orange (50-79% fill), and Red (≥ 80% critical overflow risk).',
      'Click any bin marker on the map to inspect live ultrasonic readings, battery level, and address.',
      'Toggle live collection truck paths and street-level routing overlays.'
    ],
    actionLabel: 'Open GIS Map',
    targetTab: 'map'
  },
  {
    step: '04',
    title: 'Source Segregation & Smart Disposal',
    icon: '♻️',
    badge: 'Circular Economy',
    accentColor: 'var(--color-success)',
    summary: 'Encouraging strict source-level segregation to drive biomethanation and circular recycling.',
    details: [
      'Wet/Organic Waste (Green): Diverted to city biomethanation and high-yield bio-compost plants.',
      'Dry/Recyclable Waste (Blue): Baled and routed to material recovery facilities (MRFs).',
      'E-Waste & Domestic Hazardous (Red): Tracked via circular exchange and certified refurbishers.'
    ],
    actionLabel: 'AI Vision Classifier',
    targetTab: 'classify'
  },
  {
    step: '05',
    title: 'Citizen Grievance & Black-Spot Reporting',
    icon: '📢',
    badge: 'Civic Engagement',
    accentColor: 'var(--color-danger)',
    summary: 'Citizens can report overflowing dumpsters, roadside garbage black-spots, or damaged sensors.',
    details: [
      'Upload geo-tagged images with real-time GPS coordinates.',
      'Automated municipal ticketing system dispatches nearest cleanup crew.',
      'Earn Swachhata civic reward points redeemable for Metro passes and electricity bill credits.'
    ],
    actionLabel: 'Report Spot',
    targetTab: 'blackspots'
  },
  {
    step: '06',
    title: 'IoT Sensor Telemetry & Fill Monitoring',
    icon: '📡',
    badge: 'Edge Hardware',
    accentColor: 'var(--accent-orange)',
    summary: 'Each EcoBin node houses an ultrasonic depth sensor, motion PIR, and low-power telemetry MCU.',
    details: [
      'Sub-second telemetry transmissions stream fill status via resilient WebSockets.',
      'Sensors monitor ambient bin temperature and battery health to prevent fire and sensor failure.',
      'Test simulated sensor data feeds anytime in the interactive IoT Sensor Bench.'
    ],
    actionLabel: 'IoT Sensor Bench',
    targetTab: 'iotbench'
  },
  {
    step: '07',
    title: 'AI Route Optimization & Dispatch',
    icon: '🚚',
    badge: 'Fleet Logistics',
    accentColor: 'var(--accent-purple)',
    summary: 'Google OR-Tools Capacitated Vehicle Routing Problem (CVRP) engine coupled with OSRM street road snapping.',
    details: [
      'Computes optimal routes visiting only bins requiring immediate pickup (≥ 80% fill).',
      'Respects individual truck volume capacities to prevent overloaded vehicles.',
      'Cuts overall fleet driving distance by up to 29.6%, saving diesel and municipal tax budgets.'
    ],
    actionLabel: 'Street Routes',
    targetTab: 'routes'
  },
  {
    step: '08',
    title: 'Predictive Analytics & Environmental Reports',
    icon: '📈',
    badge: 'Machine Learning',
    accentColor: 'var(--accent-cyan)',
    summary: 'XGBoost ML model forecasts fill levels 24 hours into the future based on area demographics and historical generation rates.',
    details: [
      'Area-specific forecasting for Residential, Commercial, Market, and Hospital wards.',
      'Quantifies net carbon offset in tree equivalencies (1 Tree ≈ 21.7 kg CO2 offset).',
      'Download comprehensive municipal lifecycle reports for Swachh Bharat benchmarking.'
    ],
    actionLabel: 'ML Analytics',
    targetTab: 'analytics'
  },
  {
    step: '09',
    title: 'System Administrator & Model Management',
    icon: '⚙️',
    badge: 'System Admin',
    accentColor: '#ec4899',
    summary: 'Municipal administrators maintain complete control over machine learning retraining and infrastructure state.',
    details: [
      'Trigger on-demand XGBoost retraining directly from the System & ML Engine accordion.',
      'Run live simulation scenarios (1x to 10x speed) to test city resilience during peak generation.',
      'Add or modify smart bins, register new collection trucks, and assign certified drivers.'
    ],
    actionLabel: 'Manage Fleet',
    targetTab: 'fleet'
  }
];

export const HowToUseModal: React.FC<HowToUseModalProps> = ({ isOpen, onClose, onNavigateTab }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = STEPS[activeStepIndex];

  return (
    <div 
      className="modal-backdrop" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        className="glass" 
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '740px',
          maxHeight: '90vh',
          background: 'var(--bg-glass-strong, rgba(15, 23, 42, 0.95))',
          border: '1px solid var(--border-glass)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(6, 182, 212, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
            }}>
              📖
            </div>
            <div>
              <h3 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)' }}>
                EcoBin AI System Guide
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                Step-by-step operational guide adapted from the EcoBin Smart Waste framework
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              padding: '6px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            title="Close Guide"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Indicator Pills */}
        <div style={{
          display: 'flex',
          gap: '6px',
          padding: '12px 24px',
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-glass)',
          overflowX: 'auto'
        }}>
          {STEPS.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => setActiveStepIndex(idx)}
              style={{
                flexShrink: 0,
                padding: '6px 12px',
                borderRadius: '8px',
                border: activeStepIndex === idx ? `1px solid ${s.accentColor}` : '1px solid var(--border-glass)',
                background: activeStepIndex === idx ? 'var(--bg-tertiary)' : 'transparent',
                color: activeStepIndex === idx ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: activeStepIndex === idx ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{s.step}</span>
              <span>{s.icon}</span>
              <span className="step-title-short" style={{ display: activeStepIndex === idx ? 'inline' : 'none' }}>
                {s.title.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                color: currentStep.accentColor,
                background: 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${currentStep.accentColor}`,
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                STEP {currentStep.step} OF 09
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {currentStep.badge}
              </span>
            </div>
            <div style={{ fontSize: '32px' }}>{currentStep.icon}</div>
          </div>

          <h2 style={{
            fontFamily: 'Outfit',
            fontWeight: 800,
            fontSize: '22px',
            color: 'var(--text-primary)',
            margin: '0 0 10px 0'
          }}>
            {currentStep.title}
          </h2>

          <p style={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: 'var(--text-secondary)',
            marginBottom: '20px'
          }}>
            {currentStep.summary}
          </p>

          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '20px'
          }}>
            <h4 style={{
              margin: '0 0 12px 0',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sparkles size={14} color={currentStep.accentColor} /> Key Operational Workflows
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentStep.details.map((detail, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle2 size={16} color={currentStep.accentColor} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                    {detail}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-secondary)'
        }}>
          <button
            onClick={() => setActiveStepIndex(Math.max(0, activeStepIndex - 1))}
            disabled={activeStepIndex === 0}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-glass)',
              background: 'transparent',
              color: 'var(--text-primary)',
              cursor: activeStepIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: activeStepIndex === 0 ? 0.4 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              fontSize: '13px'
            }}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {currentStep.targetTab && onNavigateTab && (
              <button
                onClick={() => {
                  onNavigateTab(currentStep.targetTab!);
                  onClose();
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(6, 182, 212, 0.35)'
                }}
              >
                <span>Jump to {currentStep.actionLabel}</span>
                <ChevronRight size={14} />
              </button>
            )}

            <button
              onClick={() => {
                if (activeStepIndex < STEPS.length - 1) {
                  setActiveStepIndex(activeStepIndex + 1);
                } else {
                  onClose();
                }
              }}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                background: activeStepIndex === STEPS.length - 1 ? 'var(--color-success)' : 'var(--accent-purple)',
                color: 'white',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <span>{activeStepIndex === STEPS.length - 1 ? 'Finish Guide' : 'Next Step'}</span>
              {activeStepIndex < STEPS.length - 1 && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToUseModal;
