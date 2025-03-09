import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import {enterprises,roles, teams} from '../../../../lib/schema';

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
            name:teams.manager_name,
            email:teams.manager_email,
            phone:teams.manager_phone,
            id:teams.id,
           
            countryCodes:teams.countryCodes,
            
        }
    ).from(teams).where(eq(teams.parent_id,Number(club_id)));

   
return NextResponse.json({result}, { status: 200 });

}

export async function POST(req: NextRequest) {
  const body=await req.json();
  const team_id=body.team_id;
  const teamsQuery=await db.select().from(teams).where(eq(teams.id,Number(body.team_id)));

 
  const password = generateRandomPassword(10);
  const hashedPassword = await hash(password, 10);
  
  try{
  await db.insert(teams).values({
    team_name: teamsQuery[0].team_name,
    created_by: "Team",  
    description: teamsQuery[0].description,
    slug	: teamsQuery[0].slug	,
    manager_name: body.name,
    logo: teamsQuery[0].logo,
    manager_email: body.email,
    address:  teamsQuery[0].address,
    age_group:  teamsQuery[0].age_group,
    visibility:  teamsQuery[0].visibility,
    
    countryCodes: body.countryCodes,
    parent_id: body.team_id,
    manager_phone: body.phone,
    buy_evaluation: body.acceptEvaluations,
    view_evaluation: body.buyLicenses,
    password:hashedPassword,
    
  });

  const emailResult = await sendEmail({
    to: body.email,
    subject: "D1 NOTES Sub Administrator Registration ",
    text: "D1 NOTES Sub Administrator Registration ",
    html: `<p>Dear ${body.name}! You have been added as a Sub Administrator by ${teamsQuery[0].team_name}. </p><p>Please login here https://d1notesupdated-five.vercel.app.</p><p>Here are your login details as a Team:</p><p>Email: ${body.email}</p><p>Password: ${password}</p><p>Please change your password upon login</p><br><p>Regards,
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
  const team_id = body.team_id;
  const teamsQuery = await db.select().from(teams).where(eq(teams.id, Number(body.team_id)));
 

  try {
    // Perform the update operation
    await db.update(teams)
      .set({
        team_name: teamsQuery[0].team_name,
    created_by: "Team",  
    description: teamsQuery[0].description,
    slug	: teamsQuery[0].slug	,
    manager_name: body.name,
    logo: teamsQuery[0].logo,
    manager_email: body.email,
    address:  teamsQuery[0].address,
    age_group:  teamsQuery[0].age_group,
    visibility:  teamsQuery[0].visibility,
    
    countryCodes: body.countryCodes,
    parent_id: body.team_id,
    manager_phone: body.phone,
    buy_evaluation: body.acceptEvaluations,
    view_evaluation: body.buyLicenses,
     
         
      })
      .where(eq(teams.id, body.id)).execute();  // Ensure you're updating the correct record based on the enterprise_id
 

    return NextResponse.json({ body }, { status: 200 });
  } 
  catch (err:any) {
    console.error("Update Error:", err); // Log full error details in the server console
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
  
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
    const id = url.searchParams.get('id') || '';

  try {
    const deletedRole = await db.delete(teams).where(eq(teams.id, parseInt(id))).returning();

    if (deletedRole) {
      return NextResponse.json({ message: 'Sub Administrator deleted successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Sub Administrator not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting Sub Admin:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
