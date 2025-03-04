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
        // Read body only once
        const body: RequestBody & { csvData: any[]; coach_id: string; enterprise_id: string } = await req.json();

        const { emails, usertype, registrationType, userName, teamId, csvData, coach_id, enterprise_id } = body;
        const userId=enterprise_id;
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const host = req.headers.get('host');
        const baseUrl = `${protocol}://${host}`;
        let inviteUrl: string;

        if (!Array.isArray(csvData)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        const emailList = csvData.map((item) => item.Email);

        // Check for existing emails
        const existingCoaches = await db
            .select()
            .from(coaches)
            .where(inArray(coaches.email, emailList));

        const existingEmails = existingCoaches.map((coach) => coach.email);
        const duplicates = csvData.filter((item) => existingEmails.includes(item.Email));
        const newRecords = csvData.filter((item) => !existingEmails.includes(item.Email));

        await Promise.all(newRecords.map(async (item) => {
            const singleEmail = item.Email; // Make sure it matches the key in csvData

            const payload = JSON.stringify({ userId, singleEmail, teamId, registrationType });
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

            inviteUrl = `${baseUrl}/${urltype}?uid=${encodeURIComponent(encryptedString)}&by=${usertype}`;

            await db.insert(invitations).values({
                sender_type: usertype,
                sender_id: Number(userId),
                email: singleEmail,
                invitation_for: registrationType,
                invitation_link: inviteUrl,
                team_id: Number(teamId),
                status: 'Sent'
            });

            await sendEmail({
                to: singleEmail,
                subject: `D1 NOTES Registration Invitation for ${registrationType} registration`,
                text: `D1 NOTES Registration Invitation for ${registrationType} registration`,
                html: `
                <div style="font-family: 'Arial', sans-serif; padding: 20px; background-color: #f9fafb; border-radius: 8px; max-width: 600px; margin: 0 auto;">
            Dear ${registrationType}! You have been invited by ${userName} to take advantage of D1 Note's Enterprises / white label service.  <a href="${inviteUrl}" 
                     style="font-weight: bold; color: blue;">
                    Click Here
                  </a> to login or create a  ${registrationType} profile and your access to the Organization or Team will automatically be activated. 

              <p className="mt-5">Regards, <br/>
D1 Notes</p>
            </div>
                `
            });
        }));

        return NextResponse.json({ message: 'Invitations sent successfully' }, { status: 200 });

    } catch (error: any) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
