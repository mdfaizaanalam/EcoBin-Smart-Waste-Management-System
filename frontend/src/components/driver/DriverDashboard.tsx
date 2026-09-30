import React, { useState, useEffect } from 'react';
import { 
  LogOut, Navigation2, CheckCircle2, AlertCircle, 
  Volume2, VolumeX, Play, Square, Pause, Wrench, Compass, QrCode,
  Gauge, Leaf, Zap, TrendingUp, Activity, Radio, Sparkles, MapPin, 
  RotateCcw, ShieldCheck, Clock, ArrowRight, BatteryCharging
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import ThemeToggle from '../ThemeToggle';
import SmartQRScanner from '../SmartQRScanner';

interface DriverDashboardProps {
  truckId: string;
  driverName: string;
  onLogout: () => void;
}

// Haversine formula to compute distance in meters
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // Earth radius in meters
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
};

// Map recentering component
const MapRecenter: React.FC<{ position: [number, number] | null }> = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);
  return null;
};

// Custom Marker Icons
const depotIcon = L.divIcon({
  html: `<div style="
    width:28px; height:28px;
    background:linear-gradient(135deg,#06b6d4,#8b5cf6);
    border:2.5px solid #ffffff; border-radius:10px;
    box-shadow:0 0 20px rgba(6,182,212,0.8);
    display:flex; align-items:center; justify-content:center;
    color:white; font-size:14px; font-weight:bold;
  ">🏛️</div>`,
  className: 'custom-depot-marker',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const truckIcon = L.divIcon({
  html: `<div style="
    width:36px; height:36px;
    background:linear-gradient(135deg,#ef4444,#ea580c);
    border:2.5px solid #ffffff; border-radius:50%;
    box-shadow:0 0 24px rgba(239,68,68,0.9);
    display:flex; align-items:center; justify-content:center;
    color:white; font-size:18px;
  ">🚚</div>`,
  className: 'custom-truck-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const createBinIcon = (status: string, isNext: boolean) => {
  const isCollected = status === 'Collected';
  const isMaintenance = status === 'Maintenance';
  
  let color = '#f59e0b'; // default yellow
  let emoji = '🗑️';
  if (isCollected) {
    color = '#64748b'; // slate/gray
    emoji = '✓';
  } else if (isMaintenance) {
    color = '#ef4444'; // red
    emoji = '⚠️';
  } else if (isNext) {
    color = '#10b981'; // green
    emoji = '🎯';
  }

  const glow = isNext ? `box-shadow: 0 0 0 5px rgba(16,185,129,0.35), 0 0 20px ${color};` : 'box-shadow: 0 2px 8px rgba(0,0,0,0.4);';
  
  const html = `<div style="
    width: 24px; height: 24px;
    background: ${color}; border: 2px solid white;
    border-radius: 50%; ${glow}
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 11px; font-weight: bold;
  ">${emoji}</div>`;

  return L.divIcon({
    html,
    className: 'custom-bin-marker',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

const DriverDashboard: React.FC<DriverDashboardProps> = ({ truckId, driverName, onLogout }) => {
  const { t } = useTranslation();
  const [routeData, setRouteData] = useState<any>(null);
  const [streetRoute, setStreetRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulation & Navigation States
  const [truckPosition, setTruckPosition] = useState<[number, number] | null>(null);
  const [currentCoordIndex, setCurrentCoordIndex] = useState<number>(0);
  const [isDriving, setIsDriving] = useState(false);
  const [streetCoords, setStreetCoords] = useState<[number, number][]>([]);
  const [navigationSteps, setNavigationSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [truckLoad, setTruckLoad] = useState<number>(0); // in Liters
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);

  // Issue Reporting States
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueBinId, setIssueBinId] = useState<string | null>(null);
  const [issueType, setIssueType] = useState('Damaged Lid');
  const [issueNotes, setIssueNotes] = useState('');
  const [reportingIssue, setReportingIssue] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [lastActionMsg, setLastActionMsg] = useState<string>('');

  useEffect(() => {
    fetchRouteData();
  }, [truckId]);

  const speakText = (text: string) => {
    if (isMuted) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const fetchRouteData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/driver/${truckId}/route`);
      if (!res.ok) throw new Error('Failed to load route data');
      const data = await res.json();
      setRouteData(data);

      if (data.has_route && data.route.path.length > 1) {
        // Fetch OSRM route with steps
        const stops = data.route.path.filter((n: any) => n.latitude && n.longitude);
        const coordStr = stops.map((s: any) => `${s.longitude},${s.latitude}`).join(';');
        const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson&steps=true`);
        
        if (osrmRes.ok) {
          const osrmData = await osrmRes.json();
          if (osrmData.code === 'Ok' && osrmData.routes?.[0]) {
            const coords = osrmData.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
            setStreetRoute({ 
              coords, 
              distance: osrmData.routes[0].distance, 
              duration: osrmData.routes[0].duration 
            });
            setStreetCoords(coords);
            
            if (coords.length > 0) {
              setTruckPosition(coords[0]);
            }
            
            // Extract OSRM turn-by-turn directions
            const allSteps: any[] = [];
            if (osrmData.routes[0].legs) {
              osrmData.routes[0].legs.forEach((leg: any, legIdx: number) => {
                leg.steps.forEach((step: any) => {
                  allSteps.push({
                    instruction: step.maneuver.instruction,
                    distance: step.distance,
                    duration: step.duration,
                    coordinate: [step.maneuver.location[1], step.maneuver.location[0]],
                    legIndex: legIdx
                  });
                });
              });
            }
            setNavigationSteps(allSteps);
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const path = routeData?.route?.path || [];
  const uncollectedBins = path.filter((n: any) => n.type === 'bin' && n.status !== 'Collected' && n.status !== 'Maintenance');
  const nextBin = uncollectedBins.length > 0 ? uncollectedBins[0] : null;

  // Real-time GPS movement simulation loop
  useEffect(() => {
    let interval: any = null;
    if (isDriving && streetCoords.length > 0) {
      const delay = Math.max(50, Math.floor(250 / simSpeed));
      interval = setInterval(() => {
        let nextIndex = currentCoordIndex + 1;
        if (nextIndex >= streetCoords.length) {
          setIsDriving(false);
          clearInterval(interval);
          speakText("Route completed. Returning to depot.");
          setLastActionMsg("🏁 Route completed. Truck returned safely to depot.");
          return;
        }

        setCurrentCoordIndex(nextIndex);
        const newPos = streetCoords[nextIndex];
        setTruckPosition(newPos);

        // Update current navigation step instruction
        const nextStepIdx = navigationSteps.findIndex((step, idx) => {
          if (idx <= currentStepIndex) return false;
          const dist = getDistance(newPos[0], newPos[1], step.coordinate[0], step.coordinate[1]);
          return dist < 30; // 30 meters vicinity
        });
        if (nextStepIdx !== -1) {
          setCurrentStepIndex(nextStepIdx);
          speakText(navigationSteps[nextStepIdx].instruction);
        }

        // Arrived at target bin
        if (nextBin && nextBin.latitude && nextBin.longitude) {
          const distToBin = getDistance(newPos[0], newPos[1], nextBin.latitude, nextBin.longitude);
          if (distToBin < 25) { // 25 meters vicinity
            setIsDriving(false);
            clearInterval(interval);
            speakText(`Arrived at bin ${nextBin.bin_id}. Ready for collection.`);
            setLastActionMsg(`🎯 Arrived at bin ${nextBin.bin_id}. Ready for pickup!`);
          }
        }
      }, delay);
    }
    return () => clearInterval(interval);
  }, [isDriving, streetCoords, currentCoordIndex, navigationSteps, currentStepIndex, nextBin, simSpeed]);

  // Telemetry details
  const totalBinsCount = path.filter((n: any) => n.type === 'bin').length;
  const collectedBinsCount = path.filter((n: any) => n.type === 'bin' && n.status === 'Collected').length;
  
  const distanceRemaining = streetRoute ? Math.max(0, (streetRoute.distance * (1 - currentCoordIndex / streetCoords.length)) / 1000) : 0;
  const durationRemaining = streetRoute ? Math.max(0, (streetRoute.duration * (1 - currentCoordIndex / streetCoords.length)) / 60) : 0;

  const markCollected = async (binId: string) => {
    try {
      const response = await fetch('/api/driver/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bin_id: binId, truck_id: truckId }),
      });
      
      if (!response.ok) throw new Error('Database collection endpoint failed');

      setRouteData((prev: any) => {
        const newPath = prev.route.path.map((node: any) => {
          if (node.bin_id === binId) return { ...node, status: 'Collected' };
          return node;
        });
        return { ...prev, route: { ...prev.route, path: newPath } };
      });
      
      const targetBin = path.find((n: any) => n.bin_id === binId);
      if (targetBin) {
        setTruckLoad((prev) => Math.min(5000, prev + (targetBin.capacity || 240)));
      }
      
      speakText(`Bin ${binId} successfully collected.`);
      setLastActionMsg(`✅ Bin ${binId} marked as collected! Database updated.`);
    } catch (err: any) {
      alert('Error updating collection: ' + err.message);
    }
  };

  const reportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueBinId) return;

    setReportingIssue(true);
    try {
      const response = await fetch('/api/driver/report-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bin_id: issueBinId,
          issue_type: issueType,
          notes: issueNotes
        }),
      });

      if (!response.ok) throw new Error('Database reporting endpoint failed');

      setRouteData((prev: any) => {
        const newPath = prev.route.path.map((node: any) => {
          if (node.bin_id === issueBinId) return { ...node, status: 'Maintenance' };
          return node;
        });
        return { ...prev, route: { ...prev.route, path: newPath } };
      });

      speakText(`Issue reported. Bin ${issueBinId} flagged for maintenance.`);
      setLastActionMsg(`⚠️ Issue logged for ${issueBinId}. Sent to maintenance crew.`);
      setShowIssueModal(false);
      setIssueNotes('');
    } catch (err: any) {
      alert('Error reporting issue: ' + err.message);
    } finally {
      setReportingIssue(false);
    }
  };

  const handleStartSimulation = () => {
    if (streetCoords.length === 0) return;
    setIsDriving(true);
    speakText("Navigation active. Driving to next stop.");
  };

  const handlePauseSimulation = () => {
    setIsDriving(false);
    speakText("Navigation paused.");
  };

  const handleResetSimulation = () => {
    setIsDriving(false);
    setCurrentCoordIndex(0);
    setCurrentStepIndex(0);
    if (streetCoords.length > 0) {
      setTruckPosition(streetCoords[0]);
    }
    speakText("Navigation reset to origin.");
  };

  const handleMuteToggle = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (!nextMute) {
      setTimeout(() => speakText("Voice guidance active."), 100);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base, #0b1120)', color: 'var(--text-primary, #f8fafc)', fontFamily: 'Outfit, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '4px solid var(--bg-tertiary, #334155)', borderTop: '4px solid var(--accent-cyan, #06b6d4)', borderRadius: '50%', width: '48px', height: '48px', margin: '0 auto 18px auto', animation: 'spin 1s linear infinite' }} />
          <div style={{ fontSize: '18px', fontWeight: 800 }}>Loading AI Route & Telemetry...</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Connecting to Municipal IoT Core</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base, #0b1120)', color: 'var(--text-primary)', flexDirection: 'column', gap: '16px', fontFamily: 'Outfit, sans-serif' }}>
        <AlertCircle size={52} color="var(--color-danger, #ef4444)" />
        <div style={{ fontSize: '20px', fontWeight: 800 }}>{error}</div>
        <button onClick={onLogout} style={{ padding: '12px 24px', borderRadius: '10px', background: 'var(--bg-secondary, #1e293b)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', cursor: 'pointer', fontWeight: 700 }}>Return to Fleet Sign In</button>
      </div>
    );
  }

  if (!routeData?.has_route) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base, #0b1120)', color: 'var(--text-primary)', flexDirection: 'column', gap: '20px', fontFamily: 'Outfit, sans-serif' }}>
        <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle2 size={40} color="#10b981" />
        </div>
        <h2 style={{ margin: 0, fontWeight: 900, fontSize: '24px' }}>No Active Route Scheduled</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 10px 0', maxWidth: '400px', textAlign: 'center' }}>
          All collection orders for {truckId} are clear or have not been dispatched by Municipal Command today.
        </p>
        <button onClick={onLogout} style={{ padding: '12px 28px', borderRadius: '12px', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 800, boxShadow: '0 4px 16px rgba(6,182,212,0.4)' }}>
          Back to Driver Portal
        </button>
      </div>
    );
  }

  const activeStep = navigationSteps[currentStepIndex];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      background: 'var(--bg-base, #0b1120)',
      fontFamily: "'Outfit', 'Inter', sans-serif",
      color: 'var(--text-primary, #f8fafc)',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      
      {/* ── Top Header Navigation Bar ──────────────────────────────── */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 24px',
        background: 'var(--bg-primary, #0f172a)',
        borderBottom: '1px solid var(--border-glass, rgba(255,255,255,0.08))',
        boxShadow: 'var(--shadow-sm)',
        zIndex: 100,
        height: '64px',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent-cyan, #06b6d4), var(--accent-purple, #8b5cf6))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(6,182,212,0.35)'
          }}>
            <Navigation2 color="#ffffff" size={20} style={{ transform: 'rotate(45deg)' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                EcoBin Fleet Pilot
              </span>
              <span style={{
                fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px',
                background: isDriving ? 'rgba(16,185,129,0.18)' : 'rgba(245,158,11,0.18)',
                color: isDriving ? '#10b981' : '#f59e0b',
                border: `1px solid ${isDriving ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`
              }}>
                {isDriving ? '🟢 Live Navigation' : '🟡 Standby'}
              </span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>👤 Driver: <strong style={{ color: 'var(--text-primary)' }}>{driverName}</strong></span>
              <span>•</span>
              <span>🚚 Unit: <strong style={{ color: 'var(--accent-cyan, #06b6d4)', fontFamily: "'JetBrains Mono', monospace" }}>{truckId}</strong></span>
              <span>•</span>
              <span>🏛️ Terminal: <strong style={{ color: 'var(--text-primary)' }}>{routeData?.depot_name || `${routeData?.city || 'Hyderabad'} Terminal`}</strong></span>
            </div>
          </div>
        </div>

        {/* Controls Ribbon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LanguageSwitcher />
          <ThemeToggle />
          
          <button 
            onClick={handleMuteToggle}
            style={{
              background: 'var(--bg-secondary, #1e293b)',
              border: '1px solid var(--border-glass)',
              padding: '8px 12px',
              borderRadius: '10px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700
            }}
            title={isMuted ? "Unmute Voice Guidance" : "Mute Voice Guidance"}
          >
            {isMuted ? <VolumeX size={16} color="#ef4444" /> : <Volume2 size={16} color="#10b981" />}
            <span>{isMuted ? 'Muted' : 'Voice On'}</span>
          </button>

          <button
            onClick={onLogout}
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              padding: '8px 14px',
              borderRadius: '10px',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 800
            }}
          >
            <LogOut size={14} /> Exit
          </button>
        </div>
      </header>

      {/* ── Real-time Telemetry & KPIs Ribbon ──────────────────────── */}
      <div style={{
        background: 'var(--bg-primary, #0f172a)',
        borderBottom: '1px solid var(--border-glass)',
        padding: '8px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px',
        alignItems: 'center',
        zIndex: 10
      }}>
        {/* Speed */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Gauge size={14} color="var(--accent-cyan, #06b6d4)" />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Live Velocity</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: isDriving ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
              {isDriving ? `${36 * simSpeed} km/h` : '0 km/h (Idle)'}
            </div>
          </div>
        </div>

        {/* Payload */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={14} color="var(--accent-purple, #8b5cf6)" />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Waste Payload</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {truckLoad}L / 5000L ({Math.round((truckLoad / 5000) * 100)}%)
            </div>
          </div>
        </div>

        {/* Stops Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={14} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Stops Picked</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#10b981' }}>
              {collectedBinsCount} of {totalBinsCount} ({totalBinsCount > 0 ? Math.round((collectedBinsCount / totalBinsCount) * 100) : 0}%)
            </div>
          </div>
        </div>

        {/* Distance Remaining */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={14} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Route Distance</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#f59e0b' }}>
              {distanceRemaining.toFixed(2)} km ({durationRemaining.toFixed(0)} mins)
            </div>
          </div>
        </div>

        {/* Carbon Offset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={14} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>CO₂ Avoided</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#10b981' }}>
              {((collectedBinsCount * 2.8) + (isDriving ? 0.6 : 0)).toFixed(1)} kg
            </div>
          </div>
        </div>
      </div>

      {/* Action Toast message if any */}
      {lastActionMsg && (
        <div style={{
          background: 'var(--bg-secondary, #1e293b)',
          borderBottom: '1px solid var(--border-glass)',
          padding: '6px 24px',
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--accent-cyan)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{lastActionMsg}</span>
          <button onClick={() => setLastActionMsg('')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* ── Main Full Screen Split Workspace ──────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* ── LEFT COLUMN: Turn Guidance, Active Bin, and Route Queue ── */}
        <div style={{
          width: '420px',
          background: 'var(--bg-primary, #0f172a)',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--border-glass)',
          overflowY: 'auto',
          boxSizing: 'border-box'
        }}>
          
          {/* Target Stop Action Card */}
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-glass)', background: nextBin ? 'rgba(6,182,212,0.06)' : 'rgba(16,185,129,0.06)' }}>
            {nextBin ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    🎯 Target Stop · Priority Collection
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', background: nextBin.current_fill_percentage >= 80 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)', color: nextBin.current_fill_percentage >= 80 ? '#ef4444' : '#f59e0b' }}>
                    {nextBin.current_fill_percentage}% Full
                  </span>
                </div>

                <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
                  {nextBin.bin_id}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} color="var(--accent-cyan)" />
                  <span>{nextBin.street_name || nextBin.area_name}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  <button 
                    onClick={() => markCollected(nextBin.bin_id)}
                    style={{
                      flex: 1, padding: '10px 14px', borderRadius: '10px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white', border: 'none', fontWeight: 800, fontSize: '13px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                    }}
                  >
                    <CheckCircle2 size={16} /> Mark Picked
                  </button>

                  <button 
                    onClick={() => setShowQRModal(true)}
                    style={{
                      padding: '10px 12px', borderRadius: '10px',
                      background: 'var(--bg-secondary, #1e293b)',
                      color: 'var(--accent-cyan)', border: '1.5px solid var(--accent-cyan)',
                      fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    <QrCode size={15} /> QR Scan
                  </button>

                  <button 
                    onClick={() => { setIssueBinId(nextBin.bin_id); setShowIssueModal(true); }}
                    style={{
                      padding: '10px 12px', borderRadius: '10px',
                      background: 'rgba(239,68,68,0.12)', color: '#ef4444',
                      border: '1px solid rgba(239,68,68,0.25)', fontWeight: 700, fontSize: '12px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    <Wrench size={14} /> Flag
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>🎉</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#10b981' }}>Shift Complete!</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>All scheduled waste bins have been picked up.</div>
              </div>
            )}
          </div>

          {/* Navigation Simulation Controls & Turn Instruction */}
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-glass)', background: 'var(--bg-secondary, #1e293b)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                🕹️ Dynamic GPS Simulation
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 4].map(s => (
                  <button
                    key={s}
                    onClick={() => setSimSpeed(s)}
                    style={{
                      padding: '2px 6px', borderRadius: '6px', fontSize: '10px', fontWeight: 800,
                      background: simSpeed === s ? 'var(--accent-cyan)' : 'var(--bg-primary)',
                      color: simSpeed === s ? 'black' : 'var(--text-muted)',
                      border: '1px solid var(--border-glass)', cursor: 'pointer'
                    }}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {!isDriving ? (
                <button 
                  onClick={handleStartSimulation}
                  disabled={streetCoords.length === 0}
                  style={{
                    flex: 1, background: 'linear-gradient(135deg, var(--accent-cyan), var(--color-info, #3b82f6))',
                    color: 'white', border: 'none', padding: '10px 14px', borderRadius: '10px',
                    fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px',
                    boxShadow: '0 4px 12px rgba(6,182,212,0.3)'
                  }}
                >
                  <Play size={14} fill="white" /> Resume Navigation
                </button>
              ) : (
                <button 
                  onClick={handlePauseSimulation}
                  style={{
                    flex: 1, background: '#f59e0b', color: 'white', border: 'none',
                    padding: '10px 14px', borderRadius: '10px', fontWeight: 800,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px'
                  }}
                >
                  <Pause size={14} fill="currentColor" /> Pause Navigation
                </button>
              )}
              
              <button 
                onClick={handleResetSimulation}
                style={{
                  background: 'var(--bg-primary)', border: '1px solid var(--border-glass)',
                  color: 'var(--text-secondary)', padding: '10px 12px', borderRadius: '10px',
                  fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px'
                }}
              >
                <RotateCcw size={13} /> Reset
              </button>
            </div>

            {/* Turn by Turn Info */}
            {activeStep ? (
              <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
                  <Compass size={13} /> Next Maneuver
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {activeStep.instruction}
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>📍 In {activeStep.distance.toFixed(0)} meters</span>
                  <span>⏱️ ~{Math.ceil(activeStep.duration)}s</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Stops List */}
          <div style={{ padding: '16px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Route Stops ({collectedBinsCount}/{totalBinsCount})
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tap to inspect</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {path.map((node: any, idx: number) => {
                if (node.type === 'depot') {
                  const terminalName = node.name || routeData?.depot_name || (routeData?.city ? `${routeData.city} Terminal` : 'Terminal');
                  return (
                    <div key={`depot-${idx}`} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'rgba(139,92,246,0.2)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                        🏛️
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '12px' }}>{terminalName}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{idx === 0 ? 'Departure Depot' : 'Final Depot Return'}</div>
                      </div>
                    </div>
                  );
                }

                const isCollected = node.status === 'Collected';
                const isMaintenance = node.status === 'Maintenance';
                const isNext = nextBin?.bin_id === node.bin_id;

                return (
                  <div 
                    key={node.bin_id} 
                    style={{ 
                      display: 'flex', gap: '10px', padding: '10px 12px', borderRadius: '10px', 
                      background: isNext ? 'rgba(6,182,212,0.12)' : 'var(--bg-secondary)',
                      border: isNext ? '1.5px solid var(--accent-cyan)' : isMaintenance ? '1px solid #ef4444' : '1px solid var(--border-glass)',
                      opacity: isCollected ? 0.6 : 1,
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ 
                      width: '26px', height: '26px', borderRadius: '50%', 
                      background: isCollected ? 'var(--bg-tertiary)' : isMaintenance ? '#ef4444' : isNext ? '#10b981' : 'var(--accent-cyan)', 
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontWeight: 800, fontSize: '11px', flexShrink: 0 
                    }}>
                      {isCollected ? '✓' : idx}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", textDecoration: isCollected ? 'line-through' : 'none' }}>
                          {node.bin_id}
                        </span>
                        {isCollected && <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 800 }}>Collected</span>}
                        {isMaintenance && <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 800 }}>Maintenance</span>}
                        {isNext && <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 800 }}>Next Up</span>}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px' }}>{node.street_name || node.area_name}</div>
                      
                      {!isCollected && !isMaintenance && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                          <div style={{ flex: 1, height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${node.current_fill_percentage}%`, height: '100%', background: node.current_fill_percentage >= 80 ? '#ef4444' : '#f59e0b' }} />
                          </div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>{node.current_fill_percentage}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN: Full-screen Leaflet Map ─────────────────── */}
        <div style={{ flex: 1, position: 'relative', height: '100%' }}>
          <MapContainer 
            center={
              routeData?.depot_latitude && routeData?.depot_longitude
                ? [routeData.depot_latitude, routeData.depot_longitude]
                : [17.3850, 78.4867]
            } 
            zoom={13} 
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors"
            />
            
            <MapRecenter position={truckPosition} />

            {/* OSRM Route Line */}
            {streetRoute ? (
              <Polyline positions={streetRoute.coords} color="#06b6d4" weight={6} opacity={0.85} />
            ) : (
              <Polyline 
                positions={path.filter((n: any) => n.latitude).map((n: any) => [n.latitude, n.longitude] as [number, number])} 
                color="#64748b" 
                weight={4} 
                dashArray="10, 8" 
                opacity={0.6} 
              />
            )}

            {/* Start/End Depot Marker */}
            {path.map((node: any, idx: number) => {
              if (!node.latitude || !node.longitude) return null;
              
              if (node.type === 'depot') {
                const popupName = node.name || routeData?.depot_name || (routeData?.city ? `${routeData.city} Municipal Terminal` : 'Municipal Terminal');
                return (
                  <Marker key={`depot-marker-${idx}`} position={[node.latitude, node.longitude]} icon={depotIcon}>
                    <Popup><div style={{ color: '#0f172a', fontWeight: 'bold' }}>{popupName}</div></Popup>
                  </Marker>
                );
              }

              const isNext = nextBin?.bin_id === node.bin_id;
              return (
                <Marker 
                  key={`marker-${node.bin_id}`} 
                  position={[node.latitude, node.longitude]} 
                  icon={createBinIcon(node.status, isNext)}
                >
                  <Popup>
                    <div style={{ color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{node.bin_id}</div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{node.street_name}</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, marginTop: '4px' }}>Fill Level: {node.current_fill_percentage}%</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Capacity: {node.capacity}L</div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Animated Truck Position Marker */}
            {truckPosition && (
              <Marker position={truckPosition} icon={truckIcon}>
                <Popup>
                  <div style={{ color: '#0f172a', fontWeight: 'bold', fontFamily: 'Outfit, sans-serif' }}>
                    Active Fleet Truck: {truckId}
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Floating HUD over map */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            background: 'var(--bg-glass, rgba(15,23,42,0.9))',
            padding: '12px 18px',
            borderRadius: '14px',
            border: '1px solid var(--border-glass)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={16} color="#10b981" className="animate-pulse" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>IoT GPS 4G-LTE Live</span>
            </div>
            <div style={{ height: '20px', width: '1px', background: 'var(--border-glass)' }} />
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Accuracy: <strong style={{ color: '#06b6d4' }}>±0.8m</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Flag Maintenance/Issue Reporting Modal */}
      {showIssueModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 2000,
          backdropFilter: 'blur(6px)'
        }}>
          <div style={{
            background: 'var(--bg-primary, #0f172a)', border: '1px solid var(--border-glass)',
            padding: '28px', borderRadius: '18px', width: '100%', maxWidth: '440px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--text-primary)', fontWeight: 800 }}>
              ⚠️ Flag Bin Issue: {issueBinId}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: '0 0 18px 0' }}>
              Report physical damage, lid blockages, or sensor malfunction. This triggers an instant ticket for the municipal maintenance crew.
            </p>
            
            <form onSubmit={reportIssue}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Issue Type
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 14px', background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-glass)', borderRadius: '10px',
                    color: 'var(--text-primary)', fontSize: '13px', outline: 'none'
                  }}
                >
                  <option value="Damaged Lid">Damaged Lid / Broken Hinge</option>
                  <option value="Blocked Access">Blocked Access (Cars / Debris)</option>
                  <option value="Sensor Failure">Sensor Malfunction (No Signal)</option>
                  <option value="Vandalism">Vandalism / Physical Damage</option>
                  <option value="Wrong Waste Type">Wrong Waste Contamination</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Notes / Details
                </label>
                <textarea
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  placeholder="Describe damage or landmark location..."
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 14px', background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-glass)', borderRadius: '10px',
                    color: 'var(--text-primary)', fontSize: '13px', outline: 'none', resize: 'none',
                    boxSizing: 'border-box', fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportingIssue}
                  style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '13px', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}
                >
                  {reportingIssue ? 'Submitting...' : 'Submit Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Scanner Modal */}
      {showQRModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 2000,
          backdropFilter: 'blur(6px)'
        }}>
          <div style={{
            background: 'var(--bg-primary, #0f172a)', border: '1px solid var(--border-glass)',
            padding: '24px', borderRadius: '18px', width: '100%', maxWidth: '440px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <SmartQRScanner 
              onScanSuccess={(_token, data) => {
                if (data.entity_type === 'Bin' && data.entity_id === nextBin?.bin_id) {
                  markCollected(nextBin.bin_id);
                  setShowQRModal(false);
                } else if (data.entity_type === 'Bin') {
                  markCollected(data.entity_id);
                  setShowQRModal(false);
                } else {
                  alert('Scanned QR does not match a valid municipal waste bin!');
                }
              }} 
              title={t('scanBin') || 'Scan Smart Bin QR Code'}
            />
            <button
              onClick={() => setShowQRModal(false)}
              style={{ marginTop: '14px', width: '100%', padding: '11px', background: 'transparent', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}
            >
              Cancel Scanner
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
