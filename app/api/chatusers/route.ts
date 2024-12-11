import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust the path based on your setup
import { coaches, users, enterprises, chats,chatfriend } from "@/lib/schema";
import { eq, sql, and,or,desc } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get('user_id');
  const user_type = searchParams.get('user_type');
  let friends;

  if(user_type=='coach')
  {
     friends = await db
    .select({
      user_id: users.id,
      first_name: users.first_name,
      last_name: users.last_name,
      image: users.image,
      type: chatfriend.chattotype,
    })
    .from(chatfriend)
    
    .leftJoin(
      users,
      and(eq(chatfriend.chattotype, 'player'), eq(chatfriend.chatto, users.id))
    )
     
    .where(eq(chatfriend.chatfrom, Number(user_id))).orderBy(desc(chatfriend.id));
  }

  else if(user_type=='player')
  {
     friends = await db
    .select({
      user_id: coaches.id,
      first_name: coaches.firstName,
      last_name: coaches.lastName,
      image: coaches.image,
      type: chatfriend.chattotype,
    })
    .from(chatfriend)
    .leftJoin(
      coaches,
      and(eq(chatfriend.chattotype, 'coach'), eq(chatfriend.chatto, coaches.id))
    )  
    .where(eq(chatfriend.chatfrom, Number(user_id))).orderBy(desc(chatfriend.id));
  }


  // const chatDetailsQuery = await db.execute(
  //   sql`
  //     SELECT 
  //       chats.sender_id AS senderId,
  //       chats.sender_type AS senderType,
  //       CASE 
  //         WHEN chats.sender_type = 'player' THEN CONCAT(senderUsers.first_name, ' ', senderUsers.last_name)
  //         WHEN chats.sender_type = 'coach' THEN CONCAT(senderCoaches."firstName", ' ', senderCoaches."lastName")
  //         WHEN chats.sender_type = 'club' THEN senderEnterprises."organizationName"
  //         ELSE NULL
  //       END AS senderName,
  //       CASE
  //         WHEN chats.sender_type = 'player' THEN senderUsers.image
  //         WHEN chats.sender_type = 'coach' THEN senderCoaches.image
  //         WHEN chats.sender_type = 'club' THEN senderEnterprises.logo
  //         ELSE NULL
  //       END AS senderImage,
  //       chats.receiver_id AS receiverId,
  //       chats.receiver_type AS receiverType,
  //       CASE 
  //         WHEN chats.receiver_type = 'player' THEN CONCAT(receiverUsers.first_name, ' ', receiverUsers.last_name)
  //         WHEN chats.receiver_type = 'coach' THEN CONCAT(receiverCoaches."firstName", ' ', receiverCoaches."lastName")
  //         WHEN chats.receiver_type = 'club' THEN receiverEnterprises."organizationName"
  //         ELSE NULL
  //       END AS receiverName,
  //       CASE
  //         WHEN chats.receiver_type = 'player' THEN receiverUsers.image
  //         WHEN chats.receiver_type = 'coach' THEN receiverCoaches.image
  //         WHEN chats.receiver_type = 'club' THEN receiverEnterprises.logo
  //         ELSE NULL
  //       END AS receiverImage,
  //       chats.message,
  //       chats."createdAt"
  //     FROM chats
  //     LEFT JOIN coaches AS senderCoaches ON senderCoaches.id = chats.sender_id AND chats.sender_type = 'coach'
  //     LEFT JOIN enterprises AS senderEnterprises ON senderEnterprises.id = chats.sender_id AND chats.sender_type = 'club'
  //     LEFT JOIN users AS senderUsers ON senderUsers.id = chats.sender_id AND chats.sender_type = 'player'
  //     LEFT JOIN coaches AS receiverCoaches ON receiverCoaches.id = chats.receiver_id AND chats.receiver_type = 'coach'
  //     LEFT JOIN enterprises AS receiverEnterprises ON receiverEnterprises.id = chats.receiver_id AND chats.receiver_type = 'club'
  //     LEFT JOIN users AS receiverUsers ON receiverUsers.id = chats.receiver_id AND chats.receiver_type = 'player'
  //     WHERE 
  //       (chats.sender_id = ${user_id} OR chats.receiver_id = ${user_id})
  //     ORDER BY chats."createdAt";
   // `
  // );
  

  
  
  
    return NextResponse.json(friends, { status: 200 });
}
