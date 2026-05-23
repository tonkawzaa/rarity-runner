import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  try {
    const result = await pool.query(
      'SELECT profile_image_data FROM users WHERE id = $1',
      [userId]
    );

    const data: string | null = result.rows[0]?.profile_image_data ?? null;
    if (!data) {
      return new NextResponse(null, { status: 404 });
    }

    const [header, base64] = data.split(',');
    const mimeType = header.match(/data:([^;]+)/)?.[1] ?? 'image/webp';
    const buffer = Buffer.from(base64, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        // URL includes a ?v= cache-buster on upload, so long TTL is safe for versioned URLs.
        // Unversioned URLs (migrated data) get a 1-hour TTL.
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving profile image:', error);
    return new NextResponse(null, { status: 500 });
  }
}
