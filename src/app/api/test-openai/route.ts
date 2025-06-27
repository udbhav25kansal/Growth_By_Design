import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'OPENAI_API_KEY environment variable not set'
      }, { status: 400 });
    }

    // Make a simple test call to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 1
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        message: 'OpenAI API key is working!',
        response: data.choices[0]?.message?.content || 'No response content',
        usage: data.usage
      });
    } else {
      const error = await response.json();
      return NextResponse.json({
        success: false,
        error: `API Error: ${response.status} - ${error.error?.message || 'Unknown error'}`,
        details: error
      }, { status: response.status });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Network error: ${error.message}`
    }, { status: 500 });
  }
} 