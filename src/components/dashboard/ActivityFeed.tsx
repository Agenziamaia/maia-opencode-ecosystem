import { useState, useEffect, useRef } from 'react';
import { ActivityItem, ActivityType } from '../../lib/types';

interface ActivityFeedProps {
  maxItems?: number;
}

const activityIcons: Record<ActivityType, string> = {
  agent_status: '🤖',
  task_update: '📋',
  vote_cast: '🗳️',
  pattern_match: '🧬',
  agent_interaction: '🤝',
};

const activityColors: Record<ActivityType, string> = {
  agent_status: 'border-blue-200 bg-blue-50',
  task_update: 'border-green-200 bg-green-50',
  vote_cast: 'border-purple-200 bg-purple-50',
  pattern_match: 'border-indigo-200 bg-indigo-50',
  agent_interaction: 'border-orange-200 bg-orange-50',
};

export default function ActivityFeed({ maxItems = 20 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        type: 'agent_interaction',
        data: {
          agent: 'coder',
          action: 'Created task "Fix auth bug"',
        },
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1 * 60 * 1000),
        type: 'vote_cast',
        data: {
          agent: 'sisyphus',
          decision: 'Should coder handle auth implementation?',
          vote: 'upvote',
        },
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 30 * 1000),
        type: 'pattern_match',
        data: {
          task: 'Implement JWT authentication',
          pattern: 'API Implementation',
          confidence: 0.85,
        },
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 10 * 1000),
        type: 'agent_status',
        data: {
          agent: 'reviewer',
          status: 'healthy',
        },
      },
    ];

    setActivities(mockActivities);
  }, []);

  const formatTimeAgo = (timestamp: Date): string => {
    const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const renderActivityContent = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'agent_interaction':
        return (
          <span>
            <span className="font-semibold">{activity.data.agent}</span>
            <span className="text-gray-600"> {activity.data.action}</span>
          </span>
        );

      case 'vote_cast':
        return (
          <div>
            <div className="font-semibold">{activity.data.agent}</div>
            <div className="text-sm text-gray-600 mt-1">
              <span className="text-indigo-700">{activity.data.vote}</span> on "{activity.data.decision}"
            </div>
          </div>
        );

      case 'pattern_match':
        return (
          <div>
            <div className="font-semibold">DNA Pattern Matched</div>
            <div className="text-sm text-gray-600 mt-1">
              Task: <span className="text-indigo-700">{activity.data.task}</span>
            </div>
            <div className="text-sm text-indigo-700">
              Pattern: "{activity.data.pattern}" - {(activity.data.confidence * 100).toFixed(0)}% confidence
            </div>
          </div>
        );

      case 'agent_status':
        return (
          <span>
            <span className="font-semibold">{activity.data.agent}</span>
            <span className="text-gray-600"> is now </span>
            <span className={`font-semibold ${
              activity.data.status === 'healthy' ? 'text-green-600' :
              activity.data.status === 'unhealthy' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {activity.data.status}
            </span>
          </span>
        );

      default:
        return <span>{JSON.stringify(activity.data)}</span>;
    }
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Activity Feed</h2>
        <div className="text-sm text-gray-600">
          {displayedActivities.length} events
        </div>
      </div>

      <div
        ref={feedRef}
        className="space-y-3 max-h-[600px] overflow-y-auto pr-2"
      >
        {displayedActivities.map(activity => (
          <div
            key={activity.id}
            className={`p-3 rounded-lg border ${activityColors[activity.type]}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{activityIcons[activity.type]}</span>
              <div className="flex-1">
                {renderActivityContent(activity)}
                <div className="text-xs text-gray-500 mt-1">
                  {formatTimeAgo(activity.timestamp)}
                </div>
              </div>
            </div>
            </div>
        ))}

        {displayedActivities.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
}
