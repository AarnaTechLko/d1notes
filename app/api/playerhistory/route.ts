import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import { coaches, joinRequest, playerEvaluation, users, } from '../../../lib/schema'
import debug from 'debug';
import { eq,and } from 'drizzle-orm';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import next from 'next';
import { SECRET_KEY } from '@/lib/constants';


  export async function POST(req: NextRequest) {
    const { slug,loggeInUser } = await req.json();
    
    try {
      // Using 'like' with lower case for case-insensitive search
      const player = await db
        .select()
        .from(users)
        .where(
          eq(users.slug,slug)
        )
        .limit(1) 
        .execute();
        
 
 
        const evaluationlist = await db
        .select({
          review_title: playerEvaluation.review_title,
          id: playerEvaluation.id,
          rating: playerEvaluation.rating,
          first_name: users.first_name, // Assuming the users table has a `name` field
          last_name: users.last_name, // Assuming the users table has an `image` field
          image: users.image, // Assuming the users table has an `image` field
        })
        .from(playerEvaluation)
        .innerJoin(users, eq(playerEvaluation.player_id, users.id)) // Join condition
        .where(
          and(
            eq(playerEvaluation.player_id, player[0].id),
            eq(playerEvaluation.status, 2))
          )
        .execute();
    
      
        
        
  
      return NextResponse.json({ evaluationlist:evaluationlist});
    } catch (error) {
      const err = error as any;
      console.error('Error fetching coaches:', error);
      return NextResponse.json({ message: 'Failed to fetch coaches' }, { status: 500 });
    }
  }