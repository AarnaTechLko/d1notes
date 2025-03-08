import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import { eq, and, inArray } from "drizzle-orm";
import { coaches, teamPlayers, licenses, teamCoaches, users, invitations } from '../../../lib/schema';
import { number } from 'zod';

import { encryptData, sendEmail } from '@/lib/helpers';

interface RequestBody {
    emails: string[];

    usertype: string;
    registrationType: string;
    userId: string;
    userName: string;
    teamId: string;
}


export async function POST(req: NextRequest) {
    try {
        const body: RequestBody & { csvData: any[]; coach_id: string; enterprise_id: string, teamId: string, registrationType: string, usertype: string } = await req.json();

        const { usertype, registrationType, userName, teamId, csvData, enterprise_id } = body;

        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const host = req.headers.get('host');
        const baseUrl = `${protocol}://${host}`;
        let inviteUrl: string;

        if (!Array.isArray(csvData)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        const emailList = csvData.map((item) => item.Email);
       
        const existingCoaches = await db
        .select()
        .from(invitations)
        .where(inArray(invitations.email, emailList));
       


        const existingEmails = existingCoaches.map((coach) => coach.email);
        const duplicates = csvData.filter((item) => existingEmails.includes(item.Email));
        const newRecords = csvData.filter((item) => !existingEmails.includes(item.Email));
        
        await Promise.all(newRecords.map(async (item) => {
            const singleEmail = item.Email; // Ensure it matches the key in csvData

            const payload = JSON.stringify({ enterprise_id, singleEmail, teamId, registrationType });
            const encryptedString = encryptData(payload);
            let urltype = 'register';

            if (registrationType === 'player') {
                const existanceCheck = await db.select().from(users).where(eq(users.email, singleEmail));
                if (existanceCheck.length > 0) urltype = 'login';
            } else {
                const existanceCheck = await db.select().from(coaches).where(eq(coaches.email, singleEmail));
                if (existanceCheck.length > 0) urltype = 'login';
                else urltype = 'coach/signup';
            }

            // Move inside loop
            const inviteUrl = `${baseUrl}/${urltype}?uid=${encodeURIComponent(encryptedString)}&by=${usertype}`;

            console.log(`Processing email: ${singleEmail}, inviteUrl: ${inviteUrl}`); // Debugging

            await db.insert(invitations).values({
                sender_type: usertype,
                enterprise_id: Number(enterprise_id),
                team_id: Number(teamId),
                email: singleEmail,
                invitation_for: registrationType,
                invitation_link: inviteUrl,
                status: 'Sent'
            }).catch(err => console.error(`Insert Error for ${singleEmail}:`, err));

            await sendEmail({
                to: singleEmail,
                subject: `D1 NOTES Registration Invitation for ${registrationType} registration`,
                text: `D1 NOTES Registration Invitation for ${registrationType} registration`,
                html: `<div style="font-family: 'Arial', sans-serif; padding: 20px; background-color: #f9fafb; border-radius: 8px; max-width: 600px; margin: 0 auto;">
                    Dear ${registrationType}! You have been invited by ${userName} to take advantage of D1 Note's Enterprises / white label service.  
                    <a href="${inviteUrl}" style="font-weight: bold; color: blue;">Click Here</a> 
                    to login or create a ${registrationType} profile and your access to the Organization or Team will automatically be activated. 
                    <p className="mt-5">Regards, <br/> D1 Notes</p>
                </div>`
            }).catch(err => console.error(`Email Sending Error for ${singleEmail}:`, err));
        }));


        return NextResponse.json({ message: 'Invitations sent successfully' }, { status: 200 });

    } catch (error: any) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
