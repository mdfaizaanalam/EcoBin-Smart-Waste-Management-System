import React, { useState, useEffect } from 'react';
import { 
  Truck, LogIn, AlertCircle, QrCode, Building2, MapPin, 
  Gauge, ArrowLeft, ShieldCheck, CheckCircle2, Navigation2, 
  Zap, Leaf, Activity, Sparkles, Radio, Compass, Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import ThemeToggle from '../ThemeToggle';
import SmartQRScanner from '../SmartQRScanner';

interface DriverLoginProps {
  onLogin: (truckId: string, driverName: string) => void;
}

interface TruckFromDB {
  truck_id: string;
  plate_number: string;
  capacity: number;
  status: string;
  driver: string;
  city: string;
}

const SUPPORTED_CITIES = [
  'Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 
  'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'
];

const DriverLogin: React.FC<DriverLoginProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [selectedCity, setSelectedCity] = useState<string>(() => localStorage.getItem('driver_city') || 'Hyderabad');
  const [dbTrucks, setDbTrucks] = useState<TruckFromDB[]>([]);
  const [loadingTrucks, setLoadingTrucks] = useState<boolean>(false);
  const [truckId, setTruckId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  // Fetch real registered trucks from database for the selected city
  useEffect(() => {
    let isMounted = true;
    const fetchCityTrucks = async () => {
      setLoadingTrucks(true);
      try {
        const res = await fetch(`/api/driver/trucks?city=${encodeURIComponent(selectedCity)}`);
        if (res.ok) {
          const data: TruckFromDB[] = await res.json();
          if (isMounted) {
            setDbTrucks(data);
            if (data.length > 0 && !truckId) {
              setTruckId(data[0].truck_id);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch trucks for city:', err);
      } finally {
        if (isMounted) setLoadingTrucks(false);
      }
    };
    fetchCityTrucks();
    return () => { isMounted = false; };
  }, [selectedCity]);

  const handleQRSuccess = (_token: string, data: any) => {
    if (data.entity_type === 'Driver' && data.truck_id) {
      localStorage.setItem('driver_truck_id', data.truck_id);
      localStorage.setItem('driver_name', data.driver_name);
      localStorage.setItem('driver_city', data.city || selectedCity);
      onLogin(data.truck_id, data.driver_name);
    } else {
      setError(t('invalidQR') || 'Invalid Driver QR badge');
      setShowQR(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent, directTruckId?: string) => {
    if (e) e.preventDefault();
    const targetId = (directTruckId || truckId).trim().toUpperCase();
    if (!targetId) {
      setError('Please select or enter an assigned Truck ID.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/driver/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ truck_id: targetId }),
      });

      if (!response.ok) {
        throw new Error('Invalid Truck ID or fleet unit is not active.');
      }

      const data = await response.json();
      const driverCity = data.city || selectedCity;
      
      localStorage.setItem('driver_truck_id', data.truck_id);
      localStorage.setItem('driver_name', data.driver);
      localStorage.setItem('driver_city', driverCity);

      onLogin(data.truck_id, data.driver);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate. Please try again.');
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
      {/* Background Glow Ambient */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(6,182,212,0.12) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(139,92,246,0.12) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(16,185,129,0.06) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      {/* Top Navbar */}
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
            background: 'linear-gradient(135deg, var(--accent-cyan, #06b6d4), var(--accent-purple, #8b5cf6))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(6,182,212,0.4)'
          }}>
            <Truck size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                EcoBin Fleet Pilot
              </span>
              <span style={{
                fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px',
                background: 'rgba(6,182,212,0.18)', color: 'var(--accent-cyan, #06b6d4)',
                border: '1px solid rgba(6,182,212,0.3)', textTransform: 'uppercase'
              }}>
                v3.2 AI Grid
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>
              Municipal Collection Logistics & Dynamic IoT Routing
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
            <Radio size={12} className="animate-pulse" />
            <span>Telemetry Online</span>
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

      {/* Main Full-Screen Layout */}
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
        
        {/* Top Feature Highlights Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          width: '100%'
        }}>
          {[
            { icon: <Zap size={20} color="#06b6d4" />, emoji: '⚡', title: 'AI Dynamic Routing', desc: 'OSRM turn-by-turn navigation optimized for fuel & traffic', badge: 'Auto Sync' },
            { icon: <Compass size={20} color="#8b5cf6" />, emoji: '🛰️', title: 'Real-Time GPS Tracking', desc: 'Sub-meter live tracking & bin proximity detection', badge: 'Active' },
            { icon: <Leaf size={20} color="#10b981" />, emoji: '🌿', title: 'Carbon & Fuel Savings', desc: 'Calculates instant CO2 offsets and diesel economy', badge: '+28% Saved' },
            { icon: <Activity size={20} color="#f59e0b" />, emoji: '📊', title: 'Live Sensor Telemetry', desc: 'Smart ultrasonic fill levels & anomaly detection', badge: 'IoT Grid' },
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
              {/* Jurisdiction Selector */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: 'var(--accent-cyan, #06b6d4)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    <Building2 size={14} /> 🏙️ Municipal Jurisdiction
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{SUPPORTED_CITIES.length} Cities Active</span>
                </div>
                <select
                  value={selectedCity}
                  onChange={e => {
                    const newCity = e.target.value;
                    setSelectedCity(newCity);
                    localStorage.setItem('driver_city', newCity);
                    setTruckId('');
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
                      📍 {c} Municipal Fleet Grid
                    </option>
                  ))}
                </select>
              </div>

              {/* Driver Sign In Header */}
              <div style={{ marginBottom: '18px' }}>
                <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                  🚚 Vehicle Driver Authentication
                </h2>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Select your assigned truck unit from the grid or enter Truck ID manually to load your optimized route.
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
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {showQR ? (
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
                  <SmartQRScanner 
                    onScanSuccess={handleQRSuccess} 
                    onScanError={(err) => setError(err)}
                    title={t('scanQR') || 'Scan Vehicle QR Badge'}
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
                      🔑 Assigned Truck ID
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={truckId}
                        onChange={(e) => setTruckId(e.target.value)}
                        placeholder={`e.g. ${dbTrucks[0]?.truck_id || 'TRK-HYD-01'}`}
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
                        fontSize: '11px', fontWeight: 800, color: 'var(--accent-cyan)', background: 'rgba(6,182,212,0.12)',
                        padding: '3px 8px', borderRadius: '6px'
                      }}>
                        TRUCK ID
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%', padding: '14px',
                      background: loading ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, var(--accent-cyan, #06b6d4), var(--accent-purple, #8b5cf6))',
                      color: '#ffffff', border: 'none', borderRadius: '12px',
                      fontSize: '15px', fontWeight: 800, fontFamily: 'inherit',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      letterSpacing: '0.3px',
                      boxShadow: loading ? 'none' : '0 8px 24px rgba(6,182,212,0.35)',
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    {loading ? '🔄 Connecting to AI Routing Engine...' : <><LogIn size={18} /> 🚀 Launch Navigation Dashboard</>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowQR(true)}
                    style={{
                      width: '100%', marginTop: '12px', padding: '12px',
                      background: 'var(--bg-secondary, #1e293b)', color: 'var(--accent-cyan, #06b6d4)',
                      border: '1.5px solid var(--accent-cyan, #06b6d4)',
                      borderRadius: '12px', fontSize: '13px', fontWeight: 700, fontFamily: 'inherit',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      transition: 'background 0.2s'
                    }}
                  >
                    <QrCode size={17} />
                    📷 Scan Driver QR Badge
                  </button>
                </form>
              )}
            </div>

            {/* Quick security & telemetry badge */}
            <div style={{ marginTop: '24px', padding: '12px 14px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={18} color="var(--accent-cyan)" />
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                <strong>GPS & IoT Telemetry Live</strong> · Route dynamically synchronized with Municipal Command.
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Active Municipal Fleet Directory ─── */}
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
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Truck size={18} color="var(--accent-cyan, #06b6d4)" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {selectedCity} Active Fleet Grid
                    </h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click any truck below for 1-click instant login</span>
                  </div>
                </div>
                <span style={{
                  fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '16px',
                  background: 'rgba(6,182,212,0.15)', color: 'var(--accent-cyan, #06b6d4)',
                  border: '1px solid rgba(6,182,212,0.3)'
                }}>
                  {loadingTrucks ? 'Loading...' : `${dbTrucks.length} Units Ready`}
                </span>
              </div>

              {/* Trucks Grid List */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '12px',
                maxHeight: '440px',
                overflowY: 'auto',
                paddingRight: '6px'
              }}>
                {dbTrucks.map(t => (
                  <div
                    key={t.truck_id}
                    onClick={() => {
                      setTruckId(t.truck_id);
                      handleLogin(undefined, t.truck_id);
                    }}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '14px',
                      border: truckId === t.truck_id ? '2px solid var(--accent-cyan, #06b6d4)' : '1px solid var(--border-glass, rgba(255,255,255,0.08))',
                      background: truckId === t.truck_id ? 'rgba(6,182,212,0.14)' : 'var(--bg-secondary, #1e293b)',
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
                          fontSize: '14px', fontWeight: 900, color: 'var(--accent-cyan, #06b6d4)',
                          fontFamily: "'JetBrains Mono', monospace", display: 'block', marginBottom: '2px'
                        }}>
                          {t.truck_id}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                          👤 {t.driver}
                        </span>
                      </div>
                      <span style={{
                        padding: '3px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800,
                        background: t.status === 'En Route' ? 'rgba(245,158,11,0.18)' : 'rgba(16,185,129,0.18)',
                        color: t.status === 'En Route' ? '#f59e0b' : '#10b981',
                        border: `1px solid ${t.status === 'En Route' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`
                      }}>
                        {t.status === 'En Route' ? '⚡ En Route' : '🟢 Ready / Idle'}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.06)',
                      paddingTop: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Gauge size={12} color="var(--accent-cyan)" />
                        <span>{t.capacity}L Vol</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} color="var(--accent-purple)" />
                        <span>{t.plate_number || 'Municipal'}</span>
                      </div>
                      <div style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>
                        Select ➔
                      </div>
                    </div>
                  </div>
                ))}

                {dbTrucks.length === 0 && !loadingTrucks && (
                  <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: '16px' }}>
                    <p style={{ fontSize: '14px', margin: '0 0 8px' }}>🚫 No collection trucks registered in {selectedCity} grid.</p>
                    <span style={{ fontSize: '12px' }}>Please switch to Hyderabad, Bangalore, or another jurisdiction.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Fleet Metrics summary */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-glass)'
            }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>City Fleet Units</span>
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{dbTrucks.length} Trucks</strong>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Avg Capacity</span>
                <strong style={{ fontSize: '14px', color: '#06b6d4' }}>5,000 Liters</strong>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>GPS Engine</span>
                <strong style={{ fontSize: '14px', color: '#10b981' }}>OSRM + IoT</strong>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default DriverLogin;
