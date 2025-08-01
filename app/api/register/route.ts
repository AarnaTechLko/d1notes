// app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import { users, otps, teams, teamPlayers, coaches, licenses, invitations, block_ips, ip_logs } from '../../../lib/schema'
import debug from 'debug';
import { eq, and, gt,or } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';

import { SECRET_KEY } from '@/lib/constants';
import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken';
import next from 'next';


async function getGeoLocation(): Promise<any> {
  try {
    const token = '750b64ff1566ad';
    const res = await fetch(`https://ipinfo.io/json?token=${token}`);
    if (!res.ok) throw new Error("Failed to fetch IP info");
    const data = await res.json();
    console.log("data",data);
    return data; // contains ip, city, region, country, etc.
  } catch (error) {
    console.error("IPINFO fetch error:", error);
    return null;
  }
}

function getClientIp(req: { headers?: Record<string, any> }): string {
  const headers = req.headers || {};

  const forwarded = headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    const ip = forwarded.split(",")[0].trim();
    if (ip && ip !== "::1") return ip;
  }

  const realIp = headers["x-real-ip"];
  if (typeof realIp === "string" && realIp !== "::1") return realIp;

  return "127.0.0.1";
}


export async function POST(req: NextRequest) {
  const logError = debug('app:error');
  const body = await req.json();
  const { email, password, otp, sendedBy, enterprise_id, teamId } = body;

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 500 });
  }
  // const clientIp = getClientIp(req);
  // console.log('Client IP:', clientIp);

  // // Step 2: Get geolocation details
  // const geoData = await getGeoLocation(clientIp);
  // const ipAddress = geoData?.ip?.trim() || clientIp;

  // // Step 3: Blocked IP check
  // const [blockedEntry] = await db
  //   .select()
  //   .from(block_ips)
  //   .where(
  //     and(
  //       eq(block_ips.block_ip_address, ipAddress),
  //       eq(block_ips.status, 'block')
  //     )
  //   )
  //   .execute();

  // if (blockedEntry) {
  //   return NextResponse.json(
  //     { message: `Access denied: Your IP (${ipAddress}) is blocked.`, blocked: true },
  //     { status: 403 }
  //   );
  // }

  const datag = await getGeoLocation();

if (!datag || !datag.ip) {
  return NextResponse.json(
    { message: 'Unable to determine your IP/location.', blocked: true },
    { status: 400 }
  );
}

const trimmedIp = datag.ip.trim();
const trimmedCountry = datag.country?.trim() || '';
const trimmedCity = datag.city?.trim() || '';
const trimmedRegion = datag.region?.trim() || '';

console.log("Geo Data:", { trimmedIp, trimmedCountry, trimmedCity, trimmedRegion });

const [blockedEntry] = await db
  .select()
  .from(block_ips)
  .where(
    and(
      eq(block_ips.status, 'block'),
      or(
        eq(block_ips.block_ip_address, trimmedIp),
        eq(block_ips.block_ip_address, trimmedCountry),
        eq(block_ips.block_ip_address, trimmedCity),
        eq(block_ips.block_ip_address, trimmedRegion)
      )
    )
  )
  .execute();

if (blockedEntry) {
  const blockedValue = blockedEntry.block_ip_address;

  const blockReasons: Record<string, string> = {
    [trimmedIp]: `Access denied: Your IP (${trimmedIp}) is blocked.`,
    [trimmedCountry]: `Access denied: Your country (${trimmedCountry}) is blocked.`,
    [trimmedCity]: `Access denied: Your city (${trimmedCity}) is blocked.`,
    [trimmedRegion]: `Access denied: Your region (${trimmedRegion}) is blocked.`
  };

  const message = blockReasons[blockedValue] || 'Access denied: Your location is blocked.';

  return NextResponse.json(
    { message, blocked: true },
    { status: 403 }
  );
}

  // Step 3: Email check (only if IP is not blocked)
  const checkEmail = await db.select().from(users).where(eq(users.email, email)).execute();
  if (checkEmail.length > 0) {
    return NextResponse.json({ message: 'This email already exists.' }, { status: 500 });
  }

  // Step 4: Proceed with user registration
  const hashedPassword = await hash(password, 10);

  try {
    const userValues: any = {
      first_name: null,
      last_name: null,
      grade_level: null,
      location: null,
      birthday: null,
      gender: null,
      sport: null,
      team: null,
      position: null,
      number: null,
      email: email.toLowerCase(),
      image: null,
      bio: null,
      country: null,
      state: null,
      city: null,
      enterprise_id: enterprise_id,
      team_id: teamId,
      jersey: null,
      slug: null,
      visibility: "on",
      password: hashedPassword,
      createdAt: new Date(),
    };

    const insertedUser = await db.insert(users).values(userValues).returning();

    // Add to team if applicable
    if (teamId) {
      try {
        await db.insert(teamPlayers).values({
          teamId: Number(teamId),
          playerId: Number(insertedUser[0].id),
          enterprise_id: Number(userValues.enterprise_id),
        });

        await db.update(invitations).set({ status: 'Joined' }).where(
          and(
            eq(invitations.team_id, Number(teamId)),
            eq(invitations.email, email),
            eq(invitations.enterprise_id, Number(userValues.enterprise_id))
          )
        );
         await db.insert(ip_logs).values({
      userId: insertedUser[0].id,
      ip_address: datag.ip.toString(),
      type: 'coach',
      login_time: new Date(),
      logout_time: null,
      created_at: new Date(),
      city: datag.city || null,
      region: datag.region || null,
      country: datag.country || null,
      postal: datag.postal || null,
      org: datag.org || null,
      loc: datag.loc || null,
      timezone: datag.timezone || null,
    });
      } catch (error) {
        return NextResponse.json({ message: String(error) }, { status: 500 });
      }
    }

    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    await sendEmail({
      to: email,
      subject: "D1 NOTES Player Registration Follow Up",
      text: "D1 NOTES Player Registration Follow Up",
      html: `<p>Dear Player! Your D1 Notes <a href="${baseUrl}/login" style="font-weight: bold; color: blue;">login</a> account has been created. If you have not done so already, please complete your profile in order to take advantage of all D1 Notes has to offer!</p><p className="mt-10">Regards,<br>D1 Notes Team</p>`,
    });

    return NextResponse.json({ id: insertedUser }, { status: 200 });

  } catch (error: any) {
    if (error.constraint === 'users_email_unique') {
      return NextResponse.json({ message: "This Email ID is already in use." }, { status: 500 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}



export async function PUT(req: NextRequest, res: NextResponse) {
  const logError = debug('app:error');
  const formData = await req.formData();
  const isCompletedProfile = formData.get('isCompletedProfile') as boolean | null;
  const firstName = formData.get('first_name') as string;
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
  const playingcountries = formData.get('playingcountries') as string;
  const height = formData.get('height') as string;
  const weight = formData.get('weight') as string;
  const graduation = formData.get('graduation') as string;
  const imageFile = formData.get('image') as string | null;
  const school_name = formData.get('school_name') as string | null;
  const gpa = formData.get('gpa') as string | '0.00';
  const facebook = formData.get('facebook') as string | null;
  const instagram = formData.get('instagram') as string | null;
  const linkedin = formData.get('linkedin') as string | null;
  const youtube = formData.get('youtube') as string | null;
  const website = formData.get('website') as string | null;
  const xlink = formData.get('xlink') as string | null;
  const age_group = formData.get('age_group') as string | null;
  const birth_year = formData.get('team_year') as string | null;
  const playerIDAsNumber = parseInt(playerID, 10);
  // const isCompletedProfile = formData.get('isCompletedProfile') as boolean | null;
  try {
    const timestamp = Date.now();
    const slug = `${firstName.trim().toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;

    const updatedUser = await db
      .update(users)
      .set({
        first_name: firstName || null,
        last_name: lastName || null,
        grade_level: gradeLevel || null,
        location: location || null,
        birthday: birthday || null,
        gender: gender || null,
        sport: sport || null,
        team: team || null,
        position: position || null,
        number: number || null,
        country: country || null,
        state: state || null,
        city: city || null,
        bio: bio || null,
        jersey: jersey || null,
        league: league || null,
        countrycode: countrycode || null,
        image: imageFile,
        slug: slug,
        playingcountries: playingcountries || null,
        height: height || null,
        weight: weight || null,
        graduation: graduation || null,
        school_name: school_name || null,
        facebook: facebook || null,
        instagram: instagram || null,
        linkedin: linkedin || null,
        youtube: youtube || null,
        xlink: xlink || null,
        website: website || null,
        age_group: age_group || null,
        birth_year: birth_year || null,
        gpa: gpa || '0.00',
        status: "Active",
        isCompletedProfile: isCompletedProfile
      })
      .where(eq(users.id, playerIDAsNumber))

      .execute();

    const user = await db
      .select({
        firstName: users.first_name,
        lastName: users.last_name,
        email: users.email // Add email to the selection
      })
      .from(users)
      .where(eq(users.id, playerIDAsNumber))
      .execute()
      .then(result => result[0]);
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;
    const emailResult = await sendEmail({
      to: user.email,
      subject: `D1 NOTES Registration Completed for ${firstName}`,
      text: `D1 NOTES Registration Completed for ${firstName}`,
      html: `<p>Dear ${firstName}! Congratulations, your D1 Notes profile has been completed and you are now ready to take advantage of all D1 Notes has to offer! <a href="${baseUrl}/login" style="font-weight: bold; color: blue">Click here</a>  to get started!
        </p><p className="mt-10">Regards,<br>
  D1 Notes Team</p>`,
    });


    return NextResponse.json({ message: "Profile Completed", image: imageFile }, { status: 200 });
  }
  catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });

  }

}


export async function GET(req: NextRequest) {
  const logError = debug('app:error');
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ message: 'No token provided.' }, { status: 401 });
  }
  const decoded = jwt.verify(token, SECRET_KEY); // No type assertion here initially

  // Type guard to check if decoded is JwtPayload
  if (typeof decoded === 'string') {
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
  }

  // Safely get userId from decoded, defaulting to null if not found
  const userId = decoded.id || null;


  return NextResponse.json({ userId }, { status: 200 });
}

