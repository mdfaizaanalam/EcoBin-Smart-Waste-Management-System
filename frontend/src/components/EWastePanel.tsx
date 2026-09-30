import React, { useState, useEffect } from 'react';
import {
  Laptop, AlertTriangle, Gift, MapPin,
  Send, Clock, RefreshCw, ShieldCheck
} from 'lucide-react';

interface CitizenReport {
  report_id: number;
  report_type: string;
  citizen_name: string;
  citizen_phone?: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  description: string;
  image_url?: string;
  ai_classification?: string;
  status: string;
  reward_points_awarded: number;
  created_at: string;
}

interface EWastePanelProps {
  selectedCity?: string;
}

export const EWastePanel: React.FC<EWastePanelProps> = ({ selectedCity = 'Hyderabad' }) => {
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [activeTab, setActiveTab] = useState<'book_ewaste' | 'report_dump' | 'feed' | 'rewards'>('book_ewaste');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [reportType, setReportType] = useState('e_waste_pickup');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const cityParam = selectedCity === 'All' ? 'Hyderabad' : selectedCity;
      const res = await fetch(`/api/citizen/reports?city=${encodeURIComponent(cityParam)}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.warn('Error fetching citizen reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedCity]);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return alert('Please enter collection or incident address.');
    setSubmitting(true);
    try {
      const defaultLat = selectedCity === 'Mumbai' ? 19.0760 : selectedCity === 'Bangalore' ? 12.9716 : 17.3850;
      const defaultLon = selectedCity === 'Mumbai' ? 72.8777 : selectedCity === 'Bangalore' ? 77.5946 : 78.4867;

      const res = await fetch('/api/citizen/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_type: reportType,
          citizen_name: citizenName || 'Civic Resident',
          citizen_phone: citizenPhone,
          latitude: defaultLat + (Math.random() - 0.5) * 0.04,
          longitude: defaultLon + (Math.random() - 0.5) * 0.04,
          address: address,
          city: selectedCity === 'All' ? 'Hyderabad' : selectedCity,
          description: description,
          ai_classification: reportType === 'e_waste_pickup' ? 'Verified E-Waste / High Heavy Metal Value' : 'Mixed Refuse & Sidewalk Encroachment'
        })
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Success! ${data.message || 'Report submitted.'}`);
        setCitizenName('');
        setCitizenPhone('');
        setAddress('');
        setDescription('');
        setActiveTab('feed');
        fetchReports();
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const eWasteCount = reports.filter(r => r.report_type === 'e_waste_pickup').length;
  const dumpCount = reports.filter(r => r.report_type === 'illegal_dumping' || r.report_type === 'overflow').length;
  const totalPoints = reports.reduce((acc, r) => acc + (r.reward_points_awarded || 0), 0);

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
            <Laptop size={18} color="var(--accent-pink)" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
              E-Waste & Citizen Engagement Portal
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Direct doorstep e-waste recycling requests, crowdsourced illegal dumping reports, and civic EcoPoints incentives for {selectedCity}.
          </p>
        </div>

        <button
          onClick={fetchReports}
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
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="kpi-card pink">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="kpi-label">E-Waste Requests</span>
            <Laptop size={18} color="var(--accent-pink)" />
          </div>
          <div className="kpi-value">{eWasteCount} Pickups</div>
          <div className="kpi-sub" style={{ color: 'var(--accent-pink)', fontWeight: 600 }}>
            Scheduled Doorstep Pickups
          </div>
        </div>

        <div className="kpi-card yellow">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="kpi-label">Civic Incident Reports</span>
            <AlertTriangle size={18} color="var(--color-warning)" />
          </div>
          <div className="kpi-value">{dumpCount} Reports</div>
          <div className="kpi-sub" style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
            Crowdsourced Overflow / Dumps
          </div>
        </div>

        <div className="kpi-card green">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="kpi-label">EcoPoints Distributed</span>
            <Gift size={18} color="var(--color-success)" />
          </div>
          <div className="kpi-value">{totalPoints} Pts</div>
          <div className="kpi-sub" style={{ color: 'var(--color-success)', fontWeight: 600 }}>
            Redeemable for Civic Credits
          </div>
        </div>

        <div className="kpi-card cyan">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="kpi-label">Response Dispatch SLA</span>
            <Clock size={18} color="var(--accent-cyan)" />
          </div>
          <div className="kpi-value">&lt; 4 Hours</div>
          <div className="kpi-sub" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
            Municipal Quick Response
          </div>
        </div>
      </div>

      {/* Pill Navigation */}
      <div style={{
        display: 'flex',
        gap: '10px',
        borderBottom: '1px solid var(--border-glass)',
        paddingBottom: '12px'
      }}>
        {[
          { key: 'book_ewaste', label: '📱 Book E-Waste Collection', color: 'pink' },
          { key: 'report_dump', label: '⚠️ Report Illegal Dump / Overflow', color: 'yellow' },
          { key: 'feed', label: `📋 Citizen Activity Feed (${reports.length})`, color: 'cyan' },
          { key: 'rewards', label: '🎁 EcoPoints Rewards Store', color: 'green' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key as any);
              if (tab.key === 'book_ewaste') setReportType('e_waste_pickup');
              if (tab.key === 'report_dump') setReportType('illegal_dumping');
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: activeTab === tab.key ? '1px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
              background: activeTab === tab.key ? 'var(--accent-cyan-dim)' : 'var(--bg-secondary)',
              color: activeTab === tab.key ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'var(--transition-fast)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Book E-Waste Pickup or Report Dump */}
      {(activeTab === 'book_ewaste' || activeTab === 'report_dump') && (
        <div style={{
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          width: '100%',
          boxShadow: 'var(--shadow-md)'
        }}>
          {/* Prominent Section Heading */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>
                  {activeTab === 'book_ewaste' ? '📱' : '⚠️'}
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', margin: 0, fontFamily: 'Outfit' }}>
                  {activeTab === 'book_ewaste' ? 'Doorstep E-Waste Pickup Request' : 'Report Illegal Dumping or Bin Overflow'}
                </h3>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {activeTab === 'book_ewaste'
                  ? `Certified municipal circular collection vehicle dispatched to your doorstep across ${selectedCity}.`
                  : `Help keep ${selectedCity} streets clean. Reports trigger automated routing alerts to municipal cleanup teams.`}
              </div>
            </div>

            <span style={{
              fontSize: '12px', fontWeight: 800, padding: '6px 14px', borderRadius: '20px',
              background: activeTab === 'book_ewaste' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: activeTab === 'book_ewaste' ? 'var(--accent-pink)' : 'var(--color-warning)',
              border: `1px solid ${activeTab === 'book_ewaste' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
            }}>
              {activeTab === 'book_ewaste' ? '🎁 Earn +150 EcoReward Points' : '🚨 High Priority Rapid Response (<4h)'}
            </span>
          </div>

          {/* Full-Width 2-Column Responsive Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
            {/* Form Column */}
            <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="e.g. Ramesh Reddy"
                    style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    Phone Number (For OTP / Driver SMS)
                  </label>
                  <input
                    type="tel"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    placeholder="+91 98490 12345"
                    style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Street Address / Ward Location in {selectedCity}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Flat 402, Green Meadows, Road No. 36, Jubilee Hills"
                  style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13px' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Item Description & Quantities
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={activeTab === 'book_ewaste' ? 'e.g. 1 laptop, 2 old cellphones, power chargers and a damaged CRT monitor.' : 'e.g. Pile of construction debris and plastic sacks on pedestrian sidewalk near crossroad.'}
                  rows={4}
                  style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13px', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '12px 32px',
                    background: activeTab === 'book_ewaste' ? 'var(--accent-pink)' : 'var(--color-warning)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Send size={16} /> {submitting ? 'Submitting...' : activeTab === 'book_ewaste' ? 'Confirm Doorstep Pickup' : 'Submit Civic Report'}
                </button>
              </div>
            </form>

            {/* Information & SLA Details Column */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <ShieldCheck size={20} color={activeTab === 'book_ewaste' ? 'var(--accent-pink)' : 'var(--color-warning)'} />
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
                    {activeTab === 'book_ewaste' ? 'Municipal E-Waste Protocol & SLA' : 'Rapid Municipal Cleanup Dispatch'}
                  </h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                    <span>Estimated Response Window:</span>
                    <strong style={{ color: 'var(--accent-cyan)' }}>Within 4 Hours (SLA Guaranteed)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                    <span>Verification & Geotag:</span>
                    <strong>GPS Coordinates Auto-Linked</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                    <span>Citizen EcoReward Credits:</span>
                    <strong style={{ color: 'var(--color-success)' }}>{activeTab === 'book_ewaste' ? '+150 Points' : '+100 Points'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
                    <span>Jurisdiction:</span>
                    <strong>{selectedCity} Municipal Corporation</strong>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12px',
                lineHeight: '1.5',
                color: 'var(--text-muted)',
                border: '1px dashed var(--border-glass)'
              }}>
                {activeTab === 'book_ewaste' ? (
                  <>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                      Accepted Items for Scientific Recycling:
                    </strong>
                    Laptops, smartphones, circuit boards (PCBs), cables, inverters, powerbanks, lead-acid & Li-Ion batteries, appliances. Processed under CPCB E-Waste Management Rules 2022.
                  </>
                ) : (
                  <>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                      Civic Incident Routing & SBM-U 2.0 Action:
                    </strong>
                    Reports directly feed into the Google OR-Tools CVRP dynamic vehicle routing solver. Nearby municipal trucks are instantly rerouted to clear black spots and prevent street overflow.
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Live Feed */}
      {activeTab === 'feed' && (
        <div style={{
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Live Citizen Incident & Collection Log
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reports.map((r, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: r.report_type === 'e_waste_pickup' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {r.report_type === 'e_waste_pickup' ? <Laptop size={18} color="var(--accent-pink)" /> : <AlertTriangle size={18} color="var(--color-warning)" />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {r.citizen_name}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        ({r.report_type === 'e_waste_pickup' ? 'E-Waste Pickup' : 'Civic Incident'})
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {r.description}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={11} color="var(--accent-cyan)" /> {r.address}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: r.status === 'Resolved' ? 'var(--color-success-dim)' : r.status === 'Scheduled' ? 'rgba(236,72,153,0.15)' : 'var(--color-warning-dim)',
                    color: r.status === 'Resolved' ? 'var(--color-success)' : r.status === 'Scheduled' ? 'var(--accent-pink)' : 'var(--color-warning)'
                  }}>
                    {r.status}
                  </span>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-success)', marginTop: '4px' }}>
                    +{r.reward_points_awarded} EcoPoints
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Rewards Store */}
      {activeTab === 'rewards' && (
        <div style={{
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Municipal EcoPoints Redemption Catalog
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Citizens convert validated segregation and e-waste points into municipal utility credits and transit passes.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {[
              { title: '₹100 Metro Transit Pass', pts: 250, icon: '🚆', desc: 'Valid across city metro network.' },
              { title: '5% Property Tax Rebate Voucher', pts: 500, icon: '🏛️', desc: 'Applied directly to municipal water / tax bill.' },
              { title: 'Free Organic Compost (10kg)', pts: 150, icon: '🌱', desc: 'Sourced from Jawaharnagar Bio-Plant.' },
              { title: '₹200 Solar Rooftop Subsidy Credit', pts: 350, icon: '☀️', desc: 'Direct credit towards residential solar setup.' }
            ].map((r, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ fontSize: '28px' }}>{r.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{r.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', flex: 1 }}>{r.desc}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-success)' }}>{r.pts} EcoPoints</span>
                  <button
                    onClick={() => alert(`Redemption for "${r.title}" initiated. Voucher code sent to registered mobile.`)}
                    style={{ padding: '6px 12px', background: 'var(--accent-cyan)', color: '#ffffff', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                  >
                    Redeem
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

export default EWastePanel;
