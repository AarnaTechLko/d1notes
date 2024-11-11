import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';

import { coaches } from '../../../../lib/schema'
import debug from 'debug';
import { eq } from 'drizzle-orm';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import next from 'next';
import { SECRET_KEY } from '@/lib/constants';


  export async function POST(req: NextRequest) {
    const { coachId } = await req.json();
    
    try {
      // Using 'like' with lower case for case-insensitive search
      const coachlist = await db
        .select({
          firstName:coaches.firstName,
          lastName:coaches.lastName,
          email:coaches.email,
          phoneNumber:coaches.phoneNumber,
          expectedCharge:coaches.expectedCharge,
          gender:coaches.gender,
          
          image:coaches.image,
          location:coaches.location,
          sport:coaches.sport,
          clubName:coaches.clubName,
          qualifications:coaches.qualifications,
          certificate:coaches.certificate

        })
        .from(coaches)
        .where(
          eq(coaches.id,coachId)
        )
        .limit(1) 
        .execute();
        const payload = coachlist.map(coach => ({
          firstName: coach.firstName,
          lastName: coach.lastName,
          email: coach.email,
          phoneNumber: coach.phoneNumber,
          expectedCharge: coach.expectedCharge,
          gender: coach.gender,
          location: coach.location,
          
          sport:coach.sport,
          qualifications:coach.qualifications,
          clubName:coach.clubName,
          image: coach.image ? `${coach.image}` : null,
          certificate: coach.certificate ? `${coach.certificate}` : null,
        }));

       
  
      return NextResponse.json(payload[0]);
    } catch (error) {
      const err = error as any;
      console.error('Error fetching coaches:', error);
      return NextResponse.json({ message: 'Failed to fetch coaches' }, { status: 500 });
    }
  }

  export async function PUT(req: NextRequest) {
    try {
      const body = await req.json();
      const finalBody = body.profileData;
  const coachId = body.coachId;
      const {
        firstName,
        lastName,
        phoneNumber,
        certificate,
        clubName,
        email,
        expectedCharge,
        gender,
        image,
        location,
        qualifications,
        sport,
        password
        
      } = finalBody;
      let updateData: any = {
        firstName: firstName || null,
        lastName: lastName || null,
        phoneNumber: phoneNumber || null,
        location: location || null,
        certificate: certificate || null,
        gender: gender || null,
        sport: sport || null,
        clubName: clubName || null,
        email: email || null,
        expectedCharge: expectedCharge || null,
        qualifications: qualifications || null,
        image: image || null,
      };

      if (password) {
        const hashedPassword = await hash(password, 10); // Hash the password with bcrypt
        updateData.password = hashedPassword; // Add the hashed password to the update data
      }
      // Update the coach's profile
      const updatedUser = await db
        .update(coaches)
        .set(updateData)
        .where(eq(coaches.id, coachId))
        .execute();
  
        const updatedCoach = await db
        .select({
            firstName:coaches.firstName,
            lastName:coaches.lastName,
            email:coaches.email,
            phoneNumber:coaches.phoneNumber,
            expectedCharge:coaches.expectedCharge,
            gender:coaches.gender,
            
            image:coaches.image,
            location:coaches.location,
            sport:coaches.sport,
            clubName:coaches.clubName,
            qualifications:coaches.qualifications,
            certificate:coaches.certificate
  
          }).from(coaches)
        .where(eq(coaches.id, coachId))
        .execute();
  
      // Return the updated profile data
      return NextResponse.json(updatedCoach);
    } catch (error) {
      console.error("Error updating profile:", error);
      return NextResponse.json({ success: false, message: 'Failed to update profile.' }, { status: 500 });
    }
  }