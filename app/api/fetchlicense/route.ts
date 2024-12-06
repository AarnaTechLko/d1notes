import { NextResponse } from "next/server";
import { db } from '../../../lib/db';
import { users, otps, licenses } from '../../../lib/schema'
import { eq, and, or } from "drizzle-orm";
export async function POST(request: Request) {
    const { userId, type } = await request.json();

    if (!userId || !type) {
        return NextResponse.json({ error: "User ID and type are required" }, { status: 400 });
    }
    if(type==='Enterprise' || type==='enterprise')
    {
    const licensseQuery=await db.select({licenseKey:licenses.licenseKey}).from(licenses)
    .where(
        and(
            eq(licenses.enterprise_id,userId),
            eq(licenses.status,'Free'),
            eq(licenses.buyer_type,'Enterprise')
        )
    ).execute();
    if(licensseQuery.length>0)
        {
            const licenseKey =licensseQuery[0].licenseKey;
            return NextResponse.json({ licenseKey });
        }
        else{
            return NextResponse.json({ message:"You do not have much licenses. Please Purchase Licenses." }, { status: 500 });
        }
    }
    if(type==='coach')
        {
        const licensseQuery=await db.select({licenseKey:licenses.licenseKey}).from(licenses)
        .where(
            and(
                or(
                    eq(licenses.enterprise_id, userId),
                    eq(licenses.assigned_to, userId)
                ),
              
                or(
                    eq(licenses.status, 'Free'),
                    eq(licenses.status, 'Assigned')
                )
            )
        ).execute();
        if(licensseQuery.length>0)
        {
            const licenseKey =licensseQuery[0].licenseKey;
            return NextResponse.json({ licenseKey });
        }
        else{
            return NextResponse.json({ message:"You do not have much licenses. Please contact your club." }, { status: 500 });
        }
       
        }

}
