import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db'; // Import your Drizzle ORM database instance
import { evaluation_charges } from '@/lib/schema';
import { eq,sum,desc } from 'drizzle-orm';
import { NextRequest } from 'next/server'; 

export async function POST(req: NextRequest) {
    const data = await req.json();
    await db.insert(evaluation_charges).values(data);
    return NextResponse.json({ success: "success"});

}

export async function GET(req: NextRequest) {
    const coachId = req.nextUrl.searchParams.get('coachId');
    const evaluation_chargesData = await db.select().from(evaluation_charges).where(eq(evaluation_charges.coach_id, Number(coachId))).orderBy(desc(evaluation_charges.id));
    
    return NextResponse.json({ evaluation_chargesData });
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, turnaroundtime, amount } = body;

        if (!id) {
            return NextResponse.json({ message: "Charge ID is required." }, { status: 400 });
        }

        if (!turnaroundtime || !amount) {
            return NextResponse.json({ message: "Turnaround time and amount are required." }, { status: 400 });
        }

        // Update the charge in the database
        const updatedCharge = await db.update(evaluation_charges).set({
            turnaroundtime:turnaroundtime,
            amount:amount
        }).where(eq(evaluation_charges.id,id));

        return NextResponse.json({
            message: "Evaluation charge updated successfully",
            data: updatedCharge,
        });
    } catch (error) {
        console.error("Error updating charge:", error);
        return NextResponse.json({ message: "Failed to update evaluation charge." }, { status: 500 });
    }
}