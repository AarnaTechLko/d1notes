import { users, coaches } from "@/lib/schema";
import { db } from '../../../lib/db';
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, type, blockedUsers } = body;

        if (!id || !type) {
            return NextResponse.json({ error: "Missing user ID or Type" }, { status: 400 });
        }

        let result
        if (type === "player") {
            result = await db
                .update(users)
                .set({ blockedCoachIds: blockedUsers })
                .where((eq(users.id, Number(id))))
                .returning()
            if (result.length > 0) {
                return NextResponse.json({ blockedCoachIds: result[0].blockedCoachIds});
            }
        }
        else if (type === "coach") {
            result = await db
                .update(coaches)
                .set({ blockedPlayerIds: blockedUsers })
                .where((eq(coaches.id, Number(id))))
                .returning()

            if (result.length > 0) {
                return NextResponse.json({ blockedPlayerIds: result[0].blockedPlayerIds});
            }
        }
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    catch (error) {
        console.error("Error updating blocked users", { status: 404 });
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }


}
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const current_id = searchParams.get('current_id');
        const selected_user_id = searchParams.get('selected_user_id');
        const current_type = searchParams.get('current_type');
        const selected_type = searchParams.get('selected_type');

        if (!current_id || !selected_user_id) {
            return NextResponse.json({ error: "Missing current or selected user ID" }, { status: 400 });
        }
        if (!current_type || !selected_type) {
            return NextResponse.json({ error: "Missing current or selected user type" }, { status: 400 });
        }
        
        let currentUsersBlockedUsers;
        let selectedUsersBlockedUsers;
        //retrieve current users blocked players
        if (current_type === "player") {
            const resultPlayer = await db
                .select({ blockedCoachIds: users.blockedCoachIds })
                .from(users)
                .where(eq(users.id, Number(current_id)))
            currentUsersBlockedUsers = resultPlayer[0].blockedCoachIds || "";
        }
        else if (current_type === "coach") {
            const resultCoach = await db
                .select({ blockedPlayerIds: coaches.blockedPlayerIds })
                .from(coaches)
                .where(eq(coaches.id, Number(current_id)))
            currentUsersBlockedUsers = resultCoach[0].blockedPlayerIds || "";
        }
        //retrieve selected users blocked players
        if (selected_type === "player") {
            const resultPlayer = await db
                .select({ blockedCoachIds: users.blockedCoachIds })
                .from(users)
                .where(eq(users.id, Number(selected_user_id)))
            selectedUsersBlockedUsers = resultPlayer[0].blockedCoachIds || "";

        }
        else if (selected_type === "coach") {
            const resultCoach = await db
                .select({ blockedPlayerIds: coaches.blockedPlayerIds })
                .from(coaches)
                .where(eq(coaches.id, Number(selected_user_id)))
            selectedUsersBlockedUsers = resultCoach[0].blockedPlayerIds || "";
        }

        return NextResponse.json({ currentUsersBlockedUsers: currentUsersBlockedUsers, selectedUsersBlockedUsers: selectedUsersBlockedUsers })
    }
    catch (error) {
        console.error("Error retrieving blocked users: ", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}