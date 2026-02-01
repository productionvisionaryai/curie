'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Cpu, User, Activity, Sparkles, Scale, ShieldCheck, Zap 
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TelemetryData {
  bpm: number;
  hrv: number;
  spo2: number;
  weight: number;
  muscleMass: number;
  bodyWater: number;
  visceralFat: number;
  bmr: number;
  target: number;
  phaseAngle: number;
  pbf: number;
}

interface ChatInterfaceProps {
  telemetry: TelemetryData;
  isEmergency?: boolean;
}

// EL "EXPORT DEFAULT" QUE VERCEL ESTÁ RECLAMANDO:
export default function ChatInterface({ 
  telemetry,
  isEmergency = false 
}: ChatInterfaceProps) {
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `[NEXUS SYNC COMPLETED] Hola Abraham, soy Curie. He analizado tu perfil actual de ${telemetry.weight} kg. ¿Deseas revisar los ajustes de tu dieta para alcanzar los 80 kg o tienes alguna duda sobre tu suplementación?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { 
      role: 'user', 
      content: input, 
      timestamp: new Date() 
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // CONEXIÓN REAL CON TU API /api/chat
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMsg].map(m => ({ 
            role: m.role, 
            content: m.content 
          })),
          telemetry 
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.content || 'Error en el Nexus');

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      }]);

    } catch (error: any) {
      console.error("Error en el envío:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "⚠️ Error: No hay respuesta del Nexus. Revisa los logs de Vercel y tu API Key.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-[900px] bg-slate-950/50 backdrop-blur-2xl border border-cyan-500/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] relative mx-auto max-w-2xl">
      
      {/* HEADER */}
      <div className="bg-slate-900/40 border-b border-cyan-500/10 p-6 flex justify-between items-center backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-full border border-cyan-500/20 animate-pulse">
            <Cpu size={18} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm tracking-widest uppercase italic font-sans">Helena Intelligence</h3>
            <p className="text-[10px] text-cyan-400/70 font-mono uppercase tracking-wider">
              {isEmergency ? '⚠ Protocolo de Emergencia' : 'Online • Análisis Predictivo Activo'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <TelemetryChip icon={<Activity size={12} />} value={telemetry.bpm} unit="BPM" color="rose" />
          <TelemetryChip icon={<Scale size={12} />} value={telemetry.weight} unit="kg" color="emerald" />
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}
            >
              <div className={`max-w-[80%] px-5 py-3.5 rounded-2xl border ${
                m.role === 'user' 
                  ? 'bg-slate-800/60 border-slate-700/50 text-slate-200' 
                  : 'bg-cyan-950/20 border-cyan-500/20 text-cyan-50'
              }`}>
                <p className="text-sm leading-relaxed">{m.content}</p>
                <span className="text-[10px] opacity-40 mt-2 block font-mono">
                  {m.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <div className="flex items-center gap-2 text-cyan-500/50 text-xs italic">
            <Zap size={12} className="animate-pulse" /> Curie procesando datos...
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-6 bg-slate-900/40 border-t border-cyan-500/10 backdrop-blur-xl">
        <form 
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="relative flex items-center gap-3 bg-black/40 border border-slate-700/50 rounded-2xl px-5 py-4 focus-within:border-cyan-500/30 transition-all"
        >
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu consulta nutricional..."
            className="flex-1 bg-transparent text-sm text-slate-200 focus:outline-none"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-black transition-all disabled:opacity-30"
          >
            <Send size={18} />
          </button>
        </form>
        
        <div className="flex justify-center items-center gap-4 mt-4">
          <p className="text-[9px] text-slate-600 font-mono uppercase tracking-[0.2em] flex items-center gap-1">
            <ShieldCheck size={10} /> E2EE Activado
          </p>
          <p className="text-[9px] text-slate-600 font-mono uppercase tracking-[0.2em]">
            Visionary AI Labs • 2026
          </p>
        </div>
      </div>
    </div>
  );
}

function TelemetryChip({ icon, value, unit, color }: { icon: any, value: number, unit: string, color: 'rose' | 'emerald' | 'cyan' }) {
  const colorClasses = {
    rose: 'text-rose-400 border-rose-500/20 bg-rose-950/30',
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-950/30',
    cyan: 'text-cyan-400 border-cyan-500/20 bg-cyan-950/30'
  };
  
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold font-mono ${colorClasses[color]}`}>
      {icon}
      <span>{value} {unit}</span>
    </div>
  );
}