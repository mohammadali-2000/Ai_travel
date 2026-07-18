'use client';

import { motion } from 'framer-motion';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiUrl, Trip } from '@/lib/trips';
import { parseTripIntent, TripIntent } from '@/lib/trip-intent';
import { TripCanvas } from './trip-canvas';

const agentNames = ['Experience Designer', 'Budget Agent', 'Weather Agent', 'Food Agent', 'Journey Coordinator'];
const generationStages = [
  ['🧠', 'Planner Agent', 'Researching the emotional arc…'],
  ['💰', 'Budget Agent', 'Balancing each choice…'],
  ['🍜', 'Food Agent', 'Finding local texture…'],
  ['🌦', 'Weather Agent', 'Preparing graceful contingencies…'],
  ['✦', 'Story Agent', 'Writing the journey reveal…'],
];
const field = 'input-glass mt-2 px-3 py-2.5 text-sm placeholder:text-zinc-600';

function ownerId() {
  const key = 'roamverse-owner-id';
  let value = window.localStorage.getItem(key);
  if (!value) { value = crypto.randomUUID(); window.localStorage.setItem(key, value); }
  return value;
}

export function TravelOS() {
  const [form, setForm] = useState({ destination: '', start_date: '', end_date: '', budget: '2500', currency: 'USD', travelers: '1', intent: '' });
  const [plannerPrompt, setPlannerPrompt] = useState('');
  const [extracted, setExtracted] = useState(false);
  const [intent, setIntent] = useState<TripIntent | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [saved, setSaved] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => { fetch(`${apiUrl}/api/v1/journeys?owner_id=${encodeURIComponent(ownerId())}`).then((r) => r.ok ? r.json() : []).then(setSaved).catch(() => undefined); }, []);
  useEffect(() => { if (!plannerPrompt.trim()) { setExtracted(false); return; } const timer = window.setTimeout(extractTrip, 500); return () => window.clearTimeout(timer); }, [plannerPrompt]);

  function extractTrip() {
    const parsed = parseTripIntent(plannerPrompt); setIntent(parsed);
    setForm((current) => ({ ...current, destination: parsed.destination.value || current.destination, budget: parsed.budget.value ? String(parsed.budget.value) : current.budget, currency: parsed.currency.value || current.currency, travelers: parsed.travelerCount.value ? String(parsed.travelerCount.value) : current.travelers, intent: plannerPrompt }));
    setExtracted(true);
  }

  async function createTrip(event: FormEvent) {
    event.preventDefault(); setError(''); setLoading(true);
    setStage(0);
    const progressTimer = window.setInterval(() => setStage((current) => Math.min(current + 1, generationStages.length - 1)), 1800);
    try {
      const response = await fetch(`${apiUrl}/api/v1/journeys`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, budget: Number(form.budget), travelers: Number(form.travelers), owner_id: ownerId() }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail ?? 'Journey generation was unavailable.');
      setTrip(payload); setSaved((current) => [payload, ...current]);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not generate your journey.'); }
    finally { window.clearInterval(progressTimer); setLoading(false); }
  }

  if (trip) return <TripCanvas trip={trip} />;

  return <main className="aurora-page relative min-h-screen overflow-hidden px-4 py-4 sm:px-7"><div className="aurora-blob one"/><div className="aurora-blob two"/><div className="relative mx-auto max-w-6xl"><header className="glass flex h-16 items-center justify-between rounded-2xl px-5"><div className="flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-violet-300 to-indigo-500 font-bold text-zinc-950">R</span><span className="text-[15px] font-medium">RoamVerse</span></div><span className="text-xs text-zinc-500">AI travel operating system</span></header>
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-5 py-10 lg:grid-cols-[1.1fr_.9fr]"><section><p className="text-xs font-medium uppercase tracking-[.22em] text-violet-300">Create a Journey Drop</p><h1 className="mt-4 max-w-xl text-4xl font-medium tracking-[-.055em] sm:text-6xl">A trip worth remembering starts with a feeling.</h1><p className="mt-5 max-w-lg text-lg leading-7 text-zinc-400">Give your AI travel team a destination, time, and budget. They’ll create a complete experience—not a generic itinerary.</p>
          <form onSubmit={createTrip} className="mt-8 rounded-[28px] bg-white p-3 shadow-[0_24px_70px_rgba(80,70,150,.16)]"><textarea value={plannerPrompt} onChange={(e)=>setPlannerPrompt(e.target.value)} className="min-h-36 w-full resize-y rounded-[22px] border-0 bg-transparent p-5 text-base text-zinc-800 outline-none placeholder:text-zinc-400" placeholder="Describe your dream trip…&#10;&#10;I want to visit Japan from 1 Aug to 10 Aug. Budget around ₹1 lakh. I love anime, photography and local food. ✦" /><div className="flex flex-wrap gap-2 px-2 pb-3">{['🇯🇵 10 days in Japan under ₹1 lakh','🏝 Goa weekend with friends','🏔 Himachal road trip','🍜 Seoul food adventure','🏖 Bali honeymoon','🎒 Solo Europe backpacking'].map((idea)=><button type="button" onClick={()=>setPlannerPrompt(idea)} className="rounded-full bg-violet-50 px-3 py-2 text-xs text-violet-700 transition hover:-translate-y-0.5 hover:bg-violet-100" key={idea}>{idea}</button>)}</div>{extracted&&intent?.destination.value?<div className="flex flex-wrap gap-2 border-t border-zinc-100 px-3 py-3">{[['📍',intent.destination.value],['📅',intent.dates.value||'Dates needed'],['💰',intent.budget.value?`₹${intent.budget.value.toLocaleString()}`:'Budget needed'],['👥',intent.travelers.value||`${form.travelers} traveler(s)`],...((intent.interests||[]).map(x=>['✦',x] as string[]))].map(([icon,value])=><span className="rounded-xl bg-violet-100 px-3 py-2 text-sm text-violet-800" key={value}>{icon} {value}</span>)}</div>:plannerPrompt&&extracted?<p className="px-5 pb-3 text-sm text-amber-700">I couldn't confidently identify your destination. Where would you like to go?</p>:null}<div className="mt-2 grid gap-3 border-t border-zinc-100 p-3 sm:grid-cols-2"><input required type="date" value={form.start_date} onChange={(e)=>setForm({...form,start_date:e.target.value})} className={`${field} mt-0`} aria-label="Start date"/><input required type="date" value={form.end_date} onChange={(e)=>setForm({...form,end_date:e.target.value})} className={`${field} mt-0`} aria-label="End date"/></div><button disabled={loading || !form.destination} className="mx-3 mb-3 w-[calc(100%-1.5rem)] rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-violet-300 transition hover:scale-[1.01] disabled:opacity-50">{loading ? 'Your team is building the journey…' : '✨ Plan My Journey'}</button>{error && <p role="alert" className="px-5 pb-3 text-sm text-rose-500">{error}</p>}</form></section>
    <aside className="glass rounded-[22px] p-6"><div className="flex items-center justify-between"><p className="text-sm font-medium">Your travel team</p><span className={loading ? 'text-xs text-violet-200' : 'text-xs text-emerald-300'}>{loading ? 'Working now' : 'Ready'}</span></div><div className="mt-6 space-y-5">{agentNames.map((agent, index) => <div className="flex items-center gap-3" key={agent}><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[.08] text-xs text-violet-200">{index + 1}</span><div className="flex-1"><p className="text-sm">{agent}</p><p className="mt-0.5 text-xs text-zinc-500">{index === 0 ? 'Shapes the emotional arc' : index === 1 ? 'Balances every choice' : index === 2 ? 'Builds resilient moments' : index === 3 ? 'Finds flavor and texture' : 'Unifies the experience'}</p></div><i className={loading ? 'h-2 w-2 animate-pulse rounded-full bg-violet-300' : 'h-2 w-2 rounded-full bg-emerald-400'} /></div>)}</div><div className="mt-8 rounded-2xl border border-white/10 bg-white/[.035] p-4"><p className="text-xs uppercase tracking-wider text-zinc-500">How it works</p><p className="mt-2 text-sm leading-6 text-zinc-400">Four specialists research independently. The coordinator turns their insights into one coherent, shareable Journey Drop.</p></div></aside></motion.div>
    {saved.length > 0 && <section className="pb-10"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-medium">Your past journeys</h2><span className="text-xs text-zinc-500">Saved privately in your workspace</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{saved.map((item) => <button onClick={() => setTrip(item)} key={item.id} className="glass card-hover rounded-2xl p-5 text-left"><p className="text-xs text-violet-200">{item.destination}</p><h3 className="mt-2 text-lg">{item.experience.title}</h3><p className="mt-2 line-clamp-2 text-sm text-zinc-400">{item.experience.premise}</p><Link onClick={(e) => e.stopPropagation()} href={`/share/${item.share_slug}`} className="mt-4 inline-block text-xs text-zinc-300 hover:text-white">Open share page ↗</Link></button>)}</div></section>}
  </div>{loading && <div className="fixed inset-0 z-50 grid place-items-center bg-[#07070b]/75 p-5 backdrop-blur-xl"><motion.section initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} className="glass-strong animated-border w-full max-w-xl rounded-[28px] p-6 sm:p-8"><p className="text-xs font-medium uppercase tracking-[.22em] text-violet-200">RoamVerse is composing your journey</p><h2 className="mt-3 text-2xl tracking-[-.04em]">A few beautiful decisions are taking shape.</h2><div className="mt-7 space-y-3">{generationStages.map(([icon, name, copy], index) => <div className="rounded-2xl border border-white/8 bg-white/[.045] p-4 transition" key={name}><div className="flex items-center gap-3"><span className="text-lg">{icon}</span><span className="text-sm font-medium">{name}</span><span className="ml-auto text-xs text-violet-200">{index < stage ? 'Complete' : index === stage ? 'Thinking' : 'Waiting'}</span></div><p className="mt-2 text-sm text-zinc-400">{copy}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><motion.div animate={{ width: index < stage ? '100%' : index === stage ? '72%' : '8%' }} transition={{ duration: .7 }} className="h-full rounded-full bg-gradient-to-r from-violet-400 to-sky-300"/></div></div>)}</div><p className="mt-6 text-center text-xs text-zinc-500">The final Journey Drop will reveal section by section.</p></motion.section></div>}</main>;
}
