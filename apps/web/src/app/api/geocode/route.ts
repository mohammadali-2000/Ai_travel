import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function flagFromCountryCode(countryCode: string | undefined) {
  const code = countryCode?.trim().toUpperCase();
  if (!code || code.length !== 2 || !/^[A-Z]{2}$/.test(code)) return '🌍';
  return String.fromCodePoint(...Array.from(code, (letter) => 127397 + letter.charCodeAt(0)));
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim();
  if (!query) return NextResponse.json({ error: 'A destination is required.' }, { status: 400 });
  if (query.length > 120) return NextResponse.json({ error: 'Destination is too long.' }, { status: 400 });

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '1');
  url.searchParams.set('q', query);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en',
        'User-Agent': 'RoamVerse/0.1 (destination globe)',
      },
      next: { revalidate: 86400 },
    });
    if (!response.ok) return NextResponse.json({ error: 'Destination lookup failed.' }, { status: 502 });

    const results = (await response.json()) as Array<{
      lat?: string;
      lon?: string;
      display_name?: string;
      address?: { country?: string; country_code?: string };
    }>;
    const result = results[0];
    const lat = Number(result?.lat);
    const lng = Number(result?.lon);
    if (!result || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: 'Destination was not found.' }, { status: 404 });
    }

    return NextResponse.json({
      lat,
      lng,
      country: result.address?.country ?? null,
      countryCode: result.address?.country_code?.toUpperCase() ?? null,
      flag: flagFromCountryCode(result.address?.country_code),
      displayName: result.display_name ?? query,
    });
  } catch {
    return NextResponse.json({ error: 'Destination lookup is unavailable.' }, { status: 502 });
  }
}
