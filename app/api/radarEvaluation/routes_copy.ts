// // import { NextResponse } from 'next/server';
// // import { db } from '@/lib/db';
// // import { radarEvaluation, evaluationResults } from '@/lib/schema';
// // import { eq } from 'drizzle-orm';

// // export async function POST(req: Request) {
// //   try {
// //     const data = await req.json();
// //     const { evaluationResultId, ...evaluationFields } = data;

// //     if (!evaluationResultId) {
// //       return NextResponse.json({ error: 'Evaluation result ID is required' }, { status: 400 });
// //     }

// //     // LEFT JOIN evaluationResults with radarEvaluation
// //     const [result] = await db
// //       .select({
// //         playerId: evaluationResults.playerId,
// //         coachId: evaluationResults.coachId,
// //         club_id: evaluationResults.club_id,
// //         evaluationId: evaluationResults.evaluationId,
// //         existingRadarId: radarEvaluation.id, // Check if a radar evaluation already exists
// //       })
// //       .from(evaluationResults)
// //       .leftJoin(
// //         radarEvaluation,
// //         eq(evaluationResults.evaluationId, radarEvaluation.evaluationId)
// //       )
// //       .where(eq(evaluationResults.id, evaluationResultId));

// //     if (!result) {
// //       return NextResponse.json({ error: 'Evaluation result not found' }, { status: 404 });
// //     }

// //     // Optional: Prevent duplicate radar evaluations
// //     if (result.existingRadarId) {
// //       return NextResponse.json({ error: 'Radar evaluation already exists for this evaluation result' }, { status: 409 });
// //     }

// //     // Insert radar evaluation using metadata from evaluationResults
// //     const [inserted] = await db
// //       .insert(radarEvaluation)
// //       .values({
// //         playerId: result.playerId,
// //         coachId: result.coachId,
// //         club_id: result.club_id,
// //         evaluationId: result.evaluationId,
// //         ...evaluationFields,
// //       })
// //       .returning();

// //     return NextResponse.json({ message: 'Radar evaluation created successfully', inserted }, { status: 201 });
// //   } catch (error) {
// //     console.error('Radar Evaluation POST Error:', error);
// //     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
// //   }
// // }

// // import { NextResponse } from 'next/server';
// // import { db } from '@/lib/db';
// // import { radarEvaluation, evaluationResults } from '@/lib/schema';
// // import { eq } from 'drizzle-orm';

// // export async function POST(req: Request) {
// //   try {
// //     const data = await req.json();
// //     const { evaluationResultId, ...evaluationFields } = data;

// //     if (!evaluationResultId) {
// //       return NextResponse.json({ error: 'Evaluation result ID is required' }, { status: 400 });
// //     }

// //     // Get player, coach, and club info from evaluation_results using LEFT JOIN
// //     const [result] = await db
// //       .select({
// //         playerId: evaluationResults.playerId,
// //         coachId: evaluationResults.coachId,
// //         club_id: evaluationResults.club_id,
// //       })
// //       .from(evaluationResults)
// //       .where(eq(evaluationResults.id, Number(evaluationResultId)));

// //     if (!result) {
// //       return NextResponse.json({ error: 'Evaluation result not found' }, { status: 404 });
// //     }

// //     // Insert into radarEvaluation with only the allowed fields
// //     const inserted = await db.insert(radarEvaluation).values({
// //       playerId: result.playerId,
// //       coachId: result.coachId,
// //       evaluationId: Number(evaluationResultId),
// //       club_id: result.club_id,

// //       // ✅ Only include these fields from frontend
// //       comm_persistence: evaluationFields.comm_persistence,
// //       comm_aggression: evaluationFields.comm_aggression,
// //       comm_alertness: evaluationFields.comm_alertness,
// //       exe_scoring: evaluationFields.exe_scoring,
// //       exe_receiving: evaluationFields.exe_receiving,
// //       exe_passing: evaluationFields.exe_passing,
// //       dec_mobility: evaluationFields.dec_mobility,
// //       dec_anticipation: evaluationFields.dec_anticipation,
// //       dec_pressure: evaluationFields.dec_pressure,
// //       soc_speedEndurance: evaluationFields.soc_speedEndurance,
// //       soc_strength: evaluationFields.soc_strength,
// //       soc_explosiveMovements: evaluationFields.soc_explosiveMovements,
// //       superStrengths: evaluationFields.superStrengths,
// //       developmentAreas: evaluationFields.developmentAreas,
// //       idpGoals: evaluationFields.idpGoals,
// //       keySkills: evaluationFields.keySkills,
// //       attacking: evaluationFields.attacking,
// //       defending: evaluationFields.defending,
// //       transitionDefending: evaluationFields.transitionDefending,
// //       transitionAttacking: evaluationFields.transitionAttacking,
// //     });

// //     return NextResponse.json({ message: 'Radar evaluation submitted', inserted }, { status: 201 });
// //   } catch (error) {
// //     console.error('Radar Evaluation POST Error:', error);
// //     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
// //   }
// // }

// import { NextResponse } from 'next/server';
// import { db } from '@/lib/db';
// import { radarEvaluation, evaluationResults, users, coaches } from '@/lib/schema'; // Import other tables if necessary
// import { eq } from 'drizzle-orm';

// export async function POST(req: Request) {
//   try {
//     const data = await req.json();
//     const { evaluationResultId, ...evaluationFields } = data;

//     if (!evaluationResultId) {
//       return NextResponse.json({ error: 'Evaluation result ID is required' }, { status: 400 });
//     }

//     // Get player, coach, and club info from evaluation_results using LEFT JOIN
//     const [result] = await db
//       .select({
//         playerId: evaluationResults.playerId,
//         coachId: evaluationResults.coachId,
//         club_id: evaluationResults.club_id,
//         evaluationResultId: evaluationResults.id, // Make sure to select the correct evaluation result ID
//       })
//       .from(evaluationResults)
//       .leftJoin(users, eq(users.id, evaluationResults.playerId)) // Example LEFT JOIN on users table
//       .leftJoin(coaches, eq(coaches.id, evaluationResults.coachId)) // Example LEFT JOIN on coaches table
//       .where(eq(evaluationResults.id, Number(evaluationResultId)));

//     if (!result) {
//       return NextResponse.json({ error: 'Evaluation result not found' }, { status: 404 });
//     }

//     // Insert into radarEvaluation with only the allowed fields
//     const inserted = await db.insert(radarEvaluation).values({
//       playerId: result.playerId,
//       coachId: result.coachId,
//       evaluationId: Number(evaluationResultId),
//       club_id: result.club_id,

//       // ✅ Only include these fields from frontend
//       comm_persistence: evaluationFields.comm_persistence,
//       comm_aggression: evaluationFields.comm_aggression,
//       comm_alertness: evaluationFields.comm_alertness,
//       exe_scoring: evaluationFields.exe_scoring,
//       exe_receiving: evaluationFields.exe_receiving,
//       exe_passing: evaluationFields.exe_passing,
//       dec_mobility: evaluationFields.dec_mobility,
//       dec_anticipation: evaluationFields.dec_anticipation,
//       dec_pressure: evaluationFields.dec_pressure,
//       soc_speedEndurance: evaluationFields.soc_speedEndurance,
//       soc_strength: evaluationFields.soc_strength,
//       soc_explosiveMovements: evaluationFields.soc_explosiveMovements,
//       superStrengths: evaluationFields.superStrengths,
//       developmentAreas: evaluationFields.developmentAreas,
//       idpGoals: evaluationFields.idpGoals,
//       keySkills: evaluationFields.keySkills,
//       attacking: evaluationFields.attacking,
//       defending: evaluationFields.defending,
//       transitionDefending: evaluationFields.transitionDefending,
//       transitionAttacking: evaluationFields.transitionAttacking,
//     });

//     return NextResponse.json({ message: 'Radar evaluation submitted', inserted }, { status: 201 });
//   } catch (error) {
//     console.error('Radar Evaluation POST Error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }



import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { radarEvaluation } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const {
      playerId,
      coachId,
      club_id,
      evaluationId,
      speed,
      ability,
      codWithBall,
      codWithoutBall,
      counterMoveJump,
      receivingFirstTouch,
      shotsOnGoal,
      finishingTouches,
      combinationPlay,
      workrate,
      pressingFromFront,
      oneVOneDomination,
      goalThreat,
      beingAGoodTeammate,
      decisionMakingScore,
      touchesInFinalThird,
      offTheBallMovement,
      spaceInBoxAbility,
      forwardRuns,
      ratings,
      superStrengths,
      developmentAreas,
      idpGoals,
      keySkills,
      attacking,
      defending,
      transitionDefending,
      transitionAttacking,
    } = data;

    // Basic validation
    if (!playerId || !coachId || !evaluationId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [inserted] = await db.insert(radarEvaluation).values({
      playerId,
      coachId,
      club_id,
      evaluationId,
      speed,
      ability,
      codWithBall,
      codWithoutBall,
      counterMoveJump,
      receivingFirstTouch,
      shotsOnGoal,
      finishingTouches,
      combinationPlay,
      workrate,
      pressingFromFront,
      oneVOneDomination,
      goalThreat,
      beingAGoodTeammate,
      decisionMakingScore,
      touchesInFinalThird,
      offTheBallMovement,
      spaceInBoxAbility,
      forwardRuns,
      comm_persistence: ratings?.comm_persistence,
      comm_aggression: ratings?.comm_aggression,
      comm_alertness: ratings?.comm_alertness,
      exe_scoring: ratings?.exe_scoring,
      exe_receiving: ratings?.exe_receiving,
      exe_passing: ratings?.exe_passing,
      dec_mobility: ratings?.dec_mobility,
      dec_anticipation: ratings?.dec_anticipation,
      dec_pressure: ratings?.dec_pressure,
      soc_speedEndurance: ratings?.soc_speedEndurance,
      soc_strength: ratings?.soc_strength,
      soc_explosiveMovements: ratings?.soc_explosiveMovements,
      superStrengths,
      developmentAreas,
      idpGoals,
      keySkills,
      attacking,
      defending,
      transitionDefending,
      transitionAttacking,
    }).returning();

    return NextResponse.json({ message: 'Radar evaluation created successfully', inserted }, { status: 201 });
  } catch (error) {
    console.error('Radar Evaluation POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
