import React, { useState } from 'react';
import { Factory, Coins, Flame, Laptop, Repeat, ShieldCheck } from 'lucide-react';
import CircularEconomyPanel from './CircularEconomyPanel';
import CircularExchangePortal from './CircularExchangePortal';
import FoodWasteBiomethanationPanel from './FoodWasteBiomethanationPanel';
import EWastePanel from './EWastePanel';
import ProductReuseRepairPanel from './ProductReuseRepairPanel';

interface CircularEconomyHubProps {
  selectedCity?: string;
}

export const CircularEconomyHub: React.FC<CircularEconomyHubProps> = ({ selectedCity = 'Hyderabad' }) => {
  const [activeTab, setActiveTab] = useState<'mrf' | 'exchange' | 'food' | 'ewaste' | 'reuse'>('mrf');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Header Banner */}
      <div className="glass" style={{
        padding: '24px', borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.08) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '28px' }}>♻️</span>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '22px', margin: 0, color: 'var(--text-primary)' }}>
              Circular Economy & Secondary Commodities Exchange
            </h2>
            <span style={{
              fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px',
              background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)', border: '1px solid rgba(16,185,129,0.3)'
            }}>
              Zero Landfill Hub · {selectedCity}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, maxWidth: '780px' }}>
            Transforming municipal waste streams into verified industrial raw materials, bio-methane clean fuel, refurbished electronics, and zero-landfill circular assets across {selectedCity}.
          </p>
        </div>

        {/* Pillar Navigation Pills */}
        <div style={{
          display: 'flex', background: 'var(--bg-secondary)', padding: '4px',
          borderRadius: '10px', border: '1px solid var(--border-glass)', flexWrap: 'wrap', gap: '4px'
        }}>
          {[
            { key: 'mrf', label: 'MRF Facilities & Materials', icon: <Factory size={15} /> },
            { key: 'exchange', label: 'Commodities Exchange', icon: <Coins size={15} /> },
            { key: 'food', label: 'Food Waste & Bio-CNG', icon: <Flame size={15} /> },
            { key: 'ewaste', label: 'E-Waste Lifecycle', icon: <Laptop size={15} /> },
            { key: 'reuse', label: 'Product Reuse & Repair', icon: <Repeat size={15} /> },
          ].map(p => (
            <button
              key={p.key}
              onClick={() => setActiveTab(p.key as any)}
              style={{
                padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px',
                background: activeTab === p.key ? 'var(--color-success)' : 'transparent',
                color: activeTab === p.key ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Tab Panel Views */}
      <div style={{ width: '100%' }}>
        {activeTab === 'mrf' && <CircularEconomyPanel selectedCity={selectedCity} />}
        {activeTab === 'exchange' && <CircularExchangePortal selectedCity={selectedCity} />}
        {activeTab === 'food' && <FoodWasteBiomethanationPanel selectedCity={selectedCity} />}
        {activeTab === 'ewaste' && <EWastePanel selectedCity={selectedCity} />}
        {activeTab === 'reuse' && <ProductReuseRepairPanel selectedCity={selectedCity} />}
      </div>
    </div>
  );
};

export default CircularEconomyHub;
