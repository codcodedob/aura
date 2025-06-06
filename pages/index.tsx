// Project: AURA (Autonomous Utility Reasoning Agent)
// Stack: Next.js (Frontend), Node.js + OpenAI (Agent Brain), Supabase (pgvector Memory)

// --- 1. NEXT.JS FRONTEND WITH TESLA x NVIDIA x APPLE UI DESIGN ---
// pages/index.tsx
import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'

export default function Home() {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onresult = (event: any) => {
        setInput(event.results[0][0].transcript)
        setIsListening(false)
      }

      recognition.onend = () => setIsListening(false)
      recognition.onerror = () => setIsListening(false)

      recognitionRef.current = recognition
    }
  }, [])

  const askAURA = async () => {
    setLoading(true)
    setResponse('')
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    })
    const data = await res.json()
    const reply = data.response || data.error || '⚠️ No response received.'
    setResponse(reply)
    speak(reply)
    setLoading(false)
  }

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.lang = 'en-US'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const startMic = () => {
    if (!isListening && recognitionRef.current) {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      askAURA()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-black to-gray-950 text-white font-sans flex flex-col items-center justify-center px-6 py-12 relative">
      <Head><title>AURA Interface</title></Head>

      {/* Floating Avatar */}
      <img
        src="/aura-avatar.png"
        alt="AURA Avatar"
        className="absolute top-10 animate-bounce-slow w-40 h-auto opacity-80 drop-shadow-xl"
        style={{ animation: 'float 6s ease-in-out infinite' }}
      />

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
          100% { transform: translateY(0px); }
        }
        .animate-bounce-slow {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>

      <h1 className="text-6xl font-extrabold text-white tracking-tight mb-2">AURA</h1>
      <p className="text-gray-400 text-md max-w-lg text-center mb-8">Speak or type into a world-class intelligence interface inspired by Tesla fluidity, NVIDIA precision, and Apple minimalism.</p>

      <div className="w-full max-w-2xl flex items-center gap-4 mb-4 rounded-xl bg-gray-900/80 border border-gray-700 shadow-inner backdrop-blur-md">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-32 p-4 rounded-xl bg-black/70 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="Ask AURA anything..."
        />
        <button
          onClick={startMic}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white shadow-lg transition-all"
        >🎤</button>
      </div>

      <button
        onClick={askAURA}
        className="px-8 py-3 bg-gradient-to-tr from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 rounded-xl font-semibold shadow-xl transition-all"
      >Send to AURA</button>

      <div className="mt-10 max-w-2xl w-full p-6 rounded-xl bg-black/60 border border-gray-700 text-green-300 text-md whitespace-pre-wrap shadow-lg backdrop-blur-md">
        {loading ? '💭 AURA is processing your request...' : response}
      </div>
    </div>
  )
}

// --- 2. BACKEND API ROUTE --- (same as before)
// No changes to backend route for this upgrade

// --- 3. SUPABASE SQL (same as before) ---
// No changes needed to the SQL setup
