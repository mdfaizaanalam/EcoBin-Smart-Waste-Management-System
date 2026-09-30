import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Radio, 
  Terminal, 
  Sliders, 
  Zap, 
  Flame, 
  Thermometer, 
  Gauge, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Sun,
  ShieldAlert,
  Send,
  Activity
} from 'lucide-react';
import { SmartBinTelemetry } from '../types/circular';

interface IoTBenchProps {
  selectedCity?: string;
}

export const IoTBench: React.FC<IoTBenchProps> = ({ selectedCity = 'Hyderabad' }) => {
  // Sensor Simulator State
  const [distanceCm, setDistanceCm] = useState<number>(24);
  const [weightKg, setWeightKg] = useState<number>(48.5);
  const [gasPpm, setGasPpm] = useState<number>(195);
  const [temperatureC, setTemperatureC] = useState<number>(29.4);
  const [batteryPct, setBatteryPct] = useState<number>(94);
  const [solarCharging, setSolarCharging] = useState<boolean>(true);
  const [lidLocked, setLidLocked] = useState<boolean>(false);
  const [flameAlert, setFlameAlert] = useState<boolean>(false);
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [txSuccess, setTxSuccess] = useState<boolean>(false);

  // Serial Console Logs
  const [serialLogs, setSerialLogs] = useState<string[]>([
    `[BOOT] ESP32-WROOM-32D Dual Core Xtensa LX6 Initialized at 240MHz`,
    `[INIT] JSN-SR04T Waterproof Ultrasonic Sensor calibrated: Max Bin Depth = 120cm`,
    `[INIT] HX711 24-Bit ADC Tare completed (offset: 84210, scale: 22.4)`,
    `[INIT] MQ-135 Gas Pre-heating finished: Baseline R0 = 10.2 kOhm (VOC/NH3/CH4)`,
    `[RADIO] LoRaWAN Regional Frequency: IN865 (865.0625 MHz), SF7, BW 125kHz`,
    `[POWER] MPPT Solar Harvesting Active: 4.18V, 420mA charging current`
  ]);

  // Derived Fill Level (120cm tall container)
  const computedFillLevel = Math.min(100, Math.max(0, Math.round(((120 - distanceCm) / 120) * 100)));

  const handlePushTelemetry = () => {
    setIsTransmitting(true);
    setTxSuccess(false);

    const hexPayload = `01${computedFillLevel.toString(16).padStart(2, '0')}${Math.round(weightKg * 10).toString(16).padStart(4, '0')}${gasPpm.toString(16).padStart(4, '0')}`;
    const timestamp = new Date().toLocaleTimeString();

    setTimeout(() => {
      setSerialLogs(prev => [
        `[TX] LoRa packet queued: [${hexPayload}] (IN865 Uplink, Freq: 865.06MHz, Pwr: +14dBm)`,
        `[TELEMETRY] Fill: ${computedFillLevel}% | Wt: ${weightKg}kg | Gas: ${gasPpm}ppm | Temp: ${temperatureC}°C | Lid: ${lidLocked ? 'LOCKED' : 'UNLOCKED'}`,
        `[ACK] Municipal Gateway Node #7 responded: RSSI -84dBm, SNR +9.2dB at ${timestamp}`,
        ...prev.slice(0, 15)
      ]);
      setIsTransmitting(false);
      setTxSuccess(true);
      setTimeout(() => setTxSuccess(false), 3000);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.15))',
        border: '1px solid rgba(139, 92, 246, 0.3)',
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
            <span style={{ fontSize: '24px' }}>⚡</span>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)' }}>
              IoT Multi-Sensor Hardware Bench & Telemetry Simulator
            </h2>
            <span style={{
              background: 'rgba(139, 92, 246, 0.2)',
              color: 'var(--accent-purple)',
              border: '1px solid var(--accent-purple)',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '20px',
              fontWeight: 700
            }}>
              Pillar 2: Smart Garbage Bins
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '750px' }}>
            Live hardware-in-the-loop workbench with JSN-SR04T ultrasonic fill measurement, HX711 strain gauge tare weight, MQ-135 hazardous gas sniffer, remote servo lid actuation, and LoRaWAN IN865 packet telemetry.
          </p>
        </div>

        <button
          onClick={handlePushTelemetry}
          disabled={isTransmitting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: txSuccess ? 'var(--color-success)' : 'var(--accent-purple)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 20px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)'
          }}
        >
          {isTransmitting ? <RefreshCw size={16} className="spin" /> : <Send size={16} />}
          <span>{txSuccess ? 'Telemetry Transmitted!' : 'Transmit LoRaWAN Packet'}</span>
        </button>
      </div>

      {/* Main Grid: Left Controls & Right Visual Bin & Terminal */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '20px'
      }}>
        {/* Sensor Sliders & Controls */}
        <div style={{
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-glass)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="var(--accent-purple)" />
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
              Hardware Sensor Calibration
            </h3>
          </div>

          {/* 1. Ultrasonic Distance Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>JSN-SR04T Distance to Waste:</span>
              <strong style={{ color: 'var(--accent-cyan)' }}>{distanceCm} cm ({computedFillLevel}% Full)</strong>
            </div>
            <input
              type="range"
              min="5"
              max="115"
              value={distanceCm}
              onChange={e => setDistanceCm(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
              <span>5 cm (100% Overflow)</span>
              <span>115 cm (Empty)</span>
            </div>
          </div>

          {/* 2. HX711 Load Cell Weight Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>HX711 24-Bit Strain Gauge Weight:</span>
              <strong style={{ color: 'var(--accent-purple)' }}>{weightKg} kg / 80 kg</strong>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="0.5"
              value={weightKg}
              onChange={e => setWeightKg(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
              <span>0 kg (Tare)</span>
              <span>80 kg (Max Rated)</span>
            </div>
          </div>

          {/* 3. MQ-135 Gas Sniffer */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>MQ-135 Gas Sniffer (Methane/VOC):</span>
              <strong style={{ color: gasPpm > 350 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                {gasPpm} PPM {gasPpm > 350 ? '⚠️ High Fermentation' : '✓ Normal'}
              </strong>
            </div>
            <input
              type="range"
              min="50"
              max="600"
              value={gasPpm}
              onChange={e => setGasPpm(Number(e.target.value))}
              style={{ width: '100%', accentColor: gasPpm > 350 ? 'var(--color-danger)' : 'var(--color-success)', cursor: 'pointer' }}
            />
          </div>

          {/* Actuator Toggles */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-glass)'
          }}>
            {/* Lid Lock Actuator */}
            <button
              onClick={() => setLidLocked(!lidLocked)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: lidLocked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: `1px solid ${lidLocked ? 'var(--color-danger)' : 'var(--color-success)'}`,
                color: lidLocked ? 'var(--color-danger)' : 'var(--color-success)',
                padding: '10px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {lidLocked ? <Lock size={16} /> : <Unlock size={16} />}
              <span>{lidLocked ? 'Lid Locked' : 'Lid Unlocked'}</span>
            </button>

            {/* Fire Alarm Toggle */}
            <button
              onClick={() => setFlameAlert(!flameAlert)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: flameAlert ? 'var(--color-danger)' : 'var(--bg-secondary)',
                border: `1px solid ${flameAlert ? 'var(--color-danger)' : 'var(--border-glass)'}`,
                color: flameAlert ? '#fff' : 'var(--text-secondary)',
                padding: '10px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <Flame size={16} />
              <span>{flameAlert ? 'FIRE DETECTED' : 'Normal Temp'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Physical Bin Telemetry Visualization & Terminal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Status Metrics Box */}
          <div style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: '16px',
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px'
          }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Fill Level</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: computedFillLevel > 80 ? 'var(--color-danger)' : 'var(--accent-cyan)' }}>
                {computedFillLevel}%
              </div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Payload Mass</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-purple)' }}>
                {weightKg} kg
              </div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Solar Battery</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sun size={16} /> {batteryPct}%
              </div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Radio Link</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-info)' }}>
                LoRaWAN
              </div>
            </div>
          </div>

          {/* Serial Console Terminal Output */}
          <div style={{
            background: '#0a0e17',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontFamily: 'var(--font-mono)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981', fontWeight: 700 }}>
                <Terminal size={14} />
                <span>ESP32 UART0 Serial Log (115200 Baud)</span>
              </div>
              <span style={{ fontSize: '10px', color: '#64748b' }}>COM4 Connected</span>
            </div>

            <div style={{
              height: '180px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontSize: '11px',
              color: '#94a3b8',
              lineHeight: '1.5'
            }}>
              {serialLogs.map((log, i) => (
                <div key={i} style={{ color: log.includes('[ACK]') ? '#10b981' : log.includes('[TX]') ? '#06b6d4' : log.includes('ERR') ? '#ef4444' : '#cbd5e1' }}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IoTBench;
