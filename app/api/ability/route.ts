import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { evaluationResults, ability } from '@/lib/schema';
import { eq } from 'drizzle-orm';



// export async function POST(req: NextRequest) {
//     try {
//       const { evaluationId, filename, comments } = await req.json();
      
//       console.log('Received data:', { evaluationId, filename, comments });  // 👈 log inputs
  
//       const evalExists = await db
//         .select()
//         .from(evaluationResults)
//         .where(eq(evaluationResults.id, evaluationId));
  
//     //   if (evalExists.length === 0) {
//     //     console.log('Evaluation not found:', evaluationId);  // 👈 log if not found
//     //     return NextResponse.json({ error: 'Evaluation ID not found' }, { status: 404 });
//     //   }
  
//       await db.insert(ability).values({
//         evaluationId,
//         filename,
//         comments,
//       });
  
//       console.log('Ability inserted successfully!'); // 👈 log success
//       return NextResponse.json({ message: 'Ability saved successfully' }, { status: 201 });
//     } catch (error: any) {
//       console.error('Error saving ability:', error.message);  // 👈 better error
//       return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
//     }
//   }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { evaluationId, file1, file2, file3, file4, file5 } = body;

    if (!evaluationId || !file1 || !file2 || !file3 || !file4 || !file5) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Collect files into a list
    const data = [file1, file2, file3, file4, file5];

    const rows = data.map((item: { filename: string; comments: string }) => ({
      evaluationId,
      filename: item.filename,
      comments: item.comments,
    }));
    console.log(rows);

    await db.insert(ability).values(rows);

    return NextResponse.json({ message: 'All abilities saved successfully' ,ability:rows}, { status: 201 });
  } catch (error: any) {
    console.error('Error saving abilities:', error.message);
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
    const result = await db
      .select()
      .from(ability)
      .where(eq(ability.evaluationId, parseInt(evaluationId)));

    if (result.length === 0) {
      return NextResponse.json({ error: 'No data found for the given evaluationId' }, { status: 404 });
    }

    // Transform to object with file1, file2, etc.
    const files = result.reduce((acc, item, index) => {
      acc[`file${index + 1}`] = {
        filename: item.filename,
        comments: item.comments||'',
      };
      return acc;
    }, {} as Record<string, { filename: string; comments: string }>);

    const responseData = {
      evaluationId,
      files,
    };

    return NextResponse.json({ ability: responseData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching ability:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}



// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const evaluationId = searchParams.get('evaluationId');

//   if (!evaluationId) {
//     return NextResponse.json({ error: 'Missing evaluationId parameter' }, { status: 400 });
//   }

//   try {
//     const result = await db
//       .select()
//       .from(ability)
//       .where(eq(ability.evaluationId, parseInt(evaluationId)));

//     return NextResponse.json({ ability: result }, { status: 200 });
//   } catch (error) {
//     console.error('Error fetching ability:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }
