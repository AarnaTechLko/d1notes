import { forgetPassword } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
 


  if (!token) {
    return NextResponse.json({ isValid: false, message: 'Token is required' }, { status: 400 });
  }

  else {

    const tokencheck=await db.select().from(forgetPassword).where(eq(forgetPassword.token,token))
    if(tokencheck.length>=1)
    {
        return NextResponse.json({ isValid:true});
    }
    else{
        return NextResponse.json({ isValid:false},{status:500});
    }
   
  }
}
