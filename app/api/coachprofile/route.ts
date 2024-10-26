import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import { coaches, playerEvaluation, users } from '../../../lib/schema'
import debug from 'debug';
import { eq } from 'drizzle-orm';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import next from 'next';
import { SECRET_KEY } from '@/lib/constants';


  export async function POST(req: NextRequest) {
    const { slug } = await req.json();
    
    try {
      // Using 'like' with lower case for case-insensitive search
      const coachlist = await db
        .select()
        .from(coaches)
        .where(
          eq(coaches.slug,slug)
        )
        .limit(1) 
        .execute();
        const payload = coachlist.map(coach => ({
          firstName: coach.firstName,
          lastName: coach.lastName,
          id: coach.id,
          expectedCharge: coach.expectedCharge,
          createdAt: coach.createdAt, 
          slug:coach.slug,
          rating:coach.rating,
          gender:coach.gender,
          location:coach.location,
          sport:coach.sport,
          clubName:coach.clubName,
          qualifications:coach.qualifications,
          certificate:coach.certificate,
          country:coach.country,
          state:coach.state,
          city:coach.city,
          
          image: coach.image ? `${coach.image}` : null,
        }));
 
 
        const evaluationlist = await db
        .select({
          review_title: playerEvaluation.review_title,
          rating: playerEvaluation.rating,
          first_name: users.first_name, // Assuming the users table has a `name` field
          last_name: users.last_name, // Assuming the users table has an `image` field
          image: users.image, // Assuming the users table has an `image` field
        })
        .from(playerEvaluation)
        .innerJoin(users, eq(playerEvaluation.player_id, users.id)) // Join condition
        .where(eq(playerEvaluation.coach_id, coachlist[0].id))
        .execute();
        
       
      
     
        
  
      return NextResponse.json({coachdata:payload[0], evaluationlist:evaluationlist});
    } catch (error) {
      const err = error as any;
      console.error('Error fetching coaches:', error);
      return NextResponse.json({ message: 'Failed to fetch coaches' }, { status: 500 });
    }
  }