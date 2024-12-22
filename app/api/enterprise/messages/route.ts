import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '../../../../lib/db'; // Assuming db is set up correctly
import { chats, coaches, users } from '../../../../lib/schema';

export async function GET(req: NextRequest) {
  const clubId = 24;

  // Constructing the SQL query
  const query = sql`
    WITH chat_pairs AS (
      SELECT 
          LEAST(sender_id, receiver_id) AS normalized_sender_id,
          GREATEST(sender_id, receiver_id) AS normalized_receiver_id,
          CASE 
              WHEN sender_id = LEAST(sender_id, receiver_id) THEN sender_type
              ELSE receiver_type
          END AS normalized_sender_type,
          CASE 
              WHEN receiver_id = GREATEST(sender_id, receiver_id) THEN receiver_type
              ELSE sender_type
          END AS normalized_receiver_type,
          MAX(message) AS latest_message,
          MAX("createdAt") AS latest_message_time
      FROM chats
      WHERE club_id = ${clubId}
      GROUP BY 
          LEAST(sender_id, receiver_id), 
          GREATEST(sender_id, receiver_id), 
          CASE 
              WHEN sender_id = LEAST(sender_id, receiver_id) THEN sender_type
              ELSE receiver_type
          END,
          CASE 
              WHEN receiver_id = GREATEST(sender_id, receiver_id) THEN receiver_type
              ELSE sender_type
          END
    )
    SELECT 
        m.*,
        CASE 
            WHEN m.normalized_sender_type = 'coach' THEN c."firstName" || ' ' || c."lastName"
            ELSE u1.first_name || ' ' || u1.last_name
        END AS sender_name,
        CASE 
            WHEN m.normalized_receiver_type = 'coach' THEN c2."firstName" || ' ' || c2."lastName"
            ELSE u2.first_name || ' ' || u2.last_name
        END AS receiver_name,
        CASE 
            WHEN m.normalized_sender_type = 'coach' THEN c."image"
            ELSE u1.image
        END AS sender_image,
        CASE 
            WHEN m.normalized_receiver_type = 'coach' THEN c2."image"
            ELSE u2.image
        END AS receiver_image,
        CASE 
            WHEN m.normalized_sender_type = 'coach' THEN c."slug"
            ELSE u1.slug
        END AS sender_slug,
        CASE 
            WHEN m.normalized_receiver_type = 'coach' THEN c2."slug"
            ELSE u2.slug
        END AS receiver_slug
    FROM chat_pairs m
    LEFT JOIN users u1 ON m.normalized_sender_id = u1.id AND m.normalized_sender_type = 'player'
    LEFT JOIN coaches c ON m.normalized_sender_id = c.id AND m.normalized_sender_type = 'coach'
    LEFT JOIN users u2 ON m.normalized_receiver_id = u2.id AND m.normalized_receiver_type = 'player'
    LEFT JOIN coaches c2 ON m.normalized_receiver_id = c2.id AND m.normalized_receiver_type = 'coach';
  `;

  try {
    // Execute the query and retrieve results
    const result = await db.execute(query);
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
