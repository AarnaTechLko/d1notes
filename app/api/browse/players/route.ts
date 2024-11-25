import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { teams, enterprises, coaches, otps, users } from '../../../../lib/schema';
import debug from 'debug';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '@/lib/constants';
import { eq, isNotNull, and, between, lt, ilike, sql } from 'drizzle-orm';
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
        firstName: users.first_name,
        lastName: users.last_name,
        slug: users.slug,
        image: users.image,
        coachName: sql`coa."firstName"`.as("coachName"),
        coachLastName: sql`coa."lastName"`.as("coachLastName"),
        enterpriseName: sql`ent."organizationName"`.as("enterpriseName"),
      })
      .from(users)
      .leftJoin(
        sql`enterprises AS ent`, // Alias defined here
        sql`${users.enterprise_id}::integer = ent.id`
      )
      .leftJoin(
        sql`coaches AS coa`, // Alias defined here
        sql`${users.coach_id}::integer = coa.id`
      );

    const result = await query.execute();


    const formattedCoachList = result.map(coach => ({
      coachName: `${coach.coachName} ${coach.coachLastName}`,
      enterpriseName: coach.enterpriseName,
      firstName: coach.firstName,
      lastName: coach.lastName,
      slug: coach.slug,
      image: coach.image,

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