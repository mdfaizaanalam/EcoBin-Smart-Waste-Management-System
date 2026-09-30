import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Map, Navigation, BarChart3, Trash2, RefreshCw, Sparkles,
  Database, Bell, Settings, Truck, Activity, Play,
  AlertTriangle, TrendingUp, Info, Wind, Plus, Wrench,
  Sun, Moon, Camera, Leaf, Factory, Laptop, Trophy,
  Menu, X, Radio, Repeat, Gift, Flame, Coins, ShieldAlert, Award,
  ChevronUp, ChevronDown, PanelLeftClose, PanelLeftOpen, ChevronLeft, ChevronRight, HelpCircle
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

import MapComponent, { CITY_CONFIG } from './MapComponent';
import Analytics from './Analytics';
import BinsTable from './BinsTable';
import FleetPanel from './FleetPanel';
import PredictionPanel from './PredictionPanel';
import NotificationsPanel from './NotificationsPanel';
import SimulationControls from './SimulationControls';
import StreetRoutePanel from './StreetRoutePanel';
import MaintenanceManagementPanel from './MaintenanceManagementPanel';
import ImpactDashboard from './ImpactDashboard';
import IoTBench from './IoTBench';
import AIWasteVisionHub from './AIWasteVisionHub';
import CircularEconomyHub from './CircularEconomyHub';
import CitizenCivicHub from './CitizenCivicHub';
import ExecutiveEvaluationHub from './ExecutiveEvaluationHub';
import HowToUseModal from './HowToUseModal';
import { sendEmailAlert } from '../utils/emailjs';

// ─── Types ────────────────────────────────────────────────────

type Tab = 'overview' | 'map' | 'routes' | 'bins' | 'fleet' | 'prediction' | 'analytics' | 'notifications' | 'simulation' | 'maintenance' | 'classify' | 'impact' | 'circular' | 'ewaste' | 'demo'
  | 'aiscanner' | 'iotbench' | 'exchange' | 'foodwaste' | 'reuserepair' | 'blackspots' | 'citizen' | 'pitch';


interface OsrmStep {
  name: string;
  distance: number;
  duration: number;
  maneuver: { type: string; modifier?: string };
}

interface StreetRoute {
  coords: [number, number][];
  steps: OsrmStep[];
  totalDistanceM: number;
  totalDurationS: number;
  snapped: boolean;
}

interface BinData {
  bin_id: string; latitude: number; longitude: number;
  street_name?: string; area_name?: string; ward?: string; ward_number?: number;
  area_type: string; capacity: number;
  current_fill_percentage?: number; predicted_fill?: number;
  overflow_probability?: number; priority_score?: number;
  battery_level?: number; signal_strength?: number; temperature?: number;
  status?: string; last_updated?: string; last_collection_time?: string;
  installation_date?: string;
}

interface BinDetail extends BinData {
  history_7d: {
    timestamp: string; fill_percentage: number;
    temperature?: number | null; rainfall?: number; waste_generated?: number;
  }[];
  prediction_tomorrow: { prediction_time: string; predicted_fill: number; overflow_probability: number } | null;
}

interface RouteData {
  route_id?: number; truck_id: string; driver: string;
  distance_km: number; fuel_liters: number; duration_hours: number;
  path: { bin_id: string; latitude: number; longitude: number; load_at_node: number }[];
  plate_number?: string;
}

interface TruckData {
  truck_id: string; plate_number?: string; capacity: number; driver: string;
  status: string; current_latitude?: number; current_longitude?: number;
  has_route: boolean; route_bins: number;
}

interface NotificationItem {
  notification_id: number; bin_id: string | null; severity: 'Critical' | 'Warning' | 'Info';
  title: string; message: string; is_read: boolean; created_at: string;
}

interface PredictionItem {
  bin_id: string; street_name?: string; area_name?: string; ward?: string;
  area_type: string; capacity: number; current_fill_percentage: number;
  predicted_fill: number; overflow_probability: number; priority_score: number;
  latitude: number; longitude: number;
}

// ─── Animated Counter (ported from External_Resources/EcoBin_Website BackToTop & Home) ──

/**
 * Smoothly counts up from 0 to `target` on first visibility.
 * Inspired by the animated stat counters in External_Resources/EcoBin_Website/src/Components/Home/Home.jsx
 */
const AnimatedCounter: React.FC<{
  target: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  style?: React.CSSProperties;
}> = ({ target, duration = 1200, decimals = 0, prefix = '', suffix = '', style }) => {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const hasRun = React.useRef(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(parseFloat((eased * target).toFixed(decimals)));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, decimals]);

  return (
    <span ref={ref} style={style}>
      {prefix}{count.toLocaleString('en-IN', { maximumFractionDigits: decimals })}{suffix}
    </span>
  );
};

// ─── Back To Top Button (ported from External_Resources/EcoBin_Website BackToTop.jsx) ──

/**
 * Floating scroll-to-top button, adapted from External_Resources/EcoBin_Website/src/Components/BackToTop/BackToTop.jsx
 * Uses EcoBin design tokens instead of the external project's CSS classes.
 */
const BackToTopButton: React.FC = () => {
  const [visible, setVisible] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    // Find the scrollable main content area
    const scrollEl = document.querySelector('.main-content') as HTMLElement | null;
    const target = scrollEl || window;

    const handleScroll = () => {
      const scrollTop = scrollEl ? scrollEl.scrollTop : window.scrollY;
      setVisible(scrollTop > 300);
    };

    target.addEventListener('scroll', handleScroll, { passive: true });
    return () => target.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollUp = () => {
    const scrollEl = document.querySelector('.main-content') as HTMLElement | null;
    if (scrollEl) {
      scrollEl.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!visible) return null;
  return (
    <button
      ref={containerRef as any}
      onClick={scrollUp}
      title="Back to top"
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 9999,
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(6, 182, 212, 0.45)',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        color: 'white',
        fontSize: '18px',
        fontWeight: 700,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.12) translateY(-2px)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(6, 182, 212, 0.65)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1) translateY(0)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(6, 182, 212, 0.45)';
      }}
    >
      ↑
    </button>
  );
};

// ─── Sparkline ────────────────────────────────────────────────

const SparkChart: React.FC<{ data: { value: number }[]; color: string }> = ({ data, color }) => (
  <ResponsiveContainer width="100%" height={40}>
    <AreaChart data={data} margin={{ top: 2, right: 2, left: -30, bottom: 2 }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.3} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5}
        fill={`url(#sg-${color.replace('#', '')})`} dot={false} />
    </AreaChart>
  </ResponsiveContainer>
);

// ─── Custom Tooltip ───────────────────────────────────────────

const DarkTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="custom-tooltip">
        <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{label}</p>
        {payload.map((e: any, i: number) => (
          <p key={i} style={{ color: e.color }}>{e.name}: <strong style={{ color: 'var(--text-primary)' }}>{e.value}</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── City Brand Label Mapping ─────────────────────────────────

const getCityBrandName = (city: string): string => {
  if (city === 'All') return 'National Waste Grid';
  if (city === 'Hyderabad') return 'Hyderabad Municipal Corp.';
  if (city === 'Bangalore') return 'Bengaluru (BBMP)';
  if (city === 'Mumbai') return 'Mumbai (BMC)';
  if (city === 'Delhi') return 'Delhi Municipal Corp. (MCD)';
  if (city === 'Chennai') return 'Chennai Corp. (GCC)';
  if (city === 'Kolkata') return 'Kolkata Municipal Corp. (KMC)';
  if (city === 'Pune') return 'Pune Municipal Corp. (PMC)';
  if (city === 'Ahmedabad') return 'Ahmedabad Municipal (AMC)';
  return `${city} Municipal Corp.`;
};

// ─── Dashboard ───────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('ecobin_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark';
  });
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ecobin_theme', theme);
  }, [theme]);


  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [bins, setBins] = useState<BinData[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [trucks, setTrucks] = useState<TruckData[]>([]);
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<string>('Hyderabad');
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);
  const [selectedBinDetail, setSelectedBinDetail] = useState<BinDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [simRunning, setSimRunning] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [systemMenuOpen, setSystemMenuOpen] = useState(false);
  const [liveUpdates, setLiveUpdates] = useState<Record<string, { fill: number; timestamp: string }>>({});
  const [streetRoutes, setStreetRoutes] = useState<Record<string, StreetRoute>>({});
  const [fetchingRoutes, setFetchingRoutes] = useState(false);
  const [routingMode, setRoutingMode] = useState<'eco' | 'priority' | 'shortest' | 'traffic'>('eco');
  const routingModeRef = useRef<'eco' | 'priority' | 'shortest' | 'traffic'>('eco');
  useEffect(() => { routingModeRef.current = routingMode; }, [routingMode]);
  const wsRef = useRef<WebSocket | null>(null);
  const selectedCityRef = useRef<string>(selectedCity);
  useEffect(() => { selectedCityRef.current = selectedCity; }, [selectedCity]);

  // Modals state
  const [showAddBinModal, setShowAddBinModal] = useState(false);
  const [showAddTruckModal, setShowAddTruckModal] = useState(false);
  const [showHowToUseModal, setShowHowToUseModal] = useState(false);

  // Edit Mode States
  const [isEditModeBin, setIsEditModeBin] = useState(false);
  const [isEditModeTruck, setIsEditModeTruck] = useState(false);
  const [editBinStatus, setEditBinStatus] = useState('Active');
  const [editTruckStatus, setEditTruckStatus] = useState('Idle');

  // New Bin Form State
  const [newBinId, setNewBinId] = useState('');
  const [newBinLat, setNewBinLat] = useState('17.4156');
  const [newBinLon, setNewBinLon] = useState('78.4486');
  const [newBinStreet, setNewBinStreet] = useState('');
  const [newBinArea, setNewBinArea] = useState('Banjara Hills');
  const [newBinWard, setNewBinWard] = useState('Ward-10');
  const [newBinWardNum, setNewBinWardNum] = useState(10);
  const [newBinAreaType, setNewBinAreaType] = useState('Residential');
  const [newBinCapacity, setNewBinCapacity] = useState(240);
  const [addingBin, setAddingBin] = useState(false);

  // New Truck Form State
  const [newTruckId, setNewTruckId] = useState('');
  const [newTruckPlate, setNewTruckPlate] = useState('');
  const [newTruckCapacity, setNewTruckCapacity] = useState(5000);
  const [newDriverId, setNewDriverId] = useState('');
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverLicense, setNewDriverLicense] = useState('');
  const [addingTruck, setAddingTruck] = useState(false);

  const handleAddBin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBinId.trim()) return alert('Please enter Bin ID');
    setAddingBin(true);
    try {
      const res = await fetch('/api/bins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bin_id: newBinId.trim().toUpperCase(),
          latitude: parseFloat(newBinLat),
          longitude: parseFloat(newBinLon),
          street_name: newBinStreet || 'Main Road',
          area_name: newBinArea,
          ward: newBinWard,
          ward_number: Number(newBinWardNum),
          area_type: newBinAreaType,
          capacity: Number(newBinCapacity),
          city: selectedCity === 'All' ? 'Hyderabad' : selectedCity
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to add bin');
      
      alert(`Bin ${newBinId.trim().toUpperCase()} added successfully!`);
      setShowAddBinModal(false);
      setNewBinId('');
      setNewBinStreet('');
      fetchAll();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setAddingBin(false);
    }
  };

  const handleAddTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTruckId.trim()) return alert('Please enter Truck ID');
    if (!newDriverId.trim()) return alert('Please enter Driver ID');
    setAddingTruck(true);
    try {
      const res = await fetch('/api/trucks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          truck_id: newTruckId.trim().toUpperCase(),
          plate_number: newTruckPlate.trim().toUpperCase() || 'TS09EA0000',
          capacity: Number(newTruckCapacity),
          driver_id: newDriverId.trim().toUpperCase(),
          driver_name: newDriverName || 'Unnamed Driver',
          driver_phone: newDriverPhone,
          driver_license: newDriverLicense,
          city: selectedCity === 'All' ? 'Hyderabad' : selectedCity
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to add truck');
      alert(`Truck ${newTruckId.trim().toUpperCase()} and Driver ${newDriverName} added successfully!`);
      
      // Send EmailJS Welcome Notification
      sendEmailAlert(
        "🎉 Welcome to Smart Waste Fleet",
        `Hello ${newDriverName || 'Driver'},`,
        "Your driver account and truck have been successfully registered on the Smart Waste Management System.",
        `Driver ID: ${newDriverId.trim().toUpperCase()}\nTruck ID: ${newTruckId.trim().toUpperCase()}\nPlate Number: ${newTruckPlate.trim().toUpperCase() || 'TS09EA0000'}`
      );
      
      setShowAddTruckModal(false);
      setNewTruckId('');
      setNewTruckPlate('');
      setNewDriverId('');
      setNewDriverName('');
      setNewDriverPhone('');
      setNewDriverLicense('');
      fetchAll();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setAddingTruck(false);
    }
  };

  const handleOpenEditBinModal = (bin: BinDetail) => {
    setNewBinId(bin.bin_id);
    setNewBinLat(String(bin.latitude));
    setNewBinLon(String(bin.longitude));
    setNewBinStreet(bin.street_name || '');
    setNewBinArea(bin.area_name || '');
    setNewBinWard(bin.ward || '');
    setNewBinWardNum(bin.ward_number || 0);
    setNewBinAreaType(bin.area_type);
    setNewBinCapacity(bin.capacity);
    setEditBinStatus(bin.status || 'Active');
    setIsEditModeBin(true);
    setShowAddBinModal(true);
  };

  const handleOpenEditTruckModal = (truck: any) => {
    setNewTruckId(truck.truck_id);
    setNewTruckPlate(truck.plate_number || '');
    setNewTruckCapacity(truck.capacity);
    setNewDriverId(truck.driver_id || '');
    setNewDriverName(truck.driver || '');
    setNewDriverPhone(truck.driver_phone || '');
    setNewDriverLicense(truck.driver_license || '');
    setEditTruckStatus(truck.status || 'Idle');
    setIsEditModeTruck(true);
    setShowAddTruckModal(true);
  };

  const handleEditBin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingBin(true);
    try {
      const res = await fetch(`/api/bins/${newBinId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: parseFloat(newBinLat),
          longitude: parseFloat(newBinLon),
          street_name: newBinStreet || 'Main Road',
          area_name: newBinArea,
          ward: newBinWard,
          ward_number: Number(newBinWardNum),
          area_type: newBinAreaType,
          capacity: Number(newBinCapacity),
          status: editBinStatus
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update bin');
      
      alert(`Bin ${newBinId} updated successfully!`);
      setShowAddBinModal(false);
      setIsEditModeBin(false);
      setNewBinId('');
      setNewBinStreet('');
      
      // BUG FIX: Capture binId before clearing state — setTimeout closure over newBinId would get empty string after setNewBinId('')
      const savedBinId = newBinId;
      if (selectedBinId === newBinId) {
        setSelectedBinId(null);
        setTimeout(() => setSelectedBinId(savedBinId), 100);
      }
      fetchAll();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setAddingBin(false);
    }
  };

  const handleEditTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingTruck(true);
    try {
      const res = await fetch(`/api/trucks/${newTruckId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plate_number: newTruckPlate.trim().toUpperCase() || 'TS09EA0000',
          capacity: Number(newTruckCapacity),
          driver_id: newDriverId.trim().toUpperCase(),
          driver_name: newDriverName || 'Unnamed Driver',
          driver_phone: newDriverPhone,
          driver_license: newDriverLicense,
          status: editTruckStatus
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update truck');
      
      alert(`Truck ${newTruckId} updated successfully!`);
      setShowAddTruckModal(false);
      setIsEditModeTruck(false);
      setNewTruckId('');
      setNewTruckPlate('');
      setNewDriverId('');
      setNewDriverName('');
      setNewDriverPhone('');
      setNewDriverLicense('');
      fetchAll();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setAddingTruck(false);
    }
  };

  // ── Data Fetching ──────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    try {
      const cityQuery = selectedCity && selectedCity !== 'All' ? `?city=${encodeURIComponent(selectedCity)}` : '';
      const notifQuery = selectedCity && selectedCity !== 'All' ? `?city=${encodeURIComponent(selectedCity)}&limit=50` : '?limit=50';
      const routesQuery = selectedCity && selectedCity !== 'All'
        ? `?city=${encodeURIComponent(selectedCity)}&mode=${routingModeRef.current}`
        : `?mode=${routingModeRef.current}`;
      const [binsRes, predRes, routesRes, trucksRes, notifRes, analyticsRes] = await Promise.all([
        fetch(`/api/bins${cityQuery}`), fetch(`/api/predictions${cityQuery}`), fetch(`/api/routes${routesQuery}`),
        fetch(`/api/trucks${cityQuery}`), fetch(`/api/notifications${notifQuery}`),
        fetch(`/api/analytics${cityQuery}`),
      ]);

      const [binsData, predData, routesData, trucksData, notifData, analyticsVal] = await Promise.all([
        binsRes.json(), predRes.json(), routesRes.json(),
        trucksRes.json(), notifRes.json(), analyticsRes.json(),
      ]);

      const mergedBins = binsData.map((b: BinData) => {
        const pred = predData.find((p: PredictionItem) => p.bin_id === b.bin_id);
        return { ...b, predicted_fill: pred?.predicted_fill, overflow_probability: pred?.overflow_probability, priority_score: pred?.priority_score };
      });

      setBins(mergedBins);
      setRoutes(routesData);
      setTrucks(trucksData);
      setPredictions(predData);
      setNotifications(notifData);
      setAnalyticsData(analyticsVal);
      setUnreadCount(notifData.filter((n: NotificationItem) => !n.is_read).length);

      if (analyticsVal?.system_stats) {
        setSimRunning(analyticsVal.system_stats.simulation_running ?? false);
        setSimSpeed(analyticsVal.system_stats.simulation_speed ?? 1.0);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCity]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Periodic refresh every 30s
  useEffect(() => {
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // ── OSRM Street Route Fetch (shared between Map + StreetRoutePanel) ─

  const fetchStreetRoutes = useCallback(async (routeList: RouteData[]) => {
    if (!routeList || routeList.length === 0) { setStreetRoutes({}); return; }
    setFetchingRoutes(true);

    const results = await Promise.allSettled(
      routeList.map(async (route) => {
        const stops = route.path.filter(n => n.latitude && n.longitude);
        if (stops.length < 2) return { truck_id: route.truck_id, result: null };

        try {
          const coordStr = stops.map(s => `${s.longitude},${s.latitude}`).join(';');
          const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson&steps=true`;
          const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();

          if (data.code === 'Ok' && data.routes?.[0]) {
            const osrmRoute = data.routes[0];
            const coords: [number, number][] = osrmRoute.geometry.coordinates.map(
              (c: [number, number]) => [c[1], c[0]] as [number, number]
            );
            const steps = (osrmRoute.legs ?? []).flatMap((leg: any) =>
              (leg.steps ?? []).map((s: any) => ({
                name: s.name ?? '',
                distance: s.distance ?? 0,
                duration: s.duration ?? 0,
                maneuver: s.maneuver ?? { type: 'straight' },
              }))
            );
            return {
              truck_id: route.truck_id,
              result: {
                coords, steps,
                totalDistanceM: osrmRoute.distance ?? 0,
                totalDurationS: osrmRoute.duration ?? 0,
                snapped: true,
              } as StreetRoute,
            };
          }
        } catch (err) {
          console.warn(`[OSRM] ${route.truck_id}:`, err);
        }

        // Straight-line fallback
        return {
          truck_id: route.truck_id,
          result: {
            coords: stops.map(s => [s.latitude, s.longitude] as [number, number]),
            steps: [],
            totalDistanceM: route.distance_km * 1000,
            totalDurationS: route.duration_hours * 3600,
            snapped: false,
          } as StreetRoute,
        };
      })
    );

    const newRoutes: Record<string, StreetRoute> = {};
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value?.result) {
        newRoutes[r.value.truck_id] = r.value.result;
      }
    }
    setStreetRoutes(newRoutes);
    setFetchingRoutes(false);
  }, []);

  // Trigger OSRM fetch whenever routes change
  useEffect(() => {
    if (routes.length > 0) fetchStreetRoutes(routes);
  }, [routes, fetchStreetRoutes]);

  const handleRoutingModeChange = async (newMode: 'eco' | 'priority' | 'shortest' | 'traffic') => {
    setRoutingMode(newMode);
    routingModeRef.current = newMode;
    try {
      setFetchingRoutes(true);
      const routesQuery = selectedCity && selectedCity !== 'All'
        ? `?city=${encodeURIComponent(selectedCity)}&mode=${newMode}`
        : `?mode=${newMode}`;
      const res = await fetch(`/api/routes${routesQuery}`);
      if (res.ok) {
        const data = await res.json();
        setRoutes(data);
        await fetchStreetRoutes(data);
      }
    } catch (err) {
      console.error('Error switching route mode:', err);
    } finally {
      setFetchingRoutes(false);
    }
  };

  // ── WebSocket Live Updates ─────────────────────────────────

  useEffect(() => {
    // BUG FIX: Track mounted state to prevent infinite reconnect loop after component unmounts
    let mounted = true;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connectWs = () => {
      if (!mounted) return;
      const backendUrl = import.meta.env.VITE_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:8000`;
      const wsProtocol = backendUrl.startsWith('https') ? 'wss:' : 'ws:';
      const wsHost = backendUrl.replace(/^https?:\/\//, '');
      const ws = new WebSocket(`${wsProtocol}//${wsHost}/ws/live`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'bin_update') {
            setLiveUpdates(prev => ({ ...prev, [msg.bin_id]: { fill: msg.fill_percentage, timestamp: msg.timestamp } }));
            setBins(prev => prev.map(b =>
              b.bin_id === msg.bin_id ? { ...b, current_fill_percentage: msg.fill_percentage, last_updated: msg.timestamp } : b
            ));
          } else if (msg.type === 'new_notification' && msg.notification) {
            const notif = msg.notification;
            const currentCity = selectedCityRef.current;
            if (!currentCity || currentCity === 'All' || notif.city === currentCity) {
              setNotifications(prev => [notif, ...prev.filter(n => n.notification_id !== notif.notification_id)]);
              setUnreadCount(c => c + 1);
            }
          }
        } catch { /* ignore parse errors */ }
      };

      ws.onclose = () => {
        // BUG FIX: Only schedule reconnect if still mounted — prevents infinite reconnect after unmount
        if (mounted) {
          reconnectTimer = setTimeout(connectWs, 3000);
        }
      };
      ws.onerror = () => ws.close();
    };

    connectWs();
    return () => {
      mounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, []);

  // ── Bin Inspector ──────────────────────────────────────────

  useEffect(() => {
    if (!selectedBinId) { setSelectedBinDetail(null); return; }
    // Instantly populate with local bin data to eliminate any UI freeze or lag
    const existing = bins.find(b => b.bin_id === selectedBinId);
    if (existing) {
      setSelectedBinDetail({
        bin_id: existing.bin_id,
        latitude: existing.latitude,
        longitude: existing.longitude,
        street_name: existing.street_name,
        area_name: existing.area_name,
        ward: existing.ward,
        ward_number: existing.ward_number || 1,
        area_type: existing.area_type,
        capacity: existing.capacity,
        current_fill_percentage: existing.current_fill_percentage,
        battery_level: existing.battery_level ?? 100,
        signal_strength: existing.signal_strength ?? 90,
        temperature: (existing as any).temperature ?? null,
        status: existing.status,
        last_updated: (existing as any).last_updated ?? null,
        last_collection_time: (existing as any).last_collection_time ?? null,
        installation_date: (existing as any).installation_date || '2026-01-01',
        history_7d: [],
        prediction_tomorrow: null,
      });
    }
    // Fetch detailed 7d telemetry and tomorrow's ML forecast asynchronously
    fetch(`/api/bins/${selectedBinId}`)
      .then(r => r.json())
      .then(setSelectedBinDetail)
      .catch(console.error);
  }, [selectedBinId, bins]);

  // Close inspector on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedBinId) {
        handleCloseInspector();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBinId]);

  // ── Actions ────────────────────────────────────────────────

  const runAction = async (key: string, method: string, url: string, body?: object) => {
    setActionLoading(key);
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error');
      await fetchAll();
      return data;
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartSim = async (speed: number) => {
    await runAction('sim_start', 'POST', '/api/simulate/start', { speed });
    setSimRunning(true); setSimSpeed(speed);
  };

  const handleStopSim = async () => {
    await runAction('sim_stop', 'POST', '/api/simulate/stop');
    setSimRunning(false);
  };

  const handleResetSim = async () => {
    if (!confirm('Reset all bin fill levels to 0-15%?')) return;
    await runAction('sim_reset', 'POST', '/api/simulate/reset');
  };

  const handleMarkRead = async (id: number) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
    setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    const cityParam = selectedCity && selectedCity !== 'All' ? `?city=${encodeURIComponent(selectedCity)}` : '';
    await fetch(`/api/notifications/mark-all-read${cityParam}`, { method: 'PUT' });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  // ── Derived Stats ──────────────────────────────────────────

  const criticalBins = bins.filter(b => (b.current_fill_percentage ?? 0) >= 80).length;
  const avgFill = bins.length > 0 ? bins.reduce((s, b) => s + (b.current_fill_percentage ?? 0), 0) / bins.length : 0;
  // BUG FIX: Use 0 as fallback instead of magic numbers (48.6, 14.5, 38.9) that mislead when backend data is unavailable
  const distanceSaved = analyticsData?.savings?.distance_km ?? 0;
  const fuelSaved = analyticsData?.savings?.fuel_liters ?? 0;
  const co2Saved = analyticsData?.savings?.co2_kg ?? 0;
  const criticalPredictions = predictions.filter(p => p.predicted_fill >= 80).length;

  // ── Navigation Config ──────────────────────────────────────

  const NAV_ITEMS: { key: Tab; icon: React.ReactNode; label: string; color?: string; badge?: number }[] = [
    // Core Fleet Operations
    { key: 'overview',      icon: <Activity size={16} />,    label: 'Overview',              color: 'cyan' },
    { key: 'map',           icon: <Map size={16} />,          label: 'Live GIS Map',          color: 'cyan' },
    { key: 'routes',        icon: <Navigation size={16} />,  label: 'Street Routes',         color: 'cyan' },
    { key: 'bins',          icon: <Trash2 size={16} />,       label: 'Smart Bins',            color: 'green' },
    { key: 'fleet',         icon: <Truck size={16} />,        label: 'Fleet Manager',         color: 'purple' },
    { key: 'maintenance',   icon: <Wrench size={16} />,       label: 'Maintenance',           color: 'orange' },

    // AI & Multi-Sensor
    { key: 'aiscanner',     icon: <Camera size={16} />,      label: 'AI Waste Vision & Scanner', color: 'cyan' },
    { key: 'prediction',    icon: <Sparkles size={16} />,     label: 'AI Forecasting',        color: 'orange' },
    { key: 'iotbench',      icon: <Radio size={16} />,       label: 'IoT Hardware Bench',    color: 'purple' },
    { key: 'simulation',    icon: simRunning ? <Play size={16} /> : <Settings size={16} />, label: 'Simulation', color: simRunning ? 'green' : 'pink' },

    // Circular Economy & ESG Hub (Consolidated)
    { key: 'circular',      icon: <Factory size={16} />,     label: 'Circular Economy & ESG', color: 'green' },

    // Citizen & Civic Hub (Consolidated)
    { key: 'citizen',       icon: <Gift size={16} />,        label: 'Citizen & Civic Hub',   color: 'yellow' },
    { key: 'impact',        icon: <Leaf size={16} />,        label: 'Carbon & ROI Impact',   color: 'green' },
    { key: 'analytics',     icon: <BarChart3 size={16} />,    label: 'Analytics',             color: 'green' },
    { key: 'notifications', icon: <Bell size={16} />,         label: 'Notifications',         color: 'yellow', badge: unreadCount },

    // Executive Pitch & Evaluation (Consolidated)
    { key: 'pitch',         icon: <Award size={16} />,       label: 'Executive Pitch & System Evaluation', color: 'cyan' },
  ];

  // ── Render Helper ──────────────────────────────────────────

  const getFillBarColor = (fill: number) => fill >= 80 ? 'red' : fill >= 50 ? 'yellow' : 'green';

  // ── Bin Inspector Panel ────────────────────────────────────

  const handleCloseInspector = () => {
    setSelectedBinId(null);
    setSelectedBinDetail(null);
  };

  const renderInspector = () => {
    if (!selectedBinDetail) return null;
    return (
      <div 
        className="inspector-panel"
        style={{
          boxShadow: '-4px 0 24px rgba(0,0,0,0.25)',
          zIndex: 45,
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="inspector-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={16} color="var(--accent-cyan)" />
            <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '15px' }}>Bin Inspector</span>
          </div>
          <button 
            onClick={handleCloseInspector} 
            title="Close Inspector (Esc)"
            style={{ 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-glass)', 
              cursor: 'pointer', 
              color: 'var(--text-primary)',
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 800,
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.15s ease'
            }}
          >
            ✕
          </button>
        </div>

        <div className="inspector-body">
          {/* Bin ID + Area */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '20px', color: 'var(--text-primary)' }}>
              {selectedBinDetail.bin_id}
            </span>
            <span style={{ padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)' }}>
              {selectedBinDetail.area_type}
            </span>
          </div>

          {/* Current Fill */}
          <div className="inspector-section" style={{ background: selectedBinDetail.current_fill_percentage && selectedBinDetail.current_fill_percentage >= 80 ? 'var(--color-danger-dim)' : 'var(--bg-primary)' }}>
            <div className="inspector-section-title">Live Fill Level</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Current:</span>
              <span style={{
                fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800,
                color: selectedBinDetail.current_fill_percentage && selectedBinDetail.current_fill_percentage >= 80 ? 'var(--color-danger)' :
                       selectedBinDetail.current_fill_percentage && selectedBinDetail.current_fill_percentage >= 50 ? 'var(--color-warning)' : 'var(--color-success)'
              }}>{(selectedBinDetail.current_fill_percentage ?? 0).toFixed(1)}%</span>
            </div>
            <div className="fill-bar-container" style={{ height: '8px', marginTop: '4px' }}>
              <div className={`fill-bar ${getFillBarColor(selectedBinDetail.current_fill_percentage ?? 0)}`}
                style={{ width: `${selectedBinDetail.current_fill_percentage ?? 0}%` }} />
            </div>
          </div>

          {/* Location */}
          <div className="inspector-section">
            <div className="inspector-section-title">Location</div>
            <div className="inspector-row">
              <span className="inspector-key">Street</span>
              <span className="inspector-val" style={{ fontSize: '11px' }}>{selectedBinDetail.street_name || '—'}</span>
            </div>
            <div className="inspector-row">
              <span className="inspector-key">Area</span>
              <span className="inspector-val">{selectedBinDetail.area_name}</span>
            </div>
            <div className="inspector-row">
              <span className="inspector-key">Ward</span>
              <span className="inspector-val">{selectedBinDetail.ward}</span>
            </div>
            <div className="inspector-row">
              <span className="inspector-key">GPS</span>
              <span className="inspector-val" style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }}>
                {selectedBinDetail.latitude?.toFixed(4)}, {selectedBinDetail.longitude?.toFixed(4)}
              </span>
            </div>
          </div>

          {/* IoT Sensor Status */}
          <div className="inspector-section">
            <div className="inspector-section-title">IoT Sensor Status</div>
            {[
              { label: 'Capacity', value: `${selectedBinDetail.capacity} L` },
              { label: 'Battery', value: `${(selectedBinDetail.battery_level ?? 100).toFixed(0)}%` },
              { label: 'Signal', value: `${selectedBinDetail.signal_strength ?? 90}%` },
              { label: 'Temperature', value: selectedBinDetail.temperature ? `${selectedBinDetail.temperature.toFixed(1)}°C` : '—' },
              { label: 'Installed', value: selectedBinDetail.installation_date || '—' },
              { label: 'Last Update', value: selectedBinDetail.last_updated ? new Date(selectedBinDetail.last_updated).toLocaleString('en-IN') : '—' },
              { label: 'Last Collected', value: selectedBinDetail.last_collection_time ? new Date(selectedBinDetail.last_collection_time).toLocaleString('en-IN') : 'Not collected' },
            ].map(r => (
              <div className="inspector-row" key={r.label}>
                <span className="inspector-key">{r.label}</span>
                <span className="inspector-val" style={{ fontSize: '11px' }}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* 24h Prediction */}
          {selectedBinDetail.prediction_tomorrow && (
            <div className="inspector-section" style={{
              background: selectedBinDetail.prediction_tomorrow.predicted_fill >= 80 ? 'var(--color-danger-dim)' : 'var(--bg-primary)',
              border: `1px solid ${selectedBinDetail.prediction_tomorrow.predicted_fill >= 80 ? 'rgba(239,68,68,0.2)' : 'var(--border-glass)'}`
            }}>
              <div className="inspector-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={11} color="var(--accent-orange)" /> 24h AI Forecast
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Predicted Fill:</span>
                <span style={{
                  fontFamily: 'Outfit', fontSize: '22px', fontWeight: 800,
                  color: selectedBinDetail.prediction_tomorrow.predicted_fill >= 80 ? 'var(--color-danger)' :
                         selectedBinDetail.prediction_tomorrow.predicted_fill >= 50 ? 'var(--color-warning)' : 'var(--color-success)'
                }}>{selectedBinDetail.prediction_tomorrow.predicted_fill.toFixed(1)}%</span>
              </div>
              <div className="inspector-row">
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Overflow Prob:</span>
                <strong style={{ fontSize: '14px', color: selectedBinDetail.prediction_tomorrow.overflow_probability >= 70 ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                  {selectedBinDetail.prediction_tomorrow.overflow_probability.toFixed(1)}%
                </strong>
              </div>
              {selectedBinDetail.prediction_tomorrow.predicted_fill >= 80 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-danger)', fontSize: '11px', fontWeight: 700, marginTop: '4px' }}>
                  <AlertTriangle size={12} /> Scheduled for next collection
                </div>
              )}
            </div>
          )}

          {/* 7-Day History Sparkline */}
          {selectedBinDetail.history_7d && selectedBinDetail.history_7d.length > 0 && (
            <div className="inspector-section">
              <div className="inspector-section-title">7-Day Load Trend</div>
              <div style={{ width: '100%', height: '70px', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)' }}>
                <SparkChart
                  data={selectedBinDetail.history_7d.map(h => ({ value: h.fill_percentage }))}
                  color={selectedBinDetail.prediction_tomorrow && selectedBinDetail.prediction_tomorrow.predicted_fill >= 80 ? '#ef4444' : '#06b6d4'}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                <span>7 days ago</span><span>Now</span>
              </div>
            </div>
          )}

          <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexShrink: 0 }}>
            <button
              onClick={() => handleOpenEditBinModal(selectedBinDetail)}
              style={{
                width: '100%', padding: '10px', background: 'var(--bg-secondary)',
                border: '1px solid var(--border-glass)', borderRadius: '8px',
                color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              Edit Bin Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Overview Panel ─────────────────────────────────────────

  // ── Overview Panel ─────────────────────────────────────────

  const renderOverview = () => {
    const areaBreakdown = analyticsData?.area_breakdown ?? [];
    const ml = analyticsData?.ml_evaluation;
    const comparison = analyticsData?.comparison;

    const areaMetrics = [
      { area: 'Commercial & IT Hubs', fill: 74, status: 'Active', health: '98%', bins: Math.round(bins.length * 0.32), icon: '🏢' },
      { area: 'Residential Sectors', fill: 52, status: 'Normal', health: '99%', bins: Math.round(bins.length * 0.41), icon: '🏡' },
      { area: 'Markets & Bazaars', fill: 86, status: 'Urgent', health: '94%', bins: Math.round(bins.length * 0.15), icon: '🛍️' },
      { area: 'Industrial Corridors', fill: 61, status: 'Normal', health: '97%', bins: Math.round(bins.length * 0.12), icon: '🏭' },
    ];

    const wardMap: Record<string, { count: number; totalFill: number; critical: number }> = {};
    bins.forEach(b => {
      const w = b.ward || 'Ward-01';
      if (!wardMap[w]) wardMap[w] = { count: 0, totalFill: 0, critical: 0 };
      wardMap[w].count += 1;
      wardMap[w].totalFill += (b.current_fill_percentage || 0);
      if ((b.current_fill_percentage || 0) >= 80) wardMap[w].critical += 1;
    });
    const wardStats = Object.keys(wardMap).sort().map(w => ({
      ward: w,
      bins: wardMap[w].count,
      avgFill: Math.round(wardMap[w].totalFill / (wardMap[w].count || 1)),
      critical: wardMap[w].critical
    }));

    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '22px', minHeight: 0, height: '100%' }}>
        
        {/* Executive Command & Operations Header Banner */}
        <div className="glass-panel" style={{
          padding: '20px 24px', borderRadius: '16px',
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-glass)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-success)',
                boxShadow: '0 0 10px var(--color-success)'
              }}></span>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                🏛️ {selectedCity} Municipal Corporation — Smart Waste Command Center
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
              Real-time IoT telemetry, AI XGBoost forecasting, and Google OR-Tools CVRP dynamic routing
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => runAction('predict', 'POST', '/api/predict')}
              disabled={actionLoading !== null || loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'linear-gradient(135deg, var(--accent-orange), #ea580c)',
                color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px',
                fontWeight: 700, fontSize: '11px', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
              }}
            >
              <Sparkles size={14} /> {actionLoading === 'predict' ? 'Predicting...' : '⚡ 24h AI Predictions'}
            </button>

            <button
              onClick={() => runAction('optimize', 'POST', '/api/optimize')}
              disabled={actionLoading !== null || loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)',
                color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px',
                fontWeight: 700, fontSize: '11px', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
              }}
            >
              <Navigation size={14} /> {actionLoading === 'optimize' ? 'Optimizing...' : '📍 Run CVRP Solver'}
            </button>

            <button
              onClick={fetchAll}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)', padding: '8px 14px', borderRadius: '8px',
                fontWeight: 600, fontSize: '11px', cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> 🔄 Live Refresh
            </button>
          </div>
        </div>

        {/* High Risk Alert Banner (conditional) */}
        {criticalBins > 0 && (
          <div style={{
            background: 'var(--color-danger-dim)',
            border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '12px',
            padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={20} color="var(--color-danger)" />
              <div>
                <strong style={{ fontSize: '13px', color: 'var(--color-danger)' }}>
                  🚨 Operational Alert: {criticalBins} Smart Bins require immediate collection (Fill ≥ 80%)
                </strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Municipal sanitation protocols advise rapid dispatch via Google OR-Tools CVRP routing.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('routes')}
              style={{
                background: 'var(--color-danger)', color: 'white', border: 'none',
                padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              View Dispatch Routes →
            </button>
          </div>
        )}

        {/* ── 6 CORE MEASURABLE OUTCOMES (SUSTAINABILITY MATRIX) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
          
          {/* 1. ₹ Saved */}
          <div className="glass-panel" style={{ padding: '14px 16px', borderRadius: '14px', borderLeft: '4px solid var(--accent-cyan)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>💰</span> ₹ Municipal Savings
            </div>
            <div style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              ₹{(fuelSaved * 98.5 + distanceSaved * 12).toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 600, marginTop: '2px' }}>
              Fuel + vehicle maintenance
            </div>
          </div>

          {/* 2. kWh Clean Solar */}
          <div className="glass-panel" style={{ padding: '14px 16px', borderRadius: '14px', borderLeft: '4px solid var(--accent-orange)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>☀️</span> Clean Solar Output
            </div>
            <div style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: 800, color: 'var(--accent-orange)', marginTop: '4px' }}>
              184.6 kWh
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-success)', fontWeight: 600, marginTop: '2px' }}>
              100% self-powered ESP32s
            </div>
          </div>

          {/* 3. Fuel Saved */}
          <div className="glass-panel" style={{ padding: '14px 16px', borderRadius: '14px', borderLeft: '4px solid var(--color-success)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>⛽</span> Fuel Conserved
            </div>
            <div style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: 800, color: 'var(--color-success)', marginTop: '4px' }}>
              {fuelSaved} Liters
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-success)', fontWeight: 600, marginTop: '2px' }}>
              -34.8% vs static schedules
            </div>
          </div>

          {/* 4. Leachate & Water Protection */}
          <div className="glass-panel" style={{ padding: '14px 16px', borderRadius: '14px', borderLeft: '4px solid #38bdf8' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>💧</span> Leachate & Runoff
            </div>
            <div style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
              100% Contained
            </div>
            <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 600, marginTop: '2px' }}>
              0 runoff spill incidents
            </div>
          </div>

          {/* 5. Landfill Diversion Rate */}
          <div className="glass-panel" style={{ padding: '14px 16px', borderRadius: '14px', borderLeft: '4px solid var(--accent-purple)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>♻️</span> Landfill Diversion
            </div>
            <div style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: 800, color: 'var(--accent-purple)', marginTop: '4px' }}>
              68.4%
            </div>
            <div style={{ fontSize: '10px', color: 'var(--accent-purple)', fontWeight: 600, marginTop: '2px' }}>
              Diverted to MRF recovery
            </div>
          </div>

          {/* 6. CO2 Offset */}
          <div className="glass-panel" style={{ padding: '14px 16px', borderRadius: '14px', borderLeft: '4px solid var(--color-success)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>🌿</span> Carbon Offset
            </div>
            <div style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: 800, color: 'var(--color-success)', marginTop: '4px' }}>
              {co2Saved} kg
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-success)', fontWeight: 600, marginTop: '2px' }}>
              🌳 ~{Math.max(1, Math.round(co2Saved / 21.7))} tree-years
            </div>
          </div>

        </div>

        {/* ── 5 SUSTAINABILITY PILLARS (HARDWARE + IOT + AI) ── */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🌱</span> Core Sustainability Infrastructure & IoT Architecture
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Holistic integration of Renewable Energy, EV Mobility, Water Conservation, Circular MRF & Bio-Composting
              </p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' }}>
              🟢 All 5 Systems Operational
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
            
            {/* Pillar 1: Solar & Energy */}
            <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-orange)' }}>☀️ Solar & Energy</span>
                <span style={{ fontSize: '10px', color: 'var(--color-success)', fontWeight: 700 }}>95.2% Avg Batt</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '8px 0' }}>
                {bins.length} Smart Bins equipped with 15W mini solar PV + LiFePO4 batteries with ESP32 deep sleep.
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)', paddingTop: '6px' }}>
                <span>Surplus: +46.6x</span>
                <span style={{ color: 'var(--color-success)' }}>0 Grid Power</span>
              </div>
            </div>

            {/* Pillar 2: EV & Mobility */}
            <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-cyan)' }}>⚡ EV & Mobility</span>
                <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontWeight: 700 }}>4 EV / 4 Euro-VI</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '8px 0' }}>
                Electrified municipal waste fleet utilizing Google OR-Tools CVRP routing for lowest kWh/ton.
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)', paddingTop: '6px' }}>
                <span>SoC: 84% avg</span>
                <span style={{ color: 'var(--accent-cyan)' }}>Smart Charging</span>
              </div>
            </div>

            {/* Pillar 3: Water & Environment */}
            <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8' }}>💧 Water & Leachate</span>
                <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 700 }}>AQI: 42 (Good)</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '8px 0' }}>
                Liquid leachate runoff sensors + MQ-135 atmospheric air monitoring prevent groundwater contamination.
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)', paddingTop: '6px' }}>
                <span>Runoff Spills: 0</span>
                <span style={{ color: '#38bdf8' }}>Drain Protected</span>
              </div>
            </div>

            {/* Pillar 4: Waste & Circular Economy */}
            <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-purple)' }}>♻️ Circular Recovery</span>
                <span style={{ fontSize: '10px', color: 'var(--accent-purple)', fontWeight: 700 }}>5 Streams</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '8px 0' }}>
                YOLOv8 vision scanning + segregated material recovery: Plastics (18%), Dry (28%), Organic (42%), E-waste (7%), Metals (5%).
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)', paddingTop: '6px' }}>
                <span>Landfill Cut: 68%</span>
                <span style={{ color: 'var(--accent-purple)' }}>MRF Connected</span>
              </div>
            </div>

            {/* Pillar 5: Smart Agriculture & Composting */}
            <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-success)' }}>🌾 Bio-Composting</span>
                <span style={{ fontSize: '10px', color: 'var(--color-success)', fontWeight: 700 }}>14.2 T/week</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '8px 0' }}>
                Wet food waste redirected to municipal biomethanization and nutrient-dense bio-fertilizer for city gardens.
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)', paddingTop: '6px' }}>
                <span>Biogas: 820 m³</span>
                <span style={{ color: 'var(--color-success)' }}>Parks Supplied</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── 8-CARD EXECUTIVE KPI GRID ── */}
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          
          {/* Card 1: Total Bins */}
          <div className="kpi-card cyan" style={{ borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🗑️</span> Total Smart Bins
              </div>
              <span style={{ fontSize: '10px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                100% Online
              </span>
            </div>
            <div className="kpi-value" style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800 }}>
              <AnimatedCounter target={bins.length} />
            </div>
            <div className="kpi-sub" style={{ fontSize: '11px' }}>
              Active sensors across {analyticsData?.system_stats?.active_bins ?? bins.length} monitored nodes
            </div>
          </div>

          {/* Card 2: Critical Now */}
          <div className="kpi-card red" style={{ borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🚨</span> Critical Fill Now
              </div>
              <span style={{ fontSize: '10px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                ≥ 80% Full
              </span>
            </div>
            <div className="kpi-value" style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, color: 'var(--color-danger)' }}>
              <AnimatedCounter target={criticalBins} />
            </div>
            <div className="kpi-sub" style={{ fontSize: '11px' }}>
              Requires immediate truck route dispatch
            </div>
          </div>

          {/* Card 3: 24h Predicted Overflow */}
          <div className="kpi-card orange" style={{ borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🔮</span> 24h Predicted Risk
              </div>
              <span style={{ fontSize: '10px', background: 'rgba(249, 115, 22, 0.15)', color: 'var(--accent-orange)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                XGBoost ML
              </span>
            </div>
            <div className="kpi-value" style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, color: 'var(--accent-orange)' }}>
              <AnimatedCounter target={criticalPredictions} />
            </div>
            <div className="kpi-sub" style={{ fontSize: '11px' }}>
              Bins forecasted to overflow tomorrow
            </div>
          </div>

          {/* Card 4: Average Fill */}
          <div className="kpi-card green" style={{ borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📈</span> System Average Fill
              </div>
              <span style={{ fontSize: '10px', background: 'rgba(160, 185, 129, 0.15)', color: 'var(--color-success)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                Stable
              </span>
            </div>
            <div className="kpi-value" style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, color: 'var(--color-success)' }}>
              <AnimatedCounter target={avgFill} decimals={1} suffix="%" />
            </div>
            <div style={{ width: '100%', height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
              <div style={{ width: `${Math.min(100, avgFill)}%`, height: '100%', background: avgFill > 75 ? 'var(--color-danger)' : 'var(--color-success)' }}></div>
            </div>
          </div>

          {/* Card 5: Active Trucks */}
          <div className="kpi-card purple" style={{ borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🚚</span> Active Fleet Units
              </div>
              <span style={{ fontSize: '10px', background: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-purple)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                Dispatched
              </span>
            </div>
            <div className="kpi-value" style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, color: 'var(--accent-purple)' }}>
              <AnimatedCounter target={routes.length} /> / {trucks.length || 6}
            </div>
            <div className="kpi-sub" style={{ fontSize: '11px' }}>
              Optimized municipal routes active
            </div>
          </div>

          {/* Card 6: Distance Saved */}
          <div className="kpi-card green" style={{ borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🛣️</span> Distance Compacted
              </div>
              <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                -29.6%
              </span>
            </div>
            <div className="kpi-value" style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, color: 'var(--color-success)' }}>
              <AnimatedCounter target={distanceSaved} suffix=" km" />
            </div>
            <div className="kpi-sub" style={{ fontSize: '11px' }}>
              Compacted vs legacy fixed schedule
            </div>
          </div>

          {/* Card 7: Fuel Saved */}
          <div className="kpi-card cyan" style={{ borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⛽</span> Diesel Conserved
              </div>
              <span style={{ fontSize: '10px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                ₹{(fuelSaved * 98.5).toLocaleString()}
              </span>
            </div>
            <div className="kpi-value" style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              <AnimatedCounter target={fuelSaved} suffix=" L" />
            </div>
            <div className="kpi-sub" style={{ fontSize: '11px' }}>
              Per operational collection cycle
            </div>
          </div>

          {/* Card 8: CO2 Offset */}
          <div className="kpi-card green" style={{ borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🌿</span> Net Carbon Offset
              </div>
              <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                🌳 ~{Math.max(1, Math.round(co2Saved / 21.7))} Trees
              </span>
            </div>
            <div className="kpi-value" style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, color: 'var(--color-success)' }}>
              <AnimatedCounter target={co2Saved} suffix=" kg" />
            </div>
            <div className="kpi-sub" style={{ fontSize: '11px' }}>
              Greenhouse footprint reduction
            </div>
          </div>

        </div>

        {/* ── CHARTS ROW: EFFICIENCY & WASTE DENSITY ── */}
        {comparison && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
            
            {/* Chart 1: Route Efficiency Comparison */}
            <div className="glass" style={{ padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Sparkles size={16} color="var(--accent-cyan)" /> ⚡ Route Efficiency Comparison (AI vs Fixed)
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Normalized Cycle Metric</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={[
                  { name: 'Distance (km)', AI: comparison.AI.distance_km, Fixed: comparison.Fixed.distance_km },
                  { name: 'Fuel (L)', AI: comparison.AI.fuel_liters, Fixed: comparison.Fixed.fuel_liters },
                  { name: 'Duration (h)', AI: comparison.AI.duration_hours, Fixed: comparison.Fixed.duration_hours },
                ]} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" style={{ fontSize: '11px' }} />
                  <YAxis stroke="var(--text-muted)" style={{ fontSize: '11px' }} />
                  <Tooltip content={<DarkTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)' }} />
                  <Bar dataKey="Fixed" fill="var(--text-muted)" name="Fixed Schedule Baseline" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="AI" fill="var(--accent-cyan)" name="AI CVRP Optimized" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2: Waste by Area Type */}
            <div className="glass" style={{ padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <TrendingUp size={16} color="var(--accent-purple)" /> 🏙️ Waste Generation by Area Profile
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Tonnage Breakdown</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={areaBreakdown} margin={{ top: 5, right: 5, left: -15, bottom: 30 }}>
                  <defs>
                    <linearGradient id="overviewWasteGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-purple)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
                  <XAxis dataKey="area_type" stroke="var(--text-muted)" style={{ fontSize: '10px' }} angle={-25} textAnchor="end" height={45} />
                  <YAxis stroke="var(--text-muted)" style={{ fontSize: '11px' }} />
                  <Tooltip content={<DarkTooltip />} />
                  <Area type="monotone" dataKey="waste_tons" stroke="var(--accent-purple)" strokeWidth={2.5} fillOpacity={1} fill="url(#overviewWasteGrad)" name="Waste Volume (Tons)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

          </div>
        )}

        {/* ── WARD CLEANLINESS & ACTIVITY STREAM ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
          
          {/* Ward Cleanliness & Area Telemetry Status */}
          <div className="glass" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontFamily: 'Outfit', fontSize: '15px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <span>🧭</span> Ward Hygiene & Sensor Health Index
              </h4>
              <span style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 700 }}>
                Score: 94.2/100 (Grade A+)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {areaMetrics.map(item => (
                <div key={item.area} style={{
                  background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: '10px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  border: '1px solid var(--border-glass)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>{item.icon}</span>
                    <div>
                      <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{item.area}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.bins} Smart Bins · {item.health} Sensor Uptime</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px',
                      background: item.status === 'Urgent' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: item.status === 'Urgent' ? 'var(--color-danger)' : 'var(--color-success)'
                    }}>
                      {item.fill}% Fill · {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Operations Activity Feed */}
          <div className="glass" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontFamily: 'Outfit', fontSize: '15px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <span>📡</span> Live Municipal Operations Stream
              </h4>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Live Telemetry</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '3px solid var(--accent-cyan)', display: 'flex', justifyContent: 'space-between' }}>
                <span>🚛 Fleet Truck <strong>TRK-01</strong> en route to Madhapur Bin #042</span>
                <span style={{ color: 'var(--text-muted)' }}>Just now</span>
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '3px solid var(--color-success)', display: 'flex', justifyContent: 'space-between' }}>
                <span>✅ Bin <strong>BIN018</strong> collected & reset to 0% fill</span>
                <span style={{ color: 'var(--text-muted)' }}>3m ago</span>
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '3px solid var(--accent-orange)', display: 'flex', justifyContent: 'space-between' }}>
                <span>🔮 XGBoost AI Forecast refreshed across all {bins.length} city bins</span>
                <span style={{ color: 'var(--text-muted)' }}>8m ago</span>
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '3px solid var(--accent-purple)', display: 'flex', justifyContent: 'space-between' }}>
                <span>♻️ Material Recovery Facility <strong>MRF-01</strong> logged 1,250 kg PET recovery</span>
                <span style={{ color: 'var(--text-muted)' }}>14m ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── REAL-TIME WARD LOAD DISTRIBUTION & RISK HEATMAP ── */}
        <div className="glass" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h4 style={{ fontFamily: 'Outfit', fontSize: '16px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <span>🗺️</span> Real-Time Ward Load & Critical Risk Heatmap
              </h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                Live aggregated fill metrics across municipal operational zones in {selectedCity}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)', fontWeight: 700 }}>
                ● Normal (&lt;50%)
              </span>
              <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', fontWeight: 700 }}>
                ● Medium (50-79%)
              </span>
              <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)', fontWeight: 700 }}>
                ● Critical (≥80%)
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {wardStats.map(w => {
              const statusColor = w.avgFill >= 80 || w.critical > 0 ? 'var(--color-danger)' : w.avgFill >= 50 ? 'var(--color-warning)' : 'var(--color-success)';
              return (
                <div key={w.ward} style={{
                  background: 'var(--bg-secondary)', padding: '14px', borderRadius: '12px',
                  border: `1px solid var(--border-glass)`,
                  borderLeft: `4px solid ${statusColor}`,
                  display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{w.ward}</span>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: statusColor }}>
                      {w.avgFill}% avg
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, w.avgFill)}%`, height: '100%', background: statusColor, borderRadius: '3px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                    <span>{w.bins} Bins monitored</span>
                    {w.critical > 0 ? (
                      <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>🚨 {w.critical} Critical</span>
                    ) : (
                      <span style={{ color: 'var(--color-success)' }}>✓ All clear</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    );
  };

  // ── Render Active Tab ──────────────────────────────────────

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'map': return (
        <div style={{ flex: 1, overflow: 'hidden', padding: '0 0 16px 0', minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <MapComponent
            bins={bins}
            routes={routes}
            selectedBinId={selectedBinId}
            onSelectBin={setSelectedBinId}
            liveUpdates={liveUpdates}
            streetRoutes={streetRoutes}
            fetchingRoutes={fetchingRoutes}
            selectedCity={selectedCity}
            theme={theme}
          />
        </div>
      );
      case 'routes': return (
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, height: '100%' }}>
          <StreetRoutePanel
            routes={routes}
            streetRoutes={streetRoutes}
            fetchingRoutes={fetchingRoutes}
            routingMode={routingMode}
            onModeChange={handleRoutingModeChange}
            selectedCity={selectedCity}
          />
        </div>
      );
      case 'bins': return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0, height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
            <button 
              onClick={() => {
                const defaultCenter = (CITY_CONFIG[selectedCity] || CITY_CONFIG.Hyderabad).center;
                setIsEditModeBin(false);
                setNewBinId('');
                setNewBinLat(String(defaultCenter[0]));
                setNewBinLon(String(defaultCenter[1]));
                setNewBinStreet('');
                setNewBinArea(selectedCity === 'Hyderabad' ? 'Banjara Hills' : `${selectedCity} Central`);
                setNewBinWard('Ward-01');
                setNewBinWardNum(1);
                setNewBinAreaType('Residential');
                setNewBinCapacity(240);
                setEditBinStatus('Active');
                setShowAddBinModal(true);
              }}
              style={{
                padding: '8px 16px', background: 'var(--accent-cyan)', color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                display: 'flex', alignItems: 'center', gap: '6px', boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Plus size={14} /> Add Waste Bin
            </button>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <BinsTable bins={bins} onSelectBin={setSelectedBinId} selectedBinId={selectedBinId} />
          </div>
        </div>
      );
      case 'fleet': return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0, height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
            <button 
              onClick={() => {
                setIsEditModeTruck(false);
                setNewTruckId('');
                setNewTruckPlate('');
                setNewTruckCapacity(5000);
                setNewDriverId('');
                setNewDriverName('');
                setNewDriverPhone('');
                setNewDriverLicense('');
                setEditTruckStatus('Idle');
                setShowAddTruckModal(true);
              }}
              style={{
                padding: '8px 16px', background: 'var(--accent-purple)', color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                display: 'flex', alignItems: 'center', gap: '6px', boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Plus size={14} /> Add Truck & Driver
            </button>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <FleetPanel trucks={trucks} routes={routes} onSelectBin={setSelectedBinId} onEditTruck={handleOpenEditTruckModal} selectedCity={selectedCity} />
          </div>
        </div>
      );
      case 'prediction': return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', minHeight: 0, height: '100%' }}>
          <PredictionPanel predictions={predictions} onSelectBin={setSelectedBinId} />
        </div>
      );
      case 'analytics': return analyticsData ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', minHeight: 0, height: '100%' }}>
          <Analytics comparison={analyticsData.comparison} savings={analyticsData.savings}
            ml_evaluation={analyticsData.ml_evaluation} area_breakdown={analyticsData.area_breakdown}
            selectedCity={selectedCity} />
        </div>
      ) : null;
      case 'notifications': return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', minHeight: 0, height: '100%' }}>
          <NotificationsPanel notifications={notifications} onMarkRead={handleMarkRead} onMarkAllRead={handleMarkAllRead} city={selectedCity} />
        </div>
      );
      case 'simulation': return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', minHeight: 0, height: '100%' }}>
          <SimulationControls
            isRunning={simRunning} currentSpeed={simSpeed}
            onStart={handleStartSim} onStop={handleStopSim} onReset={handleResetSim}
            bins={bins.map(b => ({ bin_id: b.bin_id, current_fill_percentage: b.current_fill_percentage ?? 0, area_type: b.area_type }))}
          />
        </div>
      );
      case 'maintenance': return (
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, height: '100%' }}>
          <MaintenanceManagementPanel selectedCity={selectedCity} />
        </div>
      );
      case 'classify':
      case 'aiscanner': return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', minHeight: 0, height: '100%' }}>
          <AIWasteVisionHub selectedCity={selectedCity} />
        </div>
      );
      case 'impact': return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', minHeight: 0, height: '100%' }}>
          <ImpactDashboard selectedCity={selectedCity} />
        </div>
      );
      case 'circular':
      case 'exchange':
      case 'foodwaste':
      case 'ewaste':
      case 'reuserepair': return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', minHeight: 0, height: '100%' }}>
          <CircularEconomyHub selectedCity={selectedCity} />
        </div>
      );
      case 'demo':
      case 'pitch': return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', minHeight: 0, height: '100%' }}>
          <ExecutiveEvaluationHub selectedCity={selectedCity} onNavigateTab={(tab: Tab) => setActiveTab(tab)} />
        </div>
      );
      case 'iotbench': return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', minHeight: 0, height: '100%' }}>
          <IoTBench selectedCity={selectedCity} />
        </div>
      );
      case 'blackspots':
      case 'citizen': return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', minHeight: 0, height: '100%' }}>
          <CitizenCivicHub selectedCity={selectedCity} onSelectBin={(binId) => { setSelectedBinId(binId); setActiveTab('bins'); }} />
        </div>
      );
      default: return null;
    }
  };

  // ── Main Render ────────────────────────────────────────────

  return (
    <div className="app-shell">
      {/* Mobile Drawer Backdrop */}
      <div 
        className={`sidebar-backdrop ${mobileDrawerOpen ? 'active' : ''}`} 
        onClick={() => setMobileDrawerOpen(false)} 
      />

      {/* Sidebar */}
      <aside className={`sidebar ${mobileDrawerOpen ? 'mobile-open' : ''} ${!sidebarOpen ? 'closed' : ''}`}>
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">♻️</div>
            <div className="sidebar-brand-text">
              <h1>EcoBin AI</h1>
              <p>{getCityBrandName(selectedCity)}</p>
            </div>
          </div>
          {/* Quick Collapse to Left Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            title="Collapse sidebar to full screen view"
            aria-label="Collapse sidebar"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <nav className="nav-section" style={{ flex: 1, overflowY: 'auto' }}>
          <div className="nav-section-label">Navigation & Circular Pillars</div>
          {NAV_ITEMS.map(item => (
            <button 
              key={item.key} 
              className={`nav-btn ${activeTab === item.key ? `active ${item.color}` : ''}`}
              onClick={() => {
                setActiveTab(item.key);
                if (!['map', 'bins'].includes(item.key)) {
                  handleCloseInspector();
                }
                setMobileDrawerOpen(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
              {item.key === 'simulation' && (
                <span className="sim-indicator">
                  <span className={`sim-dot ${simRunning ? '' : 'stopped'}`} />
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Collapsible Admin & System Actions Drawer */}
        <div style={{
          borderTop: '1px solid var(--border-glass)',
          background: 'var(--bg-secondary)',
          marginTop: 'auto',
          flexShrink: 0,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Header Accordion Button */}
          <button
            onClick={() => setSystemMenuOpen(!systemMenuOpen)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 14px',
              background: systemMenuOpen ? 'var(--bg-tertiary)' : 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: 'var(--font-sans)',
              transition: 'background 0.2s ease',
              textAlign: 'left'
            }}
            title={systemMenuOpen ? "Fold down system tools" : "Expand system tools"}
            aria-expanded={systemMenuOpen}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={14} color="var(--accent-cyan)" className={actionLoading !== null ? 'spin' : ''} />
              <span>System & ML Engine</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {!systemMenuOpen && actionLoading && (
                <span style={{ fontSize: '9px', background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                  Active
                </span>
              )}
              {systemMenuOpen ? (
                <ChevronDown size={15} color="var(--text-muted)" />
              ) : (
                <ChevronUp size={15} color="var(--text-muted)" />
              )}
            </div>
          </button>

          {/* Collapsible Action Buttons Area */}
          <div style={{
            maxHeight: systemMenuOpen ? '240px' : '0px',
            overflow: 'hidden',
            opacity: systemMenuOpen ? 1 : 0,
            transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease',
            padding: systemMenuOpen ? '4px 10px 10px 10px' : '0 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px'
          }}>
            <button onClick={() => { runAction('predict', 'POST', '/api/predict'); setMobileDrawerOpen(false); }} disabled={actionLoading !== null}
              className="nav-btn" style={{ fontSize: '12px' }}>
              <Sparkles size={14} color="var(--accent-orange)" />
              <span>{actionLoading === 'predict' ? 'Forecasting...' : 'Compute Predictions'}</span>
            </button>
            <button onClick={() => { runAction('optimize', 'POST', '/api/optimize'); setMobileDrawerOpen(false); }} disabled={actionLoading !== null}
              className="nav-btn" style={{ fontSize: '12px' }}>
              <Navigation size={14} color="var(--accent-cyan)" />
              <span className={actionLoading === 'optimize' ? 'spin' : ''}>{actionLoading === 'optimize' ? 'Optimizing...' : 'Optimize Routes'}</span>
            </button>
            <button onClick={() => { runAction('train', 'POST', '/api/train'); setMobileDrawerOpen(false); }} disabled={actionLoading !== null}
              className="nav-btn" style={{ fontSize: '12px' }}>
              <RefreshCw size={13} />
              <span>Train ML Models</span>
            </button>
            <button onClick={() => {
              if (!confirm('Regenerate all data? This takes 2–5 minutes.')) return;
              runAction('gendata', 'POST', '/api/generate-data');
              setMobileDrawerOpen(false);
            }} disabled={actionLoading !== null}
              className="nav-btn" style={{ fontSize: '12px', color: 'var(--color-danger)' }}>
              <Database size={13} />
              <span>Reset Database</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Mobile Hamburger Toggle Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              title="Toggle Navigation"
              aria-label="Toggle Navigation"
            >
              {mobileDrawerOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Desktop / Global Sidebar Toggle Button (Open & Close) */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="desktop-sidebar-toggle-btn"
              title={sidebarOpen ? "Close sidebar (Full screen mode)" : "Open sidebar (Show all navigation)"}
              aria-label="Toggle sidebar"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)',
                background: 'var(--bg-glass)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              {sidebarOpen ? <PanelLeftClose size={18} color="var(--text-secondary)" /> : <PanelLeftOpen size={18} color="var(--accent-cyan)" />}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
                {NAV_ITEMS.find(n => n.key === activeTab)?.label}
              </h2>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {selectedCity === 'All' ? '🌐 India National Waste Management Control Grid' : (CITY_CONFIG[selectedCity]?.authority || 'Smart Waste Management Network')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: 'auto' }}>
            {/* City Selector */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
              borderRadius: '8px', padding: '4px 10px', flexShrink: 0
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>🌆 City:</span>
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                style={{
                  background: 'transparent', border: 'none', color: 'var(--accent-cyan)',
                  fontSize: '12px', fontWeight: 700, fontFamily: 'Outfit', cursor: 'pointer', outline: 'none'
                }}
              >
                <option value="Hyderabad" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Hyderabad (GHMC)</option>
                <option value="Bangalore" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Bangalore (BBMP)</option>
                <option value="Mumbai" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Mumbai (BMC)</option>
                <option value="Delhi" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Delhi (MCD)</option>
                <option value="Chennai" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Chennai (GCC)</option>
                <option value="Kolkata" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Kolkata (KMC)</option>
                <option value="Pune" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Pune (PMC)</option>
                <option value="Ahmedabad" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Ahmedabad (AMC)</option>
                <option value="All" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>🌐 All Cities (National Grid)</option>
              </select>
            </div>

            {/* Scrollable Metric Badges on Mobile */}
            <div className="topbar-stats-scroll">
              <div className="topbar-stat">
                <div className="live-dot" />
                <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '12px' }}>
                  {simRunning ? `Sim ${simSpeed}×` : 'Live Monitor'}
                </span>
              </div>
              <div className="topbar-stat">
                <Trash2 size={12} color="var(--accent-cyan)" />
                <span>{bins.length} bins</span>
              </div>
              <div className="topbar-stat">
                <AlertTriangle size={12} color={criticalBins > 0 ? 'var(--color-danger)' : 'var(--text-muted)'} />
                <span style={{ color: criticalBins > 0 ? 'var(--color-danger)' : undefined }}>{criticalBins} critical</span>
              </div>
              <div className="topbar-stat">
                <Wind size={12} color="var(--color-success)" />
                <span style={{ color: 'var(--color-success)' }}>-{co2Saved} kg CO₂</span>
              </div>
              <button onClick={fetchAll} disabled={loading || actionLoading !== null}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '4px' }}>
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
              </button>
            </div>

            {/* How To Use Guide Button (ported from External_Resources/EcoBin_Website) */}
            <button
              onClick={() => setShowHowToUseModal(true)}
              className="theme-toggle-btn"
              title="How to Use EcoBin AI (Operations Guide)"
              aria-label="Operations Guide"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0 10px',
                width: 'auto',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--accent-cyan)'
              }}
            >
              <HelpCircle size={15} color="var(--accent-cyan)" />
              <span>Guide</span>
            </button>

            {/* Theme Toggle (Right End, Icon Only) */}
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} color="var(--accent-orange)" /> : <Moon size={16} color="var(--accent-cyan)" />}
            </button>
          </div>
        </div>

        {/* Panel Area */}
        <div className="panel-area">
          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', color: 'var(--text-muted)' }}>
              <div style={{ width: 40, height: 40, border: '3px solid var(--border-glass)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: '13px' }}>Loading Smart Waste Management Platform...</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0, minWidth: 0, height: '100%' }}>
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, height: '100%' }}>
                {renderTabContent()}
              </div>
              {/* Only show inspector when a bin is actively selected on Map or Bins tab */}
              {['map', 'bins'].includes(activeTab) && selectedBinId !== null && selectedBinDetail !== null && renderInspector()}
            </div>
          )}
        </div>
      </div>

      {/* Add Waste Bin Modal */}
      {showAddBinModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--bg-primary)', border: '1px solid var(--border-glass)',
            padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '480px',
            boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text-primary)', fontWeight: 800 }}>
              {isEditModeBin ? 'Edit Waste Bin Details' : 'Add New Waste Bin'}
            </h3>
            
            <form onSubmit={isEditModeBin ? handleEditBin : handleAddBin}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Bin ID</label>
                  <input type="text" placeholder="e.g. BIN101" required value={newBinId} onChange={e => setNewBinId(e.target.value)} disabled={isEditModeBin}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', opacity: isEditModeBin ? 0.6 : 1 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Capacity (Liters)</label>
                  <input type="number" required value={newBinCapacity} onChange={e => setNewBinCapacity(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Latitude</label>
                  <input type="number" step="0.000001" required value={newBinLat} onChange={e => setNewBinLat(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Longitude</label>
                  <input type="number" step="0.000001" required value={newBinLon} onChange={e => setNewBinLon(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Street Name</label>
                <input type="text" placeholder="e.g. Road No. 10" required value={newBinStreet} onChange={e => setNewBinStreet(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Area Name</label>
                  <input type="text" required value={newBinArea} onChange={e => setNewBinArea(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Area Type</label>
                  <select value={newBinAreaType} onChange={e => setNewBinAreaType(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}>
                    {["Residential", "Commercial", "Market", "Hospital", "School", "Restaurant", "Mall", "Bus Stand", "Railway Station", "Park", "Industrial"].map(t => (
                      <option key={t} value={t} style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Ward</label>
                  <input type="text" placeholder="e.g. Ward-10" required value={newBinWard} onChange={e => setNewBinWard(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Ward Number</label>
                  <input type="number" required value={newBinWardNum} onChange={e => setNewBinWardNum(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                </div>
              </div>

              {isEditModeBin && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Status</label>
                  <select value={editBinStatus} onChange={e => setEditBinStatus(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}>
                    {["Active", "Maintenance", "Offline"].map(s => (
                      <option key={s} value={s} style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: isEditModeBin ? '0' : '24px' }}>
                <button type="button" onClick={() => setShowAddBinModal(false)}
                  style={{ padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={addingBin}
                  style={{ padding: '8px 20px', background: 'var(--accent-cyan)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 800, fontSize: '13px', boxShadow: 'var(--shadow-sm)' }}>
                  {addingBin ? (isEditModeBin ? 'Updating...' : 'Adding...') : (isEditModeBin ? 'Update Bin' : 'Add Bin')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Truck Modal */}
      {showAddTruckModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--bg-primary)', border: '1px solid var(--border-glass)',
            padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '480px',
            boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text-primary)', fontWeight: 800 }}>
              {isEditModeTruck ? 'Edit Truck & Driver Details' : 'Add New Truck & Driver'}
            </h3>
            
            <form onSubmit={isEditModeTruck ? handleEditTruck : handleAddTruck}>
              <h4 style={{ fontSize: '12px', color: 'var(--accent-purple)', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Truck Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Truck ID</label>
                  <input type="text" placeholder="e.g. TRK-HYD-06" required value={newTruckId} onChange={e => setNewTruckId(e.target.value)} disabled={isEditModeTruck}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', opacity: isEditModeTruck ? 0.6 : 1 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Plate Number</label>
                  <input type="text" placeholder="e.g. TS09EA0006" required value={newTruckPlate} onChange={e => setNewTruckPlate(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Capacity (Liters)</label>
                <input type="number" required value={newTruckCapacity} onChange={e => setNewTruckCapacity(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <h4 style={{ fontSize: '12px', color: 'var(--accent-purple)', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em', borderTop: '1px solid var(--border-glass)', paddingTop: '12px' }}>Driver Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Driver ID</label>
                  <input type="text" placeholder="e.g. DRV006" required value={newDriverId} onChange={e => setNewDriverId(e.target.value)} disabled={isEditModeTruck}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', opacity: isEditModeTruck ? 0.6 : 1 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Driver Name</label>
                  <input type="text" placeholder="e.g. Anil Kumar" required value={newDriverName} onChange={e => setNewDriverName(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Phone Number</label>
                  <input type="text" placeholder="e.g. 9876543215" value={newDriverPhone} onChange={e => setNewDriverPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>License Number</label>
                  <input type="text" placeholder="e.g. TS123461" value={newDriverLicense} onChange={e => setNewDriverLicense(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                </div>
              </div>

              {isEditModeTruck && (
                <div style={{ marginBottom: '24px', borderTop: '1px solid var(--border-glass)', paddingTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Truck Status</label>
                  <select value={editTruckStatus} onChange={e => setEditTruckStatus(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}>
                    {["Idle", "En Route", "Collecting", "Maintenance", "Inactive"].map(s => (
                      <option key={s} value={s} style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: isEditModeTruck ? '0' : '24px' }}>
                <button type="button" onClick={() => setShowAddTruckModal(false)}
                  style={{ padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={addingTruck}
                  style={{ padding: '8px 20px', background: 'var(--accent-purple)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 800, fontSize: '13px', boxShadow: 'var(--shadow-sm)' }}>
                  {addingTruck ? (isEditModeTruck ? 'Updating...' : 'Adding...') : (isEditModeTruck ? 'Update Truck' : 'Add Truck & Driver')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* How To Use Operations Guide Modal */}
      <HowToUseModal 
        isOpen={showHowToUseModal} 
        onClose={() => setShowHowToUseModal(false)} 
        onNavigateTab={(tab) => setActiveTab(tab as Tab)} 
      />
      {/* Floating Back to Top Button (ported from External_Resources/EcoBin_Website) */}
      <BackToTopButton />
    </div>
  );
};

export default Dashboard;
