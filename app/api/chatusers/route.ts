import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust the path based on your setup
import { coaches, users, enterprises, chats, chatfriend } from "@/lib/schema";
import { eq, sql, and, or, desc } from "drizzle-orm";
import { height } from "@mui/system";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get('user_id');
  const user_type = searchParams.get('user_type');
  let userData;
  let coachData;
  if(user_type=='player')
  {
    
      userData=await db.select().from(users).where(eq(users.id,Number(user_id))).execute();
      coachData=await db.select(
        {
          user_id:coaches.id,
          first_name:coaches.firstName,
          last_name:coaches.lastName,
          image:coaches.image,
          gender:coaches.gender,
          sport:coaches.sport,
          clubName:coaches.clubName,
          qualifications:coaches.qualifications,
          slug:coaches.slug,
          id:coaches.id,
        }
      ).from(coaches).where(eq(coaches.enterprise_id,String(userData[0].enterprise_id))).execute();
  }

  if(user_type=='coach')
    {
        userData=await db.select().from(coaches).where(eq(coaches.id,Number(user_id))).execute();
        coachData=await db.select(
          {
            user_id:users.id,
            first_name:users.first_name,
            last_name:users.last_name,
            image:users.image,
            gender:users.gender,
            sport:users.sport,
            location:users.location,
            height:users.height,
            weight:users.weight,
            slug:users.slug,
            id:users.id,
          }
        ).from(users).where(eq(users.enterprise_id,String(userData[0].enterprise_id))).execute();
    }
  

  //let friends;

  // if (user_type == 'coach') {
  //   friends = await db
  //     .select({
  //       user_id: users.id,
  //       first_name: users.first_name,
  //       last_name: users.last_name,
  //       image: users.image,
  //       grade_level: users.grade_level,
  //       location: users.location,
  //       gender: users.gender,
  //       sport: users.sport,
  //       height: users.height,
  //       weight: users.weight,
  //       slug: users.slug,
  //       bio: users.bio,
  //       type: chatfriend.chattotype,
  //     })
  //     .from(chatfriend)
  //     .leftJoin(
  //       users,
  //       and(eq(chatfriend.chattotype, 'player'), eq(chatfriend.chatto, users.id))
  //     )

  //     .where(eq(chatfriend.chatfrom, Number(user_id))).orderBy(desc(chatfriend.id));
  // }

  // else if (user_type == 'player') {
  //   friends = await db
  //     .select({
  //       user_id: coaches.id,
  //       image: coaches.image,
  //       type: chatfriend.chattotype,
  //       firstName: coaches.firstName,
  //       lastName: coaches.lastName,
  //       gender: coaches.gender,
  //       sport: coaches.sport,
  //       clubName: coaches.clubName,
  //       qualifications: coaches.qualifications,
  //     })
  //     .from(chatfriend)
  //     .leftJoin(
  //       coaches,
  //       and(eq(chatfriend.chattotype, 'coach'), eq(chatfriend.chatto, coaches.id))
  //     )
  //     .where(eq(chatfriend.chatfrom, Number(user_id))).orderBy(desc(chatfriend.id));
  // }





  return NextResponse.json(coachData, { status: 200 });
}
