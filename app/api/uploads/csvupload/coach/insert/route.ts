import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../../../lib/db';
import { eq } from "drizzle-orm";
import { coaches,teamPlayers } from '../../../../../../lib/schema';
import { number } from 'zod';
import { sendEmail } from '@/lib/helpers';

 const generateRandomPassword = (length = 12) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";
    let password = "";
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  };

  export async function POST(req: NextRequest) {
    try {
      const body = await req.json();  
      const payload = body.csvData;
      const coach_id = body.coach_id;
      const enterprise_id = body.enterprise_id;
      const team_id = body.team_id;
  
      if (!Array.isArray(payload)) {
        return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
      }
  
      // Generate hashed passwords and prepare emails
      const insertData = await Promise.all(payload.map(async (item) => {
        const password = generateRandomPassword(10);
        const hashedPassword = await hash(password, 10);
        const timestamp = Date.now();
        const slug = `${item.FirstName.trim().toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
        
  
        const emailResult = await sendEmail({
            to: item.Email,
            subject: "D1 NOTES Coach Registration",
            text: "D1 NOTES Coach Registration",
            html: `<p>Dear Coach! Your account creation as a Coach on D1 NOTES has been started. </p><p>Please complete your profile in the next step to enjoy the evaluation from the best coaches.</p>\n\nHere are your login details:\nEmail: ${item.Email}\nPassword: ${password}\n\nPlease change your password upon login.\n\nBest Regards,\nYour Team`,
          });
  
        return {
          firstName: item.FirstName,
          lastName: item.LastName,
          email: item.Email,
          countrycode: item.CountryCode,
          phoneNumber: item.PhoneNumber,
          enterprise_id: enterprise_id,
          slug: slug,
          gender: null,
          location: null,
          sport: null,
          clubName: null,
          qualifications: null,
          image: null,
          rating: null,
          certificate: null,
          password: hashedPassword,
          expectedCharge: item.EvaluationCharges,
        };
      }));
  
 
      const insertedPlayers = await db.insert(coaches).values(insertData);
      return NextResponse.json({ success: true, message: 'Players inserted and emails sent successfully' });
    } catch (error) {
      console.error('Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
