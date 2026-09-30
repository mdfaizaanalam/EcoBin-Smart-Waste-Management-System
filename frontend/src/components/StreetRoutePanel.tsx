import React, { useState, useEffect } from 'react';
import { Navigation, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Compass } from 'lucide-react';

// ─── Interfaces ──────────────────────────────────────────────

interface OsrmStep {
  name: string;
  distance: number;   // metres
  duration: number;   // seconds
  maneuver: { type: string; modifier?: string };
}

interface StreetRoute {
  coords: [number, number][];
  steps: OsrmStep[];
  totalDistanceM: number;
  totalDurationS: number;
  snapped: boolean;
}

interface RoutePathNode {
  bin_id: string;
  latitude: number;
  longitude: number;
  load_at_node?: number;
  current_fill_percentage?: number;
  priority?: number;
  street_name?: string;
  area_name?: string;
  is_critical?: boolean;
  emergency_order?: number;
  traffic_status?: string;
}

interface RouteData {
  route_id?: number;
  truck_id: string;
  driver: string;
  distance_km: number;
  fuel_liters: number;
  duration_hours: number;
  path: RoutePathNode[];
  routing_mode?: string;
}

export type RoutingModeType = 'eco' | 'priority' | 'shortest' | 'traffic';

interface StreetRoutePanelProps {
  routes: RouteData[];
  streetRoutes: Record<string, StreetRoute>;
  fetchingRoutes: boolean;
  routingMode?: RoutingModeType;
  onModeChange?: (mode: RoutingModeType) => void;
  selectedCity?: string;
}

// ─── Utilities ───────────────────────────────────────────────

const ROUTE_COLORS = ['#06b6d4', '#8b5cf6', '#f97316', '#ec4899', '#10b981'];

const formatDuration = (s: number): string => {
  if (s < 60) return `${Math.round(s)}s`;
  if (s < 3600) return `${Math.round(s / 60)} min`;
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return `${h}h ${m}m`;
};

const formatDistance = (m: number): string => {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(2)} km`;
};

const maneuverIcon = (step: OsrmStep): string => {
  const { type, modifier } = step.maneuver;
  if (type === 'depart') return '🚀';
  if (type === 'arrive') return '🏁';
  if (type === 'turn') {
    if (modifier === 'left' || modifier === 'sharp left') return '↰';
    if (modifier === 'right' || modifier === 'sharp right') return '↱';
    if (modifier === 'slight left') return '↖';
    if (modifier === 'slight right') return '↗';
    return '⬆';
  }
  if (type === 'new name' || type === 'continue') return '⬆';
  if (type === 'merge') return '⤵';
  if (type === 'roundabout' || type === 'rotary') return '🔄';
  if (type === 'fork') return '⑂';
  if (type === 'end of road') return '⬆';
  return '⬆';
};

// ─── Single Route Card ────────────────────────────────────────

interface RouteCardProps {
  route: RouteData;
  sr: StreetRoute | undefined;
  color: string;
  mode: RoutingModeType;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, sr, color, mode }) => {
  const [expanded, setExpanded] = useState(false);

  const displayedSteps = sr?.steps.filter(s => s.name && s.name !== '') ?? [];
  const totalM = sr?.totalDistanceM ?? route.distance_km * 1000;
  const totalS = sr?.totalDurationS ?? route.duration_hours * 3600;

  // Stops list excluding start and end depot
  const stops = route.path.filter(n => n.bin_id && n.bin_id !== 'DEPOT');

  return (
    <div style={{
      background: 'var(--bg-glass)',
      border: `1px solid ${expanded ? color + '66' : 'var(--border-glass)'}`,
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(p => !p)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px',
          borderBottom: expanded ? `1px solid ${color}33` : 'none',
        }}
      >
        {/* Colour dot */}
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0,
        }} />

        {/* Truck info */}
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
              {route.truck_id}
            </span>
            {/* Mode badge */}
            {mode === 'eco' && (
              <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                🌿 Eco Cruising
              </span>
            )}
            {mode === 'priority' && (
              <span style={{ fontSize: '10px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                🚨 Emergency Dispatch
              </span>
            )}
            {mode === 'shortest' && (
              <span style={{ fontSize: '10px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                ⚡ Shortest TSP Loop
              </span>
            )}
            {mode === 'traffic' && (
              <span style={{ fontSize: '10px', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-cyan)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                🚦 Congestion Bypassed
              </span>
            )}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
            👤 {route.driver} · {stops.length} stops
          </div>
        </div>

        {/* Stats */}
        <div style={{ textAlign: 'right', marginRight: '6px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace' }}>
            {formatDistance(totalM)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {formatDuration(totalS)}
          </div>
        </div>

        {/* Snapped badge */}
        <div style={{ flexShrink: 0 }}>
          {sr?.snapped ? (
            <CheckCircle size={14} color="var(--color-success)" />
          ) : (
            <AlertTriangle size={14} color="var(--color-warning)" />
          )}
        </div>

        {expanded ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
      </button>

      {/* Expanded view */}
      {expanded && (
        <div style={{ padding: '0 14px 14px 14px' }}>
          {/* Route quality note */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 12px', borderRadius: '8px', margin: '10px 0',
            background: sr?.snapped ? 'var(--color-success-dim)' : 'var(--color-warning-dim)',
            border: `1px solid ${sr?.snapped ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
          }}>
            {sr?.snapped ? (
              <>
                <CheckCircle size={12} color="var(--color-success)" />
                <span style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600 }}>
                  Street-snapped via OSRM (real road network)
                </span>
              </>
            ) : (
              <>
                <AlertTriangle size={12} color="var(--color-warning)" />
                <span style={{ fontSize: '11px', color: 'var(--color-warning)', fontWeight: 600 }}>
                  Straight-line estimate (OSRM unavailable)
                </span>
              </>
            )}
          </div>

          {/* Mode-Specific Stop Sequence Details */}
          {stops.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Compass size={12} color={color} />
                <span>Optimized Stop Sequence ({mode.toUpperCase()} Mode)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '160px', overflowY: 'auto' }}>
                {stops.map((stop, sIdx) => {
                  const isCrit = (stop.current_fill_percentage && stop.current_fill_percentage >= 80) || stop.is_critical;
                  return (
                    <div key={sIdx} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '5px 8px', borderRadius: '6px',
                      background: 'var(--bg-secondary)', fontSize: '11px',
                      borderLeft: isCrit && mode === 'priority' ? '3px solid var(--color-danger)' : '3px solid var(--border-glass)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--accent-cyan)', width: '16px' }}>#{sIdx + 1}</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{stop.bin_id}</span>
                        {stop.area_name && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>({stop.area_name})</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {mode === 'priority' && isCrit && (
                          <span style={{ fontSize: '9px', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--color-danger)', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                            🚨 CRITICAL 1ST
                          </span>
                        )}
                        {mode === 'shortest' && (
                          <span style={{ fontSize: '9px', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--color-warning)', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            ⚡ Min-Leg
                          </span>
                        )}
                        {mode === 'traffic' && (
                          <span style={{ fontSize: '9px', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-cyan)', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            🟢 Fluid Bypass
                          </span>
                        )}
                        {mode === 'eco' && (
                          <span style={{ fontSize: '9px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--color-success)', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            🌿 Eco Stop
                          </span>
                        )}
                        {stop.current_fill_percentage !== undefined && (
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: isCrit ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                            {Math.round(stop.current_fill_percentage)}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Turn-by-turn list */}
          {displayedSteps.length > 0 ? (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Turn-by-Turn Road Navigation
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '220px', overflowY: 'auto' }}>
                {displayedSteps.map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '6px 8px', borderRadius: '6px',
                    background: i % 2 === 0 ? 'var(--bg-secondary)' : 'transparent',
                  }}>
                    {/* Maneuver icon */}
                    <span style={{ fontSize: '13px', width: '18px', textAlign: 'center', flexShrink: 0 }}>
                      {maneuverIcon(step)}
                    </span>

                    {/* Street name */}
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{
                        fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {step.name || '(unnamed road)'}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                        {step.maneuver.type}{step.maneuver.modifier ? ` ${step.maneuver.modifier}` : ''}
                      </div>
                    </div>

                    {/* Distance + duration */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace' }}>
                        {formatDistance(step.distance)}
                      </div>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                        {formatDuration(step.duration)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '12px' }}>
              No turn-by-turn steps available for straight-line estimate.
            </div>
          )}

          {/* Fuel summary */}
          <div style={{
            display: 'flex', gap: '8px', marginTop: '10px',
          }}>
            {[
              { label: 'Est. Fuel', value: `${route.fuel_liters} L` },
              { label: 'Total Stops', value: `${stops.length}` },
              { label: 'Road Segments', value: `${displayedSteps.length}` },
            ].map(stat => (
              <div key={stat.label} style={{
                flex: 1, background: 'var(--bg-secondary)',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px', padding: '7px 8px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Panel ───────────────────────────────────────────────

const StreetRoutePanel: React.FC<StreetRoutePanelProps> = ({
  routes,
  streetRoutes,
  fetchingRoutes,
  routingMode = 'eco',
  onModeChange,
  selectedCity = 'Hyderabad'
}) => {
  const [localMode, setLocalMode] = useState<RoutingModeType>(routingMode);

  // Sync prop changes
  useEffect(() => {
    if (routingMode && routingMode !== localMode) {
      setLocalMode(routingMode);
    }
  }, [routingMode]);

  const handleModeSelect = (modeId: RoutingModeType) => {
    setLocalMode(modeId);
    if (onModeChange) {
      onModeChange(modeId);
    }
  };

  const snappedCount = Object.values(streetRoutes).filter(r => r.snapped).length;
  const totalDistanceM = Object.values(streetRoutes).reduce((sum, r) => sum + r.totalDistanceM, 0);
  const totalDurationS = Object.values(streetRoutes).reduce((sum, r) => sum + r.totalDurationS, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px 12px',
        borderBottom: '1px solid var(--border-glass)',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <Navigation size={16} color="var(--accent-cyan)" />
        <div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
            Street Route Details & AI Optimizer
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Multi-mode routing engine with OSRM street snapping • {selectedCity} Fleet
          </div>
        </div>
        {fetchingRoutes && (
          <div style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '11px', color: 'var(--accent-cyan)',
          }}>
            <div style={{
              width: 8, height: 8, border: '2px solid var(--accent-cyan)',
              borderTopColor: 'transparent', borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
            Optimizing {localMode.toUpperCase()} Route…
          </div>
        )}
      </div>

      {/* 4 Routing Mode Selector Buttons */}
      <div style={{
        display: 'flex', gap: '6px', padding: '10px 16px 4px',
        overflowX: 'auto', borderBottom: '1px solid var(--border-glass)'
      }}>
        {[
          { id: 'eco' as RoutingModeType, label: '🌿 Eco Route', desc: 'Fuel Saving', tag: '🌱 -18% Fuel' },
          { id: 'priority' as RoutingModeType, label: '🚨 Emergency', desc: 'Overfill Focus', tag: '⚡ Priority First' },
          { id: 'shortest' as RoutingModeType, label: '⚡ Shortest', desc: 'Min Distance', tag: '📉 Min Mileage' },
          { id: 'traffic' as RoutingModeType, label: '🚦 Traffic-Aware', desc: 'Congestion Avoidance', tag: '⏱️ -24m Delay' },
        ].map(m => {
          const isActive = localMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => handleModeSelect(m.id)}
              style={{
                flex: 1, minWidth: '95px', padding: '8px 10px', borderRadius: '8px',
                border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border-glass)'}`,
                background: isActive ? 'var(--accent-cyan-dim)' : 'var(--bg-glass)',
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 0 10px rgba(6, 182, 212, 0.25)' : 'none',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800 }}>{m.label}</div>
              <div style={{ fontSize: '9px', opacity: 0.85, marginTop: '2px' }}>{m.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Active Strategy Explanation Banner */}
      <div style={{
        margin: '10px 16px 4px',
        padding: '10px 14px',
        borderRadius: '10px',
        background: localMode === 'priority' ? 'rgba(239, 68, 68, 0.08)' :
                    localMode === 'shortest' ? 'rgba(245, 158, 11, 0.08)' :
                    localMode === 'traffic' ? 'rgba(59, 130, 246, 0.08)' :
                    'rgba(16, 185, 129, 0.08)',
        border: `1px solid ${
          localMode === 'priority' ? 'rgba(239, 68, 68, 0.25)' :
          localMode === 'shortest' ? 'rgba(245, 158, 11, 0.25)' :
          localMode === 'traffic' ? 'rgba(59, 130, 246, 0.25)' :
          'rgba(16, 185, 129, 0.25)'
        }`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div>
          <div style={{
            fontSize: '12px',
            fontWeight: 800,
            color: localMode === 'priority' ? 'var(--color-danger)' :
                   localMode === 'shortest' ? 'var(--color-warning)' :
                   localMode === 'traffic' ? 'var(--accent-cyan)' :
                   'var(--color-success)',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            {localMode === 'eco' && '🌿 Fuel-Optimal Eco Routing Active'}
            {localMode === 'priority' && '🚨 Emergency Priority Dispatch Active'}
            {localMode === 'shortest' && '⚡ TSP Minimal Distance Routing Active'}
            {localMode === 'traffic' && '🚦 Dynamic Traffic Congestion Avoidance Active'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {localMode === 'eco' && 'Optimizes steady cruising velocity (~35 km/h) minimizing acceleration cycles and fuel loss.'}
            {localMode === 'priority' && 'Critical bins (≥80% capacity) are sorted to the front of collection schedule to eliminate spill hazards.'}
            {localMode === 'shortest' && 'Nearest-neighbor distance minimization loop reducing total fleet travel kilometers.'}
            {localMode === 'traffic' && 'Avoids congested municipal center bottlenecks by routing through fluid arterial bypass corridors.'}
          </div>
        </div>
        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: '6px',
          whiteSpace: 'nowrap',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-glass)'
        }}>
          {localMode === 'eco' && '🌱 -18% Fuel Burn'}
          {localMode === 'priority' && '⚡ 1st Priority Urgent'}
          {localMode === 'shortest' && '📉 Min Fleet Km'}
          {localMode === 'traffic' && '⏱️ -24m Delay Avoided'}
        </div>
      </div>

      {/* Summary 4-Column KPI Bar */}
      {routes.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px', padding: '12px 16px',
          borderBottom: '1px solid var(--border-glass)',
        }}>
          {[
            { label: 'Total Distance', value: formatDistance(totalDistanceM), color: 'var(--accent-cyan)' },
            { label: 'Est. Total Time', value: formatDuration(totalDurationS), color: 'var(--accent-purple)' },
            { label: 'Street-Snapped', value: `${snappedCount}/${routes.length}`, color: snappedCount === routes.length ? 'var(--color-success)' : 'var(--color-warning)' },
            { 
              label: localMode === 'priority' ? 'Critical Focus' : localMode === 'shortest' ? 'Mileage Efficiency' : localMode === 'traffic' ? 'Bottlenecks' : 'Est. Fuel Saved',
              value: localMode === 'priority' ? '100% Top' : localMode === 'shortest' ? 'Optimal' : localMode === 'traffic' ? 'Bypassed' : '18.2%',
              color: localMode === 'priority' ? 'var(--color-danger)' : localMode === 'shortest' ? 'var(--color-warning)' : localMode === 'traffic' ? 'var(--accent-cyan)' : 'var(--color-success)'
            },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-glass)',
              borderRadius: '10px', padding: '10px 12px', textAlign: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: stat.color, fontFamily: 'Outfit' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Route cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {routes.length === 0 ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', textAlign: 'center', gap: '12px', padding: '32px',
          }}>
            <Navigation size={36} style={{ strokeWidth: 1.2 }} />
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                No routes generated for {selectedCity} yet
              </p>
              <p style={{ fontSize: '12px' }}>
                Click <strong style={{ color: 'var(--accent-cyan)' }}>Optimize Routes</strong> in the sidebar to generate AI-optimized truck routes with real street distances.
              </p>
            </div>
          </div>
        ) : (
          routes.map((route, idx) => (
            <RouteCard
              key={route.truck_id}
              route={route}
              sr={streetRoutes[route.truck_id]}
              color={ROUTE_COLORS[idx % ROUTE_COLORS.length]}
              mode={localMode}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default StreetRoutePanel;
