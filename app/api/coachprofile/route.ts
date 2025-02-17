import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import { coaches, joinRequest, playerEvaluation, users,countries, licenses, evaluation_charges } from '../../../lib/schema'
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
      const coachlist = await db
        .select({
          firstName:coaches.firstName,
          lastName:coaches.lastName,
          id:coaches.id,
          expectedCharge:coaches.expectedCharge,
          createdAt:coaches.createdAt,
          slug:coaches.slug,
          rating:coaches.rating,
          gender:coaches.gender,
          location:coaches.location,
          sport:coaches.sport,
          clubName:coaches.clubName,
          currency:coaches.currency,
          qualifications:coaches.qualifications,
          certificate:coaches.certificate,
          country:countries.name,
          state:coaches.state,
          city:coaches.city,
          enterprise_id:coaches.enterprise_id,
          image:coaches.image,
          facebook:coaches.facebook,
          linkedin:coaches.linkedin,
          instagram:coaches.instagram,
          xlink:coaches.xlink,
          youtube:coaches.youtube,
        })
        .from(coaches)
       .leftJoin(
      countries,
      eq(countries.id, isNaN(Number(coaches.country)) ? 231 : Number(coaches.country)) // Prevent NaN error
    )
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
          currency:coach.currency,
          qualifications:coach.qualifications,
          certificate:coach.certificate,
          country:coach.country,
          state:coach.state,
          city:coach.city,
          enterprise_id:coach.enterprise_id,
          facebook:coach.facebook,
          linkedin:coach.linkedin,
          instagram:coach.instagram,
          xlink:coach.xlink,
          youtube:coach.youtube,
          
          image: coach.image ? `${coach.image}` : null,
        }));
 
 
        const evaluationlist = await db
        .select({
          id: playerEvaluation.id,
          review_title: playerEvaluation.review_title,
          rating: playerEvaluation.rating,
          first_name: users.first_name, // Assuming the users table has a `name` field
          last_name: users.last_name, // Assuming the users table has an `image` field
          image: users.image, // Assuming the users table has an `image` field
        })
        .from(playerEvaluation)
        .innerJoin(users, eq(playerEvaluation.player_id, users.id)) // Join condition
        .where(
          and(
            eq(playerEvaluation.coach_id, coachlist[0].id),
            eq(playerEvaluation.status, 2))
          )
        .execute();
        
       const requested=await db.select().from(joinRequest).where(
        and(
          eq(joinRequest.player_id,loggeInUser),
          eq(joinRequest.requestToID,coachlist[0].id),
        )).execute();
      
        const isRequested = requested.length;
      let totalLicneses;
      let availableLicenses;
      if(coachlist[0].enterprise_id!=null)
      {
        availableLicenses=await db.select().from(licenses).where(eq(licenses.enterprise_id, Number(coachlist[0].enterprise_id)));
        if(availableLicenses.length>0)
          {
            totalLicneses="available";
          }
          else{
            totalLicneses="notavailable";
          }
      }
      else{
        totalLicneses="notavailable1";
      }
      
     const evaluationCharges=await db.select().from(evaluation_charges).where(eq(evaluation_charges.coach_id,Number(coachlist[0].id)));
      return NextResponse.json({coachdata:payload[0], evaluationlist:evaluationlist,isRequested:isRequested, totalLicneses:totalLicneses, evaluationCharges:evaluationCharges});
    } catch (error) {
      const err = error as any;
      console.error('Error fetching coaches:', error);
      return NextResponse.json({ message: 'Failed to fetch coaches' }, { status: 500 });
    }
  }