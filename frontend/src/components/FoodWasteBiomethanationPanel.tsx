import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Zap, 
  Leaf, 
  Sprout, 
  Droplets, 
  TrendingUp, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Utensils
} from 'lucide-react';
import { BiomethanationEnergyMetric, FoodWasteBatch } from '../types/circular';
import { api } from '../services/api';

interface FoodWasteBiomethanationPanelProps {
  selectedCity?: string;
}

export const FoodWasteBiomethanationPanel: React.FC<FoodWasteBiomethanationPanelProps> = ({ selectedCity = 'Hyderabad' }) => {
  const [energyMetric, setEnergyMetric] = useState<BiomethanationEnergyMetric | null>(null);
  const [batches, setBatches] = useState<FoodWasteBatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'digestion' | 'food_surplus'>('digestion');

  const loadData = async () => {
    try {
      setLoading(true);
      const [energyRes, foodRes] = await Promise.all([
        api.getBiomethanationEnergy(selectedCity),
        api.getFoodWasteBatches(selectedCity)
      ]);
      setEnergyMetric(energyRes.energyMetric);
      setBatches(foodRes.batches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCity]);

  const handleRouteBatch = async (batchId: string, action: FoodWasteBatch['action']) => {
    try {
      await api.routeFoodWasteBatch(batchId, action);
      setBatches(prev => prev.map(b => b.id === batchId ? { ...b, action, status: 'converted' } : b));
    } catch (err) {
      console.error(err);
    }
  };

  // Calculations
  const lpgCylindersEquivalent = energyMetric ? Math.round(energyMetric.bioCngProducedKg / 14.2) : 1350;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.15), rgba(16, 185, 129, 0.15))',
        border: '1px solid rgba(234, 88, 12, 0.3)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px' }}>🔥</span>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)' }}>
              Food Waste Monitoring & Biomethanation Grid
            </h2>
            <span style={{
              background: 'rgba(234, 88, 12, 0.2)',
              color: 'var(--accent-orange)',
              border: '1px solid var(--accent-orange)',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '20px',
              fontWeight: 700
            }}>
              Pillar 6: Food Waste & Waste-to-Energy
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '750px' }}>
            Diverting municipal wet waste and commercial food surplus from methane-emitting landfills into anaerobic biomethanation digesters. Generates clean Bio-CNG, electrical power, and enriched organic digestate bio-fertilizer.
          </p>
        </div>

        <button
          onClick={loadData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-glass)',
            borderRadius: '10px',
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveTab('digestion')}
          style={{
            background: activeTab === 'digestion' ? 'var(--accent-orange)' : 'transparent',
            color: activeTab === 'digestion' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Municipal Anaerobic Digestion Plant
        </button>
        <button
          onClick={() => setActiveTab('food_surplus')}
          style={{
            background: activeTab === 'food_surplus' ? 'var(--accent-orange)' : 'transparent',
            color: activeTab === 'food_surplus' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Commercial Food Surplus & Rescue Logistics ({batches.length})
        </button>
      </div>

      {/* Tab 1: Biomethanation Plant Telemetry */}
      {activeTab === 'digestion' && energyMetric && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 4 Big Impact Metric Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            {/* Bio-CNG Produced */}
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Daily Bio-CNG Yield</span>
                <Flame size={20} color="var(--accent-orange)" />
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--accent-orange)' }}>
                {energyMetric.bioCngProducedKg.toLocaleString()} kg
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                ≈ {lpgCylindersEquivalent} Commercial LPG Cylinders Saved
              </div>
            </div>

            {/* Grid Power Generated */}
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Clean Grid Electricity</span>
                <Zap size={20} color="var(--accent-cyan)" />
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--accent-cyan)' }}>
                {energyMetric.gridPowerFedMwh} MWh
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Powers ~4,200 urban households daily
              </div>
            </div>

            {/* Organic Fertilizer Output */}
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Digestate Bio-Fertilizer</span>
                <Sprout size={20} color="var(--color-success)" />
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--color-success)' }}>
                {energyMetric.slurryFertilizerOutputTonnes} Tonnes
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                NPK-enriched organic soil revitalizer
              </div>
            </div>

            {/* Landfill GHG Avoided */}
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Landfill Methane Abated</span>
                <Leaf size={20} color="var(--accent-purple)" />
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--accent-purple)' }}>
                -{energyMetric.co2eAvoidedTonnes} T CO₂e
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Eliminates toxic landfill Leachate & Open Fires
              </div>
            </div>
          </div>

          {/* Plant Operational Details Box */}
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
              <Building2 size={20} color="var(--accent-orange)" />
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
                {energyMetric.plantName}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Daily Organic Feedstock Processed</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {energyMetric.dailyOrganicInputTonnes} Metric Tonnes / day
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Sourced from residential green bins, vegetable mandis, and restaurant hubs.
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Methane Capture Efficiency</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-success)', marginTop: '4px' }}>
                  {energyMetric.flareReductionPercent}% Captured
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  Hermetically sealed double-membrane gasholders with H2S biological scrubbing.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Commercial Food Surplus Management */}
      {activeTab === 'food_surplus' && (
        <div style={{
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-glass)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Utensils size={18} color="var(--accent-orange)" />
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
              Commercial Food Loss Mitigation & Valorization Dispatch
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {batches.map(b => (
              <div
                key={b.id}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>{b.source}</span>
                    <span style={{ fontSize: '10px', background: 'rgba(234, 88, 12, 0.2)', color: 'var(--accent-orange)', padding: '2px 8px', borderRadius: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                      {b.category}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Weight: <strong>{b.weightKg} kg</strong> • Spoilage Level: <strong>{Math.round(b.spoilageIndex * 100)}%</strong> • Methane Potential: <strong>{b.methanePotentialM3} m³</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Logged: {b.timestamp} • Status: <strong style={{ color: b.status === 'converted' ? 'var(--color-success)' : 'var(--accent-cyan)' }}>{b.status.toUpperCase()}</strong>
                  </div>
                </div>

                {/* Routing Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleRouteBatch(b.id, 'biomethanation')}
                    style={{
                      background: b.action === 'biomethanation' ? 'var(--accent-orange)' : 'var(--bg-glass)',
                      color: b.action === 'biomethanation' ? '#fff' : 'var(--text-secondary)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🔥 Biomethanation
                  </button>

                  <button
                    onClick={() => handleRouteBatch(b.id, 'food_bank')}
                    style={{
                      background: b.action === 'food_bank' ? 'var(--color-success)' : 'var(--bg-glass)',
                      color: b.action === 'food_bank' ? '#fff' : 'var(--text-secondary)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🍱 Food Bank Rescue
                  </button>

                  <button
                    onClick={() => handleRouteBatch(b.id, 'composting')}
                    style={{
                      background: b.action === 'composting' ? 'var(--accent-cyan)' : 'var(--bg-glass)',
                      color: b.action === 'composting' ? '#fff' : 'var(--text-secondary)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🌱 Composting
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodWasteBiomethanationPanel;
