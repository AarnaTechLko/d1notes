import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import { chats } from '../../../lib/schema';
import { eq, isNotNull, and, between, lt, ilike,or } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { sender_id, receiver_id, sender_type, receiver_type, message } = body;

    // Define chatValues directly without redeclaring sender_id, etc.
    const chatValues = {
        sender_id,
        receiver_id,
        sender_type,
        receiver_type,
        message,
        
    };

    try {
        const insertChat = await db.insert(chats).values(chatValues).returning();
        return NextResponse.json(insertChat);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to insert chat message' });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const receiver_id = searchParams.get('receiver_id');
    const receiver_type = searchParams.get('type');
    const sentFor = searchParams.get('sentFor');

    const messageQuery = await db
    .select()
    .from(chats)
    .where(
      or(
        and(
          eq(chats.sender_id, Number(receiver_id)),
          eq(chats.receiver_id, Number(sentFor))
        ),
        and(
          eq(chats.sender_id, Number(sentFor)),
          eq(chats.receiver_id, Number(receiver_id))
        )
      )
    )
    .orderBy(chats.createdAt)
    .execute();
    return NextResponse.json(messageQuery);


}
