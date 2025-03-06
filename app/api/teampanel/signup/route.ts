import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { enterprises, otps, teams } from '../../../../lib/schema';
import debug from 'debug';
import { eq, and, gt } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';
 
import { SECRET_KEY } from '@/lib/constants';
import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken';
import next from 'next';

export async function POST(req: NextRequest) {
    
    const formData = await req.formData();
    const team_name = formData.get('organizationName') as string;
    const contactPerson = formData.get('contactPerson') as string;
    const manager_name = formData.get('owner_name') as string;
    const manager_email = formData.get('email') as string;
    const manager_phone = formData.get('mobileNumber') as string;
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

    const emailCkeck=await db.select().from(teams).where(eq(teams.manager_email,manager_email));
    if(emailCkeck.length>0){
        return NextResponse.json({ message: "Email already exists" }, { status: 500 });
    }

    try {
        // Hash the password before storing it in the database
        const hashedPassword = await hash(password, 10);
        const timestamp = Date.now(); 
        const slug = `${team_name.replace(/\s+/g, '-')}${timestamp}`;
       
      
        const imageFile = await db.insert(teams).values({
            team_name,
            created_by:'Team',
            manager_name,
            manager_email,
            manager_phone,
            countryCodes,
            address,
            country,
            state,
            city,
            logo,
            description,
            status:'Active',
            facebook,
            instagram,
            linkedin,
            xlink,
            youtube,
            visibility:'on',
            password: hashedPassword, 
            slug, // Adding the hashed password
            createdAt: new Date(),
        }).returning({ insertedId: enterprises.id });


        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const host = req.headers.get('host');
        const baseUrl = `${protocol}://${host}`;

        const emailResult = await sendEmail({
            to:  manager_email || '',
            subject: `D1 NOTES Registration Completed for ${team_name}`,
            text: `D1 NOTES Registration Completed for ${team_name}`,
            html: `<p>Dear ${team_name}! Congratulations, your D1 Notes profile has been completed and you are now ready to take advantage of all D1 Notes has to offer! <a href="${baseUrl}/login" style="font-weight: bold; color: blue; ">Click here</a>  to get started!
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
