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
            name:enterprises.contactPerson,
            email:enterprises.email,
            phone:enterprises.mobileNumber,
            id:enterprises.id,
            role_id:enterprises.role_id,
            countryCodes:enterprises.countryCodes,
            buy_evaluation:enterprises.buy_evaluation,
            view_evaluation:enterprises.view_evaluation,
            
        }
    ).from(enterprises).where(eq(enterprises.parent_id,Number(club_id)));

    const rolesList=await db.select().from(roles).where(eq(roles.club_id, Number(club_id)));
return NextResponse.json({result,rolesList}, { status: 200 });

}

export async function POST(req: NextRequest) {
  const body=await req.json();
  const enterprise_id=body.enterprise_id;
  const enterproseQuery=await db.select().from(enterprises).where(eq(enterprises.id,Number(body.enterprise_id)));

 
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
    countryCodes: body.countryCodes,
    role_id: body.role_id,
    parent_id: body.enterprise_id,
    mobileNumber: body.phone,
    buy_evaluation: body.acceptEvaluations,
    view_evaluation: body.buyLicenses,
    password:hashedPassword,
    
  });

  const emailResult = await sendEmail({
    to: body.email,
    subject: "D1 NOTES Sub Administrator Registration",
    text: "D1 NOTES Sub Administrator Registration",
    html: `<p>Dear ${body.name}! You have been added as a Sub Administrator by ${enterproseQuery[0].organizationName}. </p><p>Please login here https://d1notesupdated-five.vercel.app.</p><p>Here are your login details as an Organization:</p><p>Email: ${body.email}</p><p>Password: ${password}</p><p>Please change your password upon login</p><br><p>Regards,
<br>
D1 Notes Team</p>`,
  });


  return NextResponse.json({body}, { status: 200 });
}
catch(err:any){
  console.error("Error:", err); // Log the full error
  return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
}

}




export async function PUT(req: NextRequest) {
  const body = await req.json();
  const enterprise_id = body.enterprise_id;
  const enterproseQuery = await db.select().from(enterprises).where(eq(enterprises.id, body.enterprise_id));
 

  try {
    // Perform the update operation
    await db.update(enterprises)
      .set({
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
        buy_evaluation: body.acceptEvaluations,
        view_evaluation: body.buyLicenses,
         
      })
      .where(eq(enterprises.id, body.id)).execute();  // Ensure you're updating the correct record based on the enterprise_id
 

    return NextResponse.json({ body }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ err }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
    const id = url.searchParams.get('id') || '';

  try {
    const deletedRole = await db.delete(enterprises).where(eq(enterprises.id, parseInt(id))).returning();

    if (deletedRole) {
      return NextResponse.json({ message: 'Sub Admin deleted successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Sub Admin not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting Sub Admin:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
