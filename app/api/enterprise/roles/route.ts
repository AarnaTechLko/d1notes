import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import {roles,modules} from '../../../../lib/schema';

import { eq, and, gt,desc,or } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const club_id = url.searchParams.get('club_id') || '';
     const rolesList = await db
    .select()
    .from(roles)
    .where(eq(roles.club_id,parseInt(club_id)));

    const modulesList = await db
    .select()
    .from(modules);
return NextResponse.json({ rolesList, modulesList}, { status: 200 });

}

export async function POST(req: NextRequest) {
  const body=await req.json();
  const permissions=body.permissions;
  
  await db.insert(roles).values({
    role_name: body.roleTitle,
    club_id: body.enterprise_id,
    permissions: permissions, // Ensure this matches the DB schema type
    module_id: null,
  });



  return NextResponse.json({body}, { status: 200 });
}
