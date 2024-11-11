import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import { users } from '../../../lib/schema'
import debug from 'debug';
import { eq } from 'drizzle-orm';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import next from 'next';
import { SECRET_KEY } from '@/lib/constants';


  export async function POST(req: NextRequest) {
    const { playerId } = await req.json();
    
    try {
      // Using 'like' with lower case for case-insensitive search
      const userslist = await db
        .select({
            first_name:users.first_name,
          last_name:users.last_name,
          grade_level:users.grade_level,
          location:users.location,
          birthday:users.birthday,
          gender:users.gender,
          
          sport:users.sport,
          team:users.team,
          position:users.position,
          number:users.number,
          email:users.email,
          image:users.image,
          bio:users.bio,
          country:users.country,
          state:users.state,
          city:users.city,
          jersey:users.jersey,
          countrycode:users.countrycode,

        })
        .from(users)
        .where(
          eq(users.id,playerId)
        )
        .limit(1) 
        .execute();
        const payload = userslist.map(user => ({
            first_name:user.first_name,
            last_name:user.last_name,
            grade_level:user.grade_level,
            location:user.location,
            birthday:user.birthday,
            gender:user.gender,
            
            sport:user.sport,
            team:user.team,
            position:user.position,
            number:user.number,
            email:user.email,
           
            bio:user.bio,
            country:user.country,
            state:user.state,
            city:user.city,
            jersey:user.jersey,
            countrycode:user.countrycode,
          image: user.image ? `${user.image}` : null,
          
        }));

       
  
      return NextResponse.json(payload[0]);
    } catch (error) {
      const err = error as any;
      console.error('Error fetching users:', error);
      return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
    }
  }

  export async function PUT(req: NextRequest) {
    try {
      const body = await req.json();
      const finalBody = body.profileData;
  const playerId = body.playerId;
      const {
        first_name,
        last_name,
        grade_level,
        birthday,
        team,
        email,
        position,
        gender,
        image,
        location,
        number,
        sport,
        bio,
        country,
        state,
        city,
        jersey,
      
        countrycode
      } = finalBody;


      let updateData: any = {
        first_name: first_name || null,
        last_name: last_name || null,
        grade_level: grade_level || null,
        birthday:birthday  || null,
        team: team || null,
        email: email  || null,
        position: position || null,
        gender: gender || null,
        image: image || null,
        location: location || null,
        number:number || null,
        sport: sport || null,
        bio: bio || null,
        country: country || null,
        state: state || null,
        city: city || null,
        jersey:jersey || null,
       
        countrycode: countrycode || null
      };
  
      

      // Update the coach's profile
      const updatedUser = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, playerId))
        .execute();
  
        const updateduser = await db
        .select({
            first_name:users.first_name,
          last_name:users.last_name,
          grade_level:users.grade_level,
          location:users.location,
          birthday:users.birthday,
          gender:users.gender,
          
          sport:users.sport,
          team:users.team,
          position:users.position,
          number:users.number,
          email:users.email,
          image:users.image,
          bio:users.bio,
          country:users.country,
          state:users.state,
          city:users.city,
          jersey:users.jersey,
          countrycode:users.countrycode,
  
          }).from(users)
        .where(eq(users.id, playerId))
        .execute();
  
      // Return the updated profile data
      return NextResponse.json(updateduser);
    } catch (error) {
      console.error("Error updating profile:", error);
      return NextResponse.json({ success: false, message: 'Failed to update profile.' }, { status: 500 });
    }
  }