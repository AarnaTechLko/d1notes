import { NextRequest, NextResponse} from "next/server";
import { db } from "@/lib/db";
import { payments} from "@/lib/schema";
import { eq} from "drizzle-orm";
import Stripe from 'stripe';
import { asString } from "html2canvas/dist/types/css/types/color";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

export async function GET(req: NextRequest) { 

    const { searchParams } = new URL(req.url);

    const evaluation_id = searchParams.get('evaluation_id'); // Keep the search as a string

  if (evaluation_id)
      try{

          const id = parseInt(evaluation_id) || 0; // Keep the search as a string

          const payment_info = await db.select({payment_id: payments.payment_info}).from(payments).where(eq(payments.evaluation_id, id));

          console.log("Test: ", payment_info)

          const sessions = await stripe.checkout.sessions.retrieve(
            payment_info[0].payment_id!
          );
        
          console.log("Sessions payment: ", sessions.payment_intent)

          const refund = await stripe.refunds.create({
            payment_intent: sessions.payment_intent as string,
          });



          return NextResponse.json(
            { payment_info},
            { status: 200}
          );

      }

      catch (error) {
          const err = error as any;
          console.error('Error refunding player:', err);

          // Return an error response if fetching fails
          return NextResponse.json(
              // { message: 'Failed to refund player' },
              { status: 500 }
          );
      }

    else{

      return NextResponse.json(
        { status: 500 }
    );      

    }

  }