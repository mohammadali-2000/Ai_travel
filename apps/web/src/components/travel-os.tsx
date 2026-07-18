'use client';

import { motion } from 'framer-motion';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiUrl, Trip } from '@/lib/trips';
import { TripCanvas } from './trip-canvas';

const agentNames = ['Experience Designer', 'Budget Agent', 'Weather Agent', 'Food Agent', 'Journey Coordinator'];
const field = 'mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-300/60';

function ownerId() {
  const key = 'roamverse-owner-id';
  let value = window.localStorage.getItem(key);
  if (!value) { value = crypto.randomUUID(); window.localStorage.setItem(key, value); }
  return value;
}

export function TravelOS() {
  const [form, setForm] = useState({ destination: '', start_date: '', end_date: '', budget: '2500', currency: 'USD', travelers: '1', intent: '' });
  const [trip, setTrip] = useState<Trip | null>(null);
  const [saved, setSaved] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetch(`${apiUrl}/api/v1/journeys?owner_id=${encodeURIComponent(ownerId())}`).then((r) => r.ok ? r.json() : []).then(setSaved).catch(() => undefined); }, []);

  async function createTrip(event: FormEvent) {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/v1/journeys`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, budget: Number(form.budget), travelers: Number(form.travelers), owner_id: ownerId() }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail ?? 'Journey generation was unavailable.');
      setTrip(payload); setSaved((current) => [payload, ...current]);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not generate your journey.'); }
    finally { setLoading(false); }
  }

  if (trip) return <TripCanvas trip={trip} />;

  return <main className="aurora-page min-h-screen px-4 py-4 sm:px-7"><div className="mx-auto max-w-6xl"><header className="glass flex h-16 items-center justify-between rounded-2xl px-5"><div className="flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-violet-300 to-indigo-500 font-bold text-zinc-950">R</span><span className="text-[15px] font-medium">RoamVerse</span></div><span className="text-xs text-zinc-500">AI travel operating system</span></header>
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-5 py-10 lg:grid-cols-[1.1fr_.9fr]"><section><p className="text-xs font-medium uppercase tracking-[.22em] text-violet-300">Create a Journey Drop</p><h1 className="mt-4 max-w-xl text-4xl font-medium tracking-[-.055em] sm:text-6xl">A trip worth remembering starts with a feeling.</h1><p className="mt-5 max-w-lg text-lg leading-7 text-zinc-400">Give your AI travel team a destination, time, and budget. They’ll create a complete experience—not a generic itinerary.</p>
      <form onSubmit={createTrip} className="glass mt-8 rounded-[22px] p-5 sm:p-6"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm text-zinc-300">Destination<input required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className={field} placeholder="e.g. Kyoto, Japan" /></label><label className="text-sm text-zinc-300">Total budget<input required min="100" type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className={field} /></label><label className="text-sm text-zinc-300">Start date<input required type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className={field} /></label><label className="text-sm text-zinc-300">End date<input required type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className={field} /></label></div><label className="mt-4 block text-sm text-zinc-300">What should it feel like?<textarea value={form.intent} onChange={(e) => setForm({ ...form, intent: e.target.value })} className={`${field} h-20 resize-none`} placeholder="Slow mornings, beautiful food, one surprising encounter…" /></label><button disabled={loading} className="mt-5 w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-zinc-950 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Your team is building the journey…' : 'Create my travel experience →'}</button>{error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}</form></section>
    <aside className="glass rounded-[22px] p-6"><div className="flex items-center justify-between"><p className="text-sm font-medium">Your travel team</p><span className={loading ? 'text-xs text-violet-200' : 'text-xs text-emerald-300'}>{loading ? 'Working now' : 'Ready'}</span></div><div className="mt-6 space-y-5">{agentNames.map((agent, index) => <div className="flex items-center gap-3" key={agent}><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[.08] text-xs text-violet-200">{index + 1}</span><div className="flex-1"><p className="text-sm">{agent}</p><p className="mt-0.5 text-xs text-zinc-500">{index === 0 ? 'Shapes the emotional arc' : index === 1 ? 'Balances every choice' : index === 2 ? 'Builds resilient moments' : index === 3 ? 'Finds flavor and texture' : 'Unifies the experience'}</p></div><i className={loading ? 'h-2 w-2 animate-pulse rounded-full bg-violet-300' : 'h-2 w-2 rounded-full bg-emerald-400'} /></div>)}</div><div className="mt-8 rounded-2xl border border-white/10 bg-white/[.035] p-4"><p className="text-xs uppercase tracking-wider text-zinc-500">How it works</p><p className="mt-2 text-sm leading-6 text-zinc-400">Four specialists research independently. The coordinator turns their insights into one coherent, shareable Journey Drop.</p></div></aside></motion.div>
    {saved.length > 0 && <section className="pb-10"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-medium">Your past journeys</h2><span className="text-xs text-zinc-500">Saved privately in your workspace</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{saved.map((item) => <button onClick={() => setTrip(item)} key={item.id} className="glass card-hover rounded-2xl p-5 text-left"><p className="text-xs text-violet-200">{item.destination}</p><h3 className="mt-2 text-lg">{item.experience.title}</h3><p className="mt-2 line-clamp-2 text-sm text-zinc-400">{item.experience.premise}</p><Link onClick={(e) => e.stopPropagation()} href={`/share/${item.share_slug}`} className="mt-4 inline-block text-xs text-zinc-300 hover:text-white">Open share page ↗</Link></button>)}</div></section>}
  </div></main>;
}
