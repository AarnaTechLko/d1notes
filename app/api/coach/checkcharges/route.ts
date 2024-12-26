import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db'; // Import your Drizzle ORM database instance
import { evaluation_charges } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    const body = await req.json(); // Use await to properly parse the request body

    // Querying for the 'amount' field
    const query = await db
        .select({amount:evaluation_charges.amount}) // Specify the field to select
        .from(evaluation_charges)
        .where(
            and(
                eq(evaluation_charges.turnaroundtime, body.turnaroundime),
                eq(evaluation_charges.coach_id, body.coach_id)
            )
        );
if(query.length>0){
    return NextResponse.json(query[0].amount);
}
else{
    return NextResponse.json(0);

}
   
   
    
}
