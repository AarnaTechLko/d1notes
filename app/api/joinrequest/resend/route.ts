import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust the path based on your setup
import { coaches, users, enterprises, joinRequest, teams, invitations } from "@/lib/schema";
import { eq, sql, and } from "drizzle-orm";
import { sendEmail } from "@/lib/helpers";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const invitationId = searchParams.get('invitationId');

   if(!invitationId)
   {
    return NextResponse.json(
        { error: "Invitation ID not found." },
        { status: 500 }
      );
   }

  const invitation = await db.select().from(invitations).where(eq(invitations.id, Number(invitationId))).execute();
  if(invitation.length>0)
  {
    const emailResult = await sendEmail({
        to: invitation[0].email || '',
  
        subject: `D1 NOTES Registration Invitation for ${invitation[0].invitation_for} registration`,
        text: `D1 NOTES Registration Invitation for ${invitation[0].invitation_for} registration`,
        html: `
              <div style="font-family: 'Arial', sans-serif; padding: 20px; background-color: #f9fafb; border-radius: 8px; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #ffffff; padding: 20px; border-radius: 8px;">
                  <h1 style="font-size: 24px; font-weight: bold; color: #1f2937; text-align: center;">D1 NOTES Registration Invitation</h1>
                  
                  <p style="font-size: 16px; color: #4b5563; margin-bottom: 20px;">Coach  has resend you an invitation to join D1 NOTES as a ${invitation[0].invitation_for}.</p>
                  
                  <p style="font-size: 16px; color: #4b5563; margin-bottom: 20px;">Click on the link below to start your journey with D1 NOTES.</p>
          
                  <div style="text-align: center; margin-bottom: 20px;">
                    <a href="${invitation[0].invitation_link}" 
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
    { message:'Invitation has been resent.' },
    { status: 200 }
  );

  
}

