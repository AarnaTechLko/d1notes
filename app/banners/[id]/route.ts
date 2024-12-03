import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Adjust the path as per your setup
import { playerbanner } from '@/lib/schema'; // Import the playerbanner schema
import { eq, and } from 'drizzle-orm';


export async function DELETE(request: Request, { params }: { params: { bannerId: string } }) {
    const { bannerId } = params;

    try {
        // Call your function to delete the banner by its ID
        const result = await db.delete(playerbanner).where(eq(playerbanner.id,Number(bannerId)));

        return NextResponse.json({ message: 'Banner deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting banner:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}