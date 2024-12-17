import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../../lib/db';
import { eq } from "drizzle-orm";
import { users } from '../../../../../lib/schema';
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
  
      if (!Array.isArray(payload)) {
        return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
      }
  
      // Generate hashed passwords and prepare emails
      const insertData = await Promise.all(payload.map(async (item) => {
        const password = generateRandomPassword(10);
        const hashedPassword = await hash(password, 10);
  
        
  
        const emailResult = await sendEmail({
            to: item.Email,
            subject: "D1 NOTES Player Registration",
            text: "D1 NOTES Player Registration",
            html: `<p>Dear Player! Your account creation as a Player on D1 NOTES has been started. </p><p>Please complete your profile in the next step to enjoy the evaluation from the best coaches.</p>\n\nHere are your login details:\nEmail: ${item.Email}\nPassword: ${password}\n\nPlease change your password upon login.\n\nBest Regards,\nYour Team`,
          });
  
        return {
          first_name: item.FirstName,
          last_name: item.LastName,
          email: item.Email,
          countrycode: item.CountryCode,
          number: item.PhoneNumber,
          coach_id: coach_id,
          enterprise_id: enterprise_id,
          sport: null,
          team: null,
          position: null,
          country: null,
          state: null,
          city: null,
          league: null,
          bio: null,
          birthday: null,
          password: hashedPassword,
        };
      }));
  
      // Insert data into the database
      await db.insert(users).values(insertData);
  
      return NextResponse.json({ success: true, message: 'Players inserted and emails sent successfully' });
    } catch (error) {
      console.error('Error:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
