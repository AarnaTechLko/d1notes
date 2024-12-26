import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db'; // Import your Drizzle ORM database instance
import { evaluation_charges } from '@/lib/schema';
import { eq,sum,desc } from 'drizzle-orm';
import { NextRequest } from 'next/server'; 

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    await db.delete(evaluation_charges).where(eq(evaluation_charges.id,Number(id)));
    return NextResponse.json({message:"Charges Deleted."});
}