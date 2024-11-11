// /app/api/coach/[slug]/route.ts
import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db'; // Adjust the import based on your file structure
import { coaches } from '../../../../lib/schema'; // Adjust if necessary
import { eq } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;

  try {
    // Fetch coach data based on the slug
    const coach = await db
      .select()
      .from(coaches)
      .where(eq(coaches.slug,slug)) // Adjust based on your schema
      .execute();

    // Check if the coach was found
    if (coach.length === 0) {
      return NextResponse.json({ message: 'Coach not found' }, { status: 404 });
    }

    // Return the coach data
    return NextResponse.json(coach[0]);
  } catch (error) {
    console.error('Error fetching coach data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
