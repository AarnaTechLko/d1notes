import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { radarEvaluation } from '@/lib/schema';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("🚀 Incoming Radar Evaluation Data:", data); // FULL PAYLOAD DEBUG

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
      comm_persistence,
      comm_aggression,
      comm_alertness,
      exe_scoring,
      exe_receiving,
      exe_passing,
      dec_mobility,
      dec_anticipation,
      dec_pressure,
      soc_speedEndurance,
      soc_strength,
      soc_explosiveMovements,
      superStrengths,
      developmentAreas,
      idpGoals,
      keySkills,
      attacking,
      defending,
      transitionDefending,
      transitionAttacking,
    } = data;

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
      comm_persistence,
      comm_aggression,
      comm_alertness,
      exe_scoring,
      exe_receiving,
      exe_passing,
      dec_mobility,
      dec_anticipation,
      dec_pressure,
      soc_speedEndurance,
      soc_strength,
      soc_explosiveMovements,
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
  } catch (error: any) {
    console.error('❌ Radar Evaluation POST Error:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
