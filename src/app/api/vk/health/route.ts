import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const health = {
      agents: {
        available: 13,
        total: 19,
      },
      council: {
        activeDecisions: 2,
      },
      dna: {
        learnedPatterns: 15,
      },
      overall: 'healthy' as const,
    };

    return NextResponse.json({
      success: true,
      data: health,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch ecosystem health',
        error_data: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
