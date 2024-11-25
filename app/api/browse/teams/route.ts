import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { teams,enterprises, coaches, otps } from '../../../../lib/schema';
import debug from 'debug';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '@/lib/constants';
import { eq,isNotNull,and, between, lt,ilike,sql } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    // const country = searchParams.get('country') || ''; // Keep the search as a string
    // const state = searchParams.get('state') || '';  
    // const city = searchParams.get('city') || '';  
    // const amount = searchParams.get('amount') || '';  
    // const rating = searchParams.get('rating') || '';  
  
    try {
      const conditions = [isNotNull(teams.team_name)];
      
      
    //   if (country) {
    //     conditions.push(eq(teams.country, country));
    //   }
    //   if (state) {
    //     conditions.push(eq(teams.state, state));
    //   }
    //   if (city) {
    //     conditions.push(ilike(teams.city, city));
    //   }
   
    //   if (rating) {
    //     if(rating=='0')
    //     {
          
    //       conditions.push(between(teams.rating, 0, 5));
    //     }
    //     else{
    //       conditions.push(eq(teams.rating, Number(rating)));
    //     }
        
    //   }
        
    //   if (amount) {
    //     if (amount=='0') {
    //     conditions.push(between(teams.expectedCharge, "0", "1000"));
    //     }
    //     else{
    //       conditions.push(lt(teams.expectedCharge, amount));
    //     }
    //   }
       
  
    const query = db
  .select({
    teamId: teams.id,
    teamName: teams.team_name,
    logo: teams.logo,
    slug: teams.slug,
    createdBy: teams.created_by,
    creatorId: teams.creator_id,
    creatorName: sql`COALESCE(ent."organizationName", coa."firstName")`.as("creatorName"), // Adjusted column names
  })
  .from(teams)
  .leftJoin(
    sql`enterprises AS ent`, // Explicit alias for enterprises
    sql`${teams.created_by} = 'Enterprise' AND ${teams.creator_id} = ent.id`
  )
  .leftJoin(
    sql`coaches AS coa`, // Explicit alias for coaches
    sql`${teams.created_by} = 'Coach' AND ${teams.creator_id} = coa.id`
  );

// Execute the query
const result = await query.execute();


  
        const formattedCoachList = result.map(coach => ({
            creatorName: coach.creatorName,
            teamId: coach.teamId,
            teamName: coach.teamName,
            slug: coach.slug,
            logo: coach.logo,
            
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