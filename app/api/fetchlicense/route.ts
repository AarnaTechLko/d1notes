import { NextResponse } from "next/server";
import { db } from '../../../lib/db';
import { users, otps, licenses } from '../../../lib/schema'
import { eq, and, or } from "drizzle-orm";
export async function POST(request: Request) {
    const { userId, type } = await request.json();

    if (!userId || !type) {
        return NextResponse.json({ error: "User ID and type are required" }, { status: 400 });
    }
    if(type==='Enterprise')
    {
    const licensseQuery=await db.select({licenseKey:licenses.licenseKey}).from(licenses)
    .where(
        and(
            eq(licenses.enterprise_id,userId),
            eq(licenses.status,'Free'),
            eq(licenses.buyer_type,'Enterprise')
        )
    ).execute();
    const licenseKey =licensseQuery[0].licenseKey;
    return NextResponse.json({ licenseKey });
    }
    if(type==='Coach')
        {
        const licensseQuery=await db.select({licenseKey:licenses.licenseKey}).from(licenses)
        .where(
            and(
                eq(licenses.enterprise_id,userId),
                eq(licenses.buyer_type,'Coach'),
                or(
                    eq(licenses.status,'Free'),
                    eq(licenses.status,'Assigned'),
                )
            )
        ).execute();
        const licenseKey =licensseQuery[0].licenseKey;
        return NextResponse.json({ licenseKey });
        }

}
