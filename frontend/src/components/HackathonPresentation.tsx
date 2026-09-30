import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  TrendingDown, 
  Fuel, 
  Recycle, 
  Cpu, 
  Download, 
  DollarSign, 
  Sparkles,
  Calculator,
  ArrowRight,
  ShieldCheck,
  Building2,
  Leaf,
  Layers,
  FileText
} from 'lucide-react';
import { WardScorecard, ESGAuditReport } from '../types/circular';
import { api } from '../services/api';

interface HackathonPresentationProps {
  selectedCity?: string;
}

export const HackathonPresentation: React.FC<HackathonPresentationProps> = ({ selectedCity = 'Hyderabad' }) => {
  // Municipal ROI Calculator State
  const [cityBinsCount, setCityBinsCount] = useState<number>(500);
  const [dieselPricePerLitre, setDieselPricePerLitre] = useState<number>(92);

  // Wards and ESG Report State
  const [wards, setWards] = useState<WardScorecard[]>([]);
  const [esgReport, setEsgReport] = useState<ESGAuditReport | null>(null);
  const [isAuditLoading, setIsAuditLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchScorecardsAndAudit = async () => {
      try {
        setIsAuditLoading(true);
        const [wardsRes, auditRes] = await Promise.all([
          api.getWardScorecards(selectedCity),
          api.getESGAuditReport(selectedCity)
        ]);
        setWards(wardsRes.wardScorecards || []);
        setEsgReport(auditRes.report || null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsAuditLoading(false);
      }
    };
    fetchScorecardsAndAudit();
  }, [selectedCity]);

  // Derived ROI calculations
  const weeklyFuelSaved = Math.round(cityBinsCount * 0.444);
  const annualFuelSaved = weeklyFuelSaved * 52;
  const annualDieselCostSaved = Math.round(annualFuelSaved * dieselPricePerLitre);
  const annualCo2AvoidedTonnes = ((annualFuelSaved * 2.68) / 1000).toFixed(1);
  const hardwareCapex = cityBinsCount * 1850;
  const paybackMonths = ((hardwareCapex / annualDieselCostSaved) * 12).toFixed(1);

  // Download ESG Audit JSON
  const handleDownloadEsgReport = () => {
    if (!esgReport) return;
    const blob = new Blob([JSON.stringify(esgReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EcoBin_ESG_Sustainability_Audit_Report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero Banner: Hackathon Pitch Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(139, 92, 246, 0.2))',
        border: '1px solid rgba(6, 182, 212, 0.4)',
        borderRadius: '16px',
        padding: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '28px' }}>🏆</span>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '24px', color: 'var(--text-primary)' }}>
              EcoLogic 1.0 Executive Hackathon Pitch & Municipal ROI Model
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '780px', lineHeight: '1.5' }}>
            EcoBin transforms municipal solid waste management from a reactive cost center into an AI-optimized, self-funding circular economy. Integrates Google OR-Tools CVRP routing, multi-sensor IoT telemetry, computer vision segregation, biomethanation waste-to-energy, and CPCB EPR credit accounting.
          </p>
        </div>

        <button
          onClick={handleDownloadEsgReport}
          disabled={!esgReport}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--color-success)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 20px',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
          }}
        >
          <Download size={16} />
          <span>Export ESG Compliance Audit JSON</span>
        </button>
      </div>

      {/* Municipal ROI Engine */}
      <div style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-glass)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator size={22} color="var(--accent-cyan)" />
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)' }}>
            Interactive Municipal ROI & Carbon Payback Calculator
          </h3>
        </div>

        {/* Sliders Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Total Smart Bins Deployed:</span>
              <strong style={{ color: 'var(--accent-cyan)', fontSize: '15px' }}>{cityBinsCount} Bins</strong>
            </div>
            <input
              type="range"
              min="100"
              max="5000"
              step="50"
              value={cityBinsCount}
              onChange={e => setCityBinsCount(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>100 Pilot</span>
              <span>2,500 Ward Fleet</span>
              <span>5,000 Mega-City</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Commercial Diesel Cost:</span>
              <strong style={{ color: 'var(--accent-purple)', fontSize: '15px' }}>₹{dieselPricePerLitre} / Litre</strong>
            </div>
            <input
              type="range"
              min="80"
              max="120"
              step="1"
              value={dieselPricePerLitre}
              onChange={e => setDieselPricePerLitre(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>₹80/L</span>
              <span>₹100/L Avg</span>
              <span>₹120/L High</span>
            </div>
          </div>
        </div>

        {/* Calculated Financial & Ecological Payback */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginTop: '10px'
        }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>ANNUAL DIESEL SAVED</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-success)', marginTop: '4px' }}>
              {annualFuelSaved.toLocaleString()} L
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              via CVRP dynamic routing
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>ANNUAL RECURRING SAVINGS</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-success)', marginTop: '4px' }}>
              ₹{annualDieselCostSaved.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Direct municipal fuel savings
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>ANNUAL CO₂ EMISSIONS ABATED</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--accent-cyan)', marginTop: '4px' }}>
              -{annualCo2AvoidedTonnes} Tonnes
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Clean Air & Green Fleet impact
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>CAPEX PAYBACK PERIOD</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--accent-orange)', marginTop: '4px' }}>
              {paybackMonths} Months
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Self-amortizing smart hardware
            </div>
          </div>
        </div>
      </div>

      {/* Swachh Survekshan Ward Scorecards */}
      <div style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-glass)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={20} color="var(--accent-purple)" />
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
            Swachh Survekshan Municipal Cleanliness Scorecards
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '14px'
        }}>
          {wards.map(w => (
            <div
              key={w.wardNumber}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-glass)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ward #{w.wardNumber} • {w.zone}</span>
                <span style={{
                  background: w.rank === 1 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                  color: w.rank === 1 ? 'var(--color-success)' : 'var(--color-info)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 800
                }}>
                  Rank #{w.rank}
                </span>
              </div>

              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {w.wardName}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Cleanliness Index:</span>
                <strong style={{ color: 'var(--color-success)' }}>{w.cleanlinessScore}/100</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Segregation Rate:</span>
                <strong style={{ color: 'var(--accent-cyan)' }}>{w.segregationCompliancePercent}%</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Avg Response Time:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{w.averageResponseMinutes} mins</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HackathonPresentation;
