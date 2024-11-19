// /app/api/coach/[slug]/route.ts
import { NextResponse,NextRequest } from 'next/server';
import { db } from '../../../../lib/db'; // Adjust the import based on your file structure
import { enterprises } from '../../../../lib/schema'; // Adjust if necessary
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const { enterprise_id } = await req.json();

  try {
    // Fetch coach data based on the slug
    const enterprise = await db
      .select()
      .from(enterprises)
      .where(eq(enterprises.id,Number(enterprise_id))) // Adjust based on your schema
      .execute();

     
    if (enterprise.length === 0) {
      return NextResponse.json({ message: 'Enterprise not found' }, { status: 404 });
    }

   if(enterprise[0].package_id!=null)
   {
    return NextResponse.json(enterprise[0].package_id);
   }
   else{
    return NextResponse.json('');
   }
    
  } catch (error) {
    console.error('Error fetching coach data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
