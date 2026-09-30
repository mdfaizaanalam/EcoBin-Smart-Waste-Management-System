import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Repeat, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  BookOpen, 
  Clock, 
  Cpu, 
  Layers, 
  Award,
  Leaf,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReusableItem, RepairGuide } from '../types/circular';
import { api } from '../services/api';

interface ProductReuseRepairPanelProps {
  selectedCity?: string;
}

export const ProductReuseRepairPanel: React.FC<ProductReuseRepairPanelProps> = ({ selectedCity = 'Hyderabad' }) => {
  const [items, setItems] = useState<ReusableItem[]>([]);
  const [guides, setGuides] = useState<RepairGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState<RepairGuide | null>(null);
  const [activeTab, setActiveTab] = useState<'reuse_market' | 'repair_guides'>('reuse_market');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getReusableItems(selectedCity);
      setItems(res.items || []);
      setGuides(res.repairGuides || []);
      if (res.repairGuides && res.repairGuides.length > 0) {
        setSelectedGuide(res.repairGuides[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCity]);

  const handleClaimItem = async (itemId: string) => {
    try {
      await api.claimReusableItem(itemId);
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'claimed' } : i));
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(i => i.category === selectedCategory);

  const totalCo2SavedFromReuse = items
    .filter(i => i.status === 'claimed' || i.status === 'refurbished')
    .reduce((acc, i) => acc + i.estimatedCo2SavedKg, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(16, 185, 129, 0.15))',
        border: '1px solid rgba(59, 130, 246, 0.3)',
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
            <span style={{ fontSize: '24px' }}>🔧</span>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)' }}>
              Product Reuse, Refurbishment & "Right to Repair" Hub
            </h2>
            <span style={{
              background: 'rgba(59, 130, 246, 0.2)',
              color: 'var(--color-info)',
              border: '1px solid var(--color-info)',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '20px',
              fontWeight: 700
            }}>
              Pillar 8: Product Reuse & Repair
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '750px' }}>
            Extending device and furniture longevity through open diagnostic repair guides, spare component catalogs, and a circular reuse marketplace. Prevents premature disposal and saves embodied manufacturing emissions.
          </p>
        </div>

        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', padding: '12px 18px', borderRadius: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Embodied CO₂ Saved by Reuse</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-success)' }}>
            -{totalCo2SavedFromReuse.toFixed(1)} kg CO₂
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveTab('reuse_market')}
          style={{
            background: activeTab === 'reuse_market' ? 'var(--color-info)' : 'transparent',
            color: activeTab === 'reuse_market' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Circular Reuse & Refurb Depot ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('repair_guides')}
          style={{
            background: activeTab === 'repair_guides' ? 'var(--color-info)' : 'transparent',
            color: activeTab === 'repair_guides' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Right-to-Repair Open Diagnostic Guides ({guides.length})
        </button>
      </div>

      {/* Tab 1: Reuse Depot */}
      {activeTab === 'reuse_market' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Category Filter Chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', 'appliances', 'electronics', 'furniture', 'tools'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: selectedCategory === cat ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                  border: `1px solid ${selectedCategory === cat ? 'var(--color-info)' : 'var(--border-glass)'}`,
                  color: selectedCategory === cat ? 'var(--text-primary)' : 'var(--text-muted)',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {filteredItems.map(item => (
              <div
                key={item.id}
                style={{
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '14px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '8px', color: 'var(--color-info)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {item.category}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      background: item.status === 'claimed' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: item.status === 'claimed' ? 'var(--color-danger)' : 'var(--color-success)'
                    }}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.3' }}>
                    {item.title}
                  </h4>

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Condition: <strong style={{ color: 'var(--text-secondary)' }}>{item.condition.replace(/_/g, ' ')}</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Location: {item.location}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Circular Price</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-success)' }}>
                        ₹{item.depotPriceInr}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>CO₂ Avoided</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-info)' }}>
                        -{item.estimatedCo2SavedKg} kg
                      </div>
                    </div>
                  </div>

                  {item.status === 'available' && (
                    <button
                      onClick={() => handleClaimItem(item.id)}
                      style={{
                        width: '100%',
                        background: 'var(--color-info)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Reserve for Refurbishment / Reuse
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Right-to-Repair Open Diagnostic Guides */}
      {activeTab === 'repair_guides' && selectedGuide && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {/* Guide Selector List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {guides.map(g => (
              <div
                key={g.id}
                onClick={() => setSelectedGuide(g)}
                style={{
                  background: selectedGuide.id === g.id ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-glass)',
                  border: `1px solid ${selectedGuide.id === g.id ? 'var(--color-info)' : 'var(--border-glass)'}`,
                  borderRadius: '12px',
                  padding: '14px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {g.deviceModel}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Common Symptom: {g.commonFault}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', fontSize: '10px' }}>
                  <span style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>Diff: {g.difficulty.toUpperCase()}</span>
                  <span>•</span>
                  <span style={{ color: 'var(--text-muted)' }}>{g.timeMins} Mins</span>
                  <span>•</span>
                  <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>Repairability: {g.rightToRepairScore}/10</span>
                </div>
              </div>
            ))}
          </div>

          {/* Guide Detail Teardown */}
          <div style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--color-info)', fontWeight: 700 }}>REPAIR SCHEMATIC & TEARDOWN</div>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)', marginTop: '2px' }}>
                {selectedGuide.deviceModel}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Failure Mode: {selectedGuide.commonFault}
              </p>
            </div>

            {/* Spare Parts & Tools */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>REQUIRED SPARE PARTS</div>
                <ul style={{ paddingLeft: '16px', fontSize: '11px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {selectedGuide.spareParts.map((sp, i) => (
                    <li key={i}>{sp}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>TOOLS NEEDED</div>
                <ul style={{ paddingLeft: '16px', fontSize: '11px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {selectedGuide.toolsNeeded.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Step-by-Step Restoration */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Step-by-Step Restoration Protocol:
              </div>
              <ol style={{ paddingLeft: '18px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedGuide.steps.map((step, idx) => (
                  <li key={idx} style={{ lineHeight: '1.4' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Step {idx + 1}:</strong> {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReuseRepairPanel;
