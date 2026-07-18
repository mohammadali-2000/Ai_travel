'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

type MissionControlProps = {
  activeStage: number;
  isCompleting: boolean;
};

const agents = [
  { icon: '🧠', name: 'Planner Agent', task: 'Finding the optimal itinerary' },
  { icon: '🍜', name: 'Food Agent', task: 'Searching authentic local restaurants' },
  { icon: '🌦', name: 'Weather Agent', task: 'Checking seasonal forecasts' },
  { icon: '📸', name: 'Photography Agent', task: 'Finding scenic viewpoints' },
  { icon: '🏨', name: 'Stay Agent', task: 'Comparing accommodation options' },
  { icon: '💰', name: 'Budget Agent', task: 'Optimizing trip costs' },
  { icon: '🎭', name: 'Story Agent', task: 'Crafting your travel narrative' },
];

const updates = [
  'Planning day 1 around your travel rhythm…',
  'Ranking attractions worth your time…',
  'Finding local experiences beyond the guidebooks…',
  'Calculating travel times between moments…',
  'Selecting hidden gems for your Journey Drop…',
  'Composing recommendations into one story…',
];

export function MissionControl({ activeStage, isCompleting }: MissionControlProps) {
  const [updateIndex, setUpdateIndex] = useState(0);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const updateTimer = window.setInterval(() => setUpdateIndex((current) => (current + 1) % updates.length), 1900);
    const pulseTimer = window.setInterval(() => setPulse((current) => current + 1), 850);
    return () => { window.clearInterval(updateTimer); window.clearInterval(pulseTimer); };
  }, []);

  const activeAgent = Math.min(activeStage, agents.length - 1);
  const completed = isCompleting ? agents.length : Math.min(activeAgent, agents.length);
  const progress = useMemo(() => Math.min(90, 24 + activeStage * 13 + (pulse % 3) * 4), [activeStage, pulse]);

  return <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 overflow-hidden bg-[#070814] px-4 py-5 text-white sm:p-8"
    aria-live="polite"
    aria-label="AI travel team is working"
  >
    <div className="mission-orb mission-orb-one" /><div className="mission-orb mission-orb-two" /><div className="mission-grid" />
    <div className="relative mx-auto flex min-h-full max-w-6xl flex-col justify-center">
      <motion.header initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-7 text-center sm:mb-10">
        <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5 text-xs font-medium text-violet-100 shadow-[0_0_35px_rgba(139,92,246,.22)]">
          <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> LIVE COLLABORATION
        </div>
        <h2 className="text-3xl font-medium tracking-[-.05em] text-white sm:text-5xl">AI Travel Team Working</h2>
        <p className="mt-3 text-sm text-indigo-100/65 sm:text-base">Building your personalized journey, one considered detail at a time.</p>
      </motion.header>

      <section className="mission-panel mx-auto w-full max-w-5xl rounded-[28px] p-4 sm:p-7">
        <div className="mb-5 flex flex-col gap-3 border-b border-white/[.08] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-200/75">Mission timeline</p><AnimatePresence mode="wait"><motion.p key={updateIndex} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="mt-2 text-sm text-white/85">{isCompleting ? 'Your Journey Drop is ready to reveal…' : updates[updateIndex]}</motion.p></AnimatePresence></div>
          <span className="w-fit rounded-full bg-violet-400/10 px-3 py-1.5 text-xs text-violet-100">{isCompleting ? 'Finalizing' : `${Math.min(activeAgent + 1, agents.length)} agents active`}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent, index) => {
            const status = isCompleting || index < completed ? 'complete' : index === activeAgent || index === (activeAgent + 1) % agents.length ? 'active' : 'queued';
            const width = status === 'complete' ? 100 : status === 'active' ? Math.max(35, Math.min(92, progress - (index === activeAgent ? 0 : 14))) : 12;
            return <motion.article key={agent.name} layout className={`mission-agent mission-agent-${status} rounded-2xl p-4`} animate={{ y: status === 'active' ? [0, -2, 0] : 0 }} transition={{ duration: 1.4, repeat: status === 'active' ? Infinity : 0 }}>
              <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[.08] text-lg">{agent.icon}</span><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-medium text-white">{agent.name}</h3><p className="mt-0.5 text-xs text-white/50">{status === 'complete' ? 'Insight delivered' : status === 'active' ? 'Working now' : 'Standing by'}</p></div>{status === 'complete' ? <span className="text-sm text-emerald-300">✓</span> : <i className={`h-2 w-2 rounded-full ${status === 'active' ? 'animate-pulse bg-violet-300 shadow-[0_0_12px_#c4b5fd]' : 'bg-white/20'}`} />}</div>
              <p className="mt-3 min-h-9 text-xs leading-4 text-white/58">{agent.task}…</p><div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[.08]"><motion.div className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-300 to-sky-300" animate={{ width: `${width}%` }} transition={{ duration: .65, ease: 'easeOut' }} /></div>
            </motion.article>;
          })}
        </div>
      </section>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .35 }} className="mt-6 text-center text-xs text-white/40">Your agents are collaborating privately. No generic itinerary is being generated.</motion.div>
    </div>
  </motion.div>;
}
