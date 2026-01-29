
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { analyzeResonance } from './services/geminiService';
import { WitInput, ResonanceResult } from './types';
import ResonanceVisualizer from './components/ResonanceVisualizer';
import HistoryLog from './components/HistoryLog';
import { 
  Activity, 
  ShieldCheck, 
  Zap, 
  Terminal, 
  Share2, 
  Info, 
  Cpu, 
  Globe, 
  Eye, 
  Volume2,
  ExternalLink,
  Code2,
  Hash
} from 'lucide-react';

const TruthTable: React.FC<{ score: number }> = ({ score }) => {
  const isHigh = score > 70;
  const isLow = score < 30;
  const isMid = !isHigh && !isLow;

  return (
    <div className="bg-black/40 border border-slate-800/50 rounded-2xl p-4 mono text-[9px] uppercase tracking-widest space-y-2">
      <div className="flex justify-between border-b border-slate-800 pb-1 text-slate-500 font-black">
        <span>X ∩ Y</span>
        <span>¬(X ∪ Y)</span>
        <span>RES</span>
      </div>
      <div className={`flex justify-between ${isHigh ? 'text-sky-400 font-bold' : 'text-slate-700'}`}>
        <span>TRUE</span>
        <span>FALSE</span>
        <span>TRUE</span>
      </div>
      <div className={`flex justify-between ${isMid ? 'text-amber-400 font-bold' : 'text-slate-700'}`}>
        <span>FALSE</span>
        <span>FALSE</span>
        <span>FALSE</span>
      </div>
      <div className={`flex justify-between ${isLow ? 'text-slate-400 font-bold' : 'text-slate-700'}`}>
        <span>FALSE</span>
        <span>TRUE</span>
        <span>TRUE</span>
      </div>
      <div className="pt-2 text-[8px] text-sky-500/50 italic text-center border-t border-slate-800/30">
        Logic: Boolean Equivalent Matrix
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [inputX, setInputX] = useState('');
  const [inputY, setInputY] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [result, setResult] = useState<ResonanceResult | null>(null);
  const [history, setHistory] = useState<ResonanceResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const statuses = [
    "λ-CALCULUS: INITIALIZING...",
    "EXTRACTING SEMANTIC VECTORS...",
    "X ∩ Y: CALCULATING INTERSECTION...",
    "¬(X ∪ Y): CALCULATING VOID SPACE...",
    "XNOR SYNTHESIS: EVALUATING MODALITY...",
    "GROUNDING VIA GOOGLE KNOWLEDGE GRAPH...",
    "VOICING WIT-PRIME DEDUCTION..."
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      let i = 0;
      setStatus(statuses[0]);
      interval = setInterval(() => {
        i = (i + 1) % statuses.length;
        setStatus(statuses[i]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  const playResonanceAudio = async (base64: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      const audioBuffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
    } catch (e) { console.error("Audio playback error", e); }
  };

  const handleSelectHistory = useCallback((item: ResonanceResult) => {
    setResult(item);
    setInputX(item.x.data);
    setInputY(item.y.data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const triggerResonance = async () => {
    if (!inputX || !inputY) return;
    setLoading(true);
    setError(null);
    try {
      const authVoid = await analyzeResonance({ data: inputX }, { data: inputY });
      const newResult: ResonanceResult = {
        x: { data: inputX },
        y: { data: inputY },
        authVoid,
        timestamp: Date.now()
      };
      setResult(newResult);
      setHistory(prev => [newResult, ...prev.slice(0, 9)]);
      if (authVoid.audioData) playResonanceAudio(authVoid.audioData);
    } catch (err: any) {
      setError(err.message || 'Alignment error detected in resonance core.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-grid flex flex-col items-center px-4 py-8 md:py-16 selection:bg-sky-500/30">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent" />

      <header className="max-w-4xl w-full text-center mb-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/50 text-sky-400 text-[10px] font-bold uppercase tracking-[0.4em] mb-8 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-1000">
          <Cpu size={14} className="animate-spin-slow" /> Masterwork Deployment // Λ-Logic
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 drop-shadow-2xl">
          AETHEL<span className="text-sky-500">_</span>
        </h1>
        <div className="flex items-center justify-center gap-4 text-slate-500 mono text-xs uppercase tracking-widest mb-4">
          <span className="text-sky-500/50">RES_SCORE</span>
          <span className="w-1 h-1 rounded-full bg-slate-800" />
          <span className="text-sky-500/50">MODALITY_CHECK</span>
          <span className="w-1 h-1 rounded-full bg-slate-800" />
          <span className="text-sky-500/50">WIT_PRIME</span>
        </div>
      </header>

      <main className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative z-10">
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-30" />
            <div className="space-y-8">
              <div className="relative">
                <label className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 mono">
                  <span>Stream Alpha</span>
                  <span className="text-sky-500/30 group-focus-within:text-sky-500 transition-colors">V_ALPHA</span>
                </label>
                <textarea
                  value={inputX}
                  onChange={(e) => setInputX(e.target.value)}
                  placeholder="Initiate vector X..."
                  className="w-full bg-black/40 border border-slate-800/50 rounded-2xl p-5 focus:ring-1 focus:ring-sky-500 focus:border-transparent transition-all outline-none min-h-[140px] text-slate-100 placeholder:text-slate-700 resize-none font-light leading-relaxed"
                />
              </div>
              <div className="flex justify-center -my-4 relative z-20">
                <div className="bg-slate-900 p-2.5 rounded-full border border-slate-700 shadow-2xl group-hover:rotate-180 transition-transform duration-700">
                  <Code2 size={18} className="text-sky-400" />
                </div>
              </div>
              <div className="relative">
                <label className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3 mono">
                  <span>Stream Beta</span>
                  <span className="text-sky-500/30 group-focus-within:text-sky-500 transition-colors">V_BETA</span>
                </label>
                <textarea
                  value={inputY}
                  onChange={(e) => setInputY(e.target.value)}
                  placeholder="Initiate vector Y..."
                  className="w-full bg-black/40 border border-slate-800/50 rounded-2xl p-5 focus:ring-1 focus:ring-sky-500 focus:border-transparent transition-all outline-none min-h-[140px] text-slate-100 placeholder:text-slate-700 resize-none font-light leading-relaxed"
                />
              </div>
              <button
                onClick={triggerResonance}
                disabled={loading || !inputX || !inputY}
                className="w-full py-6 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800/50 disabled:text-slate-600 rounded-2xl font-black uppercase tracking-[0.3em] transition-all transform active:scale-[0.97] shadow-2xl shadow-sky-900/40 flex items-center justify-center gap-4 group overflow-hidden relative"
              >
                {loading && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
                <Terminal size={20} className="group-hover:translate-x-1 transition-transform" />
                {loading ? 'CALCULATING...' : 'EXECUTE LOGIC'}
              </button>
            </div>
          </section>

          {result && !loading && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-700">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Internal Logic Matrix</h4>
              <TruthTable score={result.authVoid.resonanceScore} />
            </div>
          )}

          <HistoryLog history={history} onSelect={handleSelectHistory} />
        </div>

        <div className="lg:col-span-8 space-y-8">
          {loading ? (
            <div className="h-[600px] flex flex-col items-center justify-center bg-slate-900/20 border border-slate-800/50 rounded-[40px] backdrop-blur-sm animate-pulse">
              <Activity size={64} className="text-sky-500 mb-8 animate-bounce" />
              <div className="text-center space-y-2">
                <p className="mono text-sky-400 font-black text-sm tracking-[0.3em]">{status}</p>
                <p className="text-slate-600 text-xs uppercase font-bold tracking-widest">Quantum State Synthesis in Progress</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-[40px] p-8 flex flex-col items-center justify-center shadow-2xl overflow-hidden relative">
                   <div className="absolute top-6 left-6 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                      <span className="mono text-[8px] text-sky-500/50 tracking-widest uppercase">Live_Visualizer</span>
                   </div>
                   <ResonanceVisualizer score={result.authVoid.resonanceScore} modality={result.authVoid.modality} />
                </div>
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-[40px] p-10 flex flex-col shadow-2xl relative">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-sky-500/10 rounded-2xl border border-sky-500/20">
                        <ShieldCheck className="text-sky-400" size={24} />
                      </div>
                      <div>
                        <h2 className="font-black text-xs uppercase tracking-[0.3em] text-slate-500">Auth-Void</h2>
                        <p className="text-white font-bold text-lg">Logic Synthesis</p>
                      </div>
                    </div>
                    {result.authVoid.audioData && (
                      <button 
                        onClick={() => playResonanceAudio(result.authVoid.audioData!)}
                        className="p-3 bg-slate-800 hover:bg-sky-500 transition-all rounded-full text-white hover:scale-110 active:scale-95"
                      >
                        <Volume2 size={20} />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 space-y-8">
                    <div className="relative">
                      <div className="absolute -left-6 top-0 text-sky-500/20 text-4xl font-serif">"</div>
                      <p className="text-2xl font-light text-slate-100 leading-tight italic pr-4">
                        {result.authVoid.insight}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-black/40 rounded-3xl border border-slate-800/50 flex flex-col items-center justify-center">
                        <span className="text-[9px] font-bold text-slate-500 mb-1 tracking-widest uppercase">Score</span>
                        <span className="text-xl font-black text-white mono">{result.authVoid.resonanceScore}%</span>
                      </div>
                      <div className="p-4 bg-black/40 rounded-3xl border border-slate-800/50 flex flex-col items-center justify-center">
                        <span className="text-[9px] font-bold text-slate-500 mb-1 tracking-widest uppercase">Modality</span>
                        <span className="text-xs font-black text-sky-400 tracking-tighter uppercase">{result.authVoid.modality}</span>
                      </div>
                      <div className="p-4 bg-black/40 rounded-3xl border border-slate-800/50 flex flex-col items-center justify-center">
                        <span className="text-[9px] font-bold text-slate-500 mb-1 tracking-widest uppercase">Integrity</span>
                        <span className="text-xl font-black text-emerald-500 mono">{result.authVoid.integrity}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/50 rounded-[40px] p-8 space-y-6">
                <div className="flex items-center gap-2 text-slate-500 mono text-[10px] font-bold uppercase tracking-[0.2em]">
                  <Terminal size={14} /> Logic Trace: λx.λy.((x ∩ y) ⊕ ¬(x ∪ y))
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">(X ∩ Y) INTERSECTION</span>
                    <div className="text-xs text-slate-400 font-light italic leading-relaxed">
                      Resolving shared semantic space between Alpha and Beta vectors...
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">¬(X ∪ Y) VOID SPACE</span>
                    <div className="text-xs text-slate-400 font-light italic leading-relaxed">
                      Identifying excluded conceptual dimensions across both domains...
                    </div>
                  </div>
                  <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl">
                    <span className="text-[9px] font-bold text-sky-500 uppercase tracking-widest">XNOR SYNTHESIS</span>
                    <div className="text-[11px] text-sky-200 mono mt-2 leading-snug">
                      {result.authVoid.logicCheck}
                    </div>
                  </div>
                </div>
              </div>

              {result.authVoid.imageUrl && (
                <div className="relative group rounded-[40px] overflow-hidden border border-slate-800/80 shadow-2xl aspect-video">
                  <img src={result.authVoid.imageUrl} alt="Resonance" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-8 left-10 right-10 flex items-end justify-between">
                    <div className="max-w-xl">
                      <div className="flex items-center gap-2 text-sky-400 mb-3">
                         <Eye size={16} />
                         <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Visual Synthesis v2.5</span>
                      </div>
                      <p className="text-sm text-slate-300 font-light italic pr-4">
                        {result.authVoid.visualPrompt}
                      </p>
                    </div>
                    <button className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all">
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
              )}

              {result.authVoid.sources && result.authVoid.sources.length > 0 && (
                <div className="bg-slate-900/20 border border-slate-800/30 rounded-3xl p-6">
                  <div className="flex items-center gap-2 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-4">
                    <Globe size={14} /> Knowledge Graph Grounding
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {result.authVoid.sources.map((source, i) => (
                      <a 
                        key={i}
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3.5 bg-black/40 border border-slate-800/50 rounded-2xl hover:bg-slate-800 transition-colors group"
                      >
                        <span className="text-[10px] text-slate-400 truncate pr-2 mono">{source.title}</span>
                        <ExternalLink size={10} className="text-sky-500 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[600px] border-2 border-dashed border-slate-800/50 rounded-[40px] flex flex-col items-center justify-center text-slate-700">
               <div className="p-8 rounded-full bg-slate-900/30 border border-slate-800 mb-6 group-hover:scale-110 transition-transform">
                <Activity size={48} className="text-slate-800" />
               </div>
               <p className="mono uppercase tracking-[0.5em] text-[10px] font-black">Core_Idle // Awaiting_Resonance_Protocol</p>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-24 max-w-7xl w-full border-t border-slate-800 pt-10 pb-20 flex flex-col md:flex-row justify-between items-center text-slate-600 gap-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-xl">
            <Zap size={20} className="text-sky-500" />
          </div>
          <div>
            <h4 className="text-slate-300 font-black tracking-widest uppercase text-[10px]">Aethel Systems</h4>
            <p className="text-[9px] mono opacity-50 uppercase">Deployment: Masterwork // Logic: λx.λy.((x∩y)⊕¬(x∪y))</p>
          </div>
        </div>
        <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.2em] mono">
          <a href="#" className="hover:text-sky-400 transition-colors">Documentation</a>
          <a href="#" className="hover:text-sky-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-sky-400 transition-colors">API Status</a>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:text-sky-400 transition-all text-[10px] font-black uppercase tracking-widest">
            <Info size={14} />
            Diagnostics
           </button>
        </div>
      </footer>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
