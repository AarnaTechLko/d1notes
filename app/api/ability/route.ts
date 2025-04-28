import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { evaluationResults, ability } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// export async function POST(req: NextRequest) {
//   try {
//     const { evaluationId, filename, comments } = await req.json();

//     // Make sure the evaluation exists
//     const evalExists = await db
//       .select()
//       .from(evaluationResults)
//       .where(eq(evaluationResults.id, evaluationId));

//     if (evalExists.length === 0) {
//       return NextResponse.json({ error: 'Evaluation ID not found' }, { status: 404 });
//     }

//     // Insert new ability
//     await db.insert(ability).values({
//       evaluationId,
//       filename,
//       comments,
//     });

//     return NextResponse.json({ message: 'Ability saved successfully' }, { status: 201 });
//   } catch (error) {
//     console.error('Error saving ability:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

export async function POST(req: NextRequest) {
    try {
      const { evaluationId, filename, comments } = await req.json();
      
      console.log('Received data:', { evaluationId, filename, comments });  // 👈 log inputs
  
      const evalExists = await db
        .select()
        .from(evaluationResults)
        .where(eq(evaluationResults.id, evaluationId));
  
    //   if (evalExists.length === 0) {
    //     console.log('Evaluation not found:', evaluationId);  // 👈 log if not found
    //     return NextResponse.json({ error: 'Evaluation ID not found' }, { status: 404 });
    //   }
  
      await db.insert(ability).values({
        evaluationId,
        filename,
        comments,
      });
  
      console.log('Ability inserted successfully!'); // 👈 log success
      return NextResponse.json({ message: 'Ability saved successfully' }, { status: 201 });
    } catch (error: any) {
      console.error('Error saving ability:', error.message);  // 👈 better error
      return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
  }

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const evaluationId = searchParams.get('evaluationId');

  if (!evaluationId) {
    return NextResponse.json({ error: 'Missing evaluationId parameter' }, { status: 400 });
  }

  try {
    // Get ability for this evaluation
    const result = await db
      .select()
      .from(ability)
      .where(eq(ability.evaluationId, parseInt(evaluationId)));

    return NextResponse.json({ ability: result }, { status: 200 });
  } catch (error) {
    console.error('Error fetching ability:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
