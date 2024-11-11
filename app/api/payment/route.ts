import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '../../../lib/db';
import { payments, playerEvaluation } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { coachId, playerId, amount, evaluationId } = body;

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Evaluation for Player ${playerId} by Coach ${coachId}`,
            },
            unit_amount: amount * 100, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/paymentDone?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/PaymentCancel`,
    });

    await db.insert(payments).values({
      player_id: playerId,
      coach_id: coachId,
      evaluation_id: evaluationId,
      amount: amount,
      status: 'pending',
      payment_info: session.id,
      description: `Evaluation for Player ${playerId} by Coach ${coachId}`

    });



    // Return the session ID to the client
    return NextResponse.json({ id: session.id }, { status: 200 });
  } catch (err: any) {
    // Return error message if something goes wrong
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}



export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ message: "Session ID is required" }, { status: 400 });
  }
  try {
    // Retrieve the session from Stripe

    const session = await stripe.checkout.sessions.retrieve(sessionId as string);

   
    // Update payment status in your database based on session status
    if (session.payment_status === 'paid') {
      const updatedepayment = await db.update(payments)
        .set({ status: 'paid' })
        .where(eq(payments.payment_info, sessionId)).returning({ evaluationId: payments.evaluation_id });;

      const updateevaluation = await db.update(playerEvaluation)
        .set({ payment_status: 'Paid' })
        .where(eq(playerEvaluation.id, updatedepayment[0].evaluationId)).returning();

      return NextResponse.json(session);
    }

    // Return the session information

  } catch (error) {
    return NextResponse.json({ message: "Unable to retrieve data" }, { status: 500 });
  }
}
