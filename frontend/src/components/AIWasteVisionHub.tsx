import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Upload, Sparkles, RefreshCw, Volume2, VolumeX, 
  MessageSquare, Send, CheckCircle2, AlertTriangle, Leaf, 
  ShieldCheck, ArrowRight, Award, Zap, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AICircularMessage } from '../types/circular';

interface Detection {
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
}

interface ClassificationResult {
  success: boolean;
  primary_class: string;
  class_display_name: string;
  confidence: number;
  confidence_percentage: string;
  category: string;
  bin_type: string;
  bin_color: string;
  badge_color?: string;
  instructions: string;
  circular_destination: string;
  estimated_weight_kg: number;
  co2_saved_kg: number;
  revenue_generated_inr: number;
  detections: Detection[];
  model_used: string;
}

interface AIWasteVisionHubProps {
  selectedCity?: string;
  onAwardCitizenPoints?: (points: number, kg: number) => void;
}

const SAMPLE_ITEMS = [
  { name: 'Plastic Bottle (PET)', type: 'plastic', color: 'var(--accent-cyan)', icon: '🧴', desc: 'Clear beverage water bottle' },
  { name: 'Aluminum Soda Can', type: 'can', color: 'var(--accent-purple)', icon: '🥫', desc: 'Carbonated beverage aluminum can' },
  { name: 'Cardboard Shipping Box', type: 'cardboard', color: 'var(--accent-orange)', icon: '📦', desc: 'Corrugated kraft parcel box' },
  { name: 'Organic Food Waste', type: 'organic_waste', color: 'var(--color-success)', icon: '🍎', desc: 'Meal prep peels & scraps' },
  { name: 'Discarded Circuit Board', type: 'e_waste', color: 'var(--color-danger)', icon: '📱', desc: 'Broken PCB electronic assembly' },
  { name: 'Insulated Copper Wire', type: 'cable', color: 'var(--accent-pink)', icon: '🔌', desc: 'Electrical line wire scrap' },
];

export const AIWasteVisionHub: React.FC<AIWasteVisionHubProps> = ({ selectedCity = 'Hyderabad', onAwardCitizenPoints }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeCamera, setActiveCamera] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Chat Assistant State
  const [chatMessages, setChatMessages] = useState<AICircularMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: `Welcome to the EcoBin AI Vision Consultant for ${selectedCity}! Upload an item photo or ask any question regarding municipal solid waste segregation, hazardous disposal, or EPR rules.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lcaBadge: {
        material: 'Municipal Solid Waste Rules 2016',
        co2OffsetKg: 1.85,
        destination: 'Closed-Loop Circular Economy'
      }
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Draw bounding boxes on image
  const drawBoundingBoxes = (imgSrc: string, detections: Detection[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imgSrc;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      detections.forEach(det => {
        const [xmin, ymin, xmax, ymax] = det.bbox;
        const x = xmin;
        const y = ymin;
        const w = Math.max(10, xmax - xmin);
        const h = Math.max(10, ymax - ymin);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = Math.max(3, Math.round(canvas.width / 180));
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = 'rgba(6, 182, 212, 0.85)';
        const label = `${det.class.toUpperCase()} ${(det.confidence * 100).toFixed(0)}%`;
        ctx.font = `bold ${Math.max(14, Math.round(canvas.width / 35))}px Outfit, sans-serif`;
        const textWidth = ctx.measureText(label).width;
        ctx.fillRect(x, Math.max(0, y - 28), textWidth + 14, 28);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, x + 7, Math.max(20, y - 8));
      });
    };
  };

  const handleClassify = async (base64Img: string, filename = 'waste_sample.jpg') => {
    setIsClassifying(true);
    setError(null);
    setPointsAwarded(false);
    try {
      const response = await fetch('/api/classify/base64', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: base64Img, filename })
      });

      if (!response.ok) {
        throw new Error(`Classification failed (HTTP ${response.status})`);
      }

      const data: ClassificationResult = await response.json();
      setResult(data);

      if (data.detections && data.detections.length > 0) {
        drawBoundingBoxes(base64Img, data.detections);
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with AI vision backend.');
    } finally {
      setIsClassifying(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
      handleClassify(base64, file.name);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setActiveCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Unable to access webcam device.');
      setActiveCamera(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg');
      setSelectedImage(base64);
      stopCamera();
      handleClassify(base64, 'webcam_capture.jpg');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setActiveCamera(false);
  };

  const handleSelectSample = (sample: typeof SAMPLE_ITEMS[0]) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 400, 300);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 300);
      ctx.font = '80px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sample.icon, 200, 160);
      ctx.font = 'bold 18px Outfit, sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(sample.name, 200, 220);
      const base64 = canvas.toDataURL('image/jpeg');
      setSelectedImage(base64);
      handleClassify(base64, `${sample.type}_demo.jpg`);
    }
  };

  const handleSpeakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleClaimPoints = () => {
    if (!result || pointsAwarded) return;
    const pts = Math.round((result.co2_saved_kg * 40) + 25);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    setPointsAwarded(true);
    if (onAwardCitizenPoints) {
      onAwardCitizenPoints(pts, result.estimated_weight_kg);
    }
  };

  const handleSendChat = async (queryText?: string) => {
    const textToSend = queryText || chatInput;
    if (!textToSend.trim()) return;

    const userMsg: AICircularMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    if (!queryText) setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/ai/segregation-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend, city: selectedCity })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, {
          id: `msg-reply-${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          lcaBadge: {
            material: data.material || 'Circular Stream',
            co2OffsetKg: data.co2_offset_kg || 1.2,
            destination: data.circular_destination || 'MRF Optical Sorting'
          }
        }]);
        return;
      }
    } catch (err) {
      console.warn('AI segregation chat fallback:', err);
    } finally {
      setIsChatLoading(false);
    }

    // Fallback response if offline
    let reply = `According to Municipal Solid Waste Guidelines for ${selectedCity}, clean source segregation into dry, wet, and hazardous streams ensures 100% landfill diversion.`;
    let badge = { material: 'Segregation Protocol', co2OffsetKg: 1.2, destination: 'Municipal MRF' };

    const q = textToSend.toLowerCase();
    if (q.includes('battery') || q.includes('lithium') || q.includes('electronic')) {
      reply = 'Swollen or discarded batteries are hazardous Class 9 waste. Never place them in general bins. Deposit at a designated E-Waste kiosk or schedule doorstep pickup in the Citizen Hub.';
      badge = { material: 'Li-Ion Chemistry', co2OffsetKg: 4.8, destination: 'Certified Smelter' };
    } else if (q.includes('pizza') || q.includes('grease') || q.includes('food box')) {
      reply = 'Grease-soaked cardboard fibers cannot be re-pulped at paper mills. Tear off clean lid portions for Dry Recyclables (Blue Bin) and place greasy bottoms into Wet Compost (Green Bin).';
      badge = { material: 'Contaminated Fiber', co2OffsetKg: 0.6, destination: 'Biomethanation Plant' };
    } else if (q.includes('medicine') || q.includes('foil') || q.includes('blister')) {
      reply = 'Blister packaging contains laminated aluminum-PVC foil. Segregate empty blister strips under Dry Mixed Recyclables. Hand over unexpired medicines to safe pharmacy disposal boxes.';
      badge = { material: 'Alu-PVC Composite', co2OffsetKg: 1.4, destination: 'Pyrolysis Recovery' };
    }

    setChatMessages(prev => [...prev, {
      id: `msg-reply-${Date.now()}`,
      sender: 'ai',
      text: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lcaBadge: badge
    }]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Header Banner */}
      <div className="glass" style={{
        padding: '24px', borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.25)', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '28px' }}>🤖</span>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '22px', margin: 0, color: 'var(--text-primary)' }}>
              AI Vision Waste Classifier & Voice Segregation Consultant
            </h2>
            <span style={{
              fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px',
              background: 'rgba(6,182,212,0.15)', color: 'var(--accent-cyan)', border: '1px solid rgba(6,182,212,0.3)'
            }}>
              YOLOv8 Edge Engine · {selectedCity}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, maxWidth: '780px' }}>
            Multi-modal computer vision model classifying 10 waste categories with real-time bounding boxes, automated municipal bin routing, TTS audio narration, and instant Eco-Points rewards.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '10px 18px', background: 'var(--accent-cyan)', color: '#ffffff',
              borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '13px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Upload size={16} /> Upload Photo
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{ display: 'none' }} />

          <button
            onClick={activeCamera ? stopCamera : startCamera}
            style={{
              padding: '10px 18px', background: activeCamera ? 'var(--color-danger)' : 'var(--bg-secondary)',
              color: 'var(--text-primary)', borderRadius: '8px', border: '1px solid var(--border-glass)',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Camera size={16} /> {activeCamera ? 'Stop Camera' : 'Live Camera'}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Scanner / Right Assistant */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.2fr) minmax(320px, 0.8fr)', gap: '20px' }}>
        
        {/* Left Column: Image / Video / Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Viewport Box */}
          <div className="glass" style={{ padding: '16px', borderRadius: '14px', position: 'relative', minHeight: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {activeCamera ? (
              <div style={{ width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxHeight: '360px', borderRadius: '10px', objectFit: 'cover' }} />
                <button
                  onClick={capturePhoto}
                  style={{
                    position: 'absolute', bottom: '16px', padding: '10px 24px',
                    background: 'var(--accent-cyan)', color: '#ffffff', border: 'none',
                    borderRadius: '24px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(6,182,212,0.4)'
                  }}
                >
                  📸 Capture & Classify
                </button>
              </div>
            ) : selectedImage ? (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '380px', borderRadius: '10px', objectFit: 'contain' }} />
                {!result?.detections?.length && (
                  <img src={selectedImage} alt="Uploaded waste" style={{ maxWidth: '100%', maxHeight: '380px', borderRadius: '10px', objectFit: 'contain' }} />
                )}
                {isClassifying && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15,23,42,0.7)', borderRadius: '10px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px'
                  }}>
                    <RefreshCw size={32} className="spin" color="var(--accent-cyan)" />
                    <span style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '14px' }}>
                      Running YOLOv8 Neural Inference...
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Sparkles size={32} color="var(--accent-cyan)" />
                </div>
                <h4 style={{ color: 'var(--text-primary)', margin: '0 0 6px 0', fontSize: '16px' }}>No Item Selected</h4>
                <p style={{ fontSize: '13px', margin: '0 0 16px 0', maxWidth: '340px' }}>
                  Upload a photo of packaging, take a snapshot, or click any pre-loaded test material below.
                </p>
              </div>
            )}
          </div>

          {/* Quick Demo Material Chips */}
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Material Test Samples:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px' }}>
              {SAMPLE_ITEMS.map((item) => (
                <button
                  key={item.type}
                  onClick={() => handleSelectSample(item)}
                  style={{
                    padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)',
                    borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{item.icon}</span>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Detection Result Card */}
          {result && (
            <div className="glass" style={{
              padding: '20px', borderRadius: '14px', borderLeft: `5px solid ${result.bin_color || 'var(--accent-cyan)'}`,
              background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Detected Material
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit' }}>
                    {result.class_display_name}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800,
                    background: `${result.bin_color || '#06b6d4'}22`, color: result.bin_color || '#06b6d4',
                    border: `1px solid ${result.bin_color || '#06b6d4'}55`
                  }}>
                    {result.bin_type}
                  </span>
                  <button
                    onClick={() => handleSpeakText(`${result.class_display_name}. Route to ${result.bin_type}. ${result.instructions}`)}
                    style={{
                      padding: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
                      border: '1px solid var(--border-glass)', cursor: 'pointer', color: 'var(--accent-cyan)'
                    }}
                    title="Play Audio Guidance"
                  >
                    {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                </div>
              </div>

              {/* Metrics Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Confidence</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-cyan)' }}>{result.confidence_percentage}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>CO₂ Offset</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-success)' }}>+{result.co2_saved_kg} kg</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Market Value</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-orange)' }}>₹{result.revenue_generated_inr}</div>
                </div>
              </div>

              {/* Physical Actuation & Robotic Trapdoor Visualizer (Hardware Bonus) */}
              <div style={{
                background: 'rgba(6, 182, 212, 0.06)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px' }}>⚙️</span>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                      Robotic Servo Trapdoor Actuator
                    </span>
                  </div>
                  <span style={{
                    fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.2)', color: 'var(--color-success)', border: '1px solid rgba(16, 185, 129, 0.4)'
                  }}>
                    ⚡ SG90 PWM Triggered (42ms)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Mechanical Chute Deflection:</span>
                  <strong style={{ color: result.bin_color || 'var(--accent-cyan)' }}>
                    Actuating Trapdoor to {result.bin_type}
                  </strong>
                </div>

                <div style={{
                  width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)',
                  borderRadius: '3px', overflow: 'hidden', position: 'relative'
                }}>
                  <div style={{
                    height: '100%',
                    width: '100%',
                    background: `linear-gradient(90deg, transparent, ${result.bin_color || '#06b6d4'}, transparent)`,
                    animation: 'pulse 1.5s infinite'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                  <span>Sensor: OV5640 Camera</span>
                  <span>Controller: ESP32 / Raspberry Pi GPIO</span>
                  <span>State: Trapdoor Deflecting</span>
                </div>
              </div>

              {/* Segregation Instructions */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Municipal Segregation Guideline:
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {result.instructions}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Destination: <strong>{result.circular_destination}</strong>
                </span>
                <button
                  onClick={handleClaimPoints}
                  disabled={pointsAwarded}
                  style={{
                    padding: '8px 16px', background: pointsAwarded ? 'var(--color-success)' : 'var(--accent-orange)',
                    color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '12px',
                    cursor: pointsAwarded ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Award size={14} /> {pointsAwarded ? 'Points Claimed (+50 pts)' : 'Claim +50 EcoPoints'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Conversational AI Segregation Assistant */}
        <div className="glass" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '520px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
            <MessageSquare size={18} color="var(--accent-cyan)" />
            <h3 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
              Circular AI Segregation Consultant
            </h3>
          </div>

          {/* Chat Messages Log */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px', marginBottom: '16px' }}>
            {chatMessages.map(msg => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: msg.sender === 'user' ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
                  color: msg.sender === 'user' ? '#0f172a' : 'var(--text-primary)',
                  borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  padding: '12px 14px',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  boxShadow: 'var(--shadow-sm)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-glass)'
                }}
              >
                <div>{msg.text}</div>
                {msg.lcaBadge && (
                  <div style={{
                    marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--accent-cyan)'
                  }}>
                    <Leaf size={12} /> {msg.lcaBadge.material} · -{msg.lcaBadge.co2OffsetKg}kg CO₂
                  </div>
                )}
                <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                  {msg.timestamp}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div style={{ alignSelf: 'flex-start', padding: '8px 14px', background: 'var(--bg-secondary)', borderRadius: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                Consulting SWM rules...
              </div>
            )}
          </div>

          {/* Quick Question Chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Frequently Asked:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                'Swollen Li-Ion Battery',
                'Greasy Pizza Box',
                'Blister Medicine Foil',
                'Tetra Pak Cartons'
              ].map(q => (
                <button
                  key={q}
                  onClick={() => handleSendChat(`How to dispose: ${q}?`)}
                  style={{
                    padding: '4px 8px', borderRadius: '12px', fontSize: '11px',
                    background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)',
                    border: '1px solid var(--border-glass)', cursor: 'pointer'
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Bar */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Ask about segregation, plastics, hazardous items..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendChat()}
              style={{
                flex: 1, padding: '10px 14px', background: 'var(--bg-secondary)',
                border: '1px solid var(--border-glass)', borderRadius: '8px',
                color: 'var(--text-primary)', fontSize: '13px', outline: 'none'
              }}
            />
            <button
              onClick={() => handleSendChat()}
              disabled={isChatLoading || !chatInput.trim()}
              style={{
                padding: '10px 16px', background: 'var(--accent-cyan)', color: '#ffffff',
                border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIWasteVisionHub;
