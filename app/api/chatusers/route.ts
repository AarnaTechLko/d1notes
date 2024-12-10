import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust the path based on your setup
import { coaches, users, enterprises, chats } from "@/lib/schema";
import { eq, sql, and } from "drizzle-orm";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sender_id = searchParams.get('sender_id');
    const sender_type = searchParams.get('sender_type');

    const chatDetailsQuery = await db
    .select({
        senderId: chats.sender_id,
        senderType: chats.sender_type,
        receiverId: chats.receiver_id,
        receiverType: chats.receiver_type,
        message: chats.message,
        createdAt: chats.createdAt,
        receiverName: sql<string>`
          CASE 
            WHEN ${chats.receiver_type} = 'player' THEN CONCAT(${users.first_name}, ' ', ${users.last_name})
            WHEN ${chats.receiver_type} = 'coach' THEN CONCAT(${coaches.firstName}, ' ', ${coaches.lastName})
            WHEN ${chats.receiver_type} = 'enterprise' THEN ${enterprises.organizationName}
            ELSE NULL
          END
        `.as('receiverName'),
    })
    .from(chats)
    .leftJoin(coaches, and(eq(chats.receiver_type, 'coach'), eq(coaches.id, chats.receiver_id)))
    .leftJoin(enterprises, and(eq(chats.receiver_type, 'enterprise'), eq(enterprises.id, chats.receiver_id)))
    .leftJoin(users, and(eq(chats.receiver_type, 'player'), eq(users.id, chats.receiver_id)))
    .where(
        and(
            eq(chats.sender_id, Number(sender_id)),
            eq(chats.sender_type, String(sender_type))
        )
    )
    
    .orderBy(chats.createdAt)
    
    .execute(); // Execute the query

    // Return the results as JSON
    return NextResponse.json(chatDetailsQuery, { status: 200 });
}
