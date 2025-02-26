import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db'; // Import your Drizzle ORM database instance
import { coaches, evaluation_charges } from '@/lib/schema';
import { eq,sum,desc, and, ne } from 'drizzle-orm';
import { NextRequest } from 'next/server'; 

export async function POST(req: NextRequest) {
    const data = await req.json();
    const checkQuery=await db.select().from(evaluation_charges).where(
        and(
            eq(evaluation_charges.turnaroundtime,data.turnaroundtime),
            eq(evaluation_charges.coach_id,data.coach_id),
        )
    );

    if(checkQuery.length>0)
    {
        return NextResponse.json({ message:"You have already Added this Turnaround Time."}, { status: 500 });
    }
    else{
        await db.insert(evaluation_charges).values(data);
        return NextResponse.json({ success: "success"});
    }
   

}

export async function GET(req: NextRequest) {
    const coachId = req.nextUrl.searchParams.get('coachId');
    try{
        const evaluation_chargesData = await db.select().from(evaluation_charges).where(eq(evaluation_charges.coach_id, Number(coachId))).orderBy(desc(evaluation_charges.id));
    
        return NextResponse.json({ evaluation_chargesData });
    }
    catch (error) {
        
        return NextResponse.json({ message:error}, { status: 500 });
    }
    
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, turnaroundtime, amount, currency } = body;

        if (!id) {
            return NextResponse.json({ message: "Charge ID is required." }, { status: 400 });
        }

        if (!turnaroundtime || !amount || !currency) {
            return NextResponse.json({ message: "Turnaround time and amount are required." }, { status: 400 });
        }

        const checkQuery=await db.select().from(evaluation_charges).where(
            and(
                eq(evaluation_charges.turnaroundtime,body.turnaroundtime),
                eq(evaluation_charges.coach_id,body.coach_id),
                ne(evaluation_charges.id,body.id),
            )
        );
        if(checkQuery.length>0)
            {
                return NextResponse.json({ message:"You have already Added this Turnaround Time."}, { status: 500 });
            }
        // Update the charge in the database
        const updatedCharge = await db.update(evaluation_charges).set({
            turnaroundtime:turnaroundtime,
            amount:amount,
            currency:currency
        }).where(eq(evaluation_charges.id,id));


        if(turnaroundtime==120)
        {
            const updatedCoaches = await db.update(coaches).set({
              
                expectedCharge:amount,
                
            }).where(eq(coaches.id,body.coach_id));
        }

        return NextResponse.json({
            message: "Evaluation charge updated successfully",
            data: updatedCharge,
        });
    } catch (error) {
        console.error("Error updating charge:", error);
        return NextResponse.json({ message: "Failed to update evaluation charge." }, { status: 500 });
    }
}