import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '../../../../lib/db';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { coachId, country, currency, routingNumber,accountNumber, email } = body;

    const account = await stripe.accounts.create({
        country: 'US',
        email: email,
        controller: {
          fees: {
            payer: 'application',
          },
          losses: {
            payments: 'application',
          },
          stripe_dashboard: {
            type: 'express',
          },
        },
      });

      return NextResponse.json({account}, { status: 200 });

}