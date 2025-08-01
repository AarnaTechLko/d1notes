import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { block_ips, enterprises, ip_logs, otps } from '../../../../lib/schema';
import debug from 'debug';
import { eq, and, gt, or } from 'drizzle-orm';
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
    return data; // contains ip, city, region, country, etc.
  } catch (error) {
    console.error("IPINFO fetch error:", error);
    return null;
  }
}
export async function POST(req: NextRequest) {

  const formData = await req.formData();
  const organizationName = formData.get('organizationName') as string;
  const contactPerson = formData.get('contactPerson') as string;
  const owner_name = formData.get('owner_name') as string;
  const em = formData.get('email') as string;
  const emai = formData.get("email");
  const email = typeof em === "string" ? em.toLowerCase() : "";
  const mobileNumber = formData.get('mobileNumber') as string;
  const address = formData.get('address') as string;
  const country = formData.get('country') as string;
  const countryCodes = formData.get('countryCodes') as string;
  const state = formData.get('state') as string;
  const city = formData.get('city') as string;
  const logo = formData.get('logo') as string;
  const affiliationDocs = formData.get('affiliationDocs') as string;
  const password = formData.get('password') as string;
  const description = formData.get('description') as string;
  const facebook = formData.get('facebook') as string;
  const instagram = formData.get('instagram') as string;
  const linkedin = formData.get('linkedin') as string;
  const xlink = formData.get('xlink') as string;
  const youtube = formData.get('youtube') as string;

  const emailCkeck = await db.select().from(enterprises).where(eq(enterprises.email, email));
  if (emailCkeck.length > 0) {
    return NextResponse.json({ message: "Email already exists" }, { status: 500 });
  }
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

  try {
    // Hash the password before storing it in the database
    const hashedPassword = await hash(password, 10);
    const timestamp = Date.now();
    const slug = `${organizationName.replace(/\s+/g, '-')}${timestamp}`;


    const imageFile = await db.insert(enterprises).values({
      organizationName,
      contactPerson,
      email,
      mobileNumber,
      countryCodes,
      address,
      country,
      state,
      city,
      logo,
      affiliationDocs,
      owner_name,
      description,
      password: hashedPassword,
      slug, // Adding the hashed password
      createdAt: new Date(),
      facebook,
      instagram,
      linkedin,
      xlink,
      youtube
    }).returning({ insertedId: enterprises.id });

    const insertedId = imageFile[0]?.insertedId;

    await db.insert(ip_logs).values({
      userId: insertedId,
      ip_address: datag.ip?.toString() || '',
      type: 'enterprise',
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
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    const emailResult = await sendEmail({
      to: email || '',
      subject: `D1 NOTES Registration Completed for ${organizationName}`,
      text: `D1 NOTES Registration Completed for ${organizationName}`,
      html: `<p>Dear ${organizationName}! Congratulations, your D1 Notes profile has been completed and you are now ready to take advantage of all D1 Notes has to offer! <a href="${baseUrl}/login" style="font-weight: bold; color: blue">Click here</a>  to get started!
            </p><p className="mt-10">Regards,<br>
        D1 Notes Team</p>`,
    });




    return NextResponse.json({ message: "Profile Completed", image: imageFile }, { status: 200 });
  }
  catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    // If it's not an Error, you can handle it differently (for example, return a generic message)
    return NextResponse.json({ message: 'An unknown error occurred.' }, { status: 500 });
  }
}
