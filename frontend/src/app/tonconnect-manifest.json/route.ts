import { NextResponse } from 'next/server';

export async function GET() {
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;

  if (!frontendUrl) {
    console.error('NEXT_PUBLIC_FRONTEND_URL is not set');
    return new NextResponse('Unexpected error', { status: 500 });
  }

  const manifest = {
    url: frontendUrl,
    name: 'Mini-Holders',
    iconUrl: new URL('/favicon.ico', frontendUrl).toString(),
  };

  return NextResponse.json(manifest);
} 