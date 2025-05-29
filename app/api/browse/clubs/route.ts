import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { enterprises, countries, otps } from '../../../../lib/schema';
import debug from 'debug';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '@/lib/constants';
import { eq,isNotNull, and, sql , between, lt,ilike } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    // const country = searchParams.get('country') || ''; // Keep the search as a string
    // const state = searchParams.get('state') || '';  
    // const city = searchParams.get('city') || '';  
    // const amount = searchParams.get('amount') || '';  
    // const rating = searchParams.get('rating') || '';  
  
    try {
      const conditions = [isNotNull(enterprises.organizationName)];
      
      
    //   if (country) {
    //     conditions.push(eq(enterprises.country, country));
    //   }
    //   if (state) {
    //     conditions.push(eq(enterprises.state, state));
    //   }
    //   if (city) {
    //     conditions.push(ilike(enterprises.city, city));
    //   }
   
    //   if (rating) {
    //     if(rating=='0')
    //     {
          
    //       conditions.push(between(enterprises.rating, 0, 5));
    //     }
    //     else{
    //       conditions.push(eq(enterprises.rating, Number(rating)));
    //     }
        
    //   }
        
    //   if (amount) {
    //     if (amount=='0') {
    //     conditions.push(between(enterprises.expectedCharge, "0", "1000"));
    //     }
    //     else{
    //       conditions.push(lt(enterprises.expectedCharge, amount));
    //     }
    //   }
       
  
  
      let query =  db
        .select({
            organizationName: enterprises.organizationName,
            country: enterprises.country,
            countryName: countries.name,
            state: enterprises.state,
            city:enterprises.city,
            logo: enterprises.logo,
            slug: enterprises.slug,
            club_id:enterprises.id,
          is_deleted:enterprises.is_deleted,
        })
        .from(enterprises)
        .leftJoin(countries, eq(countries.id, sql<number>`CAST(${enterprises.country} AS INTEGER)`))
        .where(and(...conditions))
        
      // .leftJoin(countries, eq(countries.id, sql<number>`CAST(${users.country} AS INTEGER)`))

        
        const coachlist =await query.execute();
  
        const formattedCoachList = coachlist.map(coach => ({
            organizationName: coach.organizationName,
            country: coach.country,
            countryName: coach.countryName,
            state: coach.state,
            city: coach.city,
            logo:coach.logo,
            slug:coach.slug,
            club_id:coach.club_id,
            is_deleted: coach.is_deleted, // ✅ Include this field

           
        }));
      // Return the coach list as a JSON response
      return NextResponse.json(formattedCoachList);
  
    } catch (error) {
      const err = error as any;
      console.error('Error fetching coaches:', error);
  
      // Return an error response if fetching fails
      return NextResponse.json(
        { message: 'Failed to fetch coaches' },
        { status: 500 }
      );
    }
  }