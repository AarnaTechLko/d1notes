// app/api/evaluation/save/route.ts
import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db'; // Import your Drizzle ORM database instance
import { chats, coachaccount, coachearnings, coaches, evaluationResults, licenses, messages, playerEvaluation, users } from '@/lib/schema';
import { eq, sum, and } from 'drizzle-orm';
import { NextRequest } from 'next/server'; // Import NextRequest
import { sendEmail } from '@/lib/helpers';

export async function POST(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const status = url.searchParams.get('status');
    const data = await req.json();
    const {
      evaluationId,
      playerId,
      coachId,
      technicalScores,
      tacticalScores,
      physicalScores,
      technicalRemarks,
      tacticalRemarks,
      physicalRemarks,
      finalRemarks,
      document,
      organizationalRemarks,
      distributionRemarks,
      distributionScores,
      organizationScores,
      sport,
      position,
      thingsToWork
    } = data;

    const evaluationQuery = await db.select().from(playerEvaluation).where(eq(playerEvaluation.id, evaluationId));
    const existingData = await db.select().from(evaluationResults).where(eq(evaluationResults.evaluationId, evaluationId)).limit(1)  // Limit to 1 record
      .execute();


    if (existingData.length > 0) {
      const insertedData = await db.update(evaluationResults).set({
        evaluationId: evaluationId,
        playerId: playerId,
        coachId: coachId,
        technicalScores: technicalScores,
        tacticalScores: tacticalScores,
        physicalScores: physicalScores,
        technicalRemarks: technicalRemarks,
        tacticalRemarks: tacticalRemarks,
        physicalRemarks: physicalRemarks,
        finalRemarks: finalRemarks,
        document: document,
        organizationScores: organizationScores,
        distributionScores: distributionScores,
        organizationalRemarks: organizationalRemarks,
        distributionRemarks: distributionRemarks,
        thingsToWork: thingsToWork
      }).returning();
    }
    else {
      const insertedData = await db.insert(evaluationResults).values({
        evaluationId: evaluationId,
        playerId: playerId,
        coachId: coachId,
        technicalScores: technicalScores,
        tacticalScores: tacticalScores,
        physicalScores: physicalScores,
        technicalRemarks: technicalRemarks,
        tacticalRemarks: tacticalRemarks,
        physicalRemarks: physicalRemarks,
        finalRemarks: finalRemarks,
        document: document,
        club_id: evaluationQuery[0].club_id,
        organizationScores: organizationScores,
        distributionScores: distributionScores,
        organizationalRemarks: organizationalRemarks,
        distributionRemarks: distributionRemarks,
        sport:sport,
        position:position,
        thingsToWork: thingsToWork
      }).returning();
    }


    if (status) {

      const updateEvaluation = await db
        .update(playerEvaluation)
        .set({
          status: 4
        })
        .where(eq(playerEvaluation.id, evaluationId))
        .returning();



    }
    else {
      const updateEvaluation = await db
        .update(playerEvaluation)
        .set({
          status: 2
        })
        .where(eq(playerEvaluation.id, evaluationId))
        .returning();

      await db
        .update(coachearnings)
        .set({
          status: 'Completed'
        })
        .where(eq(coachearnings.evaluation_id, evaluationId))
        .returning();

      const freelicense = await db.select().from(licenses).where(
        and(
          eq(licenses.status, 'Free'),
          eq(licenses.enterprise_id, Number(evaluationQuery[0].club_id)),

        )).limit(1);

      if (freelicense.length > 0) {
        const updateLicnes = await db.update(licenses)
          .set({
            status: 'Consumed',
            used_by: coachId,
            used_for: 'Coach',
          })
          .where(eq(licenses.id, freelicense[0].id));
      }

      let chatFriend: any = {
        playerId: playerId,
        coachId: coachId,
        club_id: 0
      };
      const insertChatfriend = await db.insert(chats).values(chatFriend).returning();
      const coachData = await db.select().from(coaches).where(eq(coaches.id, coachId));
      const playerData = await db.select().from(users).where(eq(users.id, playerId));

let subject;
let mailmessage;
let coachsubject;
let coachmailmessage;

const protocol = req.headers.get('x-forwarded-proto') || 'http';
const host = req.headers.get('host');
const baseUrl = `${protocol}://${host}`;
      const message = "Your Evaluation has been submitted by me. Please check.";
       
      subject=`D1 NOTES Evaluation Request Completed by ${coachData[0].firstName}`;
    
      mailmessage=`Dear ${playerData[0].first_name}! Your evaluation was completed by ${coachData[0].firstName}. <a href="${baseUrl}/login" style="font-weight: bold; color: blue; ">Login</a> to your player account and view your Dashboard to access the evaluation. Feel free to follow up with any Messages or Rating or Testimonial. Let’s go! <p  className="mt-10">Regards<br>D1 Notes Team</p>`

      coachsubject=`D1 NOTES Evaluation Request Completed by ${coachData[0].firstName}`;
    
      coachmailmessage=`Dear ${coachData[0].firstName}! Your completed evaluation was sent to  ${playerData[0].first_name}. <a href="${baseUrl}/login" style="font-weight: bold; color: blue;">Login</a> to your coach account to check on your Earnings History and any Messages or Rating or Testimonial! <p  className="mt-10">Regards<br>D1 Notes Team</p>`



      let userValues: any = {
        senderId: coachId,
        chatId: insertChatfriend[0].id,
        message: message,
        club_id: 0
      };

      const insertedUser = await db.insert(messages).values(userValues).returning();


      const emailResultPlayer = await sendEmail({
        to: playerData[0].email,
        subject:subject,
        text: subject,
        html: mailmessage || '',
      });

      const emailResultCoach = await sendEmail({
        to: coachData[0].email || '',
        subject:coachsubject,
        text:coachsubject,
        html: coachmailmessage || '',
      });


      

    }




    let totalAmount;
    const payment = await db.select().from(coachearnings).where(eq(coachearnings.evaluation_id, evaluationId)).execute();
    if (payment.length >=1) {
      ///return NextResponse.json({ message: 'No payment record found for this evaluationId' }, { status: 400 });
      const totalBalance = await db
      .select({ value: sum(coachaccount.amount) })
      .from(coachaccount)
      .where(eq(coachaccount.coach_id, coachId))
      .execute();

    const totalBalanceValue = Number(totalBalance[0]?.value) || 0;
    const commisionAmount = Number(payment[0]?.commision_amount) || 0;
    totalAmount = totalBalanceValue + commisionAmount;

    await db.update(coachaccount)
      .set({ amount: totalAmount.toString() })
      .where(eq(coachaccount.coach_id, coachId));

    const updatecoachearnings = await db
      .update(coachearnings)
      .set({
        status: 'Released'
      })
      .where(eq(coachearnings.evaluation_id, evaluationId))
      .returning();
    }

    


    return NextResponse.json({ success: "success" });
  } catch (error) {
    console.error('Error saving evaluation results:', error);
    return NextResponse.json({ success: false, error: "Error in inserting data" }, { status: 500 });
  }
}
