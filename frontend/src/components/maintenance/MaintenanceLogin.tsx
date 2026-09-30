import React, { useState, useEffect } from 'react';
import LanguageSwitcher from '../LanguageSwitcher';
import ThemeToggle from '../ThemeToggle';
import SmartQRScanner from '../SmartQRScanner';
import { 
  QrCode, LogIn, MapPin, Building2, Wrench, ShieldCheck, 
  ArrowLeft, Users, CheckCircle2, Activity, Zap, AlertTriangle, 
  Clock, Award, Radio, Phone, Sparkles, HeartPulse
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MaintenanceLoginProps {
  onLogin: (workerId: string, workerName: string, zone: string, city: string) => void;
}

interface WorkerFromDB {
  worker_id: string;
  name: string;
  phone: string;
  zone: string;
  city: string;
  status: string;
  open_jobs: number;
}

const SUPPORTED_CITIES = [
  'Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 
  'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'
];

export default function MaintenanceLogin({ onLogin }: MaintenanceLoginProps) {
  const { t } = useTranslation();
  const [selectedCity, setSelectedCity] = useState<string>(() => localStorage.getItem('mnt_worker_city') || 'Hyderabad');
  const [dbWorkers, setDbWorkers] = useState<WorkerFromDB[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState<boolean>(false);
  const [workerId, setWorkerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(false);

  // Fetch real registered workers from the database for the selected city
  useEffect(() => {
    let isMounted = true;
    const fetchCityWorkers = async () => {
      setLoadingWorkers(true);
      try {
        const res = await fetch(`/api/maintenance/workers?city=${encodeURIComponent(selectedCity)}`);
        if (res.ok) {
          const data: WorkerFromDB[] = await res.json();
          if (isMounted) {
            setDbWorkers(data);
            if (data.length > 0 && !workerId) {
              setWorkerId(data[0].worker_id);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch workers:', err);
      } finally {
        if (isMounted) setLoadingWorkers(false);
      }
    };
    fetchCityWorkers();
    return () => { isMounted = false; };
  }, [selectedCity]);

  const handleQRSuccess = (_token: string, data: any) => {
    if (data.entity_type === 'Worker' && data.entity_id) {
      const city = data.city || selectedCity;
      localStorage.setItem('mnt_worker_id', data.entity_id);
      localStorage.setItem('mnt_worker_name', data.worker_name);
      localStorage.setItem('mnt_worker_zone', data.zone || '');
      localStorage.setItem('mnt_worker_city', city);
      onLogin(data.entity_id, data.worker_name, data.zone || '', city);
    } else {
      setError("Invalid QR for Maintenance Worker.");
      setShowQR(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent, directId?: string) => {
    if (e) e.preventDefault();
    const targetId = (directId || workerId).trim().toUpperCase();
    if (!targetId) { setError('Please enter or select your Worker ID.'); return; }
    
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/maintenance/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id: targetId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Login failed');
      }
      const data = await res.json();
      const workerCity = data.city || selectedCity;
      localStorage.setItem('mnt_worker_id', data.worker_id);
      localStorage.setItem('mnt_worker_name', data.name);
      localStorage.setItem('mnt_worker_zone', data.zone || '');
      localStorage.setItem('mnt_worker_city', workerCity);
      onLogin(data.worker_id, data.name, data.zone || '', workerCity);
    } catch (e: any) {
      setError(e.message || 'Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: 'var(--bg-base, #0b1120)',
      color: 'var(--text-primary, #f8fafc)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Outfit', 'Inter', sans-serif",
      boxSizing: 'border-box',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Ambient Radial Background Glow */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'radial-gradient(circle at 15% 15%, rgba(16,185,129,0.12) 0%, transparent 40%), radial-gradient(circle at 85% 85%, rgba(6,182,212,0.12) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(245,158,11,0.06) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      {/* Top Header Navbar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 28px',
        backdropFilter: 'blur(16px)',
        background: 'var(--bg-glass, rgba(15,23,42,0.85))',
        borderBottom: '1px solid var(--border-glass, rgba(255,255,255,0.08))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(16,185,129,0.4)'
          }}>
            <Wrench size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                EcoBin Field Command
              </span>
              <span style={{
                fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px',
                background: 'rgba(16,185,129,0.18)', color: '#10b981',
                border: '1px solid rgba(16,185,129,0.3)', textTransform: 'uppercase'
              }}>
                Repair & SLA Ops
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>
              Municipal Waste Grid Hardware & Sensor Maintenance Operations
            </p>
          </div>
        </div>

        {/* Top Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
            borderRadius: '20px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
            fontSize: '11px', color: '#10b981', fontWeight: 700
          }}>
            <HeartPulse size={12} className="animate-pulse" />
            <span>SLA Grid: 98.4% On-Target</span>
          </div>
          <LanguageSwitcher />
          <ThemeToggle />
          <a
            href="/"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '10px',
              background: 'var(--bg-secondary, #1e293b)',
              border: '1px solid var(--border-glass, rgba(255,255,255,0.08))',
              color: 'var(--text-primary)', textDecoration: 'none',
              fontSize: '12px', fontWeight: 700, transition: 'all 0.2s'
            }}
          >
            <ArrowLeft size={14} /> Admin Portal
          </a>
        </div>
      </header>

      {/* Main Full-Screen Body */}
      <main style={{
        flex: 1,
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '24px 28px 40px 28px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>

        {/* Feature Cards Ribbon */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          width: '100%'
        }}>
          {[
            { emoji: '🛠️', title: 'Rapid Field Dispatch', desc: 'Real-time incident assignment with GPS directions & bin location', badge: '< 30 Min SLA' },
            { emoji: '🔋', title: 'Sensor Diagnostics', desc: 'Ultrasonic sensor calibration, battery level & lidar checks', badge: 'IoT Telemetry' },
            { emoji: '📱', title: 'Digital Work Orders', desc: 'One-touch job start, photo logs, and QR code resolution verification', badge: 'Instant DB Sync' },
            { emoji: '🏢', title: 'Multi-City Grid Network', desc: 'Unified maintenance coverage across 8 major municipal zones', badge: 'Active' },
          ].map((feat, idx) => (
            <div key={idx} style={{
              background: 'var(--bg-primary, #0f172a)',
              borderRadius: '16px',
              padding: '16px 18px',
              border: '1px solid var(--border-glass, rgba(255,255,255,0.08))',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: 'var(--bg-secondary, #1e293b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', flexShrink: 0
              }}>
                {feat.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{feat.title}</h4>
                  <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>{feat.badge}</span>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 2-Column Main Workspace */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(380px, 460px) 1fr',
          gap: '24px',
          alignItems: 'stretch',
          flex: 1
        }}>

          {/* ── LEFT COLUMN: Sign In Card ──────────────── */}
          <div style={{
            background: 'var(--bg-primary, #0f172a)',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: 'var(--shadow-lg, 0 10px 40px rgba(0,0,0,0.35))',
            border: '1px solid var(--border-glass, rgba(255,255,255,0.1))',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              {/* City Selection */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    <Building2 size={14} /> 🏙️ Municipal Corporation
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{SUPPORTED_CITIES.length} Divisions Active</span>
                </div>
                <select
                  value={selectedCity}
                  onChange={e => {
                    const newCity = e.target.value;
                    setSelectedCity(newCity);
                    localStorage.setItem('mnt_worker_city', newCity);
                    setWorkerId('');
                  }}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '12px',
                    border: '1px solid var(--border-glass, rgba(255,255,255,0.12))', fontSize: '14px', fontWeight: 700,
                    background: 'var(--bg-secondary, #1e293b)', color: 'var(--text-primary, #f8fafc)', outline: 'none', cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  {SUPPORTED_CITIES.map(c => (
                    <option key={c} value={c} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                      📍 {c} Municipal Corporation
                    </option>
                  ))}
                </select>
              </div>

              {/* Technician Sign In Header */}
              <div style={{ marginBottom: '18px' }}>
                <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                  🔧 Field Technician Authentication
                </h2>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Select your technician profile from the directory or enter Worker ID to access assigned repair orders.
                </p>
              </div>

              {error && (
                <div style={{
                  background: 'var(--color-danger-dim, rgba(239, 68, 68, 0.15))',
                  border: '1px solid var(--color-danger, #ef4444)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--color-danger, #ef4444)',
                  marginBottom: '18px',
                  fontSize: '13px',
                  fontWeight: 600
                }}>
                  <AlertTriangle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {showQR ? (
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
                  <SmartQRScanner 
                    onScanSuccess={handleQRSuccess} 
                    onScanError={(err) => setError(err)}
                    title="Scan Technician Badge QR"
                  />
                  <button 
                    onClick={() => setShowQR(false)}
                    style={{
                      marginTop: '14px', width: '100%', padding: '12px',
                      background: 'transparent', border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)', borderRadius: '10px', cursor: 'pointer', fontWeight: 700
                    }}
                  >
                    Cancel QR Scanner
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => handleLogin(e)}>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      🪪 Worker ID / Badge Code
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={workerId}
                        onChange={e => setWorkerId(e.target.value)}
                        placeholder={`e.g. ${dbWorkers[0]?.worker_id || 'MNT-HYD-01'}`}
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          padding: '14px 16px', borderRadius: '12px',
                          border: error ? '1.5px solid var(--color-danger, #ef4444)' : '1px solid var(--border-glass, rgba(255,255,255,0.12))',
                          fontSize: '15px', fontFamily: "'JetBrains Mono', monospace",
                          background: 'var(--bg-secondary, #1e293b)', color: 'var(--text-primary, #f8fafc)',
                          outline: 'none', transition: 'border-color 0.2s',
                          letterSpacing: '0.8px', fontWeight: 700,
                        }}
                      />
                      <span style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        fontSize: '11px', fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.12)',
                        padding: '3px 8px', borderRadius: '6px'
                      }}>
                        TECH ID
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%', padding: '14px',
                      background: loading ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#ffffff', border: 'none', borderRadius: '12px',
                      fontSize: '15px', fontWeight: 800, fontFamily: 'inherit',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      letterSpacing: '0.3px',
                      boxShadow: loading ? 'none' : '0 8px 24px rgba(16,185,129,0.35)',
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    {loading ? '🔄 Authenticating Field Technician...' : <><LogIn size={18} /> 🛠️ Access Field Work Orders</>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowQR(true)}
                    style={{
                      width: '100%', marginTop: '12px', padding: '12px',
                      background: 'var(--bg-secondary, #1e293b)', color: '#10b981',
                      border: '1.5px solid #10b981',
                      borderRadius: '12px', fontSize: '13px', fontWeight: 700, fontFamily: 'inherit',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      transition: 'background 0.2s'
                    }}
                  >
                    <QrCode size={17} />
                    📷 Scan Technician Badge QR
                  </button>
                </form>
              )}
            </div>

            {/* Security Notice */}
            <div style={{ marginTop: '24px', padding: '12px 14px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={18} color="#10b981" />
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                <strong>Authorized Field Technicians Only</strong> · Activity is timestamped and synchronized with Municipal SLA logs.
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Active Crew Directory ─── */}
          <div style={{
            background: 'var(--bg-primary, #0f172a)',
            borderRadius: '24px',
            padding: '24px',
            border: '1px solid var(--border-glass, rgba(255,255,255,0.08))',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={18} color="#10b981" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {selectedCity} Crew Directory
                    </h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click any technician below for 1-click instant login</span>
                  </div>
                </div>
                <span style={{
                  fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '16px',
                  background: 'rgba(16,185,129,0.15)', color: '#10b981',
                  border: '1px solid rgba(16,185,129,0.3)'
                }}>
                  {loadingWorkers ? 'Loading...' : `${dbWorkers.length} Registered`}
                </span>
              </div>

              {/* Workers Grid List */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '12px',
                maxHeight: '440px',
                overflowY: 'auto',
                paddingRight: '6px'
              }}>
                {dbWorkers.map(w => (
                  <div
                    key={w.worker_id}
                    onClick={() => {
                      setWorkerId(w.worker_id);
                      handleLogin(undefined, w.worker_id);
                    }}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '14px',
                      border: workerId === w.worker_id ? '2px solid #10b981' : '1px solid var(--border-glass, rgba(255,255,255,0.08))',
                      background: workerId === w.worker_id ? 'rgba(16,185,129,0.14)' : 'var(--bg-secondary, #1e293b)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '10px',
                      transition: 'all 0.15s ease',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{
                          fontSize: '14px', fontWeight: 900, color: '#10b981',
                          fontFamily: "'JetBrains Mono', monospace", display: 'block', marginBottom: '2px'
                        }}>
                          {w.worker_id}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                          👷 {w.name}
                        </span>
                      </div>
                      <span style={{
                        padding: '3px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800,
                        background: w.status === 'On Job' ? 'rgba(245,158,11,0.18)' : 'rgba(16,185,129,0.18)',
                        color: w.status === 'On Job' ? '#f59e0b' : '#10b981',
                        border: `1px solid ${w.status === 'On Job' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`
                      }}>
                        {w.status === 'On Job' ? '⚡ On Job' : '🟢 Available'}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.06)',
                      paddingTop: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} color="#10b981" />
                        <span>{w.zone || 'Primary Zone'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: w.open_jobs > 0 ? '#f59e0b' : '#10b981', fontWeight: 700 }}>
                        <span>{w.open_jobs} active orders</span>
                      </div>
                      <div style={{ color: '#10b981', fontWeight: 700 }}>
                        Select ➔
                      </div>
                    </div>
                  </div>
                ))}

                {dbWorkers.length === 0 && !loadingWorkers && (
                  <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: '16px' }}>
                    <p style={{ fontSize: '14px', margin: '0 0 8px' }}>🚫 No field technicians registered in {selectedCity} grid.</p>
                    <span style={{ fontSize: '12px' }}>Please select another municipal corporation.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Crew Metrics summary */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-glass)'
            }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Crew Size</span>
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{dbWorkers.length} Technicians</strong>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>SLA Target</span>
                <strong style={{ fontSize: '14px', color: '#10b981' }}>98.4% On-Time</strong>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Response Time</span>
                <strong style={{ fontSize: '14px', color: '#06b6d4' }}>&lt; 30 Mins</strong>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
