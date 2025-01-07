import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '../../../../lib/db';
import { orderHistory, enterprises, licenses, packages } from '@/lib/schema';
import { eq, and, count } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { packageId, amount, organizationId, no_of_licenses, rate } = body;

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Package Purchase`,
            },
            unit_amount: amount * 100, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/enterprise/paymentDone?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/enterprise/PaymentCancel`,
    });

    try {
     const insertOrder= await db.insert(orderHistory).values({
        enterprise_id: Number(organizationId),  // Ensure enterprise_id is a number
        package_id: Number(packageId),                  // Ensure package_id matches the schema type
        amount:amount,                 // Ensure amount is a string or match the expected type
        status: 'Pending',                      // Assuming 'Pending' is a valid status
        payment_info: session.id,               // Payment session id
        description: `Package Purchase`,        // Description as a string
        createdAt: new Date(),                  // Date
        licenses: Number(no_of_licenses),       // Ensure licenses is a number
        rate: Number(rate),                     // Ensure rate is a number
      });
    } catch (err) {
      console.error('Error inserting order history:', err);
      return NextResponse.json({ error: err }, { status: 500 });
    }


   
    const randomStrings = Array.from({ length: no_of_licenses }, () => generateRandomString(30));

const licensesData = randomStrings.map(randomString => ({
  enterprise_id: organizationId,
  package_id: packageId,
  payment_info: session.id,
  licenseKey: randomString,  // Insert individual random string
  status: 'Generated',
  buyer_type: 'Coach',
  createdAt: new Date(),
}));

// Perform the bulk insert
await db.insert(licenses).values(licensesData);
 


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
    
    const session = await stripe.checkout.sessions.retrieve(sessionId as string);

     
    if (session.payment_status === 'paid') {
      const updatedepayment = await db.update(orderHistory)
        .set({ status: 'paid' })
        .where(eq(orderHistory.payment_info, sessionId)).returning({ package_id: orderHistory.package_id, enterprise_id: orderHistory.enterprise_id, licenseCount: orderHistory.licenses });

      const licenseCount = updatedepayment[0].licenseCount;

      const updateevaluation = await db.update(enterprises)
        .set({ package_id: Number(updatedepayment[0].package_id) })
        .where(eq(enterprises.id, Number(updatedepayment[0].enterprise_id))).returning();

     await db.update(licenses).set({status:'Free'}).where(eq(licenses.payment_info,sessionId));
   

      return NextResponse.json(session);
    }

  } catch (error) {
    return NextResponse.json({ message: "Unable to retrieve data" }, { status: 500 });
  }
}

