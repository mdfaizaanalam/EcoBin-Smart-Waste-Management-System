import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Zap, 
  Info, 
  Cpu, 
  Copy, 
  Check, 
  Send, 
  Activity, 
  Radio, 
  AlertTriangle, 
  CheckCircle2,
  Layers
} from 'lucide-react';

interface SimulationControlsProps {
  isRunning: boolean;
  currentSpeed: number;
  onStart: (speed: number) => void;
  onStop: () => void;
  onReset: () => void;
  bins?: { bin_id: string; current_fill_percentage: number; area_type: string }[];
}

const SPEED_OPTIONS = [
  { value: 1, label: '1×', desc: '1 hr/min' },
  { value: 5, label: '5×', desc: '1 hr/12s' },
  { value: 10, label: '10×', desc: '1 hr/6s' },
  { value: 30, label: '30×', desc: '1 hr/2s' },
  { value: 60, label: '60×', desc: 'Max speed' },
];

const ARDUINO_ESP32_CODE = `// ESP32 Arduino C++ Firmware — EcoBin Autonomous Telemetry
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "MUNICIPAL_CORP_IOT";
const char* password = "ECOBIN_SECURE_WPA2";
const char* serverUrl = "http://YOUR_SERVER:8000/api/bin/update";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\\nWiFi Connected. IP: " + WiFi.localIP().toString());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    float distanceCm = readUltrasonicSonar();   // JSN-SR04T Waterproof Sonar
    float fillPct = constrain((1.0 - (distanceCm / 120.0)) * 100.0, 0.0, 100.0);
    float batteryV = readBatteryVoltage();      // Solar MPPT ADC
    float ambientC = readInternalTemp();        // Onboard Sensor

    String jsonPayload = "{";
    jsonPayload += "\\"bin_id\\":\\"BIN001\\",";
    jsonPayload += "\\"fill_percentage\\":" + String(fillPct, 1) + ",";
    jsonPayload += "\\"battery\\":" + String(batteryV, 1) + ",";
    jsonPayload += "\\"temperature\\":" + String(ambientC, 1) + ",";
    jsonPayload += "\\"latitude\\":17.3850,";
    jsonPayload += "\\"longitude\\":78.4867";
    jsonPayload += "}";

    int httpCode = http.POST(jsonPayload);
    if (httpCode > 0) {
      String response = http.getString();
      Serial.println("[UPLINK OK] Code " + String(httpCode) + " -> " + response);
    } else {
      Serial.println("[ERR] POST Failed: " + http.errorToString(httpCode));
    }
    http.end();
  }
  delay(300000); // Transmit every 5 minutes
}`;

const SimulationControls: React.FC<SimulationControlsProps> = ({
  isRunning, currentSpeed, onStart, onStop, onReset, bins = []
}) => {
  const [selectedSpeed, setSelectedSpeed] = useState(5);
  const [copiedCode, setCopiedCode] = useState(false);
  const [testPingSending, setTestPingSending] = useState(false);
  const [testPingResult, setTestPingResult] = useState<{ status: string; code?: number; timeMs?: number } | null>(null);

  const criticalBins = bins.filter(b => (b.current_fill_percentage ?? 0) >= 80);
  const warningBins = bins.filter(b => (b.current_fill_percentage ?? 0) >= 50 && (b.current_fill_percentage ?? 0) < 80);
  const normalBins = bins.filter(b => (b.current_fill_percentage ?? 0) < 50);
  const avgFill = bins.length > 0 ? bins.reduce((s, b) => s + (b.current_fill_percentage ?? 0), 0) / bins.length : 0;

  // Sorted bins for live activity monitor (top 6 highest fill)
  const topBins = [...bins].sort((a, b) => (b.current_fill_percentage ?? 0) - (a.current_fill_percentage ?? 0)).slice(0, 6);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ARDUINO_ESP32_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSendTestPing = async () => {
    setTestPingSending(true);
    setTestPingResult(null);
    const startTime = performance.now();

    try {
      const targetBinId = bins.length > 0 ? bins[0].bin_id : 'BIN001';
      const simulatedFill = Math.min(99, Math.max(10, Math.round(avgFill + (Math.random() * 8 - 4))));

      const res = await fetch('/api/bin/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bin_id: targetBinId,
          fill_percentage: simulatedFill,
          battery: 92.4,
          temperature: 28.5,
          latitude: 17.3850,
          longitude: 78.4867
        })
      });

      const elapsed = Math.round(performance.now() - startTime);
      if (res.ok) {
        const json = await res.json();
        setTestPingResult({ status: json.status || 'accepted', code: res.status, timeMs: elapsed });
      } else {
        setTestPingResult({ status: `HTTP ${res.status}`, code: res.status, timeMs: elapsed });
      }
    } catch (err: any) {
      setTestPingResult({ status: 'Network Error', timeMs: Math.round(performance.now() - startTime) });
    } finally {
      setTestPingSending(false);
      setTimeout(() => setTestPingResult(null), 5000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      
      {/* Top Banner Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(59, 130, 246, 0.12))',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        borderRadius: '16px',
        padding: '22px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(6, 182, 212, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-cyan)'
          }}>
            <Cpu size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '20px', color: 'var(--text-primary)', margin: 0 }}>
                IoT Fleet Simulation Engine & Hardware Bridge
              </h2>
              <span style={{
                background: isRunning ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                color: isRunning ? 'var(--color-success)' : 'var(--text-muted)',
                border: `1px solid ${isRunning ? 'var(--color-success)' : 'rgba(255,255,255,0.1)'}`,
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '20px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isRunning ? 'var(--color-success)' : 'var(--text-muted)'
                }} />
                {isRunning ? `LIVE (${currentSpeed}× Speed)` : 'IDLE / STOPPED'}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>
              Real-time multi-bin telemetry clock driving predictive fill progression, alert triggers, and Google OR-Tools CVRP dynamic routing.
            </p>
          </div>
        </div>

        {/* Quick Action Reset */}
        <button 
          onClick={onReset} 
          disabled={isRunning}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.06)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-glass)',
            borderRadius: '10px',
            padding: '10px 16px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.5 : 1,
            transition: 'all 0.2s ease'
          }}
          title="Reset all bins to initial baseline states"
        >
          <RotateCcw size={14} />
          <span>Reset All Bins</span>
        </button>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
        gap: '24px'
      }}>

        {/* LEFT COLUMN: Controls, Fleet KPIs & Live Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Engine Controller Card */}
          <div style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: '16px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Simulation Clock Controller
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {isRunning
                    ? `Advancing fleet fill rates at ${currentSpeed}× clock speed · ~${currentSpeed.toFixed(0)} hours simulated per minute`
                    : 'Engine paused · Select acceleration speed multiplier and click Start'}
                </p>
              </div>
            </div>

            {/* Speed Selector Presets */}
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: '8px' }}>
                Clock Multiplier Presets
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {SPEED_OPTIONS.map(s => {
                  const isActive = selectedSpeed === s.value;
                  return (
                    <button 
                      key={s.value}
                      onClick={() => setSelectedSpeed(s.value)}
                      disabled={isRunning}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px 6px',
                        background: isActive ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border-glass)'}`,
                        borderRadius: '10px',
                        cursor: isRunning ? 'not-allowed' : 'pointer',
                        opacity: isRunning && !isActive ? 0.4 : 1,
                        transition: 'all 0.2s ease'
                      }}
                      title={s.desc}
                    >
                      <span style={{ 
                        fontFamily: 'Outfit', 
                        fontWeight: 800, 
                        fontSize: '14px', 
                        color: isActive ? 'var(--accent-cyan)' : 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        <Zap size={11} /> {s.label}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {!isRunning ? (
                <button 
                  onClick={() => onStart(selectedSpeed)} 
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '13px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)'
                  }}
                >
                  <Play size={16} fill="currentColor" /> Start Multi-Bin Simulation
                </button>
              ) : (
                <button 
                  onClick={onStop} 
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'var(--color-danger)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '13px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)'
                  }}
                >
                  <Square size={16} fill="currentColor" /> Stop Simulation
                </button>
              )}
            </div>
          </div>

          {/* Fleet Status KPIs (4 Box Grid) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px'
          }}>
            {/* Avg Fill */}
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '14px', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>Avg Fill Level</div>
              <div style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '4px' }}>
                {avgFill.toFixed(1)}%
              </div>
              <div style={{ marginTop: '8px', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${avgFill}%`, 
                    background: avgFill >= 80 ? 'var(--color-danger)' : avgFill >= 50 ? 'var(--color-warning)' : 'var(--color-success)',
                    transition: 'width 0.4s ease'
                  }} 
                />
              </div>
            </div>

            {/* Critical Bins */}
            <div style={{ background: 'var(--color-danger-dim)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '14px', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-danger)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>Critical Bins</div>
              <div style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, color: 'var(--color-danger)', marginTop: '4px' }}>
                {criticalBins.length}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(239,68,68,0.8)', marginTop: '4px' }}>≥ 80% urgent pickup</div>
            </div>

            {/* Warning Bins */}
            <div style={{ background: 'var(--color-warning-dim)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '14px', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-warning)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>Warning Bins</div>
              <div style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, color: 'var(--color-warning)', marginTop: '4px' }}>
                {warningBins.length}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(245,158,11,0.8)', marginTop: '4px' }}>50–80% monitoring</div>
            </div>

            {/* Total Active Bins */}
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '14px', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>Active Fleet</div>
              <div style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {bins.length}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-success)', marginTop: '4px' }}>{normalBins.length} normal capacity</div>
            </div>
          </div>

          {/* Real-time Bins Activity Feed */}
          <div style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: '16px',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} color="var(--accent-cyan)" />
                <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                  Live Bins Telemetry Stream
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Top Highest Fill Bins</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topBins.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
                  No active bin telemetry available.
                </div>
              ) : (
                topBins.map(b => {
                  const fill = Math.round(b.current_fill_percentage ?? 0);
                  const isCrit = fill >= 80;
                  const isWarn = fill >= 50 && fill < 80;
                  const color = isCrit ? 'var(--color-danger)' : isWarn ? 'var(--color-warning)' : 'var(--color-success)';

                  return (
                    <div 
                      key={b.bin_id} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontFamily: 'JetBrains Mono',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          background: 'rgba(255,255,255,0.06)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {b.bin_id}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {b.area_type || 'Municipal Zone'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '140px' }}>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${fill}%`, background: color, transition: 'width 0.3s ease' }} />
                        </div>
                        <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '13px', color: color, width: '38px', textAlign: 'right' }}>
                          {fill}%
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Architecture, Interactive Test Ping & ESP32 Code */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* IoT Architecture Info Box */}
          <div style={{
            background: 'rgba(6,182,212,0.06)', 
            border: '1px solid rgba(6,182,212,0.25)',
            borderRadius: '16px', 
            padding: '18px 20px', 
            display: 'flex', 
            gap: '14px', 
            alignItems: 'flex-start'
          }}>
            <Info size={20} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '15px', marginBottom: '4px' }}>
                Hardware-Identical Ingestion Architecture
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                This simulator calls the <code style={{ fontFamily: 'JetBrains Mono', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', color: '#06b6d4' }}>POST /api/bin/update</code> endpoint —
                the exact same endpoint physical ESP32 devices utilize. When real hardware boots,
                simply point devices to this URL and stop the simulator. <strong style={{ color: 'var(--text-primary)' }}>Zero backend modifications required.</strong>
              </p>
            </div>
          </div>

          {/* Interactive Live IoT Test Ping Tool */}
          <div style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={16} color="var(--accent-purple)" />
                <h4 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>
                  Test Live IoT Ping (POST /api/bin/update)
                </h4>
              </div>
              {testPingResult && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: testPingResult.status === 'accepted' ? 'var(--color-success)' : 'var(--color-danger)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {testPingResult.status === 'accepted' ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                  {testPingResult.status} ({testPingResult.timeMs}ms)
                </span>
              )}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Trigger an instant mock ESP32 telemetry packet to verify that the FastAPI ingestion pipeline, database models, and WebSocket alerts respond in milliseconds.
            </p>

            <button
              onClick={handleSendTestPing}
              disabled={testPingSending}
              style={{
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(139, 92, 246, 0.15)',
                color: 'var(--accent-purple)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                borderRadius: '8px',
                padding: '9px 16px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: testPingSending ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Send size={13} />
              <span>{testPingSending ? 'Transmitting...' : 'Dispatch Test ESP32 Telemetry Ping'}</span>
            </button>
          </div>

          {/* ESP32 Arduino C++ Code Reference Card */}
          <div style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={16} color="var(--accent-cyan)" />
                <h4 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>
                  ESP32 Production Firmware Reference
                </h4>
              </div>

              <button
                onClick={handleCopyCode}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: copiedCode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  color: copiedCode ? 'var(--color-success)' : 'var(--text-secondary)',
                  border: `1px solid ${copiedCode ? 'var(--color-success)' : 'var(--border-glass)'}`,
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <pre style={{
              background: '#0a0e17',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              color: '#10b981',
              overflowX: 'auto',
              lineHeight: 1.6,
              maxHeight: '340px',
              margin: 0
            }}>
              {ARDUINO_ESP32_CODE}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};

export default SimulationControls;
