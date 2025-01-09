import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust the path based on your setup
import { playerEvaluation, payments } from "@/lib/schema";
import { eq, not, sql } from "drizzle-orm";

export async function POST(req: Request) {

    const { player_id } = await req.json();
    const unevaluatedRecords = await db
        .select()
        .from(playerEvaluation)
        .where(
            sql`${playerEvaluation.id} NOT IN (SELECT ${payments.evaluation_id} FROM ${payments}) AND ${playerEvaluation.player_id} = ${player_id}`
        );

    const countRecords = unevaluatedRecords.length

    return NextResponse.json(
        { countRecords },
        { status: 200 }
    );


}

