import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Adjust the path based on your setup
import { freerequests } from "@/lib/schema";
import { eq, sql, and } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { allowedFreeRequests, clubId } = body;

        const checkRequest = await db.select().from(freerequests).where(eq(freerequests.clubId, clubId));
        if (checkRequest.length > 0) {
            await db.update(freerequests)
                .set({ requests:allowedFreeRequests })
                .where(eq(freerequests.clubId, clubId));
        }
        else {
            await db.insert(freerequests)
            .values({ requests:allowedFreeRequests, clubId:clubId });
        }


        return NextResponse.json(
            { message: "Join Request Sent" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error processing request:", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const clubId = searchParams.get('clubId');
let freerequestCount;
    const query=await db.select().from(freerequests).where(eq(freerequests.clubId, Number(clubId))).execute();
    if(query.length>0)
    {
        freerequestCount=Number(query[0].requests);
    }
    else{
        freerequestCount=Number(0);
    }
    return NextResponse.json(
        { requests:freerequestCount},
        { status: 200 }
    );
    


}




