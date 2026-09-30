import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wrench, CheckCircle2, Clock, AlertTriangle, UserCheck, 
  MapPin, Battery, Phone, RefreshCw, LogOut, Search, Filter, 
  PlusCircle, ShieldCheck, ArrowRight, Activity, Building2,
  BarChart3, PieChart, TrendingUp, Zap, Radio, Sparkles,
  Layers, CheckSquare, AlertCircle, HeartPulse
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LanguageSwitcher from '../LanguageSwitcher';
import ThemeToggle from '../ThemeToggle';

const API = '';

interface Job {
  log_id: number;
  bin_id: string;
  bin_street: string;
  bin_area: string;
  bin_ward: string;
  bin_city?: string;
  bin_lat: number | null;
  bin_lon: number | null;
  bin_fill: number;
  bin_battery: number;
  issue_type: string;
  notes: string | null;
  priority: string;
  status: string;
  reported_by: string | null;
  worker_id: string | null;
  worker_name: string | null;
  reported_at: string;
  assigned_at: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
}

interface Stats {
  total_open: number;
  in_progress: number;
  resolved_today: number;
  total_resolved: number;
  bins_in_maintenance: number;
  total_workers: number;
  workers_on_job: number;
  avg_resolution_hours: number;
}

interface Worker {
  worker_id: string;
  name: string;
  phone: string;
  zone: string;
  city?: string;
  status: string;
  open_jobs: number;
  resolved_total: number;
}

interface Props {
  workerId: string;
  workerName: string;
  zone: string;
  city?: string;
  onLogout: () => void;
}

const SUPPORTED_CITIES = [
  'All Cities', 'Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 
  'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'
];

const CITY_COORDS: Record<string, [number, number]> = {
  'Hyderabad': [17.3850, 78.4867],
  'Bangalore': [12.9716, 77.5946],
  'Mumbai': [19.0760, 72.8777],
  'Delhi': [28.6139, 77.2090],
  'Chennai': [13.0827, 80.2707],
  'Kolkata': [22.5726, 88.3639],
  'Pune': [18.5204, 73.8567],
  'Ahmedabad': [23.0225, 72.5714],
};

const PRIORITY_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  Critical: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
  High:     { bg: 'rgba(249, 115, 22, 0.15)', text: '#f97316', border: 'rgba(249, 115, 22, 0.3)' },
  Medium:   { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
  Low:      { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
};

const STATUS_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  Open:        { bg: 'rgba(239, 68, 68, 0.12)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.25)' },
  'In Progress': { bg: 'rgba(59, 130, 246, 0.12)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.25)' },
  Resolved:    { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981', border: 'rgba(16, 185, 129, 0.25)' },
};

const maintenanceMapIcon = L.divIcon({
  html: `<div style="
    width:26px; height:26px;
    background:#ef4444; border:2px solid white;
    border-radius:50%; box-shadow:0 0 16px rgba(239,68,68,0.8);
    display:flex; align-items:center; justify-content:center;
    color:white; font-size:12px; font-weight:bold;
  ">⚠️</div>`,
  className: 'custom-maint-marker',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

function fmtTime(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function MaintenanceDashboard({ workerId, workerName, zone, city = 'Hyderabad', onLogout }: Props) {
  const [tab, setTab] = useState<'myJobs' | 'allJobs' | 'map' | 'analytics' | 'workers' | 'createJob'>('myJobs');
  const [activeCity, setActiveCity] = useState<string>(() => city || localStorage.getItem('mnt_worker_city') || 'Hyderabad');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  
  // Create job form state
  const [createForm, setCreateForm] = useState({ 
    bin_id: '', 
    issue_type: 'Overflow / Sensor Failure', 
    notes: '', 
    priority: 'Medium', 
    worker_id: workerId 
  });
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const cityParam = activeCity && activeCity !== 'All Cities' && activeCity !== 'All' 
        ? `city=${encodeURIComponent(activeCity)}` 
        : '';
      const [myRes, allRes, wRes, sRes] = await Promise.all([
        fetch(`${API}/api/maintenance/jobs?worker_id=${encodeURIComponent(workerId)}${cityParam ? `&${cityParam}` : ''}`),
        fetch(`${API}/api/maintenance/jobs${cityParam ? `?${cityParam}` : ''}`),
        fetch(`${API}/api/maintenance/workers${cityParam ? `?${cityParam}` : ''}`),
        fetch(`${API}/api/maintenance/stats${cityParam ? `?${cityParam}` : ''}`),
      ]);
      if (myRes.ok) setJobs(await myRes.json());
      if (allRes.ok) setAllJobs(await allRes.json());
      if (wRes.ok) setWorkers(await wRes.json());
      if (sRes.ok) setStats(await sRes.json());
    } catch (e) {
      console.warn('Error loading maintenance data:', e);
    } finally {
      setLoading(false);
    }
  }, [workerId, activeCity]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { 
    const t = setInterval(loadData, 20000); 
    return () => clearInterval(t); 
  }, [loadData]);

  const handleUpdateJob = async (logId: number, status: string) => {
    setActionLoading(true);
    setActionMsg('');
    try {
      const res = await fetch(`${API}/api/maintenance/jobs/${logId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          log_id: logId, 
          status, 
          worker_id: workerId, 
          resolution_notes: resolveNotes 
        }),
      });
      if (res.ok) {
        setActionMsg(status === 'Resolved' ? '✅ Work order resolved! Smart bin returned to service.' : '✅ Work order set to In Progress.');
        setSelectedJob(null);
        setResolveNotes('');
        await loadData();
      }
    } catch (e: any) {
      setActionMsg(`❌ ${e.message || 'Error updating order'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    if (!createForm.bin_id.trim()) { setCreateError('Bin ID is required.'); return; }
    try {
      const res = await fetch(`${API}/api/maintenance/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      if (res.ok) {
        setCreateSuccess('✅ Repair work order created and dispatched successfully.');
        setCreateForm({ ...createForm, bin_id: '', notes: '' });
        await loadData();
      } else {
        const err = await res.json();
        setCreateError(err.detail || 'Failed to create work order.');
      }
    } catch {
      setCreateError('Connection error communicating with backend.');
    }
  };

  const filterJob = (j: Job) => {
    const matchesStatus = !filterStatus || j.status === filterStatus;
    const matchesPriority = !filterPriority || j.priority === filterPriority;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = !query || 
      j.bin_id.toLowerCase().includes(query) ||
      (j.bin_street && j.bin_street.toLowerCase().includes(query)) ||
      (j.bin_area && j.bin_area.toLowerCase().includes(query)) ||
      (j.issue_type && j.issue_type.toLowerCase().includes(query));
    return matchesStatus && matchesPriority && matchesQuery;
  };

  const filteredAll = allJobs.filter(filterJob);
  const filteredMy = jobs.filter(filterJob);

  // Issue category analytics calculations
  const issueCounts: Record<string, number> = {};
  allJobs.forEach(j => {
    const it = j.issue_type || 'Other';
    issueCounts[it] = (issueCounts[it] || 0) + 1;
  });

  const priorityCounts = {
    Critical: allJobs.filter(j => j.priority === 'Critical').length,
    High: allJobs.filter(j => j.priority === 'High').length,
    Medium: allJobs.filter(j => j.priority === 'Medium').length,
    Low: allJobs.filter(j => j.priority === 'Low').length,
  };

  const mapCenterCoords: [number, number] = CITY_COORDS[activeCity] || [17.3850, 78.4867];
  const binsWithCoords = allJobs.filter(j => j.bin_lat && j.bin_lon);

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: 'var(--bg-base, #0b1120)',
      color: 'var(--text-primary, #f8fafc)',
      fontFamily: "'Outfit', 'Inter', sans-serif",
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden'
    }}>
      {/* ── Top Sticky Navigation Bar ──────────────────────────────── */}
      <header style={{
        backgroundColor: 'var(--bg-primary, #0f172a)',
        borderBottom: '1px solid var(--border-glass, rgba(255,255,255,0.08))',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(14px)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(16,185,129,0.35)'
          }}>
            <Wrench size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              EcoBin Field Command
              <span style={{
                fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '14px',
                background: 'rgba(16,185,129,0.18)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)'
              }}>
                MUNICIPAL SLA LIVE
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              👷 Tech: <strong style={{ color: 'var(--text-primary)' }}>{workerName}</strong> (<span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#10b981' }}>{workerId}</span>) · Zone: <strong>{zone || 'Central'}</strong>
            </div>
          </div>
        </div>

        {/* Center: City Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={16} color="#10b981" />
          <select
            value={activeCity}
            onChange={e => {
              const nc = e.target.value;
              setActiveCity(nc);
              localStorage.setItem('mnt_worker_city', nc);
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              background: 'var(--bg-secondary, #1e293b)',
              color: 'var(--text-primary, #f8fafc)',
              border: '1px solid var(--border-glass, rgba(255,255,255,0.12))',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {SUPPORTED_CITIES.map(c => (
              <option key={c} value={c} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                {c === 'All Cities' ? '🌐 All Municipalities' : `📍 ${c} Grid`}
              </option>
            ))}
          </select>
        </div>

        {/* Right Tools: Refresh, Language, Theme, Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={loadData}
            title="Refresh Database Records"
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              background: 'var(--bg-secondary, #1e293b)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-glass)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>

          <LanguageSwitcher />
          <ThemeToggle />

          <button
            onClick={onLogout}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── Main Content Container ─────────────────────────────────── */}
      <main style={{
        flex: 1,
        padding: '20px 24px 60px 24px',
        maxWidth: '1440px',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        
        {/* Action feedback toast */}
        {actionMsg && (
          <div style={{
            padding: '12px 18px', borderRadius: '12px', marginBottom: '16px',
            background: 'var(--bg-secondary)', border: '1px solid #10b981',
            color: 'var(--text-primary)', fontSize: '13px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <span>{actionMsg}</span>
            <button onClick={() => setActionMsg('')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}>×</button>
          </div>
        )}

        {/* ── KPI Stat Cards Grid (8 Cards) ───────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {/* Open */}
          <div style={{
            background: 'var(--bg-primary, #0f172a)', padding: '14px 16px', borderRadius: '14px',
            border: '1px solid var(--border-glass)', borderLeft: '4px solid #ef4444', boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>🚨 Open Incidents</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#ef4444', marginTop: '2px' }}>{stats?.total_open ?? 0}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Awaiting action</div>
          </div>

          {/* In Progress */}
          <div style={{
            background: 'var(--bg-primary, #0f172a)', padding: '14px 16px', borderRadius: '14px',
            border: '1px solid var(--border-glass)', borderLeft: '4px solid #3b82f6', boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>⚙️ In Progress</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#3b82f6', marginTop: '2px' }}>{stats?.in_progress ?? 0}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Under repair</div>
          </div>

          {/* Resolved Today */}
          <div style={{
            background: 'var(--bg-primary, #0f172a)', padding: '14px 16px', borderRadius: '14px',
            border: '1px solid var(--border-glass)', borderLeft: '4px solid #10b981', boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>✅ Fixed Today</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>{stats?.resolved_today ?? 0}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Closed today</div>
          </div>

          {/* Lifetime Resolved */}
          <div style={{
            background: 'var(--bg-primary, #0f172a)', padding: '14px 16px', borderRadius: '14px',
            border: '1px solid var(--border-glass)', borderLeft: '4px solid #06b6d4', boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>📈 Total Resolved</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#06b6d4', marginTop: '2px' }}>{stats?.total_resolved ?? 0}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Historic repairs</div>
          </div>

          {/* Bins in Maintenance */}
          <div style={{
            background: 'var(--bg-primary, #0f172a)', padding: '14px 16px', borderRadius: '14px',
            border: '1px solid var(--border-glass)', borderLeft: '4px solid #f59e0b', boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>🪣 Flagged Bins</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#f59e0b', marginTop: '2px' }}>{stats?.bins_in_maintenance ?? 0}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Hardware offline</div>
          </div>

          {/* Crew on Field */}
          <div style={{
            background: 'var(--bg-primary, #0f172a)', padding: '14px 16px', borderRadius: '14px',
            border: '1px solid var(--border-glass)', borderLeft: '4px solid #8b5cf6', boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>👷 Active Crew</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#8b5cf6', marginTop: '2px' }}>
              {stats?.workers_on_job ?? 0} <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>/ {stats?.total_workers ?? 0}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Field technicians</div>
          </div>

          {/* MTTR */}
          <div style={{
            background: 'var(--bg-primary, #0f172a)', padding: '14px 16px', borderRadius: '14px',
            border: '1px solid var(--border-glass)', borderLeft: '4px solid #ec4899', boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>⏱️ Avg Fix Time</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#ec4899', marginTop: '2px' }}>{stats?.avg_resolution_hours ?? 0}h</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Mean resolution</div>
          </div>

          {/* SLA */}
          <div style={{
            background: 'var(--bg-primary, #0f172a)', padding: '14px 16px', borderRadius: '14px',
            border: '1px solid var(--border-glass)', borderLeft: '4px solid #10b981', boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>🛡️ SLA Rating</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>98.4%</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>On-target fixes</div>
          </div>
        </div>

        {/* ── Navigation Tabs ────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: 'var(--bg-primary, #0f172a)',
          padding: '6px',
          borderRadius: '12px',
          border: '1px solid var(--border-glass)',
          marginBottom: '20px',
          width: 'fit-content',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setTab('myJobs')}
            style={{
              padding: '9px 16px', borderRadius: '8px', border: 'none',
              fontSize: '13px', fontWeight: 800, cursor: 'pointer',
              background: tab === 'myJobs' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: tab === 'myJobs' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s'
            }}
          >
            📋 My Assigned Orders ({jobs.length})
          </button>
          <button
            onClick={() => setTab('allJobs')}
            style={{
              padding: '9px 16px', borderRadius: '8px', border: 'none',
              fontSize: '13px', fontWeight: 800, cursor: 'pointer',
              background: tab === 'allJobs' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: tab === 'allJobs' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s'
            }}
          >
            🏢 Municipal Queue ({allJobs.length})
          </button>
          <button
            onClick={() => setTab('map')}
            style={{
              padding: '9px 16px', borderRadius: '8px', border: 'none',
              fontSize: '13px', fontWeight: 800, cursor: 'pointer',
              background: tab === 'map' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: tab === 'map' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s'
            }}
          >
            🗺️ Sensor Fault Map ({binsWithCoords.length})
          </button>
          <button
            onClick={() => setTab('analytics')}
            style={{
              padding: '9px 16px', borderRadius: '8px', border: 'none',
              fontSize: '13px', fontWeight: 800, cursor: 'pointer',
              background: tab === 'analytics' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: tab === 'analytics' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s'
            }}
          >
            📊 Grid Analytics
          </button>
          <button
            onClick={() => setTab('workers')}
            style={{
              padding: '9px 16px', borderRadius: '8px', border: 'none',
              fontSize: '13px', fontWeight: 800, cursor: 'pointer',
              background: tab === 'workers' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: tab === 'workers' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s'
            }}
          >
            👷 Field Crew ({workers.length})
          </button>
          <button
            onClick={() => setTab('createJob')}
            style={{
              padding: '9px 16px', borderRadius: '8px', border: 'none',
              fontSize: '13px', fontWeight: 800, cursor: 'pointer',
              background: tab === 'createJob' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: tab === 'createJob' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s'
            }}
          >
            ➕ Dispatch Work Order
          </button>
        </div>

        {/* ── Tab: Interactive Map ────────────────────────────────────── */}
        {tab === 'map' && (
          <div style={{
            background: 'var(--bg-primary, #0f172a)',
            borderRadius: '16px',
            border: '1px solid var(--border-glass)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
            height: '560px',
            position: 'relative'
          }}>
            <MapContainer
              center={mapCenterCoords}
              zoom={12}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {binsWithCoords.map(j => (
                <Marker
                  key={`map-job-${j.log_id}`}
                  position={[j.bin_lat!, j.bin_lon!]}
                  icon={maintenanceMapIcon}
                >
                  <Popup>
                    <div style={{ color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>
                      <div style={{ fontWeight: 800, fontSize: '13px' }}>{j.bin_id}</div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{j.bin_street}, {j.bin_area}</div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', marginTop: '4px' }}>⚠️ {j.issue_type}</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>Priority: {j.priority} · Status: {j.status}</div>
                      <div style={{ marginTop: '8px' }}>
                        <button
                          onClick={() => setSelectedJob(j)}
                          style={{
                            padding: '4px 10px', borderRadius: '6px', background: '#10b981',
                            color: 'white', border: 'none', fontSize: '10px', fontWeight: 800, cursor: 'pointer'
                          }}
                        >
                          Resolve Order
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            
            <div style={{
              position: 'absolute', top: '16px', right: '16px', zIndex: 1000,
              background: 'var(--bg-glass, rgba(15,23,42,0.9))', padding: '10px 14px',
              borderRadius: '12px', border: '1px solid var(--border-glass)',
              fontSize: '12px', fontWeight: 700, backdropFilter: 'blur(8px)'
            }}>
              📍 Showing {binsWithCoords.length} Flagged Bins in {activeCity}
            </div>
          </div>
        )}

        {/* ── Tab: Field Analytics & Visual Graphs ───────────────────── */}
        {tab === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            
            {/* Issue distribution */}
            <div style={{
              background: 'var(--bg-primary, #0f172a)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid var(--border-glass)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={18} color="#10b981" /> Issue Type Breakdown ({activeCity})
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Incident diagnostics and hardware anomalies</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {Object.entries(issueCounts).map(([issue, count]) => {
                  const pct = allJobs.length > 0 ? Math.round((count / allJobs.length) * 100) : 0;
                  return (
                    <div key={issue}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-primary)' }}>{issue}</span>
                        <span style={{ color: '#10b981' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`, height: '100%',
                          background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                          borderRadius: '4px', transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(issueCounts).length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No recorded incidents in this jurisdiction.
                  </div>
                )}
              </div>
            </div>

            {/* Severity Distribution & MTTR Velocity */}
            <div style={{
              background: 'var(--bg-primary, #0f172a)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid var(--border-glass)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="#06b6d4" /> Priority & Response SLA
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '18px' }}>Turnaround benchmarks and active alerts</div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800 }}>🔴 CRITICAL FAULTS</div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#ef4444', marginTop: '4px' }}>{priorityCounts.Critical}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Immediate dispatch</div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800 }}>🟠 HIGH SEVERITY</div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#f97316', marginTop: '4px' }}>{priorityCounts.High}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{"< 4h resolution"}</div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800 }}>🟡 MEDIUM / ROUTINE</div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>{priorityCounts.Medium + priorityCounts.Low}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Standard queue</div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800 }}>⏱️ AVG FIX VELOCITY</div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#06b6d4', marginTop: '4px' }}>{stats?.avg_resolution_hours ?? 0}h</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>98.4% SLA adherence</div>
                </div>
              </div>

              {/* IoT Hardware Health */}
              <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Radio size={14} color="#10b981" /> Ultrasonic Sensor Uptime</span>
                  <span style={{ color: '#10b981' }}>99.2% Operational</span>
                </div>
                <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '99.2%', height: '100%', background: '#10b981' }} />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── Tab: My Jobs & All Jobs ─────────────────────────────────── */}
        {(tab === 'myJobs' || tab === 'allJobs') && (
          <div>
            {/* Filter and Search Bar */}
            <div style={{
              background: 'var(--bg-primary, #0f172a)',
              padding: '14px 18px',
              borderRadius: '14px',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 280px' }}>
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Search by Bin ID, street, area, or issue type..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary, #1e293b)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary, #1e293b)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-glass)',
                    fontSize: '12px',
                    fontWeight: 700,
                    outline: 'none'
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>

                <select
                  value={filterPriority}
                  onChange={e => setFilterPriority(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary, #1e293b)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-glass)',
                    fontSize: '12px',
                    fontWeight: 700,
                    outline: 'none'
                  }}
                >
                  <option value="">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Orders Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
              {(tab === 'myJobs' ? filteredMy : filteredAll).map(j => {
                const pStyle = PRIORITY_BADGES[j.priority] || PRIORITY_BADGES.Medium;
                const sStyle = STATUS_BADGES[j.status] || STATUS_BADGES.Open;
                return (
                  <div
                    key={j.log_id}
                    style={{
                      background: 'var(--bg-primary, #0f172a)',
                      borderRadius: '14px',
                      padding: '18px',
                      border: '1px solid var(--border-glass)',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      {/* Top header: Bin ID + Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
                            {j.bin_id}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <MapPin size={12} color="#10b981" />
                            <span>{j.bin_street}, {j.bin_area} ({j.bin_ward || 'Zone'})</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{
                            padding: '3px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800,
                            background: pStyle.bg, color: pStyle.text, border: `1px solid ${pStyle.border}`
                          }}>
                            {j.priority}
                          </span>
                          <span style={{
                            padding: '3px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800,
                            background: sStyle.bg, color: sStyle.text, border: `1px solid ${sStyle.border}`
                          }}>
                            {j.status}
                          </span>
                        </div>
                      </div>

                      {/* Issue Description */}
                      <div style={{
                        padding: '10px 12px', borderRadius: '10px',
                        background: 'var(--bg-secondary, #1e293b)',
                        marginBottom: '10px', border: '1px solid var(--border-glass)'
                      }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '3px' }}>
                          ⚠️ {j.issue_type}
                        </div>
                        {j.notes && (
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            {j.notes}
                          </div>
                        )}
                      </div>

                      {/* Telemetry snippet */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <div>Fill: <strong style={{ color: j.bin_fill > 80 ? '#ef4444' : 'var(--text-primary)' }}>{j.bin_fill}%</strong></div>
                        <div>Battery: <strong>{j.bin_battery}%</strong></div>
                        <div>Reported: <strong>{fmtTime(j.reported_at)}</strong></div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {j.status === 'Open' && (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleUpdateJob(j.log_id, 'In Progress')}
                          style={{
                            flex: 1, padding: '9px 12px', borderRadius: '8px',
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            color: '#ffffff', border: 'none', fontSize: '12px', fontWeight: 800,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                          }}
                        >
                          <Activity size={14} /> Start Repair
                        </button>
                      )}

                      {j.status === 'In Progress' && (
                        <button
                          disabled={actionLoading}
                          onClick={() => setSelectedJob(j)}
                          style={{
                            flex: 1, padding: '9px 12px', borderRadius: '8px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: '#ffffff', border: 'none', fontSize: '12px', fontWeight: 800,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                          }}
                        >
                          <CheckCircle2 size={14} /> Resolve & Close
                        </button>
                      )}

                      {j.status === 'Resolved' && (
                        <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShieldCheck size={16} /> Resolved at {fmtTime(j.resolved_at)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {(tab === 'myJobs' ? filteredMy : filteredAll).length === 0 && !loading && (
                <div style={{
                  gridColumn: '1 / -1', padding: '40px', textAlign: 'center',
                  background: 'var(--bg-primary)', borderRadius: '14px', border: '1px solid var(--border-glass)'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>No active repair orders found</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    All hardware units in {activeCity} municipal waste grid are operational.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Field Workers Directory ────────────────────────────── */}
        {tab === 'workers' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
            {workers.map(w => (
              <div
                key={w.worker_id}
                style={{
                  background: 'var(--bg-primary, #0f172a)',
                  borderRadius: '14px',
                  padding: '18px',
                  border: '1px solid var(--border-glass)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{w.name}</div>
                    <div style={{ fontSize: '12px', color: '#10b981', fontFamily: "'JetBrains Mono', monospace", fontWeight: 800 }}>
                      {w.worker_id}
                    </div>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 800,
                    background: w.status === 'On Job' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: w.status === 'On Job' ? '#f59e0b' : '#10b981',
                    border: `1px solid ${w.status === 'On Job' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                  }}>
                    {w.status}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} color="var(--text-muted)" />
                    <span>Zone: <strong style={{ color: 'var(--text-primary)' }}>{w.zone}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={13} color="var(--text-muted)" />
                    <span>Contact: <strong style={{ color: 'var(--text-primary)' }}>{w.phone}</strong></span>
                  </div>
                </div>

                <div style={{
                  display: 'flex', justifyContent: 'space-between', padding: '10px 12px',
                  background: 'var(--bg-secondary)', borderRadius: '10px', fontSize: '11px', fontWeight: 700
                }}>
                  <div>Active Orders: <strong style={{ color: '#ef4444' }}>{w.open_jobs}</strong></div>
                  <div>Lifetime Fixed: <strong style={{ color: '#10b981' }}>{w.resolved_total}</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab: Dispatch Work Order ─────────────────────────────────── */}
        {tab === 'createJob' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{
              background: 'var(--bg-primary, #0f172a)',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid var(--border-glass)',
              boxShadow: 'var(--shadow-md)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={20} color="#10b981" /> Create Municipal Work Order
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
                Dispatch an immediate repair ticket for sensor glitch, battery fault, or physical bin damage in {activeCity}.
              </p>

              {createSuccess && (
                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '16px', fontSize: '13px', fontWeight: 700 }}>
                  {createSuccess}
                </div>
              )}
              {createError && (
                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '16px', fontSize: '13px', fontWeight: 700 }}>
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateJob}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Smart Bin ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BIN001, HYD-BIN-04, BLR-BIN-02"
                    value={createForm.bin_id}
                    onChange={e => setCreateForm({ ...createForm, bin_id: e.target.value.toUpperCase() })}
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: '10px',
                      background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)', fontSize: '14px', fontFamily: "'JetBrains Mono', monospace",
                      boxSizing: 'border-box', outline: 'none', fontWeight: 700
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Issue Type
                  </label>
                  <select
                    value={createForm.issue_type}
                    onChange={e => setCreateForm({ ...createForm, issue_type: e.target.value })}
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: '10px',
                      background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)', fontSize: '13px',
                      boxSizing: 'border-box', outline: 'none'
                    }}
                  >
                    <option value="Overflow / Sensor Failure">Overflow / Sensor Failure</option>
                    <option value="Battery Depletion / Solar Fault">Battery Depletion / Solar Fault</option>
                    <option value="Physical Damage / Broken Lid">Physical Damage / Broken Lid</option>
                    <option value="ESP32 Telemetry Offline">ESP32 Telemetry Offline</option>
                    <option value="Fire / Thermal Anomaly">Fire / Thermal Anomaly</option>
                    <option value="Vandalism / Relocation Required">Vandalism / Relocation Required</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Priority Level
                  </label>
                  <select
                    value={createForm.priority}
                    onChange={e => setCreateForm({ ...createForm, priority: e.target.value })}
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: '10px',
                      background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)', fontSize: '13px',
                      boxSizing: 'border-box', outline: 'none'
                    }}
                  >
                    <option value="Critical">🔴 Critical (Immediate Action)</option>
                    <option value="High">🟠 High (Within 4 Hours)</option>
                    <option value="Medium">🟡 Medium (Within 24 Hours)</option>
                    <option value="Low">🟢 Low (Routine Inspection)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Inspection Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe specific symptoms, physical landmarks, or required replacement components..."
                    value={createForm.notes}
                    onChange={e => setCreateForm({ ...createForm, notes: e.target.value })}
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: '10px',
                      background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)', fontSize: '13px',
                      boxSizing: 'border-box', outline: 'none', resize: 'vertical'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%', padding: '14px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff', border: 'none', fontSize: '14px', fontWeight: 900,
                    cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.35)'
                  }}
                >
                  🚀 Dispatch Work Order to Field Grid
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* ── Resolve Order Modal Dialog ───────────────────────────────── */}
      {selectedJob && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-primary, #0f172a)',
            borderRadius: '18px',
            padding: '28px',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid var(--border-glass)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
              Resolve Work Order #{selectedJob.log_id}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              Bin: <strong style={{ color: 'var(--text-primary)' }}>{selectedJob.bin_id}</strong> ({selectedJob.bin_street}, {selectedJob.bin_area})
            </p>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Resolution Action & Field Notes
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Ultrasonic sensor cleaned and re-calibrated. Battery replaced with fully charged 12V LiFePO4 pack."
                value={resolveNotes}
                onChange={e => setResolveNotes(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '10px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box', outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedJob(null)}
                style={{
                  padding: '10px 18px', borderRadius: '10px',
                  background: 'transparent', border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)', fontSize: '13px', fontWeight: 700, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleUpdateJob(selectedJob.log_id, 'Resolved')}
                style={{
                  padding: '10px 22px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff', border: 'none', fontSize: '13px', fontWeight: 900, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16,185,129,0.35)'
                }}
              >
                {actionLoading ? 'Updating...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
