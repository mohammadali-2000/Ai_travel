import { notFound } from 'next/navigation';
import { TravelOS } from '@/components/travel-os';
import { WorkspacePage } from '@/components/workspace-page';

const pages = new Set(['dashboard', 'timeline', 'agents', 'budget', 'food', 'weather', 'profile']);

export default async function WorkspaceRoute({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  if (page === 'create') return <TravelOS />;
  if (pages.has(page)) return <WorkspacePage page={page} />;
  notFound();
}
