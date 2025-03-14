import { NextResponse } from 'next/server';

export async function GET(request) {
  // Redirecionar para a página principal
  return NextResponse.rewrite(new URL('/strava-for', request.url));
} 