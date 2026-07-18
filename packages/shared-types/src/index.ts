/** Stable contracts shared by web clients and API consumers. */
export type AgentName = 'discovery' | 'local-expert' | 'social-curator' | 'trip-concierge';

export interface AgentRunRequest {
  agent: AgentName;
  conversationId: string;
  input: string;
}

export interface AgentRunResponse {
  runId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
}
