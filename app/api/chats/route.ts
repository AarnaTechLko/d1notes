import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import { chats, messages } from '../../../lib/schema';
import { eq, isNotNull, and, between, lt, ilike, or } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { senderId, receiver_id, sender_type, receiver_type, message, club_id } = body;

  // Ensure coachId and playerId are valid numbers
  let coachId: number | undefined;
  let playerId: number | undefined;

  if (sender_type === 'coach') {
    coachId = Number(senderId);
    playerId = Number(receiver_id);
  } else if (sender_type === 'player') {
    coachId = Number(receiver_id);
    playerId = Number(senderId);
  }

  if (coachId === undefined || playerId === undefined) {
    return NextResponse.json({ error: 'Invalid coachId or playerId' });
  }

  // Now we can safely assert that coachId and playerId are numbers
  const validCoachId = coachId as number;
  const validPlayerId = playerId as number;

  // Get current date and time
  const currentDateTime = new Date();

  // Prepare chat data for insertion
  const chatValues = {
    coachId: validCoachId,
    playerId: validPlayerId,
    createdAt: currentDateTime,
    updatedAt: currentDateTime,
    club_id: club_id,
  };

  try {
    // Insert chat
    const insertChat = await db.insert(chats).values(chatValues).returning();

    // Prepare message data
    const chatMessage = {
      chatId: insertChat[0]?.id,  // Fixed field name here
      senderId: senderId,         // Fixed field name here
      message: message,
      createdAt: currentDateTime,   // Add createdAt if needed
      updatedAt: currentDateTime,
      club_id: club_id,    // Add updatedAt if needed
    };

    // Insert message
    const insertMessage = await db.insert(messages).values(chatMessage).returning();

    return NextResponse.json(insertChat);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to insert chat message' });
  }
}



export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const receiver_id = searchParams.get('receiver_id');
  const type = searchParams.get('type');
  const sentFor = searchParams.get('sentFor');

  let coachId: number | undefined;
  let playerId: number | undefined;

  if (type === 'coach') {
    coachId = Number(receiver_id);
    playerId = Number(sentFor);
  } else if (type === 'player') {
    
    coachId = Number(sentFor);
    playerId = Number(receiver_id);
  }



  const messagesList = await db
  .select({
    messageId: messages.id,
    chatId: messages.chatId,
    senderId: messages.senderId,
    message: messages.message,
    messageCreatedAt: messages.createdAt,
    chatCreatedAt: chats.createdAt,
    chatUpdatedAt: chats.updatedAt,
  })
  .from(messages)
  .innerJoin(chats, eq(chats.id,messages.chatId))
  .where(
    and(
      eq(chats.coachId,Number(coachId)),
      eq(chats.playerId,Number(playerId))
    )
   
  )
  .orderBy(messages.createdAt);
  return NextResponse.json(messagesList);


}
