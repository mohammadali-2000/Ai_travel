'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiUrl, Trip } from '@/lib/trips';
import { TripCanvas } from '@/components/trip-canvas';

export default function SharePage() {
  const { slug } = useParams<{ slug: string }>(); const [trip, setTrip] = useState<Trip | null>(null); const [error, setError] = useState('');
  useEffect(() => { fetch(`${apiUrl}/api/v1/journeys/shared/${slug}`).then(async (r) => { const data = await r.json(); if (!r.ok) throw new Error(data.detail); return data; }).then(setTrip).catch((cause) => setError(cause.message)); }, [slug]);
  if (error) return <main className="aurora-page grid min-h-screen place-items-center p-6 text-center"><div><h1 className="text-2xl">This Journey Drop is unavailable.</h1><p className="mt-2 text-zinc-400">{error}</p></div></main>;
  if (!trip) return <main className="aurora-page grid min-h-screen place-items-center text-zinc-400">Opening Journey Drop…</main>;
  return <TripCanvas trip={trip} shared />;
}
