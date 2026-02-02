import { NextRequest, NextResponse } from 'next/server';

const VIBE_KANBAN_URL = process.env.VIBE_KANBAN_URL || 'http://localhost:62601';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id') || 'b7a06d11-3600-447f-8dbd-617b0de52e67';

    const response = await fetch(`${VIBE_KANBAN_URL}/api/tasks?project_id=${projectId}`);
    const data = await response.json();

    return NextResponse.json({
      success: data.success,
      data: data.data || [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isConnectionError = message.includes('ECONNREFUSED') || message.includes('fetch failed');

    return NextResponse.json(
      {
        success: false,
        error: isConnectionError ? 'VibeKanban service is offline' : 'Failed to fetch tasks',
        error_data: message,
        data: [],
      },
      { status: isConnectionError ? 503 : 500 }
    );
  }
}
