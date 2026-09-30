import React, { useState, useEffect } from 'react';
import { 
  Gift, Award, QrCode, Recycle, TrendingUp, CheckCircle2, 
  AlertTriangle, Sparkles, Sprout, Zap, Train, ShoppingBag, 
  Send, ShieldAlert, Truck, Plus, RefreshCw, MapPin, Clock, Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CitizenProfile, CivicBlackSpot, BiomethanationEnergyMetric } from '../types/circular';
import { api } from '../services/api';

interface CitizenCivicHubProps {
  selectedCity?: string;
  onSelectBin?: (binId: string) => void;
}

interface LocalizedReward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  sponsor: string;
  category: 'transit' | 'utility' | 'eco' | 'voucher';
  icon: string;
}

const CITY_REWARDS_MAP: Record<string, LocalizedReward[]> = {
  Delhi: [
    { id: 'del-1', title: 'Delhi Metro (DMRC) Day Tourist Pass', description: '₹150 Travel Credit on Delhi Metro Smart Card', pointsCost: 150, sponsor: 'Delhi Metro Rail Corporation (DMRC)', category: 'transit', icon: '🚇' },
    { id: 'del-2', title: 'BSES Rajdhani Green Electricity Bill Rebate', description: '₹300 Direct Credit on monthly power bill', pointsCost: 300, sponsor: 'BSES Rajdhani / MCD Energy', category: 'utility', icon: '⚡' },
    { id: 'del-3', title: 'MCD Enriched Organic Vermicompost (5kg)', description: 'Free Doorstep Delivery by Delhi Horticulture Dept', pointsCost: 80, sponsor: 'Municipal Corp of Delhi (MCD)', category: 'eco', icon: '🌱' },
    { id: 'del-4', title: 'Delhi Zero-Waste Steel & Bamboo Kit', description: '₹400 Retail Value Reusable Lunch & Tumbler Set', pointsCost: 220, sponsor: 'Delhi Swachhata Circular Store', category: 'voucher', icon: '🛍️' },
  ],
  Mumbai: [
    { id: 'mum-1', title: 'Mumbai Metro & BEST Bus Smart Pass', description: '₹150 Top-up for Mumbai 1 Card', pointsCost: 150, sponsor: 'MMRDA & BEST Undertaking', category: 'transit', icon: '🚇' },
    { id: 'mum-2', title: 'MahaVitaran / Tata Power Bill Rebate', description: '₹300 Direct Discount on Residential Power Tariff', pointsCost: 300, sponsor: 'Tata Power / MahaVitaran', category: 'utility', icon: '⚡' },
    { id: 'mum-3', title: 'BMC Deonar Bio-Compost Sack (5kg)', description: 'Certified High-NPK Organic Fertilizer', pointsCost: 80, sponsor: 'Brihanmumbai Municipal Corp (BMC)', category: 'eco', icon: '🌱' },
    { id: 'mum-4', title: 'Khadi & Bamboo Zero-Waste Carry Bag Set', description: 'Handcrafted plastic-free totes voucher', pointsCost: 180, sponsor: 'BMC Coastal Environment Initiative', category: 'voucher', icon: '🛍️' },
  ],
  Bangalore: [
    { id: 'blr-1', title: 'Namma Metro Unlimited Day Transit Pass', description: '₹120 Top-up for BMRCL Transit Card', pointsCost: 150, sponsor: 'Bangalore Metro Rail Corporation Ltd', category: 'transit', icon: '🚇' },
    { id: 'blr-2', title: 'BESCOM Clean Energy Bill Rebate Voucher', description: '₹250 Direct Credit on monthly electricity bill', pointsCost: 280, sponsor: 'Bangalore Electricity Supply Company', category: 'utility', icon: '⚡' },
    { id: 'blr-3', title: 'BBMP Kannahalli Bio-Fertilizer Sack (5kg)', description: 'Doorstep delivered compost from organic waste', pointsCost: 80, sponsor: 'Bruhat Bengaluru Mahanagara Palike', category: 'eco', icon: '🌱' },
    { id: 'blr-4', title: 'Organic Farm Fresh Veggie Basket Voucher', description: '₹350 value redeemable at HOPCOMS outlets', pointsCost: 240, sponsor: 'Karnataka Horticulture Federation', category: 'voucher', icon: '🥦' },
  ],
  Pune: [
    { id: 'pun-1', title: 'Pune Metro (MahaMetro) Day Pass', description: '₹100 Smart Card Recharge Voucher', pointsCost: 140, sponsor: 'Maha Metro Rail Corporation', category: 'transit', icon: '🚇' },
    { id: 'pun-2', title: 'MSEDCL Clean Energy Bill Rebate', description: '₹250 Credit on electricity consumption bill', pointsCost: 280, sponsor: 'Maharashtra State Electricity Board', category: 'utility', icon: '⚡' },
    { id: 'pun-3', title: 'PMC Organic Bio-Compost Sack (5kg)', description: 'Doorstep delivery from Kothrud SWM Plant', pointsCost: 80, sponsor: 'Pune Municipal Corporation', category: 'eco', icon: '🌱' },
    { id: 'pun-4', title: 'Eco-Friendly Copper & Clay Dining Bottle', description: '₹300 retail voucher at Pune Green Outlets', pointsCost: 200, sponsor: 'PMC Environment Dept', category: 'voucher', icon: '🍶' },
  ],
  Ahmedabad: [
    { id: 'amd-1', title: 'Ahmedabad Metro & AMTS Green Transit Pass', description: '₹100 Smart Pass Recharge', pointsCost: 140, sponsor: 'Gujarat Metro Rail Corporation', category: 'transit', icon: '🚇' },
    { id: 'amd-2', title: 'Torrent Power Clean Energy Bill Voucher', description: '₹250 Direct Power Bill Credit', pointsCost: 280, sponsor: 'Torrent Power Ltd', category: 'utility', icon: '⚡' },
    { id: 'amd-3', title: 'AMC Pirana Enriched Compost Sack (5kg)', description: 'High-yield soil conditioner for urban gardens', pointsCost: 80, sponsor: 'Ahmedabad Municipal Corporation', category: 'eco', icon: '🌱' },
    { id: 'amd-4', title: 'Sabarmati Clean River Zero-Waste Kit', description: '₹300 voucher for bamboo brushes & stainless bottles', pointsCost: 200, sponsor: 'AMC Green Mission', category: 'voucher', icon: '🛍️' },
  ],
  Hyderabad: [
    { id: 'hyd-1', title: 'Hyderabad Metro Unlimited Day Pass', description: '₹100 Off Metro Smart Card Top-up', pointsCost: 150, sponsor: 'Hyderabad Metro Rail Corporation', category: 'transit', icon: '🚇' },
    { id: 'hyd-2', title: 'TSSPDCL Green Electricity Bill Rebate', description: '₹250 Direct Credit on Power Bill', pointsCost: 300, sponsor: 'Telangana Southern Power Distribution', category: 'utility', icon: '⚡' },
    { id: 'hyd-3', title: 'GHMC Enriched Organic Vermicompost (5kg)', description: 'Free Doorstep Delivery from Biomethanation Plants', pointsCost: 80, sponsor: 'GHMC Urban Forest Dept', category: 'eco', icon: '🌱' },
    { id: 'hyd-4', title: 'Zero-Waste Kitchen Starter Kit (Steel & Bamboo)', description: '₹350 Retail Value Voucher', pointsCost: 220, sponsor: 'EcoClean India Store', category: 'voucher', icon: '🛍️' },
  ]
};

interface HubCitizenProfile {
  citizenId: string;
  name: string;
  city: string;
  karmaLevel: string;
  pointsBalance: number;
  totalKgDiverted: number;
  co2AvoidedKg: number;
  badges: string[];
}

export const CitizenCivicHub: React.FC<CitizenCivicHubProps> = ({ selectedCity = 'Hyderabad' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'rewards' | 'blackspots'>('rewards');

  // Rewards state
  const [profile, setProfile] = useState<HubCitizenProfile>({
    citizenId: 'CIT-8849',
    name: 'Aarav Sharma',
    city: selectedCity,
    karmaLevel: 'Eco Champion (Tier 3)',
    pointsBalance: 680,
    totalKgDiverted: 48.5,
    co2AvoidedKg: 89.2,
    badges: ['Zero Waste Hero', '100% Segregator', 'Rapid Reporter']
  });
  const [availableBins, setAvailableBins] = useState<{ bin_id: string; label: string }[]>([]);
  const [selectedBinCode, setSelectedBinCode] = useState<string>('');
  const [depositWasteType, setDepositWasteType] = useState<string>('recyclable');
  const [depositWeightKg, setDepositWeightKg] = useState<number>(2.5);
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState('');
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  // Civic Blackspots state
  const [blackSpots, setBlackSpots] = useState<CivicBlackSpot[]>([]);
  const [energyMetric, setEnergyMetric] = useState<BiomethanationEnergyMetric | null>(null);
  const [loadingSpots, setLoadingSpots] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'moderate' | 'low'>('all');
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  // Load bins for the city
  useEffect(() => {
    const fetchCityBins = async () => {
      try {
        const cityParam = selectedCity === 'All' ? '' : `?city=${encodeURIComponent(selectedCity)}`;
        const res = await fetch(`/api/bins${cityParam}`);
        if (res.ok) {
          const binsData = await res.json();
          const mapped = binsData.slice(0, 15).map((b: any) => ({
            bin_id: b.bin_id,
            label: `${b.bin_id} (${b.street_name || b.area_name} - ${b.area_type})`
          }));
          setAvailableBins(mapped);
          if (mapped.length > 0) {
            setSelectedBinCode(mapped[0].bin_id);
          }
        }
      } catch (err) {
        console.error('Failed to load city bins:', err);
      }
    };
    fetchCityBins();
  }, [selectedCity]);

  // Load blackspots and biomethanation data for city
  useEffect(() => {
    const loadBlackspots = async () => {
      setLoadingSpots(true);
      try {
        const [spotsRes, energyRes] = await Promise.all([
          api.getBlackSpots(selectedCity),
          api.getBiomethanationEnergy(selectedCity)
        ]);
        setBlackSpots(spotsRes.blackSpots || []);
        setEnergyMetric(energyRes.energyMetric || null);
      } catch (err) {
        console.error('Failed to load blackspots:', err);
      } finally {
        setLoadingSpots(false);
      }
    };
    loadBlackspots();
  }, [selectedCity]);

  // Handle deposit waste
  const handleRecordDeposit = () => {
    setIsDepositing(true);
    setDepositSuccessMsg('');
    setTimeout(() => {
      const pointsEarned = Math.round(depositWeightKg * (depositWasteType === 'e-waste' ? 50 : depositWasteType === 'recyclable' ? 20 : 15));
      setProfile(prev => ({
        ...prev,
        pointsBalance: prev.pointsBalance + pointsEarned,
        totalKgDiverted: Number((prev.totalKgDiverted + depositWeightKg).toFixed(1)),
        co2AvoidedKg: Number((prev.co2AvoidedKg + depositWeightKg * 1.85).toFixed(1))
      }));
      setDepositSuccessMsg(`🎉 Success! Deposited ${depositWeightKg}kg at ${selectedBinCode}. Earned +${pointsEarned} Eco-Points!`);
      setIsDepositing(false);
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
    }, 500);
  };

  // Handle reward redemption
  const handleRedeem = (reward: LocalizedReward) => {
    if (profile.pointsBalance < reward.pointsCost) {
      alert(`Insufficient Eco-Points! You need ${reward.pointsCost} points for this reward.`);
      return;
    }
    setRedeemingId(reward.id);
    setTimeout(() => {
      setProfile(prev => ({
        ...prev,
        pointsBalance: prev.pointsBalance - reward.pointsCost
      }));
      setRedeemingId(null);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      alert(`🎉 Voucher redeemed! Confirmation SMS sent for: ${reward.title}`);
    }, 600);
  };

  // Handle dispatching cleanup crew
  const handleDispatchCrew = async (spotId: string) => {
    setDispatchingId(spotId);
    try {
      const crewName = `${selectedCity} Municipal Quick Clean Force #${Math.floor(Math.random() * 8) + 1}`;
      const res = await api.dispatchBlackSpotCrew(spotId, crewName);
      setBlackSpots(prev => prev.map(s => s.id === spotId ? res.blackSpot : s));
      confetti({ particleCount: 60, spread: 60 });
    } catch (err) {
      console.error(err);
    } finally {
      setDispatchingId(null);
    }
  };

  const currentRewards = CITY_REWARDS_MAP[selectedCity] || CITY_REWARDS_MAP.Delhi || [];
  const filteredSpots = blackSpots.filter(s => filterSeverity === 'all' || s.severity === filterSeverity);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Top Banner with Sub-Tab Switcher */}
      <div className="glass" style={{
        padding: '24px', borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(16, 185, 129, 0.08) 100%)',
        border: '1px solid rgba(234, 179, 8, 0.25)', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '28px' }}>🌟</span>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '22px', margin: 0, color: 'var(--text-primary)' }}>
              Citizen Green Karma & Civic Cleanliness Hub
            </h2>
            <span style={{
              fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px',
              background: 'rgba(234,179,8,0.15)', color: 'var(--accent-orange)', border: '1px solid rgba(234,179,8,0.3)'
            }}>
              {selectedCity} Civic Grid
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, maxWidth: '780px' }}>
            Incentivizing source segregation with instant Eco-Points for transit passes, electricity rebates, and zero-waste goods. Plus crowdsourced reporting of illegal dumping blackspots.
          </p>
        </div>

        {/* Sub-Tab Navigation Pills */}
        <div style={{
          display: 'flex', background: 'var(--bg-secondary)', padding: '4px',
          borderRadius: '10px', border: '1px solid var(--border-glass)'
        }}>
          <button
            onClick={() => setActiveSubTab('rewards')}
            style={{
              padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
              background: activeSubTab === 'rewards' ? 'var(--accent-orange)' : 'transparent',
              color: activeSubTab === 'rewards' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <Gift size={16} /> Green Karma & Rewards
          </button>
          <button
            onClick={() => setActiveSubTab('blackspots')}
            style={{
              padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
              background: activeSubTab === 'blackspots' ? 'var(--color-danger)' : 'transparent',
              color: activeSubTab === 'blackspots' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <ShieldAlert size={16} /> Civic Blackspots & Cleanliness
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: REWARDS & SMART DEPOSIT */}
      {activeSubTab === 'rewards' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Karma Profile Card */}
          <div className="glass" style={{
            padding: '20px', borderRadius: '14px', background: 'var(--bg-secondary)',
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', border: '1px solid var(--border-glass)'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Eco-Citizen Profile</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{profile.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 600 }}>{profile.karmaLevel}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Eco-Points Balance</div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--accent-orange)', fontFamily: 'Outfit' }}>
                {profile.pointsBalance} <span style={{ fontSize: '14px', fontWeight: 600 }}>pts</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Landfill Diverted</div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-success)', fontFamily: 'Outfit' }}>
                {profile.totalKgDiverted} <span style={{ fontSize: '14px', fontWeight: 600 }}>kg</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Carbon Offset</div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--accent-purple)', fontFamily: 'Outfit' }}>
                -{profile.co2AvoidedKg} <span style={{ fontSize: '14px', fontWeight: 600 }}>kg CO₂</span>
              </div>
            </div>
          </div>

          {/* Interactive Deposit + Redemption Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.4fr)', gap: '20px' }}>
            
            {/* Scan & Deposit Form */}
            <div className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <QrCode size={20} color="var(--accent-cyan)" />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
                  Smart Bin Scan & Deposit
                </h3>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                Select a smart bin in {selectedCity} to record waste deposit and earn real-time points.
              </p>

              {/* Bin Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Select Smart Bin in {selectedCity}:
                </label>
                <select
                  value={selectedBinCode}
                  onChange={e => setSelectedBinCode(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)',
                    fontSize: '13px', outline: 'none'
                  }}
                >
                  {availableBins.length > 0 ? (
                    availableBins.map(b => (
                      <option key={b.bin_id} value={b.bin_id} style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                        {b.label}
                      </option>
                    ))
                  ) : (
                    <option value="BIN-DEFAULT" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>BIN-01 ({selectedCity} Central Station)</option>
                  )}
                </select>
              </div>

              {/* Waste Category */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Waste Stream:
                </label>
                <select
                  value={depositWasteType}
                  onChange={e => setDepositWasteType(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-primary)',
                    fontSize: '13px', outline: 'none'
                  }}
                >
                  <option value="recyclable">Dry Recyclable (Plastics, Cans, Paper) · 20 pts/kg</option>
                  <option value="e-waste">E-Waste (Electronics, Cables, Batteries) · 50 pts/kg</option>
                  <option value="organic">Organic Wet Waste (Compostable) · 15 pts/kg</option>
                </select>
              </div>

              {/* Weight Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '11px' }}>Deposit Mass:</span>
                  <span style={{ fontWeight: 800, color: 'var(--accent-orange)' }}>{depositWeightKg} kg</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="15"
                  step="0.5"
                  value={depositWeightKg}
                  onChange={e => setDepositWeightKg(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-orange)' }}
                />
              </div>

              {depositSuccessMsg && (
                <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: 'var(--color-success)', fontSize: '12px' }}>
                  {depositSuccessMsg}
                </div>
              )}

              <button
                onClick={handleRecordDeposit}
                disabled={isDepositing}
                style={{
                  padding: '12px', background: 'var(--accent-orange)', color: '#fff', border: 'none',
                  borderRadius: '10px', fontWeight: 800, fontSize: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px'
                }}
              >
                <Recycle size={18} /> {isDepositing ? 'Recording Deposit...' : 'Confirm Deposit & Earn Points'}
              </button>
            </div>

            {/* City Rewards Catalog */}
            <div className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Gift size={20} color="var(--accent-orange)" />
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
                    {selectedCity} Rewards Redemption Store
                  </h3>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  Sponsored by Local Municipal Utilities
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                {currentRewards.map(reward => (
                  <div
                    key={reward.id}
                    style={{
                      background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)',
                      borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column',
                      justifyContent: 'space-between', gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{reward.icon}</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.3 }}>
                        {reward.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        {reward.description}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        Sponsor: {reward.sponsor}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '10px' }}>
                      <span style={{ fontWeight: 800, color: 'var(--accent-orange)', fontSize: '14px' }}>
                        {reward.pointsCost} pts
                      </span>
                      <button
                        onClick={() => handleRedeem(reward)}
                        disabled={redeemingId === reward.id}
                        style={{
                          padding: '6px 14px', borderRadius: '8px', border: 'none',
                          background: profile.pointsBalance >= reward.pointsCost ? 'var(--color-success)' : 'rgba(255,255,255,0.08)',
                          color: '#fff', fontSize: '12px', fontWeight: 700, cursor: profile.pointsBalance >= reward.pointsCost ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {redeemingId === reward.id ? 'Redeeming...' : 'Redeem'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CIVIC BLACKSPOTS & DUMPING REPORTS */}
      {activeSubTab === 'blackspots' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Biomethanation & Cleanliness Header Metrics */}
          {energyMetric && (
            <div className="glass" style={{
              padding: '20px', borderRadius: '14px', background: 'var(--bg-secondary)',
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Municipal Plant</div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{energyMetric.plantName}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Daily Organic Input</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--color-success)', fontFamily: 'Outfit' }}>
                  {energyMetric.dailyOrganicInputTonnes} <span style={{ fontSize: '13px' }}>TPD</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Bio-CNG Produced</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--accent-orange)', fontFamily: 'Outfit' }}>
                  {energyMetric.bioCngProducedKg.toLocaleString()} <span style={{ fontSize: '13px' }}>kg/day</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>CO₂e Avoided</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--accent-cyan)', fontFamily: 'Outfit' }}>
                  {energyMetric.co2eAvoidedTonnes} <span style={{ fontSize: '13px' }}>Tons/day</span>
                </div>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Filter Severity:</span>
              {(['all', 'critical', 'moderate', 'low'] as const).map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  style={{
                    padding: '5px 12px', borderRadius: '16px', border: '1px solid var(--border-glass)',
                    background: filterSeverity === sev ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
                    color: filterSeverity === sev ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: '11px', cursor: 'pointer', textTransform: 'capitalize'
                  }}
                >
                  {sev}
                </button>
              ))}
            </div>

            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredSpots.length}</strong> active civic blackspots in {selectedCity}
            </span>
          </div>

          {/* Blackspots Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
            {filteredSpots.map(spot => (
              <div
                key={spot.id}
                className="glass"
                style={{
                  padding: '18px', borderRadius: '14px', background: 'var(--bg-secondary)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px',
                  borderTop: `4px solid ${spot.severity === 'critical' ? 'var(--color-danger)' : spot.severity === 'moderate' ? 'var(--accent-orange)' : 'var(--color-success)'}`
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {spot.title}
                    </h4>
                    <span style={{
                      padding: '3px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800,
                      textTransform: 'uppercase',
                      background: spot.severity === 'critical' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                      color: spot.severity === 'critical' ? 'var(--color-danger)' : 'var(--accent-orange)'
                    }}>
                      {spot.severity}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                    <MapPin size={13} color="var(--accent-cyan)" />
                    {spot.location.address}
                  </div>

                  {spot.photoUrl && (
                    <img
                      src={spot.photoUrl}
                      alt="Blackspot"
                      style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                    />
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {spot.wasteComposition.map(w => (
                      <span key={w} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                        {w}
                      </span>
                    ))}
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Est. Volume: <strong>{spot.estimatedVolumeM3} m³</strong> · Drain Risk: {spot.drainBlockageRisk ? '⚠️ High' : 'Low'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: spot.status === 'cleared' ? 'var(--color-success)' : spot.status === 'crew_dispatched' ? 'var(--accent-cyan)' : 'var(--accent-orange)' }}>
                    Status: {spot.status.replace('_', ' ').toUpperCase()}
                  </span>

                  {spot.status !== 'cleared' && (
                    <button
                      onClick={() => handleDispatchCrew(spot.id)}
                      disabled={dispatchingId === spot.id}
                      style={{
                        padding: '6px 14px', background: 'var(--accent-cyan)', color: '#ffffff',
                        border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      <Truck size={14} /> {dispatchingId === spot.id ? 'Dispatching...' : 'Dispatch Cleanup Crew'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenCivicHub;
