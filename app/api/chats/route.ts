import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import { chats, coaches, messages, users,admin_message} from '../../../lib/schema';
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
    
    const coachQuery=await db.select().from(coaches).where(eq(coaches.id,validCoachId));
    const playerQuery=await db.select().from(users).where(eq(users.id,validPlayerId));
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;
    if(sender_type=='player')
    {
      const emailResultPlayer = await sendEmail({
        to: coachQuery[0].email || '',
        subject:` D1 NOTES Message from ${playerQuery[0].first_name}`,
        text: ` D1 NOTES Message from ${playerQuery[0].first_name}`,
        html:`Dear ${coachQuery[0].firstName}! You have received a Message from ${playerQuery[0].first_name}. <a href="${baseUrl}/login" style="font-weight: bold; color: blue;">Login</a> to your coach account and view Messages in the menu. <p>Regars<br/>Team D1 Notes/p>`,
      });

    }
    else{
      const emailResultPlayer = await sendEmail({
        to: playerQuery[0].email || '',
        subject:` D1 NOTES Message from ${coachQuery[0].firstName}`,
        text: ` D1 NOTES Message from ${coachQuery[0].firstName}`,
        html:`Dear ${playerQuery[0].first_name}! You have received a Message from ${coachQuery[0].firstName}. <a href="${baseUrl}/login" style="font-weight: bold; color: blue; ">Login</a> to your player  account and view Messages in the menu. <p>Regars<br/>Team D1 Notes/p>`,
      });

    }
    return NextResponse.json(insertChat);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to insert chat message' });
  }
}



 export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const receiver_id = searchParams.get('user_id');
  console.log('user:',receiver_id);
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
/* export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const receiverId = searchParams.get("user_id"); // could be playerId or coachId
    const type = searchParams.get("type"); // "player" or "coach"
    const sentFor = searchParams.get("sentFor"); // optional, opposite user
//console.log('userid:',receiverId);
    if (!receiverId || !type) {
      return NextResponse.json({ error: "receiver_id and type are required" }, { status: 400 });
    }

    // 1. Get messages for this receiver
    const messages = await db
      .select()
      .from(admin_message)
      .where(eq(admin_message.receiver_id, Number(receiverId)));

    console.log("All Messages:", messages);

    // 2. Get chat entries based on type
    let chatResults = [];
    if (type === "player") {
      chatResults = await db
        .select()
        .from(chats)
        .where(eq(chats.playerId, Number(receiverId)));
    } else if (type === "coach") {
      chatResults = await db
        .select()
        .from(chats)
        .where(eq(chats.coachId, Number(receiverId)));
    } else {
      return NextResponse.json({ error: "Invalid type. Must be 'coach' or 'player'." }, { status: 400 });
    }

    if (!chatResults.length) {
      return NextResponse.json({ error: "No chats found" }, { status: 404 });
    }

    console.log("Chat Results:", chatResults);

    // Optional filter: match sentFor if provided
    const filteredChats = sentFor
      ? chatResults.filter(chat =>
          type === "player"
            ? chat.coachId === Number(sentFor)
            : chat.playerId === Number(sentFor)
        )
      : chatResults;

    console.log("Filtered Chats:", filteredChats);

    // Match messages where receiver_id === playerId in filtered chats
    const validReceiverIds = filteredChats.map(chat =>
      type === "player" ? chat.playerId : chat.coachId
    );

    const filteredMessages = messages.filter(msg =>
      validReceiverIds.includes(msg.receiver_id)
    );

    return NextResponse.json({
      chats: filteredChats,
      messages: filteredMessages,
    });

  } catch (error) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} */