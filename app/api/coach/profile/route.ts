import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';

import { coaches, countries, evaluation_charges } from '../../../../lib/schema'
import debug from 'debug';
import { eq,sql,and } from 'drizzle-orm';
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
          certificate:coaches.certificate,
          country:coaches.country,
          countrycode:coaches.countrycode,
          state:coaches.state,
          city:coaches.city,
          facebook:coaches.facebook,
          linkedin:coaches.linkedin,
          instagram:coaches.instagram,
          xlink:coaches.xlink,
          youtube:coaches.youtube,
          countryName:countries.name,
          license_type:coaches.license_type,
          cv:coaches.cv,
          license:coaches.license

        })
        .from(coaches)
        .leftJoin(
          countries, 
          eq(countries.id, sql<number>`CAST(${coaches.country} AS INTEGER)`) // ✅ Explicit cast using sql
        )
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
          city: coach.city,
          
          sport:coach.sport,
          qualifications:coach.qualifications,
          clubName:coach.clubName,
          country:coach.country,
          state:coach.state,
          countrycode:coach.countrycode,
          image: coach.image ? `${coach.image}` : null,
          certificate: coach.certificate ? `${coach.certificate}` : null,
          countryName:coach.countryName,
          facebook:coach.facebook,
          linkedin:coach.linkedin,
          instagram:coach.instagram,
          xlink:coach.xlink,
          youtube:coach.youtube,
          license_type:coach.license_type,
          license:coach.license,
          cv:coach.cv,
        }));

        await db.update(evaluation_charges)
        .set({ amount: payload[0].expectedCharge })
        .where(
          and(
            eq(evaluation_charges.coach_id,coachId),
            eq(evaluation_charges.turnaroundtime,'120'),
        )
      );
  
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
        password,
        city,
        country,
        countrycode,
        state,
        facebook,
        linkedin,
        instagram,
        xlink,
        youtube,
        license_type,
        license,
        cv  
        
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
        city: city || null,
        country: country || null,
        countrycode: countrycode || null,
        state: state || null,
        facebook: facebook || null,
        linkedin: linkedin || null,
        instagram: instagram || null,
        xlink: xlink || null,
        youtube: youtube || null,
        license_type: license_type || null,
        cv: cv || null,
        license: license || null,
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
            certificate:coaches.certificate,
            city: coaches.city,
            country: coaches.country,
            countrycode: coaches.countrycode,
            state: coaches.state,
            facebook: coaches.facebook,
            linkedin: coaches.linkedin,
            instagram: coaches.instagram,
            xlink: coaches.xlink,
            youtube: coaches.youtube,
            license: coaches.license,
            cv: coaches.cv,
            
  
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