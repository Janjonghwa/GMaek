import { NextResponse } from 'next/server';

export type ApiErrorCode =
  | 'INVALID_COORDINATES'
  | 'REGION_NOT_SUPPORTED'
  | 'UPSTREAM_TIMEOUT'
  | 'ANALYSIS_FAILED'
  | 'RATE_LIMITED'
  | 'SIGNATURE_INVALID'
  | 'IMAGE_GENERATION_FAILED';

interface ApiErrorPayload {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}

export const jsonError = (status: number, code: ApiErrorCode, message: string, details?: unknown) => {
  const payload: ApiErrorPayload = {
    error: {
      code,
      message,
      details,
    },
  };

  return NextResponse.json(payload, { status });
};
