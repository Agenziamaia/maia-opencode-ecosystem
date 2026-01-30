import useEcosystemPolling from '../../lib/hooks/useEcosystemPolling';
import AgentStatusGrid from './AgentStatusGrid';
import TaskBoard from './TaskBoard';
import ActivityFeed from './ActivityFeed';

export default function EcosystemDashboard() {
  const {
    tasks,
    agents,
    decisions,
    health,
    isPolling,
    error,
    lastUpdate,
    refetch,
  } = useEcosystemPolling(5000);

  const handleMoveTask = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/vk/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: taskId,
          status: newStatus,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update task: ${res.status}`);
      }

      refetch();
    } catch (err) {
      console.error('Error moving task:', err);
      alert('Failed to move task. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🌱 MAIA Living Ecosystem Showcase
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {isPolling && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Live updates
                </span>
              )}
              <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>

          <button
            onClick={refetch}
            disabled={isPolling}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
          >
            {isPolling ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-bold text-red-900">Connection Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <AgentStatusGrid agents={agents} />
            <TaskBoard tasks={tasks} onMoveTask={handleMoveTask} />
          </div>

          <div className="space-y-6">
            <ActivityFeed maxItems={15} />

            {health && (
              <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Ecosystem Health</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Agents Available</span>
                    <span className="font-semibold text-gray-900">
                      {health.agents.available} / {health.agents.total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Active Council Decisions</span>
                    <span className="font-semibold text-gray-900">
                      {health.council.activeDecisions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Learned DNA Patterns</span>
                    <span className="font-semibold text-gray-900">
                      {health.dna.learnedPatterns}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-gray-700">Overall Status</span>
                    <span className={`font-semibold ${
                      health.overall === 'healthy' ? 'text-green-600' :
                      health.overall === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {health.overall === 'healthy' ? '✅ Healthy' :
                       health.overall === 'warning' ? '⚠️ Warning' :
                       '❌ Error'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
