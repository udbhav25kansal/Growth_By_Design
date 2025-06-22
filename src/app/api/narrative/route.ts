import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      onboarding,
      lastCheck = {}
    } = body;

    if (!onboarding) {
      return NextResponse.json(
        { error: 'Onboarding data is required' },
        { status: 400 }
      );
    }

    const { stage, goal, mrr, churn, conversion } = onboarding;
    const { alignment: verdict, suggestion } = lastCheck;

    const narrative = `
We are a ${stage}-stage startup aiming to ${goal}. 
Current metrics: MRR=$${mrr}, churn=${churn}%, conversion=${conversion}%.
Our last action check was: ${verdict || 'N/A'} ("${suggestion || 'No previous validation'}").
This shows we follow a data-driven growth process.
    `.trim();

    return NextResponse.json({ narrative });
  } catch (error) {
    console.error('Error generating narrative:', error);
    return NextResponse.json(
      { error: 'Failed to generate narrative' },
      { status: 500 }
    );
  }
} 