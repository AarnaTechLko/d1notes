import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import {enterprises,roles} from '../../../../lib/schema';

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

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const club_id = url.searchParams.get('club_id') || '';
    const result = await db.select(
        {
            role_name:roles.role_name,
            name:enterprises.contactPerson,
            email:enterprises.email,
            phone:enterprises.mobileNumber,
            id:enterprises.id,
            
        }
    ).from(enterprises).rightJoin(roles, eq(enterprises.role_id, roles.id)).where(eq(enterprises.parent_id,Number(club_id)))
return NextResponse.json(result, { status: 200 });

}

export async function POST(req: NextRequest) {
  const body=await req.json();
  const enterprise_id=body.enterprise_id;
  const enterproseQuery=await db.select().from(enterprises).where(eq(enterprises.id,body.enterprise_id));
  const password = generateRandomPassword(10);
  const hashedPassword = await hash(password, 10);
  try{
  await db.insert(enterprises).values({
    organizationName: enterproseQuery[0].organizationName,
    owner_name: enterproseQuery[0].owner_name,
    address: enterproseQuery[0].address,
    country: enterproseQuery[0].country,
    state: enterproseQuery[0].state,
    city: enterproseQuery[0].city,
    logo: enterproseQuery[0].logo,
    slug: enterproseQuery[0].slug,
    contactPerson: body.name,
    email: body.email,
    role_id: body.role_id,
    parent_id: body.enterprise_id,
    mobileNumber: body.phone,
    password:hashedPassword,
    
  });

  const emailResult = await sendEmail({
    to: body.email,
    subject: "D1 NOTES DOC Registration",
    text: "D1 NOTES DOC Registration",
    html: `<p>Dear ${body.name}! Your  account creation as a DOC on D1 NOTES has been completed. </p><p>Please complete your profile in the next step to enjoy the evaluation from the best coaches.</p><p>Here are your login details:</p><p>Email: ${body.email}</p><p>Password: ${password}</p><p>Please change your password upon login</p>`,
  });


  return NextResponse.json({body}, { status: 200 });
}
catch(err){
  return NextResponse.json({err}, { status: 500 });
}
}
