import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import { licenses, coaches, invitations, users } from '../../../lib/schema';
import { encryptData, sendEmail } from '@/lib/helpers';
import { eq, and, gt, desc, count } from 'drizzle-orm';

interface RequestBody {
  emails: string[];
  mobiles: string[];
  usertype: string;
  registrationType: string;
  userId: string;
  enterpriseId: string;
  teamId: string;
}

export async function POST(req: NextRequest) {
  const { emails,enterpriseId, usertype, registrationType, teamId }: RequestBody = await req.json();
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  const host = req.headers.get('host');
  const baseUrl = `${protocol}://${host}`;
   
  let inviteUrl: string;
  // Use a for...of loop to handle the asynchronous email sending
  for (let index = 0; index < emails.length; index++) {
    const singleEmail = emails[index];

    const payload = JSON.stringify({ enterprise_id:enterpriseId, singleEmail, teamId, registrationType });
    const encryptedString = encryptData(payload);
    let urltype;
    if (registrationType === 'player') {
      const existanceCheck = await db.select().from(users).where(eq(users.email, singleEmail));
      if (existanceCheck.length > 0) {
        urltype = 'login'
      }
      else {
        urltype = 'register'
      }
      inviteUrl = `${baseUrl}/${urltype}?uid=${encodeURIComponent(encryptedString)}&by=${usertype}`;
    }
    else {
      const existanceCheck = await db.select().from(coaches).where(eq(coaches.email, singleEmail));
      if (existanceCheck.length > 0) {
        urltype = 'login'
      }
      else {
        urltype = 'coach/signup'
      }

      inviteUrl = `${baseUrl}/${urltype}?uid=${encodeURIComponent(encryptedString)}&by=${usertype}`;
    }

    await db.insert(invitations).values({
      sender_type: usertype,
      enterprise_id: Number(enterpriseId),
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
      html: `<div style="font-family: 'Arial', sans-serif; padding: 20px; background-color: #f9fafb; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          Dear ${registrationType}! You have been invited  to take advantage of D1 Note's Enterprises / white label service.  
          <a href="${inviteUrl}" style="font-weight: bold; color: blue;">Click Here</a> 
          to login or create a ${registrationType} profile and your access to the Organization or Team will automatically be activated. 
          <p className="mt-5">Regards, <br/> D1 Notes</p>
      </div>`
  }).catch(err => console.error(`Email Sending Error for ${singleEmail}:`, err));
 
  }

  return NextResponse.json(
    { message: "Invitation(s) sent successfully." },
    { status: 200 }
  );
}
