import React, { useState, useEffect } from 'react';
import { 
  Repeat, 
  TrendingUp, 
  QrCode, 
  Building2, 
  CheckCircle2, 
  Leaf, 
  ArrowUpRight, 
  FileText, 
  Sparkles, 
  Scale, 
  Coins, 
  Download, 
  ShieldCheck, 
  Package, 
  Clock, 
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CircularCommodity, CircularManifest } from '../types/circular';
import { api } from '../services/api';

interface CircularExchangePortalProps {
  selectedCity?: string;
}

export const CircularExchangePortal: React.FC<CircularExchangePortalProps> = ({ selectedCity = 'Hyderabad' }) => {
  const [commodities, setCommodities] = useState<CircularCommodity[]>([]);
  const [manifests, setManifests] = useState<CircularManifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommodity, setSelectedCommodity] = useState<CircularCommodity | null>(null);
  const [dispatchWeight, setDispatchWeight] = useState<number>(300);
  const [selectedOfftaker, setSelectedOfftaker] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'commodities' | 'manifests' | 'traceability'>('commodities');
  const [selectedManifest, setSelectedManifest] = useState<CircularManifest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCircularData = async () => {
    try {
      setLoading(true);
      const data = await api.getCircularCommodities(selectedCity);
      setCommodities(data.commodities || []);
      setManifests(data.manifests || []);
      if (data.commodities && data.commodities.length > 0) {
        setSelectedCommodity(data.commodities[0]);
        setSelectedOfftaker(data.commodities[0].verifiedOfftaker);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCircularData();
  }, [selectedCity]);

  const handleSelectCommodity = (com: CircularCommodity) => {
    setSelectedCommodity(com);
    setSelectedOfftaker(com.verifiedOfftaker);
    setDispatchWeight(Math.min(com.stockAvailableKg, Math.max(100, Math.round(com.stockAvailableKg * 0.4))));
    setStatusMessage(null);
  };

  const handleDispatchBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommodity) return;

    try {
      setIsSubmitting(true);
      setStatusMessage(null);
      const res = await api.dispatchCircularBatch(
        selectedCommodity.id,
        dispatchWeight,
        selectedOfftaker || selectedCommodity.verifiedOfftaker
      );

      setStatusMessage({
        type: 'success',
        text: `Batch Dispatched! Generated ${res.manifest.manifestCode} • Earned ₹${res.manifest.totalRevenueInr.toLocaleString()}`
      });

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });

      await fetchCircularData();
      setSelectedManifest(res.manifest);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Dispatch failed'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCommoditiesValueInr = commodities.reduce((acc, c) => acc + (c.stockAvailableKg * c.currentPricePerKg), 0);
  const totalStockKg = commodities.reduce((acc, c) => acc + c.stockAvailableKg, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))',
        border: '1px solid rgba(16, 185, 129, 0.3)',
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
            <span style={{ fontSize: '24px' }}>🔄</span>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)' }}>
              Circular Economy & Secondary Commodities Trading Floor
            </h2>
            <span style={{
              background: 'rgba(16, 185, 129, 0.2)',
              color: 'var(--color-success)',
              border: '1px solid var(--color-success)',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '20px',
              fontWeight: 700
            }}>
              Pillar 7: Material Recovery
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '750px' }}>
            Transforming municipal waste from a disposal liability into verified secondary raw material revenue. Matches MRF sorted bales with accredited industrial offtakers and generates EPR-compliant chain-of-custody manifests.
          </p>
        </div>

        {/* Global Summary Stats */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', padding: '10px 16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MRF Inventory Value</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-success)' }}>
              ₹{Math.round(totalCommoditiesValueInr).toLocaleString()}
            </div>
          </div>
          <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', padding: '10px 16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sorted Stock</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              {(totalStockKg / 1000).toFixed(1)} Tonnes
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveTab('commodities')}
          style={{
            background: activeTab === 'commodities' ? 'var(--accent-cyan)' : 'transparent',
            color: activeTab === 'commodities' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Live Commodities Floor ({commodities.length})
        </button>
        <button
          onClick={() => setActiveTab('manifests')}
          style={{
            background: activeTab === 'manifests' ? 'var(--accent-cyan)' : 'transparent',
            color: activeTab === 'manifests' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          EPR Manifests & Offtaker Dispatches ({manifests.length})
        </button>
      </div>

      {/* Tab 1: Commodities Trading Floor */}
      {activeTab === 'commodities' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {/* Commodities List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {commodities.map(c => (
              <div
                key={c.id}
                onClick={() => handleSelectCommodity(c)}
                style={{
                  background: selectedCommodity?.id === c.id ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-glass)',
                  border: `1px solid ${selectedCommodity?.id === c.id ? 'var(--accent-cyan)' : 'var(--border-glass)'}`,
                  borderRadius: '14px',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>{c.name}</span>
                    <span style={{ fontSize: '10px', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '6px', color: 'var(--accent-cyan)' }}>
                      {c.materialCode}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Verified Buyer: <strong style={{ color: 'var(--text-secondary)' }}>{c.verifiedOfftaker}</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px' }}>
                    Target: {c.endProductDescription}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-success)' }}>
                    ₹{c.currentPricePerKg.toFixed(2)}/kg
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {c.stockAvailableKg.toLocaleString()} kg in stock
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--accent-orange)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Demand: {c.demandTrend}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dispatch Batch Form */}
          {selectedCommodity && (
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
                <Coins size={20} color="var(--color-success)" />
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
                  Dispatch Secondary Raw Materials Batch
                </h3>
              </div>

              {statusMessage && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: statusMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                  border: `1px solid ${statusMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`
                }}>
                  {statusMessage.text}
                </div>
              )}

              <form onSubmit={handleDispatchBatch} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Selected Commodity</label>
                  <input
                    type="text"
                    disabled
                    value={`${selectedCommodity.name} (₹${selectedCommodity.currentPricePerKg}/kg)`}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', marginTop: '4px' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Dispatch Mass</span>
                    <strong style={{ color: 'var(--accent-cyan)' }}>{dispatchWeight} kg</strong>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max={Math.max(100, selectedCommodity.stockAvailableKg)}
                    step="25"
                    value={dispatchWeight}
                    onChange={e => setDispatchWeight(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                    <span>50 kg</span>
                    <span>{selectedCommodity.stockAvailableKg} kg (Max)</span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Accredited Offtaker / Recycler</label>
                  <input
                    type="text"
                    value={selectedOfftaker}
                    onChange={e => setSelectedOfftaker(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', marginTop: '4px' }}
                  />
                </div>

                {/* Calculation Preview */}
                <div style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Gross Revenue</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-success)' }}>
                      ₹{Math.round(dispatchWeight * selectedCommodity.currentPricePerKg).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CO₂ Avoided</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                      -{Math.round(dispatchWeight * selectedCommodity.co2DisplacementFactor)} kg
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || selectedCommodity.stockAvailableKg < 50}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'var(--color-success)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                    marginTop: '6px'
                  }}
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'Generating Cryptographic Manifest...' : 'Issue EPR Dispatch Manifest'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: EPR Manifests List */}
      {activeTab === 'manifests' && (
        <div style={{
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-glass)',
          borderRadius: '16px',
          padding: '20px',
          overflowX: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>Manifest Code</th>
                <th style={{ padding: '10px 12px' }}>Commodity</th>
                <th style={{ padding: '10px 12px' }}>Weight (kg)</th>
                <th style={{ padding: '10px 12px' }}>Revenue (₹)</th>
                <th style={{ padding: '10px 12px' }}>Offtaker</th>
                <th style={{ padding: '10px 12px' }}>Date</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {manifests.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                    {m.manifestCode}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>{m.commodityName}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{m.weightKg.toLocaleString()} kg</td>
                  <td style={{ padding: '12px', color: 'var(--color-success)', fontWeight: 700 }}>₹{m.totalRevenueInr.toLocaleString()}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{m.offtaker}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{new Date(m.timestamp).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: 'var(--color-success)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '10px'
                    }}>
                      {m.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CircularExchangePortal;
