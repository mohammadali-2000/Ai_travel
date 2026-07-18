export type Trip = {
  id: string; owner_id: string; destination: string; start_date: string; end_date: string;
  budget: number; currency: string; travelers: number; intent: string; share_slug: string;
  created_at?: string;
  agents: { agent: string; status: 'complete' | 'failed' }[];
  experience: {
    title: string; premise: string; map_center: string; map_points: string[];
    itinerary: { day: number; title: string; theme: string; moments: string[] }[];
    budget_breakdown: { category: string; amount: number; note: string }[];
    weather: { summary: string; packing_note: string; contingency: string };
    food: { name: string; neighborhood: string; why: string; price: string }[];
    packing: string[]; hidden_gems: string[];
  };
};

export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
