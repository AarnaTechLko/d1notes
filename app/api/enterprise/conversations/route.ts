import { eq, and, or,asc,sql,inArray } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Adjust the import according to your setup
import { messages,chats, coaches, users } from '@/lib/schema'; // Adjust based on your schema

export async function POST(req: NextRequest) {
    const body = await req.json();
    const id = body.id;
    
try{
    const chatsList=await db.select().from(chats).where(eq(chats.id,id));

    const communications=await db.select().from(chats).where(
        and(
            eq(chats.coachId,chatsList[0].coachId),
            eq(chats.playerId,chatsList[0].playerId),
        )
        );
        const chatIds = communications.map(comm => comm.id);
    const chatMessages = await db
        .select({
            id: messages.id,
            senderId: messages.senderId,
            message: messages.message,
            createdAt: messages.createdAt,
            chatId: messages.chatId,
            coachId: coaches.id,
            coachFirstName: coaches.firstName,
            coachLastName: coaches.lastName,
            coachImage: coaches.image,
            coachSlug: coaches.slug,
            playerId: users.id,
            playerFirstName: users.first_name,
            playerLastName: users.last_name,
            playerImage: users.image,
            playerSlug: users.slug,
        })
        .from(messages)
        .leftJoin(chats, eq(messages.chatId, chats.id))
        .leftJoin(coaches, eq(chats.coachId, coaches.id))
        .leftJoin(users, eq(chats.playerId, users.id))
        .where(inArray(messages.chatId, chatIds),
        )
        .orderBy(asc(messages.createdAt));
        return NextResponse.json(chatMessages);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch chat messages' });
    }
}
