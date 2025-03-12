import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { teams, enterprises, coaches, otps, users } from '../../../../lib/schema';
import debug from 'debug';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '@/lib/constants';
import { eq, isNotNull, and, not, between, lt, ilike, sql, ne, isNull, or,desc } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country') || ''; // Keep the search as a string
  const state = searchParams.get('state') || '';
  const city = searchParams.get('city') || '';
  const graduation = searchParams.get('graduation') || '';
  const birthyear = searchParams.get('birthyear') || '';
  const position = searchParams.get('position') || '';

  try {
    const conditions = [and(
      eq(users.status, 'Active'),
      not(eq(users.first_name, '')),
      eq(users.visibility, 'on')
    )];

   /// conditions.push(isNull(users.parent_id));


    if (country) {
      conditions.push(eq(users.country, country));
    }
    if (state) {
      conditions.push(eq(users.state, state));
    }
    if (city) {
      conditions.push(ilike(users.city, city));
    }
    if (graduation) {
      conditions.push(ilike(users.graduation, graduation));
    }
    if (position && Array.isArray(position) && position.length > 0) {
      const positionConditions = position.map(pos => ilike(users.position, pos));
      conditions.push(...positionConditions);
    } else if (position) {
      conditions.push(ilike(users.position, position));
    }

    if (birthyear) {
      conditions.push(
        sql`EXTRACT(YEAR FROM ${users.birthday}) = ${birthyear}`
      );
    }




    const query = db
      .select({
        firstName: users.first_name,
        lastName: users.last_name,
        slug: users.slug,
        image: users.image,
        position: users.position,
        grade_level: users.grade_level,
        location: users.location,
        height: users.height,
        jersey: users.jersey,
        weight: users.weight,
        birthday: users.birthday,
        graduation: users.graduation,
        facebook: users.facebook,
        instagram: users.instagram,
        linkedin: users.linkedin,
        birth_year: users.birth_year,
        age_group: users.age_group,
        xlink: users.xlink,
        youtube: users.youtube,
        coachName: sql`coa."firstName"`.as("coachName"),
        coachLastName: sql`coa."lastName"`.as("coachLastName"),
        enterpriseName: sql`ent."organizationName"`.as("enterpriseName"),
      })
      .from(users)
      .leftJoin(
        sql`enterprises AS ent`, // Alias defined here
        sql`NULLIF(${users.enterprise_id}, '')::integer = ent.id`
      )
      .leftJoin(
        sql`coaches AS coa`, // Alias defined here
        sql`NULLIF(${users.coach_id}, '')::integer = coa.id`
      )
      .where(and(...conditions)).orderBy(desc(users.id));

    const result = await query.execute();


    const formattedCoachList = result.map(coach => ({
      coachName: `${coach.coachName} ${coach.coachLastName}`,
      enterpriseName: coach.enterpriseName,
      firstName: coach.firstName,
      lastName: coach.lastName,
      slug: coach.slug,
      image: coach.image,
      position: coach.position,
      jersey: coach.jersey,
      grade_level: coach.grade_level,
      location: coach.location,
      height: coach.height,
      weight: coach.weight,
      graduation: coach.graduation,
      birthday: coach.birthday,
      facebook: coach.facebook,
      instagram: coach.instagram,
      linkedin: coach.linkedin,
      xlink: coach.xlink,
      youtube: coach.youtube,
      birth_year: coach.birth_year,
      age_group: coach.age_group,
    }));
    // Return the coach list as a JSON response
    return NextResponse.json(formattedCoachList);

  } catch (error) {
    if (error instanceof Error) {
        console.error("Database Query Error:", error);

        return NextResponse.json(
            { message: "Failed to fetch coaches", error: error.message, stack: error.stack },
            { status: 500 }
        );
    }

    // Handle unknown errors (non-Error objects)
    console.error("Unknown Error:", error);
    return NextResponse.json(
        { message: "Failed to fetch coaches", error: "Unknown error occurred" },
        { status: 500 }
    );
}
}