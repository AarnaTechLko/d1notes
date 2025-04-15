import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { playerEvaluation} from "@/lib/schema";
import { eq, and, desc,count } from "drizzle-orm";
import { sendEmail } from "@/lib/helpers";
import { getSession } from "next-auth/react";


export async function DELETE(req: NextRequest) { 
    try{
    
        const {evaluation_id} = await req.json();

        // console.log("I'm here")
        // console.log("session: ", evaluation_id)
        await db.delete(playerEvaluation).where(eq(playerEvaluation.id,evaluation_id));

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
    }

}