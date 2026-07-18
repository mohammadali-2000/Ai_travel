'use client';

import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const destinations = [
  ['Kyoto', 'Moonlit temples, tea at dawn', 'JP'],
  ['Lisbon', 'An Atlantic city, unhurried', 'PT'],
  ['Reykjavík', 'A quiet route through fire and ice', 'IS'],
];

export function TravelOS() {
  return (
    <main className="aurora-page relative min-h-screen overflow-hidden px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div aria-hidden className="aurora-orb absolute -top-48 left-1/2 h-[520px] w-[720px] -translate-x-1/2 rounded-full opacity-80" />
      <div className="relative mx-auto max-w-7xl">
        <header className="glass flex h-16 items-center justify-between rounded-2xl px-4 sm:px-5">
          <a className="flex items-center gap-2.5" href="#main" aria-label="RoamVerse home">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-violet-300 to-indigo-500 text-sm font-bold text-zinc-950 shadow-lg shadow-indigo-500/20">R</span>
            <span className="text-[15px] font-medium tracking-tight">RoamVerse</span>
          </a>
          <nav className="hidden items-center gap-1 text-sm text-zinc-400 md:flex" aria-label="Primary navigation">
            <a className="rounded-lg px-3 py-2 text-zinc-100" href="#main">Workspace</a>
            <a className="rounded-lg px-3 py-2 hover:text-white" href="#discover">Discover</a>
            <a className="rounded-lg px-3 py-2 hover:text-white" href="#collections">Collections</a>
          </nav>
          <button className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xs text-zinc-200" aria-label="Open account menu">SM</button>
        </header>

        <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.07 }} id="main" className="pt-10 sm:pt-16">
          <motion.div variants={fadeUp} className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-xs font-medium uppercase tracking-[.22em] text-violet-300">Your travel intelligence, amplified</p>
            <h1 className="text-balance text-4xl font-medium tracking-[-.055em] text-white sm:text-6xl">Where should curiosity take you?</h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-7 text-zinc-400 sm:text-lg">A private team of travel minds is ready to turn a passing thought into a journey worth sharing.</p>
          </motion.div>

          <motion.section variants={fadeUp} className="glass mx-auto mt-9 max-w-3xl rounded-[22px] p-2 shadow-2xl shadow-black/25" aria-label="Ask your travel team">
            <div className="flex items-end gap-3 rounded-[17px] bg-black/20 px-4 py-3">
              <span className="mb-1.5 text-lg text-violet-300">✦</span>
              <label className="flex-1">
                <span className="sr-only">Travel idea</span>
                <textarea className="h-12 w-full resize-none bg-transparent pt-1 text-[15px] leading-6 text-white outline-none placeholder:text-zinc-500" placeholder="Ask anything — a mood, a place, a moment…" />
              </label>
              <button className="mb-1 grid h-9 w-9 place-items-center rounded-xl bg-white text-lg text-zinc-900 transition hover:scale-105" aria-label="Send prompt">↑</button>
            </div>
            <div className="flex gap-2 overflow-x-auto px-2 pb-1 pt-3 text-xs text-zinc-400">
              {['A cinematic long weekend', 'Find my next obsession', 'Build a shared escape'].map((idea) => <button key={idea} className="whitespace-nowrap rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 transition hover:bg-white/[.09] hover:text-zinc-100">{idea}</button>)}
            </div>
          </motion.section>

          <motion.section variants={fadeUp} id="discover" className="mt-7 grid gap-4 lg:grid-cols-12">
            <article className="glass card-hover relative min-h-[315px] overflow-hidden rounded-[22px] p-6 sm:p-7 lg:col-span-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_25%,rgba(177,145,255,.32),transparent_23%),radial-gradient(circle_at_86%_80%,rgba(93,163,255,.22),transparent_32%)]" />
              <div className="relative flex h-full flex-col justify-between">
                <div><span className="rounded-full border border-violet-200/15 bg-violet-300/10 px-2.5 py-1 text-[11px] font-medium text-violet-200">Live signal</span><h2 className="mt-5 max-w-md text-3xl font-medium tracking-[-.04em] text-white">Your travel taste is shifting toward the unfamiliar.</h2></div>
                <div className="flex items-end justify-between"><p className="max-w-sm text-sm leading-6 text-zinc-300">The Explorer agent noticed a pattern: slow mornings, dramatic landscapes, and places with stories still unfolding.</p><button className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white backdrop-blur hover:bg-white/15">Explore signal</button></div>
              </div>
            </article>
            <article className="glass card-hover rounded-[22px] p-6 lg:col-span-5">
              <div className="flex items-center justify-between"><p className="text-sm font-medium">Your travel team</p><span className="text-xs text-emerald-300">3 agents ready</span></div>
              <div className="mt-7 space-y-5">
                {[['Explorer', 'Reading the world beyond the obvious', 'E'], ['Local Lens', 'Finding texture, not tourist traps', 'L'], ['Storymaker', 'Shaping moments people remember', 'S']].map(([name, copy, initial], index) => <div className="flex items-center gap-3" key={name}><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[.08] text-xs font-medium text-violet-200">{initial}</span><div className="flex-1"><p className="text-sm text-zinc-100">{name}</p><p className="mt-0.5 text-xs text-zinc-500">{copy}</p></div><span className={index === 1 ? 'h-2 w-2 rounded-full bg-amber-300' : 'h-2 w-2 rounded-full bg-emerald-400'} /></div>)}
              </div>
            </article>
          </motion.section>

          <motion.section variants={fadeUp} id="collections" className="mt-4 grid gap-4 md:grid-cols-3">
            {destinations.map(([city, copy, code], index) => <article key={city} className="glass card-hover group relative min-h-[210px] overflow-hidden rounded-[22px] p-5"><div className={`absolute inset-0 opacity-60 ${index === 0 ? 'bg-[radial-gradient(circle_at_82%_10%,#b282ba55,transparent_38%),linear-gradient(150deg,#44285550,transparent)' : index === 1 ? 'bg-[radial-gradient(circle_at_80%_15%,#db9f6355,transparent_42%),linear-gradient(150deg,#343f6150,transparent)' : 'bg-[radial-gradient(circle_at_80%_15%,#8bb7cc55,transparent_42%),linear-gradient(150deg,#34486650,transparent)'}`}/><div className="relative flex h-full flex-col justify-between"><span className="w-fit rounded-lg border border-white/10 bg-black/10 px-2 py-1 font-mono text-[10px] tracking-wider text-zinc-300">{code}</span><div><h3 className="text-xl font-medium tracking-[-.03em] text-white">{city}</h3><p className="mt-1 text-sm text-zinc-300">{copy}</p></div></div></article>)}
          </motion.section>
        </motion.div>
        <footer className="flex items-center justify-between py-8 text-xs text-zinc-600"><span>RoamVerse / Private beta</span><span className="flex items-center gap-2"><i className="shimmer inline-block h-1.5 w-1.5 rounded-full bg-violet-300" /> Agents are standing by</span></footer>
      </div>
    </main>
  );
}
