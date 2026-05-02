import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const corp_code = searchParams.get('corp_code');
  const bsns_year = searchParams.get('bsns_year');
  const reprt_code = searchParams.get('reprt_code') || '11011';

  if (!corp_code || !bsns_year) {
    return NextResponse.json(
      { status: 'error', message: 'corp_code and bsns_year are required' },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENDART_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { status: 'error', message: 'OpenDART API key not configured' },
      { status: 500 }
    );
  }

  const url = new URL('https://opendart.fss.or.kr/api/fnlttSinglAcnt.json');
  url.searchParams.set('crtfc_key', apiKey);
  url.searchParams.set('corp_code', corp_code);
  url.searchParams.set('bsns_year', bsns_year);
  url.searchParams.set('reprt_code', reprt_code);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { status: 'error', message: `OpenDART returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('OpenDART fetch error:', err);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch from OpenDART' },
      { status: 500 }
    );
  }
}
