import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../../lib/db';
import {enterprises,roles} from '../../../../../lib/schema';

import { eq, and, gt,desc,or } from 'drizzle-orm';
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
    const body=await req.json();
    const password = generateRandomPassword(10);
    const hashedPassword = await hash(password, 10);
    try {
        const result = await db
          .update(enterprises)
          .set({
            password: hashedPassword,
            
          })
          .where(eq(enterprises.id,body.id));
    
        const emailResult = await sendEmail({
            to: body.email,
            subject: "D1 NOTES DOC Password Reset",
            text: "D1 NOTES DOC Password Reset",
            html: `<p>Dear ${body.name}! Your  password has been reset. </p><p>Please use the following password to login.</p><p>Password: ${password}</p><p>Please change your password upon login</p>`,
          });

          return NextResponse.json({message:"Password reset and send successfully on email."}, { status: 200 });
      } catch (error) {
        return NextResponse.json({message:error}, { status: 500 });
      }

  }