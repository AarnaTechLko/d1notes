// app/api/teampanel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db'; // Ensure the correct path
import { coaches } from '@/lib/schema'; // Ensure this import exists
import { eq } from 'drizzle-orm';


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log("Received Request Body:", body); // Add this log

        const { coachId } = body;
        if (!coachId) {
            console.error("Error: Coach ID is missing in the request");
            return NextResponse.json({ message: "Coach ID is required" }, { status: 400 });
        }

        console.log("Updating coach status in the database...");

        const result = await db.update(coaches)
            .set({ status: 'active' } as any) 
            .where(eq(coaches.id, coachId))
            .returning();  

        console.log("Update Result:", result);

        if (!result || result.length === 0) {
            console.error("Error: No coach found with the given ID");
            return NextResponse.json({ message: "Coach not found or already active" }, { status: 404 });
        }

        return NextResponse.json({ message: "Coach restored successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error restoring coach:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}




 export async function DELETE(req: NextRequest) {
    try {
        const { coachId } = await req.json();

        if (!coachId) {
            return NextResponse.json({ message: "Coaches ID is required" }, { status: 400 });
        }

        const coachIdNumber = Number(coachId);
        if (isNaN(coachIdNumber)) {
            return NextResponse.json({ message: "Invalid Player ID" }, { status: 400 });
        }

        // **OPTION 2: Remove from Team Players (If Required)**
        await db
            .delete(coaches)
            .where(eq(coaches.id, coachIdNumber));

        return NextResponse.json({ message: "Coaches deleted successfully" }, { status: 200 });

    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
    }
} 