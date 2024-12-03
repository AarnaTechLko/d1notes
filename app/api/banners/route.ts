// app/api/banners/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Adjust the path as per your setup
import { playerbanner } from '@/lib/schema'; // Import the playerbanner schema
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        // Parse the incoming JSON body
        const { user_id, filepath, usertype } = await req.json();
     
        // Validate the incoming data
        if (!user_id || !filepath || !usertype) {
            return NextResponse.json(
                { error: 'Missing required fields: player_id, filepath, usertype' },
                { status: 400 }
            );
        }

        // Insert the data into the playerbanner table
        const newBanner = await db.insert(playerbanner).values({
            user_id,
            filepath,
            usertype,
        });

        return NextResponse.json(
            { message: 'Banner uploaded successfully', banner: newBanner },
            { status: 201 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error uploading banner' }, { status: 500 });
    }
}


export async function GET(req: NextRequest) {
    try {
        // Extract the query parameters
        const user_id = req.nextUrl.searchParams.get('user_id');
        const usertype = req.nextUrl.searchParams.get('usertype');

        // Validate the required query parameters
        if (!user_id || !usertype) {
            return NextResponse.json(
                { error: 'Missing required query parameters: user_id, usertype' },
                { status: 400 }
            );
        }

        // Fetch the banners from the playerbanner table
        const banners = await db.select().from(playerbanner).where(
            and(
                eq(playerbanner.user_id,Number(user_id)),
                eq(playerbanner.usertype,usertype)
            )
           
        );

        // Return the banners if found
        if (banners.length > 0) {
            return NextResponse.json(banners, { status: 200 });
        }

        return NextResponse.json({ message: 'No banners found' }, { status: 404 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching banners' }, { status: 500 });
    }
}
