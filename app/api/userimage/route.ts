
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import { playerEvaluation, users, coaches } from '../../../lib/schema'
import { like } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { and } from 'drizzle-orm';
import next from 'next';

export async function POST(req: NextRequest) {
    try {
      const { userId, type } = await req.json();
  
      let query;
  
      if (type === "coach") {
        query = await db.query.coaches.findFirst({
          where: eq(coaches.id, userId)
        });
      } else {
        query = await db.query.users.findFirst({
          where: eq(users.id, userId)
        });
      }
  
      // Check if the query returned a result
      if (!query) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }
  
      // Return the image in a structured JSON response
      return NextResponse.json({ image: query.image });
    } catch (error) {
      console.error('Error fetching data:', error); // Log the error for debugging
      return NextResponse.json(
        { message: "Error in fetching data" },
        { status: 500 }
      );
    }
  }