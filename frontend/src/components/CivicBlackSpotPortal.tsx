import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Zap, 
  ShieldAlert, 
  Plus, 
  RefreshCw, 
  Sparkles,
  Droplets,
  Activity,
  Layers,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CivicBlackSpot, BiomethanationEnergyMetric } from '../types/circular';
import { api } from '../services/api';

interface CivicBlackSpotPortalProps {
  selectedCity?: string;
}

export const CivicBlackSpotPortal: React.FC<CivicBlackSpotPortalProps> = ({ selectedCity = 'Hyderabad' }) => {
  const [blackSpots, setBlackSpots] = useState<CivicBlackSpot[]>([]);
  const [energyMetric, setEnergyMetric] = useState<BiomethanationEnergyMetric | null>(null);
  const [loading, setLoading] = useState(true);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'moderate' | 'low'>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const [spotsRes, energyRes] = await Promise.all([
        api.getBlackSpots(selectedCity),
        api.getBiomethanationEnergy(selectedCity)
      ]);
      setBlackSpots(spotsRes.blackSpots || []);
      setEnergyMetric(energyRes.energyMetric || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCity]);

  const handleDispatchCrew = async (spotId: string) => {
    setDispatchingId(spotId);
    try {
      const crewName = `Municipal Rapid Desilting & SWM Taskforce Unit #${Math.floor(Math.random() * 8) + 1}`;
      const res = await api.dispatchBlackSpotCrew(spotId, crewName);
      setBlackSpots(prev => prev.map(s => s.id === spotId ? res.blackSpot : s));
    } catch (err) {
      console.error(err);
    } finally {
      setDispatchingId(null);
    }
  };

  const handleResolveSpot = async (spotId: string) => {
    setResolvingId(spotId);
    try {
      const res = await api.resolveBlackSpot(spotId);
      setBlackSpots(prev => prev.map(s => s.id === spotId ? res.blackSpot : s));
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setResolvingId(null);
    }
  };

  const filteredSpots = filterSeverity === 'all' 
    ? blackSpots 
    : blackSpots.filter(s => s.severity === filterSeverity);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(245, 158, 11, 0.15))',
        border: '1px solid rgba(239, 68, 68, 0.3)',
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
            <span style={{ fontSize: '24px' }}>🚨</span>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)' }}>
              Civic Blackspot & Illegal Dumpsite Detection Portal
            </h2>
            <span style={{
              background: 'rgba(239, 68, 68, 0.2)',
              color: 'var(--color-danger)',
              border: '1px solid var(--color-danger)',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '20px',
              fontWeight: 700
            }}>
              Civic Cleanliness Engine
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '750px' }}>
            Identifies open garbage dumping hotspots, evaluates storm water drain blockage risks, and coordinates rapid municipal desilting taskforces. Diverted waste is routed directly to biomethanation and MRF facilities.
          </p>
        </div>

        <button
          onClick={loadData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-glass)',
            borderRadius: '10px',
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Hotspots</span>
        </button>
      </div>

      {/* Quick Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active Blackspots</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-danger)', marginTop: '4px' }}>
            {blackSpots.filter(s => s.status !== 'cleared').length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Urgent municipal clearing required
          </div>
        </div>

        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Drain Blockage Risk</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--accent-orange)', marginTop: '4px' }}>
            {blackSpots.filter(s => s.drainBlockageRisk && s.status !== 'cleared').length} Chokepoints
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Monitored during monsoon rains
          </div>
        </div>

        <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: '14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cleared & Diverted Waste</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-success)', marginTop: '4px' }}>
            {blackSpots.reduce((acc, s) => acc + (s.divertedWeightKg || 0), 0)} kg
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Prevented from open burning
          </div>
        </div>
      </div>

      {/* Blackspots List */}
      <div style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-glass)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
            Reported Vulnerability Points
          </h3>

          {/* Severity Filters */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'critical', 'moderate', 'low'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev as any)}
                style={{
                  background: filterSeverity === sev ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                  border: `1px solid ${filterSeverity === sev ? 'var(--accent-cyan)' : 'var(--border-glass)'}`,
                  color: filterSeverity === sev ? 'var(--text-primary)' : 'var(--text-muted)',
                  padding: '4px 10px',
                  borderRadius: '14px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  cursor: 'pointer'
                }}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredSpots.map(spot => (
            <div
              key={spot.id}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-glass)',
                borderRadius: '14px',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
                alignItems: 'center'
              }}
            >
              {/* Photo & Details */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <img
                  src={spot.photoUrl}
                  alt={spot.title}
                  style={{ width: '90px', height: '90px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-glass)' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>{spot.title}</span>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      background: spot.severity === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: spot.severity === 'critical' ? 'var(--color-danger)' : 'var(--accent-orange)'
                    }}>
                      {spot.severity.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {spot.location.address} ({spot.location.zone})
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Volume: <strong>{spot.estimatedVolumeM3} m³</strong> • Reported by: {spot.reportedBy}
                  </div>
                  {spot.drainBlockageRisk && (
                    <div style={{ fontSize: '10px', color: 'var(--color-danger)', fontWeight: 700, marginTop: '2px' }}>
                      ⚠️ High Risk of Storm Drain Blockage
                    </div>
                  )}
                </div>
              </div>

              {/* Status & Crew Dispatch Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Status</div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: spot.status === 'cleared' ? 'var(--color-success)' : spot.status === 'crew_dispatched' ? 'var(--accent-cyan)' : 'var(--color-danger)'
                  }}>
                    {spot.status.replace(/_/g, ' ').toUpperCase()}
                  </div>
                  {spot.assignedCrew && (
                    <div style={{ fontSize: '10px', color: 'var(--text-faint)' }}>{spot.assignedCrew}</div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {spot.status === 'reported' && (
                    <button
                      onClick={() => handleDispatchCrew(spot.id)}
                      disabled={dispatchingId === spot.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'var(--accent-cyan)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <Truck size={14} />
                      <span>{dispatchingId === spot.id ? 'Dispatching...' : 'Dispatch Clean-up Taskforce'}</span>
                    </button>
                  )}

                  {spot.status === 'crew_dispatched' && (
                    <button
                      onClick={() => handleResolveSpot(spot.id)}
                      disabled={resolvingId === spot.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'var(--color-success)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <CheckCircle2 size={14} />
                      <span>{resolvingId === spot.id ? 'Verifying...' : 'Mark Cleaned & Diverted'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CivicBlackSpotPortal;
