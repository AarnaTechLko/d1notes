import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { licenses, coaches, users, teams} from '../../../../lib/schema';
 

import { eq, and, gt,desc, count } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const { enterprise_id } = await req.json();

  const consumeLicensesResult = await db
    .select({ count: count() })
    .from(licenses)
    .where(
      and(
        eq(licenses.enterprise_id, enterprise_id),
        eq(licenses.status, 'Consumed')
      )
    );
  const consumeLicenses = consumeLicensesResult[0]?.count || 0;

  const activeLicensesResult = await db
    .select({ count: count() })
    .from(licenses)
    .where(
      and(
        eq(licenses.enterprise_id, enterprise_id),
        eq(licenses.status, 'Free')
      )
    );
  const activeLicenses = activeLicensesResult[0]?.count || 0;

  const totalCoachesResult = await db
    .select({ count: count() })
    .from(coaches)
    .where(eq(coaches.enterprise_id, enterprise_id));
  const totalCoaches = totalCoachesResult[0]?.count || 0;

  const totalPlayersResult = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.enterprise_id, enterprise_id)); // Ensure the `coaches` table is correct here
  const totalPlayers = totalPlayersResult[0]?.count || 0;

  const totalTeamsResult=await db.select({count:count()}).from(teams).where(and(eq(teams.created_by,'Enterprise'), eq(teams.club_id,enterprise_id)));

  const totalTeams=totalTeamsResult[0]?.count || 0;
  return NextResponse.json(
    { consumeLicenses, activeLicenses, totalCoaches, totalPlayers, totalTeams },
    { status: 200 }
  );
}
