import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, coaches, coachearnings, playerEvaluation, coachaccount } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const coach_id = url.searchParams.get("coach_id");

    if (!coach_id) {
        return NextResponse.json(
            { error: "Coach ID is required" },
            { status: 400 }
        );
    }


    const parsedCoachId = Number(coach_id);
    if (isNaN(parsedCoachId)) {
        return NextResponse.json(
            { error: "Invalid Coach ID" },
            { status: 400 }
        );
    }

    try {
        const earnings = await db.select({
            commision_amount: coachearnings.commision_amount,
            transaction_id: coachearnings.transaction_id,
            status: coachearnings.status,
            created_at: coachearnings.created_at,
            playername: sql`CONCAT(${users.first_name}, ' ', ${users.last_name})`.as('playername'),
            image: users.image,
            slug: users.slug,
            evaluation_title: playerEvaluation.review_title,
            evaluation_id: playerEvaluation.id,
        }).from(coachearnings)
            .leftJoin(users, eq(coachearnings.player_id, users.id))
            .leftJoin(playerEvaluation, eq(coachearnings.evaluation_id, playerEvaluation.id))
            .where(eq(coachearnings.coach_id, parsedCoachId));

        const accounts = await db
            .select({ amount: coachaccount.amount })
            .from(coachaccount)
            .where(eq(coachaccount.coach_id, parsedCoachId));


        return NextResponse.json({ earnings, accounts });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Database query failed", details: error.message },
            { status: 500 }
        );
    }
}
