import { useState, useEffect } from 'react';
import type { EcosystemHealth, AgentData, Task, CouncilDecision, DNAMatchResult } from '../lib/types';

interface EcosystemData {
  tasks: Task[];
  agents: AgentData[];
  decisions: CouncilDecision[];
  health: EcosystemHealth;
  dnaMatches: Map<string, DNAMatchResult>;
}

export function useEcosystemPolling(intervalMs: number = 5000) {
  const [data, setData] = useState<EcosystemData>({
    tasks: [],
    agents: [],
    decisions: [],
    health: {
      agents: { available: 0, total: 0 },
      council: { activeDecisions: 0 },
      dna: { learnedPatterns: 0 },
      overall: 'error',
    },
    dnaMatches: new Map(),
  });

  const [isPolling, setIsPolling] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    let isMounted = true;

    const fetchEcosystemData = async () => {
      if (!isMounted) return;

      try {
        const [tasksRes, agentsRes, decisionsRes, healthRes] = await Promise.all([
          fetch('/api/vk/tasks'),
          fetch('/api/vk/agents'),
          fetch('/api/vk/decisions'),
          fetch('/api/vk/health'),
        ]);

        const tasks = (await tasksRes.json()).data || [];
        const agents = (await agentsRes.json()).data || [];
        const decisions = (await decisionsRes.json()).data || [];
        const health = (await healthRes.json()).data;

        if (isMounted) {
          setData(prev => ({
            ...prev,
            tasks,
            agents,
            decisions,
            health,
          }));
          setLastUpdate(new Date());
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch ecosystem data');
          console.error('Polling error:', err);
        }
      }
    };

    fetchEcosystemData();
    const interval = setInterval(fetchEcosystemData, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [intervalMs]);

  const refetch = () => {
    setIsPolling(true);
    setTimeout(() => setIsPolling(false), 100);
  };

  return {
    ...data,
    isPolling,
    error,
    lastUpdate,
    refetch,
  };
}
