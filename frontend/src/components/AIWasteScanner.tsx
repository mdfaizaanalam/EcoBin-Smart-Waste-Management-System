import React, { useState, useRef } from 'react';
import { 
  ScanSearch, 
  Upload, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Leaf, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  Send, 
  HelpCircle, 
  ShieldCheck, 
  ArrowRight,
  TrendingDown,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WasteClassificationResult, AICircularMessage } from '../types/circular';
import { api } from '../services/api';

interface AIWasteScannerProps {
  onAwardCitizenPoints?: (points: number, kg: number) => void;
}

export const AIWasteScanner: React.FC<AIWasteScannerProps> = ({ onAwardCitizenPoints }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<WasteClassificationResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Conversational AI Assistant
  const [chatMessages, setChatMessages] = useState<AICircularMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: 'Hello! I am the EcoBin Circular AI Consultant. Ask me anything about complex packaging segregation, hazardous disposal, or municipal solid waste guidelines.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lcaBadge: {
        material: 'Municipal Solid Waste (SWM Rules 2016)',
        co2OffsetKg: 1.8,
        destination: 'Closed-Loop Circular Economy'
      }
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  const presetQuestions = [
    'How do I safely segregate blister medicine foil strips?',
    'Can greasy pizza box cardboard be recycled?',
    'What is the safest way to dispose of a swollen Li-Ion battery?',
    'How are Tetra Pak beverage cartons processed?'
  ];

  // Text-To-Speech (TTS) Voice Narration
  const handleSpeakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Preset Test Samples
  const sampleItems = [
    {
      title: 'Plastic PET Water Bottle',
      desc: 'Crushed transparent 500ml beverage bottle',
      category: 'recyclable',
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80'
    },
    {
      title: 'Banana & Fruit Peels',
      desc: 'Leftover organic banana peel and fruit pulp',
      category: 'organic',
      image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=80'
    },
    {
      title: 'Discarded PCB Circuit Board',
      desc: 'Computer motherboard section with electrolytic capacitors',
      category: 'e-waste',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'
    },
    {
      title: 'Corrugated Shipping Box',
      desc: 'Clean cardboard packaging carton',
      category: 'recyclable',
      image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const handleSelectSample = (sample: typeof sampleItems[0]) => {
    setSelectedImage(sample.image);
    handleClassify(sample.image, sample.title);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      handleClassify(base64, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleClassify = async (imgData: string, fallbackName?: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      const res = await api.classifyWaste(imgData);
      if (fallbackName && !res.itemName.includes(fallbackName)) {
        res.itemName = fallbackName;
      }
      setResult(res);

      if (onAwardCitizenPoints) {
        onAwardCitizenPoints(res.ecoPointsEarned, 0.5);
      }

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendChat = (questionText?: string) => {
    const query = questionText || chatInput;
    if (!query.trim()) return;

    const userMsg: AICircularMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!questionText) setChatInput('');
    setIsChatLoading(true);

    setTimeout(() => {
      let reply = "Segregate into dry recyclables for MRF optical sorting.";
      let lcaBadge = { material: "Mixed Polymer", co2OffsetKg: 0.9, destination: "Mechanical Recycling" };

      const lower = query.toLowerCase();
      if (lower.includes('blister') || lower.includes('medicine')) {
        reply = "Medicine blister packs contain bonded aluminium foil and PVC/PVDC plastic. They cannot go into ordinary paper recycling. Place them in designated Domestic Hazardous or Specialized Chemical Collection bins for thermal delamination.";
        lcaBadge = { material: "Aluminium-PVC Foil", co2OffsetKg: 1.6, destination: "Specialized Pyrolysis / Metallurgical Recovery" };
      } else if (lower.includes('pizza') || lower.includes('greasy')) {
        reply = "Grease-soaked cardboard sections cannot be turned into quality pulp because food oils contaminate paper fibers. Tear off clean dry lid sections for the Blue Recyclable Bin; compost the greasy bottom section in the Green Organic Bin.";
        lcaBadge = { material: "Food-Contaminated Cellulose", co2OffsetKg: 0.7, destination: "Composting / Biomethanation" };
      } else if (lower.includes('battery') || lower.includes('li-ion')) {
        reply = "⚠️ CAUTION: Swollen Lithium-Ion batteries present immediate thermal runaway and fire hazard! Never puncture, crush, or place in general bins. Insulate terminals with electrical tape and deposit immediately at an authorized E-Waste Depot hazardous battery cell.";
        lcaBadge = { material: "Lithium Cobalt Oxide (LCO)", co2OffsetKg: 3.8, destination: "Hydrometallurgical Cobalt/Lithium Extraction" };
      } else if (lower.includes('tetra pak')) {
        reply = "Tetra Pak cartons consist of 75% paperboard, 20% polyethylene, and 5% aluminium foil. Processed in hydropulpers where paper fibers are extracted into kraft paper, and poly-aluminium (poly-Al) is compressed into industrial roof tiles.";
        lcaBadge = { material: "Aseptic Composite Board", co2OffsetKg: 2.2, destination: "Hydropulping & Poly-Al Tile Fabrication" };
      }

      const aiMsg: AICircularMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        lcaBadge
      };

      setChatMessages(prev => [...prev, aiMsg]);
      setIsChatLoading(false);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.15))',
        border: '1px solid rgba(6, 182, 212, 0.3)',
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
            <span style={{ fontSize: '24px' }}>🤖</span>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)' }}>
              AI Vision Waste Segregation Scanner & LCA Advisor
            </h2>
            <span style={{
              background: 'rgba(16, 185, 129, 0.2)',
              color: 'var(--color-success)',
              border: '1px solid var(--color-success)',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '20px',
              fontWeight: 700
            }}>
              Pillar 1: AI Waste Classification
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '750px' }}>
            Multi-class computer vision detector classifying packaging types, contamination risks, lifecycle carbon footprint, and audio voice instructions for inclusive municipal segregation.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--accent-cyan)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 20px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)'
          }}
        >
          <Camera size={18} />
          <span>Upload / Take Photo</span>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          onChange={handleFileUpload} 
          style={{ display: 'none' }} 
        />
      </div>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {/* Left Column: Image Preview & Sample Selectors */}
        <div style={{
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-glass)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
            1. Test Sample Presets or Live Capture
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px'
          }}>
            {sampleItems.map((s, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectSample(s)}
                style={{
                  border: '1px solid var(--border-glass)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: 'var(--bg-secondary)',
                  transition: 'all 0.2s ease',
                  transform: selectedImage === s.image ? 'scale(0.98)' : 'none',
                  borderColor: selectedImage === s.image ? 'var(--accent-cyan)' : 'var(--border-glass)'
                }}
              >
                <img src={s.image} alt={s.title} style={{ width: '100%', height: '80px', objectFit: 'cover' }} />
                <div style={{ padding: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{s.title}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{s.category.toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Active Image Box */}
          <div style={{
            height: '240px',
            borderRadius: '12px',
            border: '2px dashed var(--border-glass)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-secondary)',
            position: 'relative'
          }}>
            {selectedImage ? (
              <img src={selectedImage} alt="Scanned item" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                <ScanSearch size={40} style={{ margin: '0 auto 8px', opacity: 0.6 }} />
                <div style={{ fontSize: '13px', fontWeight: 600 }}>No image loaded</div>
                <div style={{ fontSize: '11px' }}>Click a sample above or upload a camera photo</div>
              </div>
            )}

            {isLoading && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.75)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                color: 'var(--accent-cyan)'
              }}>
                <Sparkles size={32} className="spin" />
                <span style={{ fontWeight: 700, fontSize: '13px' }}>Neural Vision Inferencing...</span>
              </div>
            )}
          </div>
        </div>

        {/* Middle Column: Classification Results */}
        <div style={{
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-glass)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
              2. Classification & LCA Impact
            </h3>

            {result && (
              <button
                onClick={() => handleSpeakText(`${result.itemName}. Recommended destination: ${result.recommendedBinColor}. ${result.recyclingInstructions.join('. ')}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: isSpeaking ? 'var(--color-danger)' : 'rgba(59, 130, 246, 0.15)',
                  color: isSpeaking ? '#fff' : 'var(--color-info)',
                  border: '1px solid var(--color-info)',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                <span>{isSpeaking ? 'Stop Audio' : 'Speak Instructions'}</span>
              </button>
            )}
          </div>

          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Main Badge */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-glass)',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {result.itemName}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Category: <strong style={{ color: 'var(--accent-cyan)' }}>{result.wasteCategory.toUpperCase()}</strong>
                  </div>
                </div>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--color-success)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontWeight: 800,
                  fontSize: '13px'
                }}>
                  {Math.round(result.confidence * 100)}% Match
                </div>
              </div>

              {/* Bin Color Guide */}
              <div style={{
                background: result.wasteCategory === 'organic' ? 'rgba(16, 185, 129, 0.12)' : result.wasteCategory === 'recyclable' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: '1px solid var(--border-glass)',
                borderRadius: '10px',
                padding: '12px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>DISPOSAL TARGET</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {result.recommendedBinColor}
                </div>
              </div>

              {/* LCA Metrics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px'
              }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CO₂ Avoided</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-success)' }}>
                    -{result.carbonOffsetKg} kg
                  </div>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Eco-Points Earned</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-orange)' }}>
                    +{result.ecoPointsEarned} pts
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Segregation Instructions:
                </div>
                <ul style={{ paddingLeft: '18px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {result.recyclingInstructions.map((ins, i) => (
                    <li key={i}>{ins}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <Sparkles size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
              <div>Ready to classify. Select a sample or upload an image.</div>
            </div>
          )}
        </div>

        {/* Right Column: Circular AI Consultant Chat */}
        <div style={{
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-glass)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          height: '520px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <MessageSquare size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
              Circular AI Segregation Consultant
            </h3>
          </div>

          {/* Preset Questions Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
            {presetQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendChat(q)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-secondary)',
                  borderRadius: '14px',
                  padding: '4px 10px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            paddingRight: '6px'
          }}>
            {chatMessages.map(msg => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                  background: msg.sender === 'user' ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
                  color: msg.sender === 'user' ? '#fff' : 'var(--text-primary)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  fontSize: '12px',
                  lineHeight: '1.4'
                }}
              >
                <div>{msg.text}</div>
                {msg.lcaBadge && (
                  <div style={{
                    marginTop: '8px',
                    paddingTop: '6px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '10px',
                    opacity: 0.9,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>
                    <span>🔬 Material: {msg.lcaBadge.material}</span>
                    <span>🌱 LCA Offset: {msg.lcaBadge.co2OffsetKg} kg CO₂</span>
                    <span>🔄 Target: {msg.lcaBadge.destination}</span>
                  </div>
                )}
              </div>
            ))}
            {isChatLoading && (
              <div style={{ alignSelf: 'flex-start', fontSize: '11px', color: 'var(--text-muted)' }}>
                EcoBin AI is thinking...
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendChat()}
              placeholder="Ask about complex packaging or rules..."
              style={{
                flex: 1,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'var(--text-primary)',
                fontSize: '12px',
                outline: 'none'
              }}
            />
            <button
              onClick={() => handleSendChat()}
              style={{
                background: 'var(--accent-cyan)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIWasteScanner;
