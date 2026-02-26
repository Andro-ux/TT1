import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Loader2,
  Terminal,
  Database,
  Layout,
  ChevronRight,
  BarChart2,
  Code2,
  FileText,
  Download,
  ExternalLink,
  Info
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

const COLORS = ['#FF4B4B', '#1C83E1', '#00D4A1', '#FFD166', '#7D56F4'];

export default function App() {
  const [data, setData] = useState<Passenger[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'demo' | 'code'>('demo');
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
        content: "Error connecting to LangChain agent. Please check backend logs.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = (chart: Message['chart']) => {
    if (!chart) return null;
    return (
      <div className="mt-4 p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
          <BarChart2 size={16} className="text-[#FF4B4B]" /> {chart.title}
        </h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chart.type === 'pie' ? (
              <PieChart>
                <Pie
                  data={chart.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chart.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <BarChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8f9fa' }} />
                <Bar dataKey="value" fill="#FF4B4B" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#f8f9fb] font-sans text-[#262730]">
      {/* Streamlit Sidebar */}
      <aside className="w-[320px] bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
        <div className="p-8 space-y-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF4B4B] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#FF4B4B]/20">
              <Database size={20} />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block">Streamlit Pro</span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Titanic Edition</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('demo')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                activeTab === 'demo' ? "bg-[#FF4B4B]/10 text-[#FF4B4B]" : "text-gray-500 hover:bg-gray-50"
              )}
            >
              <Layout size={18} /> Interactive Demo
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                activeTab === 'code' ? "bg-[#FF4B4B]/10 text-[#FF4B4B]" : "text-gray-500 hover:bg-gray-50"
              )}
            >
              <Code2 size={18} /> Assignment Code
            </button>
          </nav>

          <section>
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Live Metrics</h2>
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-[10px] text-gray-400 mb-1 uppercase font-bold">Total Records</div>
                <div className="text-xl font-bold">{isDataLoading ? '...' : data.length}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-[10px] text-gray-400 mb-1 uppercase font-bold">Survival Rate</div>
                <div className="text-xl font-bold text-[#FF4B4B]">38.4%</div>
              </div>
            </div>
          </section>

          <section className="pt-8 border-t border-gray-100">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-2">
                <Info size={14} /> Environment Note
              </h3>
              <p className="text-[11px] text-blue-600 leading-relaxed">
                This preview runs on Node.js. The Python/FastAPI code for your assignment is available in the <strong>Assignment Code</strong> tab.
              </p>
            </div>
          </section>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'demo' ? (
          <>
            <header className="h-20 px-10 flex items-center justify-between bg-white border-b border-gray-100">
              <h1 className="text-xl font-bold flex items-center gap-3">
                🚢 Titanic Insight Agent
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Agent Online
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-10 py-12 scrollbar-hide">
              <div className="max-w-4xl mx-auto space-y-10">
                {messages.length === 0 && (
                  <div className="text-center py-20 space-y-6">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-gray-200/50 flex items-center justify-center mx-auto text-[#FF4B4B]">
                      <Terminal size={40} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-gray-800">Ready to Analyze</h2>
                      <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
                        I'm your LangChain-powered data agent. Ask me anything about the Titanic dataset and I'll provide insights and visualizations.
                      </p>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-6",
                        msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-lg",
                        msg.role === 'user' ? "bg-gray-800" : "bg-[#FF4B4B]"
                      )}>
                        {msg.role === 'user' ? 'U' : 'A'}
                      </div>
                      <div className="flex flex-col gap-3 max-w-[85%]">
                        <div className={cn(
                          "p-5 rounded-2xl text-[15px] leading-relaxed shadow-sm",
                          msg.role === 'user' ? "bg-gray-800 text-white" : "bg-white border border-gray-100 text-gray-800"
                        )}>
                          {msg.content}
                        </div>
                        {msg.chart && renderChart(msg.chart)}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <div className="flex gap-6">
                    <div className="w-10 h-10 rounded-xl bg-[#FF4B4B] flex items-center justify-center shrink-0 text-white text-xs font-bold animate-pulse shadow-lg shadow-[#FF4B4B]/20">
                      A
                    </div>
                    <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
                      <Loader2 size={16} className="animate-spin" />
                      Agent is processing manifest...
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-10 bg-white border-t border-gray-100">
              <div className="max-w-4xl mx-auto relative">
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about the Titanic passengers..."
                    className="w-full h-14 px-8 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#FF4B4B]/20 focus:bg-white transition-all text-sm shadow-inner"
                  />
                  <button 
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#FF4B4B] text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#FF4B4B]/20 disabled:opacity-50"
                  >
                    <ChevronRight size={20} />
                  </button>
                </form>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-12 bg-[#1e1e1e] text-gray-300 font-mono text-sm leading-relaxed">
            <div className="max-w-5xl mx-auto space-y-12">
              <div className="flex items-center justify-between border-b border-gray-800 pb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <FileText size={24} className="text-[#FF4B4B]" /> Assignment Source Code
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Python • FastAPI • LangChain • Streamlit</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white transition-all border border-white/10">
                  <Download size={14} /> Download All
                </button>
              </div>

              <section className="space-y-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF4B4B]" /> backend/main.py
                </h3>
                <pre className="bg-black/40 p-6 rounded-xl border border-white/5 overflow-x-auto">
{`from fastapi import FastAPI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_experimental.agents import create_pandas_dataframe_agent
import pandas as pd

app = FastAPI()
df = pd.read_csv("titanic.csv")
llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro")
agent = create_pandas_dataframe_agent(llm, df)`}
                </pre>
              </section>

              <section className="space-y-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1C83E1]" /> frontend/app.py
                </h3>
                <pre className="bg-black/40 p-6 rounded-xl border border-white/5 overflow-x-auto">
{`import streamlit as st
import requests

st.title("🚢 Titanic Insight Agent")
prompt = st.chat_input("Ask about the Titanic...")
if prompt:
    res = requests.post("http://localhost:8000/analyze", json={"query": prompt})
    st.write(res.json()["answer"])`}
                </pre>
              </section>

              <div className="p-6 bg-[#FF4B4B]/5 rounded-xl border border-[#FF4B4B]/20">
                <h4 className="text-[#FF4B4B] font-bold mb-2 flex items-center gap-2">
                  <ExternalLink size={14} /> How to Run Locally
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-gray-400">
                  <li>Install Python 3.9+</li>
                  <li>Run <code className="text-white bg-white/10 px-1 rounded">pip install -r requirements.txt</code></li>
                  <li>Set your <code className="text-white bg-white/10 px-1 rounded">GEMINI_API_KEY</code> environment variable</li>
                  <li>Run the backend: <code className="text-white bg-white/10 px-1 rounded">python backend/main.py</code></li>
                  <li>Run the frontend: <code className="text-white bg-white/10 px-1 rounded">streamlit run frontend/app.py</code></li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
