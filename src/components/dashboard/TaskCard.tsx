import { Task, ExtendedTask, AgentId } from '../../lib/types';

interface TaskCardProps {
  task: ExtendedTask;
  isDragging?: boolean;
  onDragStart?: (e: DragEvent<HTMLDivElement>, task: Task) => void;
}

function AgentBadge({ agentId, size = 'sm' }: { agentId: AgentId; size?: 'sm' | 'md' }) {
  const colors: Record<AgentId, string> = {
    maia: 'bg-purple-600',
    sisyphus: 'bg-indigo-600',
    coder: 'bg-blue-600',
    ops: 'bg-orange-600',
    researcher: 'bg-green-600',
    researcher_deep: 'bg-green-700',
    reviewer: 'bg-red-600',
    giuzu: 'bg-cyan-600',
    workflow: 'bg-teal-600',
    opencode: 'bg-violet-600',
    vision: 'bg-pink-600',
    starter: 'bg-amber-600',
    librarian: 'bg-lime-600',
    maia_premium: 'bg-purple-700',
    prometheus: 'bg-slate-600',
    oracle: 'bg-sky-600',
    explore: 'bg-emerald-600',
    frontend: 'bg-rose-600',
    github: 'bg-gray-600',
    sisyphus_junior: 'bg-indigo-700',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses} ${colors[agentId] || 'bg-gray-600'} text-white rounded-full font-medium`}>
      {agentId}
    </span>
  );
}

export default function TaskCard({ task, isDragging = false, onDragStart }: TaskCardProps) {
  const { agent_assignment, dna, council_decision } = task;

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (onDragStart) {
      onDragStart(e, task);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`
        bg-white rounded-lg border-2 p-4 cursor-move transition-all
        ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-lg hover:scale-[1.02]'}
        ${agent_assignment ? 'border-blue-300' : 'border-gray-200'}
      `}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-gray-900 flex-1">{task.title}</h4>
          {agent_assignment && (
            <AgentBadge agentId={agent_assignment.primary_agent} />
          )}
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 line-clamp-3">{task.description}</p>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 5).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 5 && (
              <span className="text-xs text-gray-500">+{task.tags.length - 5}</span>
            )}
          </div>
        )}

        {dna && dna.pattern_id && (
          <div className="p-2 bg-blue-50 rounded border border-blue-200">
            <div className="flex items-center gap-1 text-sm">
              <span className="text-lg">🧬</span>
              <span className="font-semibold text-blue-900">Pattern Match</span>
              <span className="ml-auto text-blue-700">
                {(dna.pattern_confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
          </div>
        )}

        {council_decision && council_decision.status === 'pending' && (
          <div className="p-2 bg-indigo-50 rounded border border-indigo-200">
            <div className="flex items-center gap-1 text-sm">
              <span className="text-lg">🗳️</span>
              <span className="font-semibold text-indigo-900">Council Decision</span>
              <span className="ml-auto text-indigo-700">
                {council_decision.votes.length} votes
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
          <span>Updated: {new Date(task.updated_at).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
