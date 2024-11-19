import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import {packages} from '../../../lib/schema';

import { eq, and, gt } from 'drizzle-orm';

export async function POST(req: NextRequest) {

const {packageName, amount, details, noOfLicnese}= await req.json();
const status='Active';
const imageFile = await db.insert(packages).values({
    packageName,
    amount,
    details,
    noOfLicnese ,
    status,// Adding the hashed password
    createdAt: new Date(),
}).returning({ insertedId: packages.id });

return NextResponse.json({ message: "Package Created successfully." }, { status: 200 });

}

export async function GET(req: NextRequest) {

    try {
        // Fetch data from the 'users' table
        const allpackages = await db.select().from(packages);
        return NextResponse.json({ packages:allpackages}, { status: 200 });
        
      } catch (error) {
        console.error("Error fetching packages:", error);
        return NextResponse.json({ error: "Error fetching packages" });
      }

}