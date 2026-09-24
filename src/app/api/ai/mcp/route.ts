import { NextResponse } from 'next/server';
import { handleMcpRequest, getMcpManifest } from '@/lib/ai/mcp/server';

export async function GET() {
  return NextResponse.json(getMcpManifest());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await handleMcpRequest(body);
    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
