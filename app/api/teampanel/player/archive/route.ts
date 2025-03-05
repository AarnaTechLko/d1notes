// app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../../lib/db';
import { users, otps, licenses, teamPlayers, playerEvaluation } from '../../../../../lib/schema'
import { eq, and, or, ilike, count, desc, sql } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {

    const formData = await req.formData();
    const license = formData.get('license') as string;
    const team_id = formData.get('team_id') as string;
    const checkLicense = await db
      .select()
      .from(licenses)
      .where(
        and(
          eq(licenses.licenseKey, license),
          eq(licenses.status, 'Free'),
          
  
        ));
    if (checkLicense.length < 1) {
      return NextResponse.json({ message: checkLicense.length }, { status: 500 });
    }
  
  
    const firstName = formData.get('first_name') as string;
    const email = formData.get('email') as string;
  
    const lastName = formData.get('last_name') as string;
    const gradeLevel = formData.get('grade_level') as string;
    const location = formData.get('location') as string;
    const birthday = formData.get('birthday') as string;
    const gender = formData.get('gender') as string;
    const sport = formData.get('sport') as string;
    const team = formData.get('team') as string;
    const position = formData.get('position') as string;
    const number = formData.get('number') as string;
    const playerID = formData.get('playerID') as string;
    const country = formData.get('country') as string;
    const state = formData.get('state') as string;
    const city = formData.get('city') as string;
    const bio = formData.get('bio') as string;
    const jersey = formData.get('jersey') as string;
    const league = formData.get('league') as string;
    const countrycode = formData.get('countrycode') as string;
    const imageFile = formData.get('image') as string | null;
    const randomPassword = Array(12)
      .fill(null)
      .map(() => Math.random().toString(36).charAt(2)) // Generate random characters
      .join('');
    const hashedPassword = await hash(randomPassword, 10);
    try {
      const timestamp = Date.now();
      const slug = `${firstName.trim().toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
  
      const user = await db
        .insert(users)
        .values({
          first_name: firstName,
          last_name: lastName,
          email: email,
        
          grade_level: gradeLevel,
          location: location,
          birthday: birthday,
          gender: gender,
          sport: sport,
          team: team,
          position: position,
          number: number,
          country: country,
          state: state,
          city: city,
          bio: bio,
          jersey: jersey,
          league: league,
          countrycode: countrycode,
          image: imageFile,
          password: hashedPassword,
          slug: slug,
          status: 'Active',
        })
        .returning();
  
      const updateLicnes = await db.update(licenses).set({
        status: 'Consumed',
        used_by: user[0].id.toString(),
        used_for: 'Player',
      }).where(eq(licenses.licenseKey, license));
  
  
  
  
      const emailResult = await sendEmail({
        to: email,
        subject: "D1 NOTES Player Registration",
        text: "D1 NOTES Player Registration",
        html: `<p>Dear ${firstName}! Your account for  Player on D1 NOTES has been created. </p><p>Find your Login credentials below.</p><p><b>Email: </b> ${email}</p><p><b>Password: </b>${randomPassword}</p><p>Click <a href="https://d1notes.com/login" target="_blank">Here to Login</a></p>`,
      });
      return NextResponse.json({ message: "Profile Completed" }, { status: 200 });
    }
    catch (error: unknown) {
      if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
      }
  
    }
  
  }

  export async function GET(req: NextRequest) {
    try {
      const url = new URL(req.url);
      const search = url.searchParams.get("search") || "";
      const page = parseInt(url.searchParams.get("page") || "1", 10);
      const limit = parseInt(url.searchParams.get("limit") || "10", 10);
      const team_id = url.searchParams.get("team_id");
      const teamId = url.searchParams.get("teamId");
  
      if (!team_id) {
        return NextResponse.json(
          { message: "Enterprise ID not found!" },
          { status: 400 }
        );
      }
  
      const offset = (page - 1) * limit;
  
      const whereClause = search
        ? and(
            eq(users.team_id, team_id),
            eq(users.status, "Archived"), // Ensure only "Archived" users are selected
            or(
              ilike(users.first_name, `%${search}%`),
              ilike(users.email, `%${search}%`),
              ilike(users.number, `%${search}%`)
            )
          )
        : and(eq(users.team_id, team_id), eq(users.status, "Archived")); // Filter for Archived users
  
      let query;
      let totalCountQuery;
  
      if (teamId) {
        query = db
          .select({
            id: users.id,
            first_name: users.first_name,
            last_name: users.last_name,
            grade_level: users.grade_level,
            location: users.location,
            birthday: users.birthday,
            gender: users.gender,
            sport: users.sport,
            team: users.team,
            jersey: users.jersey,
            position: users.position,
            number: users.number,
            email: users.email,
            image: users.image,
            bio: users.bio,
            country: users.country,
            state: users.state,
            city: users.city,
            league: users.league,
            countrycode: users.countrycode,
            slug: users.slug,
            status: users.status,
            createdAt: users.createdAt,
            totalEvaluations: sql<number>`COUNT(CASE WHEN player_evaluation.status = 2 THEN player_evaluation.id END)`,
          })
          .from(users) 
          .innerJoin(teamPlayers, eq(teamPlayers.playerId, users.id))
          .where(and(eq(users.status, "Archived"), eq(teamPlayers.teamId, Number(teamId)))) // Ensure "Archived" filter applies here
          .orderBy(desc(users.createdAt))
          .offset(offset)
          .limit(limit);
  
        totalCountQuery = db
          .select({ count: count() })
          .from(users)
          .innerJoin(teamPlayers, eq(teamPlayers.playerId, users.id))
          .where(and(eq(users.status, "Archived"), eq(teamPlayers.teamId, Number(teamId))));
      } else {
        query = db
          .select()
          .from(users)
          .where(whereClause)
          .orderBy(desc(users.createdAt))
          .offset(offset)
          .limit(limit);
  
        totalCountQuery = db
          .select({ count: count() })
          .from(users)
          .where(whereClause);
      }
  
      const players = await query;
      const totalCount = await totalCountQuery.then((result) => result[0]?.count || 0);
      const totalPages = Math.ceil(totalCount / limit);
  
      return NextResponse.json({ players, totalPages });
    } catch (error) {
      return NextResponse.json(
        {
          message: "Failed to fetch players",
          error: error instanceof Error ? error.message : error,
        },
        { status: 500 }
      );
    }
  }
  
