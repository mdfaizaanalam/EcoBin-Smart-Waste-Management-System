import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Award, 
  QrCode, 
  Recycle, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Sprout, 
  Zap, 
  Train, 
  ShoppingBag,
  Send,
  Camera,
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CitizenProfile, CitizenReward } from '../types/circular';
import { api } from '../services/api';

export const CitizenPortal: React.FC = () => {
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [rewards, setRewards] = useState<CitizenReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBinCode, setSelectedBinCode] = useState<string>('ECO-HYD-04');
  const [depositWasteType, setDepositWasteType] = useState<string>('recyclable');
  const [depositWeightKg, setDepositWeightKg] = useState<number>(2.5);
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, rRes] = await Promise.all([
        api.getCitizenProfile(),
        api.getRewards()
      ]);
      setProfile(pRes.profile);
      setRewards(rRes.rewards);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordDeposit = async () => {
    setIsDepositing(true);
    setSuccessMsg('');
    try {
      const res = await api.recordDeposit(selectedBinCode, depositWasteType, depositWeightKg);
      setProfile({ ...res.profile });
      setSuccessMsg(`🎉 Success! Deposited ${depositWeightKg}kg of ${depositWasteType}. Earned +${res.pointsEarned} Eco-Points!`);

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      alert(`Deposit failed: ${err.message}`);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleRedeem = async (reward: CitizenReward) => {
    setRedeemingId(reward.id);
    try {
      const res = await api.redeemReward(reward.id);
      if (profile) {
        setProfile({ ...profile, ecoPoints: res.remainingPoints });
      }
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.5 }
      });
      alert(`🎉 Voucher Redeemed! Code: ECO-${Math.random().toString(36).substring(2, 8).toUpperCase()}\nApplied: ${reward.discountValue}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(16, 185, 129, 0.15))',
        border: '1px solid rgba(245, 158, 11, 0.3)',
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
            <span style={{ fontSize: '24px' }}>🎁</span>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)' }}>
              Citizen Green Karma & Gamified Waste Rewards Portal
            </h2>
            <span style={{
              background: 'rgba(245, 158, 11, 0.2)',
              color: 'var(--accent-orange)',
              border: '1px solid var(--accent-orange)',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '20px',
              fontWeight: 700
            }}>
              Citizen Engagement
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '750px' }}>
            Incentivizing source segregation with instant Eco-Points. Citizens scan QR codes at smart bins, deposit sorted materials, and redeem points for public transit passes, power bill rebates, and zero-waste goods.
          </p>
        </div>

        {profile && (
          <div style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: '14px',
            padding: '12px 20px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Eco-Points Balance</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--accent-orange)' }}>
              {profile.ecoPoints.toLocaleString()} pts
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600 }}>
              {profile.rankTitle}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {/* Left Column: Smart QR Waste Deposit Simulator */}
        <div style={{
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-glass)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
              Scan & Deposit at Smart Bin
            </h3>
          </div>

          {successMsg && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--color-success)',
              color: 'var(--color-success)',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '12px',
              fontWeight: 600
            }}>
              {successMsg}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Smart Bin Code</label>
              <select
                value={selectedBinCode}
                onChange={e => setSelectedBinCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  marginTop: '4px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value="ECO-HYD-01">ECO-HYD-01 (Banjara Hills Rd 12 - Organic)</option>
                <option value="ECO-HYD-04">ECO-HYD-04 (HITEC City Cyber Towers - Recyclable)</option>
                <option value="ECO-HYD-08">ECO-HYD-08 (Gachibowli Stadium - E-Waste)</option>
                <option value="ECO-BLR-02">ECO-BLR-02 (MG Road Metro Station - Recyclable)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Waste Category</label>
              <select
                value={depositWasteType}
                onChange={e => setDepositWasteType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-primary)',
                  marginTop: '4px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value="recyclable">Dry Recyclable (Bottles, Cans, Paper) - 20 pts/kg</option>
                <option value="organic">Wet Organic (Compostable Food) - 10 pts/kg</option>
                <option value="e-waste">Domestic E-Waste (Chargers, PCBs, Batteries) - 50 pts/kg</option>
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Deposit Mass</span>
                <strong style={{ color: 'var(--accent-orange)' }}>{depositWeightKg} kg</strong>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={depositWeightKg}
                onChange={e => setDepositWeightKg(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-orange)', cursor: 'pointer' }}
              />
            </div>

            <button
              onClick={handleRecordDeposit}
              disabled={isDepositing}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'var(--accent-orange)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                marginTop: '6px'
              }}
            >
              <Coins size={16} />
              <span>{isDepositing ? 'Recording Deposit...' : 'Confirm Deposit & Earn Points'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Rewards Store */}
        <div style={{
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-glass)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gift size={20} color="var(--color-success)" />
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
              Rewards Redemption Store
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rewards.map(r => (
              <div
                key={r.id}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-primary)' }}>{r.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600, marginTop: '2px' }}>
                    {r.discountValue}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Sponsor: {r.sponsor}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => handleRedeem(r)}
                    disabled={redeemingId === r.id || (profile?.ecoPoints || 0) < r.pointsRequired}
                    style={{
                      background: (profile?.ecoPoints || 0) >= r.pointsRequired ? 'var(--color-success)' : 'var(--bg-tertiary)',
                      color: (profile?.ecoPoints || 0) >= r.pointsRequired ? '#fff' : 'var(--text-faint)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: (profile?.ecoPoints || 0) >= r.pointsRequired ? 'pointer' : 'not-allowed',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Redeem ({r.pointsRequired} pts)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenPortal;
