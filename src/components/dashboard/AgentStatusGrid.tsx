import { AgentData, AgentStatus } from '../../lib/types';

interface AgentStatusProps {
  agent: AgentData;
}

function AgentStatusDot({ agent }: AgentStatusProps) {
  const statusColors = {
    healthy: 'bg-green-500',
    unhealthy: 'bg-red-500',
    busy: 'bg-yellow-500',
    idle: 'bg-gray-400',
  };

  const loadPercentage = (agent.currentTasks / agent.maxTasks) * 100;

  return (
    <div className="relative">
      <div className={`w-4 h-4 rounded-full ${statusColors[agent.status]} ${agent.status === 'healthy' && agent.currentTasks > 0 ? 'animate-pulse' : ''}`} />
      {agent.currentTasks > 0 && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
          <span className="text-[10px] font-bold text-gray-700">{agent.currentTasks}</span>
        </div>
      )}
    </div>
  );
}

interface AgentStatusGridProps {
  agents: AgentData[];
}

export default function AgentStatusGrid({ agents }: AgentStatusGridProps) {
  const columns = 5;
  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Agent Status Grid</h2>
        <div className="text-sm text-gray-600">
          {agents.filter(a => a.status === 'healthy').length} / {agents.length} healthy
        </div>
      </div>

      <div className="grid gap-3" style={gridStyle}>
        {agents.map(agent => (
          <div
            key={agent.id}
            className={`p-3 rounded-lg border-2 transition-all ${
              agent.status === 'healthy'
                ? 'bg-white border-green-300 hover:shadow-lg'
                : agent.status === 'unhealthy'
                ? 'bg-red-50 border-red-300'
                : agent.status === 'busy'
                ? 'bg-yellow-50 border-yellow-300'
                : 'bg-gray-50 border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <AgentStatusDot agent={agent} />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                <div className="text-xs text-gray-500 capitalize">{agent.status}</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <span>Load:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-full rounded-full transition-all ${
                      agent.currentTasks / agent.maxTasks > 0.8 ? 'bg-red-500' :
                      agent.currentTasks / agent.maxTasks > 0.5 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${loadPercentage}%` }}
                  />
                </div>
                <span className="font-mono">{agent.currentTasks}/{agent.maxTasks}</span>
              </div>

              {agent.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {agent.specialties.slice(0, 3).map((spec, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px]"
                    >
                      {spec}
                    </span>
                  ))}
                  {agent.specialties.length > 3 && (
                    <span className="text-xs text-gray-500">+{agent.specialties.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
