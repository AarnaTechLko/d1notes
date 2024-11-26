import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import { licenses, coaches, invitations } from '../../../lib/schema';
import { encryptData, sendEmail } from '@/lib/helpers';
import { eq, and, gt, desc, count } from 'drizzle-orm';

interface RequestBody {
  emails: string[];
  mobiles: string[];
  usertype: string;
  registrationType: string;
  userId: string;
  userName: string;
}

export async function POST(req: NextRequest) {
  const { emails, mobiles, usertype, registrationType, userId, userName }: RequestBody = await req.json();
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  const host = req.headers.get('host');
  const baseUrl = `${protocol}://${host}`;
  const allMobiles = mobiles.join(',');
  let inviteUrl: string;
  // Use a for...of loop to handle the asynchronous email sending
  for (let index = 0; index < emails.length; index++) {
        const singleEmail = emails[index];
       
        const payload = JSON.stringify({ userId, singleEmail });
        const encryptedString = encryptData(payload);
       
        if(registrationType==='player')
          {
              inviteUrl=`${baseUrl}/register?uid=${encodeURIComponent(encryptedString)}&by=${usertype}`;
          }
          else{
             inviteUrl=`${baseUrl}/coach/signup?uid=${encodeURIComponent(encryptedString)}&by=${usertype}`;
          }

          await db.insert(invitations).values({ 
            sender_type:usertype,
            sender_id:Number(userId),
            email:singleEmail,
            invitation_for:registrationType,
            mobile:allMobiles,
            invitation_link:inviteUrl,
        
        });

        const emailResult = await sendEmail({
          to: singleEmail,
        
          subject: `D1 NOTES Registration Invitation for ${registrationType} registration`,
          text: `D1 NOTES Registration Invitation for ${registrationType} registration`,
          html: `
            <div style="font-family: 'Arial', sans-serif; padding: 20px; background-color: #f9fafb; border-radius: 8px; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #ffffff; padding: 20px; border-radius: 8px;">
                <h1 style="font-size: 24px; font-weight: bold; color: #1f2937; text-align: center;">D1 NOTES Registration Invitation</h1>
                
                <p style="font-size: 16px; color: #4b5563; margin-bottom: 20px;">${userName} has sent you an invitation to join D1 NOTES as a ${registrationType}.</p>
                
                <p style="font-size: 16px; color: #4b5563; margin-bottom: 20px;">Click on the link below to start your journey with D1 NOTES.</p>
        
                <div style="text-align: center; margin-bottom: 20px;">
                  <a href="${inviteUrl}" 
                     style="font-size: 16px; font-weight: bold; color: #ffffff; background-color: #2563eb; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
                    Click Here
                  </a>
                </div>
        
                <p style="font-size: 14px; color: #6b7280; text-align: center;">If you have any questions, feel free to contact us.</p>
              </div>
            </div>
          `
        });
  }

  return NextResponse.json(
      { message: "Invitation(s) sent successfully." },
      { status: 200 }
  );
}
