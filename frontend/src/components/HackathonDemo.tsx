import React from 'react';
import { 
  Zap, ArrowRight, ShieldCheck, 
  Cpu, Navigation, Leaf, Camera, 
  Users, Factory
} from 'lucide-react';

interface HackathonDemoProps {
  onNavigateTab: (tab: any) => void;
  selectedCity?: string;
}

export const HackathonDemo: React.FC<HackathonDemoProps> = ({ onNavigateTab, selectedCity = 'Hyderabad' }) => {
  const PILLARS = [
    {
      title: 'IoT Telemetry & Edge Ultrasonic Sensing',
      category: 'Real-Time Edge Telemetry',
      weight: 'Active Hardware Node',
      icon: <Cpu size={20} color="var(--accent-cyan)" />,
      badge: 'Edge Ingestion',
      badgeColor: 'cyan',
      description: 'ESP32 ultrasonic distance telemetry with live hardware-identical simulation engine pushing live fill levels to municipal WebSocket grid.',
      stats: '400+ Smart Bins Synchronized',
      actionTab: 'simulation',
      actionLabel: 'Launch IoT Simulator'
    },
    {
      title: 'Deep Vision Waste Segregation Engine',
      category: 'Computer Vision AI',
      weight: 'YOLOv8 Dual-Loop',
      icon: <Camera size={20} color="var(--accent-purple)" />,
      badge: '93.5% mAP',
      badgeColor: 'purple',
      description: '10-class real-time bounding box detection classifying plastics, metals, paper, compostables, and hazardous e-waste with instant municipal bin routing.',
      stats: '10 Material Categories Supported',
      actionTab: 'classify',
      actionLabel: 'Test Vision Classifier'
    },
    {
      title: 'Multi-Fleet Dynamic CVRP Route Optimizer',
      category: 'Constraint Programming & Metaheuristics',
      weight: 'Google OR-Tools + GA/SA',
      icon: <Navigation size={20} color="var(--accent-cyan)" />,
      badge: '-43.8% Diesel',
      badgeColor: 'cyan',
      description: 'Solves Capacitated Vehicle Routing Problem with multi-algorithm benchmark against Genetic Algorithm and Simulated Annealing with turn-by-turn OSRM.',
      stats: '4 Algorithms Benchmarked',
      actionTab: 'routes',
      actionLabel: 'Inspect Street Routes'
    },
    {
      title: 'GHG Protocol Verified Carbon Accounting',
      category: 'Sustainability & ESG',
      weight: 'Empirical Carbon Offset',
      icon: <Leaf size={20} color="var(--color-success)" />,
      badge: 'CPCB Calibrated',
      badgeColor: 'green',
      description: 'Quantifies daily CO₂ avoided (kg), diesel fuel saved (liters), and municipal financial return with ward-by-ward leaderboard.',
      stats: '8.76 Tons CO₂ Diverted',
      actionTab: 'impact',
      actionLabel: 'View Carbon Metrics'
    },
    {
      title: 'Circular Economy Material Recovery Network',
      category: 'Secondary Raw Materials',
      weight: 'Closed-Loop MRF Grid',
      icon: <Factory size={20} color="var(--accent-orange)" />,
      badge: 'MRF Ledger',
      badgeColor: 'orange',
      description: 'Tracks registered Material Recovery Facilities, compost plants, and industrial buyers off-taking secondary PET flakes, aluminum, and bio-compost.',
      stats: '4 Registered Processing Hubs',
      actionTab: 'circular',
      actionLabel: 'Open Circular Hub'
    },
    {
      title: 'Citizen Doorstep E-Waste & Incident Reporting',
      category: 'Civic Participation & Incentives',
      weight: 'EcoReward Gamification',
      icon: <Users size={20} color="var(--accent-pink)" />,
      badge: 'Live Civic Portal',
      badgeColor: 'pink',
      description: 'Citizens schedule doorstep e-waste collections, crowdsource illegal dump reports, and earn redeemable civic EcoPoints for transit and utility credits.',
      stats: 'Direct Citizen Engagement',
      actionTab: 'ewaste',
      actionLabel: 'Open Citizen Portal'
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Hero Overview Banner */}
      <div style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{
                background: 'var(--color-success-dim)',
                color: 'var(--color-success)',
                border: '1px solid var(--color-success-glow)',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <ShieldCheck size={13} /> Production Municipal Stack
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Active Region: <strong>{selectedCity}</strong>
              </span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              EcoBin: AI-Driven Smart Waste Segregation & Circular Optimization Platform
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '850px', lineHeight: 1.5 }}>
              An enterprise-grade, end-to-end municipal platform integrating ESP32 IoT Fill Sensors, YOLOv8 Deep Vision Segregation, Google OR-Tools CVRP Dynamic Fleet Routing, and Live Carbon Offset Impact Quantification.
            </p>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            textAlign: 'center',
            flexShrink: 0
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Operational Health
            </div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--color-success)', fontFamily: 'var(--font-display)', marginTop: '2px' }}>
              100%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600 }}>
              All 6 Modules Active
            </div>
          </div>
        </div>
      </div>

      {/* 6 Core Operational Architecture Pillars Grid */}
      <div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Core Architectural Modules & Capabilities
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Explore the end-to-end capabilities powering the EcoBin municipal ecosystem
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          {PILLARS.map((pillar, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-md)',
                transition: 'var(--transition-smooth)',
                position: 'relative'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-glass-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-glass)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {pillar.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {pillar.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {pillar.category}
                    </div>
                  </div>
                </div>

                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-glass)'
                }}>
                  {pillar.badge}
                </span>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px', flex: 1 }}>
                {pillar.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                  {pillar.stats}
                </span>

                <button
                  onClick={() => onNavigateTab(pillar.actionTab)}
                  style={{
                    padding: '6px 14px',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 600,
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-cyan)'; e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                >
                  {pillar.actionLabel} <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Quick Tour Bar */}
      <div style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={16} color="var(--accent-orange)" /> 1-Click Guided Navigation Tour
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { step: '1', title: 'AI Waste Vision', desc: 'Classify sample items & stream tags', tab: 'classify' },
            { step: '2', title: 'Dynamic CVRP Routes', desc: 'Run Google OR-Tools fleet solver', tab: 'routes' },
            { step: '3', title: 'Carbon Command Center', desc: 'Audit verified GHG & fuel savings', tab: 'impact' },
            { step: '4', title: 'E-Waste & Citizen Hub', desc: 'Schedule doorstep pickup & rewards', tab: 'ewaste' }
          ].map((step, i) => (
            <button
              key={i}
              onClick={() => onNavigateTab(step.tab)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-glass)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '2px' }}>
                Step {step.step}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {step.title}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {step.desc}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HackathonDemo;
