import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Loader2,
  Anchor,
  Compass,
  Waves,
  ChevronRight,
  Info,
  History,
  Sparkles,
  Layout
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { fetchTitanicData, analyzeData, Passenger } from './services/titanicService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  chart?: {
    type: 'bar' | 'pie' | 'line' | 'histogram';
    title: string;
    data: any[];
  };
}

const COLORS = ['#F27D26', '#E0D8D0', '#8E9299', '#5A5A40', '#141414'];

export default function App() {
  const [data, setData] = useState<Passenger[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTitanicData().then(res => {
      setData(res);
      setIsDataLoading(false);
    });
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await analyzeData(input, data);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.answer,
        chart: result.chart?.data ? result.chart : undefined,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "The archives are currently unreachable. Please try your inquiry again.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = (chart: Message['chart']) => {
    if (!chart) return null;
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-6 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mb-8 flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-[#F27D26]" /> {chart.title}
        </h3>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chart.type === 'pie' ? (
              <PieChart>
                <Pie
                  data={chart.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {chart.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(20, 20, 20, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                />
              </PieChart>
            ) : (
              <BarChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  fontSize={10} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}
                />
                <YAxis 
                  fontSize={10} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(20, 20, 20, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                />
                <Bar dataKey="value" fill="#F27D26" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0D8D0] font-sans selection:bg-[#F27D26] selection:text-white overflow-hidden flex flex-col">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#F27D26]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Header */}
      <header className="relative z-10 h-24 px-12 flex items-center justify-between border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-[#F27D26] bg-white/5">
            <Anchor size={22} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-serif italic tracking-tight">Titanic Insight Agent</h1>
            <p className="text-[9px] font-mono uppercase tracking-[0.3em] opacity-40">Maritime Intelligence Archive v2.5</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          <div className="text-right">
            <div className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-30 mb-1">Archive Status</div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="opacity-60">{isDataLoading ? 'Synchronizing...' : '891 Records Indexed'}</span>
              <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]", isDataLoading ? "bg-yellow-500" : "bg-green-500")} />
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors opacity-40 hover:opacity-100">
            <Compass size={20} />
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col max-w-6xl mx-auto w-full px-12 pt-12 pb-32 overflow-hidden">
        {/* Chat Viewport */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto pr-4 space-y-16 scrollbar-hide mask-fade-edges"
        >
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#F27D26]/20 blur-3xl rounded-full" />
                <Waves size={64} className="relative text-[#F27D26]/40" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-serif italic max-w-lg">Explore the manifest of the RMS Titanic</h2>
                <p className="text-sm text-white/40 max-w-md mx-auto font-light leading-relaxed">
                  Ask questions about survival rates, passenger demographics, or specific historical data points from the 1912 voyage.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  "Survival rate by gender",
                  "Age distribution",
                  "Average fare by class",
                  "Embarkation ports"
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs hover:bg-white/10 hover:border-white/20 transition-all text-white/60 hover:text-white"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex flex-col max-w-[80%]",
                  msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "text-[9px] font-mono uppercase tracking-[0.3em] mb-3 opacity-30",
                  msg.role === 'user' ? "text-right" : "text-left"
                )}>
                  {msg.role === 'user' ? 'Inquiry' : 'Archive Response'}
                </div>
                <div className={cn(
                  "px-8 py-5 rounded-[2rem] text-[15px] leading-relaxed font-light",
                  msg.role === 'user' 
                    ? "bg-[#F27D26] text-white rounded-tr-none shadow-[0_10px_30px_rgba(242,125,38,0.2)]" 
                    : "bg-white/5 backdrop-blur-md border border-white/10 rounded-tl-none"
                )}>
                  {msg.content}
                </div>
                {msg.chart && renderChart(msg.chart)}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4 text-white/30"
            >
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                <Loader2 size={14} className="animate-spin" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Consulting the manifest...</span>
            </motion.div>
          )}
        </div>

        {/* Floating Input Bar */}
        <div className="absolute bottom-12 left-12 right-12">
          <motion.form 
            layout
            onSubmit={handleSubmit}
            className="relative max-w-3xl mx-auto"
          >
            <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full opacity-50" />
            <div className="relative flex items-center bg-white/10 backdrop-blur-2xl border border-white/10 rounded-full p-2 pl-8 shadow-2xl focus-within:border-[#F27D26]/40 transition-all">
              <Search size={18} className="text-white/20" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search the archives..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-4 px-6 placeholder:text-white/20"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-12 h-12 rounded-full bg-[#F27D26] text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg shadow-[#F27D26]/20"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.form>
          <div className="mt-6 flex justify-center items-center gap-8 text-[9px] font-mono uppercase tracking-[0.2em] opacity-20">
            <span className="flex items-center gap-2"><Sparkles size={10} /> Neural Analysis</span>
            <span className="flex items-center gap-2"><History size={10} /> Historical Accuracy</span>
            <span className="flex items-center gap-2"><Layout size={10} /> Data Visualization</span>
          </div>
        </div>
      </main>

      {/* CSS Utility for Fade Edges */}
      <style dangerouslySetInnerHTML={{ __html: `
        .mask-fade-edges {
          mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
        }
      `}} />
    </div>
  );
}
