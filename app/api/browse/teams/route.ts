import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { teams,enterprises, coaches, otps } from '../../../../lib/schema';
import debug from 'debug';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '@/lib/constants';
import { eq,isNotNull,and, between, lt,ilike,sql,isNull } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country') || '';
  const state = searchParams.get('state') || '';  
  const city = searchParams.get('city') || '';  
  const gender = searchParams.get('gender') || '';  
  const rating = searchParams.get('rating') === '0' ? null : searchParams.get('rating') || '';
  const year = searchParams.get('year') || '';  
  
  try {
    const conditions = [
      isNotNull(teams.team_name), 
      isNull(teams.club_id), 
      eq(teams.status, 'Active'),
      eq(teams.visibility, 'on'),
    ];
    
    if (country) {
      conditions.push(eq(teams.country, country));
    }
    if (state) {
      conditions.push(eq(teams.state, state));
    }
    if (city) {
      conditions.push(ilike(teams.city, city));
    }
    if (gender) {
      conditions.push(ilike(teams.team_type, gender));
    }
    if (year) {
      conditions.push(eq(teams.team_year, year));  // Assuming 'year' is a number
    }

    if (rating) {
      if (rating === '0') {
        conditions.push(between(teams.rating, 0, 5));
      } else {
        conditions.push(eq(teams.rating, Number(rating)));
      }
    }

    const query = db
      .select({
        teamId: teams.id,
        teamName: teams.team_name,
        logo: teams.logo,
        slug: teams.slug,
        createdBy: teams.created_by,
        creatorId: teams.creator_id,
        creatorName: sql`COALESCE(ent."organizationName", coa."firstName")`.as("creatorName"),
      })
      .from(teams)
      .leftJoin(
        sql`enterprises AS ent`, 
        sql`${teams.created_by} = 'Enterprise' AND ${teams.creator_id} = ent.id`
      )
      .leftJoin(
        sql`coaches AS coa`, 
        sql`${teams.created_by} = 'Coach' AND ${teams.creator_id} = coa.id`
      )
      .where(and(...conditions));

    const result = await query.execute();

    const formattedCoachList = result.map(coach => ({
      creatorName: coach.creatorName,
      teamId: coach.teamId,
      teamName: coach.teamName,
      slug: coach.slug,
      logo: coach.logo,
    }));

    return NextResponse.json(formattedCoachList);

  } catch (error) {
    console.error('Error fetching coaches:', error);
    return NextResponse.json({ message: 'Failed to fetch coaches' }, { status: 500 });
  }
}
