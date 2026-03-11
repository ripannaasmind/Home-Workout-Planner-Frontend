import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/create-payment-intent
 *
 * Proxies the request to our backend which reads the Stripe secret key
 * from the database (set by admin in the Payment Settings panel).
 * No Stripe keys are stored in frontend env vars.
 */
export async function POST(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Forward the Authorization header so the backend can authenticate the user
  const authHeader = request.headers.get('Authorization') || '';

  try {
    const body = await request.json();

    const backendRes = await fetch(`${backendUrl}/orders/payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to create payment intent' },
        { status: backendRes.status }
      );
    }

    // Return clientSecret and paymentIntentId from backend response
    return NextResponse.json({
      clientSecret: data.data?.clientSecret,
      paymentIntentId: data.data?.paymentIntentId,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create payment intent';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
