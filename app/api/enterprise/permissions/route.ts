import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { roles, enterprises } from '../../../../lib/schema'
import { eq ,and, isNotNull} from 'drizzle-orm';
import next from 'next';
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const enterprise_id = url.searchParams.get('enterprise_id') || '';

    const enterprise=await db.select().from(enterprises).where(eq(enterprises.id,Number(enterprise_id)));
    const role=await db.select().from(roles).where(eq(roles.id,Number(enterprise[0].role_id)));

    return NextResponse.json(role[0].permissions, { status: 200 });


}