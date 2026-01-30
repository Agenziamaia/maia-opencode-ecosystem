import { NextRequest, NextResponse } from 'next/server';

const MOCK_DECISIONS = [
  {
    decision_id: 'council_123',
    proposal: 'Should coder handle JWT authentication implementation?',
    votes: [
      {
        agent_id: 'maia',
        vote: 'upvote',
        reasoning: 'Coder has strong auth implementation experience',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      },
      {
        agent_id: 'sisyphus',
        vote: 'upvote',
        reasoning: 'This is a critical infrastructure task, coder is the right choice',
        timestamp: new Date(Date.now() - 1.5 * 60 * 1000).toISOString(),
      },
      {
        agent_id: 'reviewer',
        vote: 'abstain',
        reasoning: 'Will review once implementation is complete',
        timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      },
    ],
    status: 'pending',
    consensus_threshold: 0.7,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    timeout_at: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
    timeout_ms: 300000,
  },
  {
    decision_id: 'council_456',
    proposal: 'Should we adopt TypeScript strict mode across all projects?',
    votes: [
      {
        agent_id: 'maia',
        vote: 'upvote',
        reasoning: 'Improves type safety and reduces bugs',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        agent_id: 'ops',
        vote: 'downvote',
        reasoning: 'May slow down development velocity',
        timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
      },
      {
        agent_id: 'coder',
        vote: 'upvote',
        reasoning: 'Already using strict mode in new projects, works well',
        timestamp: new Date(Date.now() - 13 * 60 * 1000).toISOString(),
      },
    ],
    status: 'consensus',
    consensus_threshold: 0.7,
    created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    timeout_at: new Date(Date.now() - 17 * 60 * 1000).toISOString(),
    final_decision: 'approved',
    timeout_ms: 300000,
  },
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: MOCK_DECISIONS,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch council decisions',
        error_data: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
