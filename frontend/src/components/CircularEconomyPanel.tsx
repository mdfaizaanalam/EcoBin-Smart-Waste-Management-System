import React, { useState, useEffect } from 'react';
import { 
  Factory, Recycle, DollarSign, Leaf, Plus, 
  MapPin, RefreshCw, X
} from 'lucide-react';

interface RecyclingFacility {
  center_id: string;
  name: string;
  facility_type: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  daily_capacity_tons: number;
  current_utilization: number;
  contact_phone: string;
}

interface MaterialBatch {
  log_id: number;
  center_id: string;
  material_type: string;
  category: string;
  weight_kg: number;
  co2_offset_kg: number;
  revenue_generated_inr: number;
  date_processed: string;
  buyer_industry: string;
}

interface CircularEconomyPanelProps {
  selectedCity?: string;
}

export const CircularEconomyPanel: React.FC<CircularEconomyPanelProps> = ({ selectedCity = 'Hyderabad' }) => {
  const [facilities, setFacilities] = useState<RecyclingFacility[]>([]);
  const [batches, setBatches] = useState<MaterialBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);

  // Form State
  const [centerId, setCenterId] = useState('MRF-01');
  const [materialType, setMaterialType] = useState('Plastic-PET Flakes');
  const [category, setCategory] = useState('Recyclable');
  const [weightKg, setWeightKg] = useState('1000');
  const [buyerIndustry, setBuyerIndustry] = useState('Textile (Recycled Polyester Yarn)');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const cityParam = selectedCity === 'All' ? 'Hyderabad' : selectedCity;
      const [facRes, matRes] = await Promise.all([
        fetch(`/api/circular/facilities?city=${encodeURIComponent(cityParam)}`),
        fetch(`/api/circular/materials?city=${encodeURIComponent(cityParam)}`)
      ]);

      if (facRes.ok) {
        const facData = await facRes.json();
        setFacilities(facData);
        if (facData.length > 0) {
          setCenterId(facData[0].center_id);
        }
      }
      if (matRes.ok) {
        const matData = await matRes.json();
        setBatches(matData);
      }
    } catch (e) {
      console.warn('Error fetching circular economy data, using calibrated data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCity]);

  const handleLogBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/circular/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          center_id: centerId,
          material_type: materialType,
          category: category,
          weight_kg: parseFloat(weightKg) || 100,
          buyer_industry: buyerIndustry
        })
      });

      if (res.ok) {
        alert('Material recovery batch logged successfully!');
        setShowLogModal(false);
        fetchData();
      } else {
        throw new Error('Failed to log batch');
      }
    } catch (err: any) {
      alert(`Error logging batch: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const totalDivertedKg = batches.reduce((acc, b) => acc + (b.weight_kg || 0), 0);
  const totalCo2OffsetKg = batches.reduce((acc, b) => acc + (b.co2_offset_kg || 0), 0);
  const totalRevenueInr = batches.reduce((acc, b) => acc + (b.revenue_generated_inr || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Header Banner */}
      <div style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Factory size={18} color="var(--accent-purple)" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Circular Economy & Material Recovery Network
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Transforming segregated municipal waste into secondary raw materials, tracking MRFs, industrial off-takers, and circular revenue generation for {selectedCity}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              padding: '9px 14px',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>

          <button
            onClick={() => setShowLogModal(true)}
            style={{
              padding: '9px 16px',
              background: 'var(--accent-purple)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Plus size={15} /> Log Recovered Batch
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="kpi-card purple">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="kpi-label">Total Material Diverted</span>
            <Recycle size={18} color="var(--accent-purple)" />
          </div>
          <div className="kpi-value">{(totalDivertedKg / 1000).toFixed(2)} Tons</div>
          <div className="kpi-sub" style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>
            Diverted from Landfills
          </div>
        </div>

        <div className="kpi-card green">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="kpi-label">Circular CO₂ Offset</span>
            <Leaf size={18} color="var(--color-success)" />
          </div>
          <div className="kpi-value">{totalCo2OffsetKg.toLocaleString()} kg</div>
          <div className="kpi-sub" style={{ color: 'var(--color-success)', fontWeight: 600 }}>
            Emissions Avoided
          </div>
        </div>

        <div className="kpi-card cyan">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="kpi-label">Secondary Market Value</span>
            <DollarSign size={18} color="var(--accent-cyan)" />
          </div>
          <div className="kpi-value">₹{totalRevenueInr.toLocaleString()}</div>
          <div className="kpi-sub" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
            Sold to Manufacturing Buyers
          </div>
        </div>

        <div className="kpi-card orange">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="kpi-label">Active Facilities</span>
            <Factory size={18} color="var(--accent-orange)" />
          </div>
          <div className="kpi-value">{facilities.length} Centers</div>
          <div className="kpi-sub" style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>
            MRFs & Processing Hubs
          </div>
        </div>
      </div>

      {/* Facility Network Cards */}
      <div style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Registered Material Recovery Facilities (MRFs) & Processing Hubs
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Infrastructure network routing dry recyclables, organics, and e-waste in {selectedCity}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {facilities.map((fac, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-purple)', background: 'var(--accent-purple-dim)', padding: '2px 6px', borderRadius: '4px' }}>
                    {fac.center_id}
                  </span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px' }}>
                    {fac.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>
                    {fac.facility_type}
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-success)', background: 'var(--color-success-dim)', padding: '2px 8px', borderRadius: '12px' }}>
                  Active
                </span>
              </div>

              {/* Capacity Progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>Daily Capacity: {fac.daily_capacity_tons} Tons/day</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{fac.current_utilization}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${fac.current_utilization}%`,
                    height: '100%',
                    background: fac.current_utilization >= 85 ? 'var(--color-danger)' : fac.current_utilization >= 70 ? 'var(--accent-cyan)' : 'var(--color-success)'
                  }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-faint)' }}>
                <MapPin size={12} color="var(--accent-orange)" /> {fac.address}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Material Recovery Ledger Table */}
      <div style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Circular Material Recovery Ledger
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Batches of recovered dry recyclables, bio-compost, and secondary metals diverted into production
            </div>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {batches.length} Batches Logged
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Batch ID</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Facility</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Material Recovered</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Batch Weight</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>CO₂ Offset</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Market Revenue</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Buyer Industry</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch, idx) => (
                <tr 
                  key={idx}
                  style={{ borderBottom: '1px solid var(--border-glass)', transition: 'var(--transition-fast)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    #{batch.log_id}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--accent-purple)' }}>
                    {batch.center_id}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Recycle size={14} color="var(--accent-cyan)" /> {batch.material_type}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                    {batch.category}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {batch.weight_kg?.toLocaleString()} kg
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--color-success)' }}>
                    +{batch.co2_offset_kg?.toLocaleString()} kg
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--accent-orange)' }}>
                    ₹{batch.revenue_generated_inr?.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--bg-secondary)', padding: '3px 8px', borderRadius: '6px', fontSize: '11px' }}>
                      💼 {batch.buyer_industry}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Log New Recovery Batch */}
      {showLogModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Log Material Recovery Batch
              </h3>
              <button onClick={() => setShowLogModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLogBatch} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Processing Facility
                </label>
                <select
                  value={centerId}
                  onChange={(e) => setCenterId(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13px' }}
                >
                  {facilities.map(f => (
                    <option key={f.center_id} value={f.center_id}>{f.center_id} - {f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Material Specification
                </label>
                <input
                  type="text"
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value)}
                  placeholder="e.g. Plastic-PET Flakes"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13px' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13px' }}
                  >
                    <option value="Recyclable">Recyclable Dry</option>
                    <option value="Organic">Organic / Bio</option>
                    <option value="E-Waste">E-Waste / Metal</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="1000"
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Industrial Buyer / Off-Taker
                </label>
                <input
                  type="text"
                  value={buyerIndustry}
                  onChange={(e) => setBuyerIndustry(e.target.value)}
                  placeholder="e.g. Textile (Recycled Polyester Yarn)"
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  style={{ padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '8px 18px', background: 'var(--accent-purple)', border: 'none', color: '#ffffff', fontWeight: 700, borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '13px' }}
                >
                  {submitting ? 'Recording...' : 'Submit Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CircularEconomyPanel;
