import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import {packages, orderHistory, enterprises, licenses} from '../../../../lib/schema';

import { eq, and, gt,desc,or } from 'drizzle-orm';

export async function POST(req: NextRequest) {

const {enterprise_id}= await req.json();
const licenseslist = await db
  .select()
  .from(licenses)
 
  .where(
    or(
      eq(licenses.enterprise_id, enterprise_id),
      eq(licenses.assigned_to, enterprise_id)
    ) 
  )
   
  .orderBy(desc(licenses.createdAt));

return NextResponse.json({ licenseslist}, { status: 200 });

}
