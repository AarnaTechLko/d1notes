
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { radarEvaluation, users, coaches, playerEvaluation } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const evaluationId = Number(url.searchParams.get('evaluationId'));

    const result = await db
      .select({
        // Radar Evaluation Fields
        evaluationId: radarEvaluation.evaluationId,
        playerId: radarEvaluation.playerId,
        coachId: radarEvaluation.coachId,
        club_id: radarEvaluation.club_id,
        speed: radarEvaluation.speed,
        ability: radarEvaluation.ability,
        codWithBall: radarEvaluation.codWithBall,
        codWithoutBall: radarEvaluation.codWithoutBall,
        counterMoveJump: radarEvaluation.counterMoveJump,
        receivingFirstTouch: radarEvaluation.receivingFirstTouch,
        shotsOnGoal: radarEvaluation.shotsOnGoal,
        finishingTouches: radarEvaluation.finishingTouches,
        combinationPlay: radarEvaluation.combinationPlay,
        workrate: radarEvaluation.workrate,
        pressingFromFront: radarEvaluation.pressingFromFront,
        oneVOneDomination: radarEvaluation.oneVOneDomination,
        goalThreat: radarEvaluation.goalThreat,
        beingAGoodTeammate: radarEvaluation.beingAGoodTeammate,
        decisionMakingScore: radarEvaluation.decisionMakingScore,
        touchesInFinalThird: radarEvaluation.touchesInFinalThird,
        offTheBallMovement: radarEvaluation.offTheBallMovement,
        spaceInBoxAbility: radarEvaluation.spaceInBoxAbility,
        forwardRuns: radarEvaluation.forwardRuns,
        comm_persistence: radarEvaluation.comm_persistence,
        comm_aggression: radarEvaluation.comm_aggression,
        comm_alertness: radarEvaluation.comm_alertness,
        exe_scoring: radarEvaluation.exe_scoring,
        exe_receiving: radarEvaluation.exe_receiving,
        exe_passing: radarEvaluation.exe_passing,
        dec_mobility: radarEvaluation.dec_mobility,
        dec_anticipation: radarEvaluation.dec_anticipation,
        dec_pressure: radarEvaluation.dec_pressure,
        soc_speedEndurance: radarEvaluation.soc_speedEndurance,
        soc_strength: radarEvaluation.soc_strength,
        soc_explosiveMovements: radarEvaluation.soc_explosiveMovements,
        superStrengths: radarEvaluation.superStrengths,
        developmentAreas: radarEvaluation.developmentAreas,
        idpGoals: radarEvaluation.idpGoals,
        keySkills: radarEvaluation.keySkills,
        attacking: radarEvaluation.attacking,
        defending: radarEvaluation.defending,
        transitionDefending: radarEvaluation.transitionDefending,
        transitionAttacking: radarEvaluation.transitionAttacking,

        // Player Info
        playerFirstName: users.first_name,
        playerLastName: users.last_name,
        playerImage: users.image,
        playerSlug: users.slug,

        // Coach Info
        coachFirstName: coaches.firstName,
        coachLastName: coaches.lastName,
        coachImage: coaches.image,
        coachSlug: coaches.slug,

        // Evaluation Meta
        reviewTitle: playerEvaluation.review_title,
        status: playerEvaluation.status,
        position: playerEvaluation.position,
        created_at: playerEvaluation.created_at,
      })
      .from(radarEvaluation)
      .innerJoin(users, eq(users.id, radarEvaluation.playerId))
      .innerJoin(coaches, eq(coaches.id, radarEvaluation.coachId))
      .innerJoin(playerEvaluation, eq(playerEvaluation.id, radarEvaluation.evaluationId))
      .where(eq(radarEvaluation.evaluationId, evaluationId))
      .limit(1)
      .execute();

    return NextResponse.json({
      result: result[0],
    });
  } catch (error) {
    console.error('❌ GET Radar Evaluation Error:', error);
    return NextResponse.json({ error: 'Failed to fetch radar evaluation data' }, { status: 500 });
  }

}




