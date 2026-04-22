import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import React from 'react';
import { verifySignature } from '@/lib/fengshui/signature';
import { jsonError } from '@/lib/api/error-response';
import { ShareImageTemplate } from './template';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const score = searchParams.get('score') || '0';
    const match = searchParams.get('match') || '풍수 명당';
    const lat = searchParams.get('lat') || '0.0000';
    const lng = searchParams.get('lng') || '0.0000';
    const sig = searchParams.get('sig') || '';

    if (!(await verifySignature(score, match, sig))) {
      return jsonError(403, 'SIGNATURE_INVALID', 'Invalid Signature');
    }

    return new ImageResponse(
      React.createElement(ShareImageTemplate, { score, match, lat, lng }),
      { width: 1080, height: 1920 }
    );
  } catch {
    return jsonError(500, 'IMAGE_GENERATION_FAILED', 'Failed to generate image');
  }
}
