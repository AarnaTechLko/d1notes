import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust the path based on your setup
import { coaches, users, enterprises, chats } from "@/lib/schema";
import { eq, sql, and,or } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get('user_id');
  const user_type = searchParams.get('user_type');
  
  const chatDetailsQuery = await db.execute(
    sql`
      SELECT 
        chats.sender_id AS senderId,
        chats.sender_type AS senderType,
        CASE 
          WHEN chats.sender_type = 'player' THEN CONCAT(senderUsers.first_name, ' ', senderUsers.last_name)
          WHEN chats.sender_type = 'coach' THEN CONCAT(senderCoaches."firstName", ' ', senderCoaches."lastName")
          WHEN chats.sender_type = 'enterprise' THEN senderEnterprises."organizationName"
          ELSE NULL
        END AS senderName,
        CASE
          WHEN chats.sender_type = 'player' THEN senderUsers.image
          WHEN chats.sender_type = 'coach' THEN senderCoaches.image
          WHEN chats.sender_type = 'enterprise' THEN senderEnterprises.logo
          ELSE NULL
        END AS senderImage,
        chats.receiver_id AS receiverId,
        chats.receiver_type AS receiverType,
        CASE 
          WHEN chats.receiver_type = 'player' THEN CONCAT(receiverUsers.first_name, ' ', receiverUsers.last_name)
          WHEN chats.receiver_type = 'coach' THEN CONCAT(receiverCoaches."firstName", ' ', receiverCoaches."lastName")
          WHEN chats.receiver_type = 'enterprise' THEN receiverEnterprises."organizationName"
          ELSE NULL
        END AS receiverName,
        CASE
          WHEN chats.receiver_type = 'player' THEN receiverUsers.image
          WHEN chats.receiver_type = 'coach' THEN receiverCoaches.image
          WHEN chats.receiver_type = 'enterprise' THEN receiverEnterprises.logo
          ELSE NULL
        END AS receiverImage,
        chats.message,
        chats."createdAt"
      FROM chats
      LEFT JOIN coaches AS senderCoaches ON senderCoaches.id = chats.sender_id AND chats.sender_type = 'coach'
      LEFT JOIN enterprises AS senderEnterprises ON senderEnterprises.id = chats.sender_id AND chats.sender_type = 'enterprise'
      LEFT JOIN users AS senderUsers ON senderUsers.id = chats.sender_id AND chats.sender_type = 'player'
      LEFT JOIN coaches AS receiverCoaches ON receiverCoaches.id = chats.receiver_id AND chats.receiver_type = 'coach'
      LEFT JOIN enterprises AS receiverEnterprises ON receiverEnterprises.id = chats.receiver_id AND chats.receiver_type = 'enterprise'
      LEFT JOIN users AS receiverUsers ON receiverUsers.id = chats.receiver_id AND chats.receiver_type = 'player'
      WHERE 
        (chats.sender_id = ${user_id} OR chats.receiver_id = ${user_id})
      ORDER BY chats."createdAt";
    `
  );
  

  
  
  
    return NextResponse.json(chatDetailsQuery.rows, { status: 200 });
}
