import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db'; // Assuming db is set up correctly
import { chats, messages, coaches, users } from '../../../../lib/schema';
import { eq, desc,sql,and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const club_id = searchParams.get('enterprise_id');
  if (!club_id) {
    return NextResponse.json({ error: 'coachId and playerId are required' }, { status: 400 });
  }

  try {
    const result = await db
  .select({
    coachId: chats.coachId,
    coachName: sql`CONCAT(${coaches.firstName}, ' ', ${coaches.lastName})`.as("coachName"),
    playerName: sql`CONCAT(${users.first_name}, ' ', ${users.last_name})`.as("playerName"),
    playerId: chats.playerId,
    coachPhoto: coaches.image,
    playerPhoto: users.image,
    playerSlug:users.slug,
    coachSlug:coaches.slug,
    chatId: sql`MAX(${chats.id})`.as("latestChatId"),
    messageContent: messages.message, // Replace with the actual column name in your `messages` table
    messageTimestamp: messages.createdAt, // Replace with the actual column name for message timestamps
  })
  .from(chats)
  .leftJoin(
    messages,
    sql`${messages.chatId} = ${sql`(
      SELECT MAX(c.id)
      FROM chats AS c
      WHERE c."coachId" = ${chats.coachId}
        AND c."playerId" = ${chats.playerId}
    )`}`
  )
  .leftJoin(coaches, eq(coaches.id, chats.coachId))
  .leftJoin(users, eq(users.id, chats.playerId))
  .where(
    and(
      eq(chats.club_id, Number(club_id))
    )
  )
  .orderBy(desc(messages.createdAt))
  .groupBy(chats.coachId, chats.playerId, messages.message, messages.createdAt, coaches.firstName, coaches.lastName, users.first_name,users.last_name, coaches.image, users.image, users.slug, coaches.slug);
  

     

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching chats and messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
