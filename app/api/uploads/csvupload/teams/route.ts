import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../../lib/db';
import { eq, inArray, and } from "drizzle-orm";
import { users, teamPlayers, licenses, teams, teamCoaches, coaches } from '../../../../../lib/schema';
import { number } from 'zod';
import { sendEmail } from '@/lib/helpers';


const generateRandomPassword = (length = 12) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";
    let password = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }

    return password;
};
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const payload = body.csvData;
        const enterprise_id = body.enterprise_id;

        if (!Array.isArray(payload)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        const teamNameMap = new Map();

        payload.forEach((item) => {
            const normalizedTeamName = item.TeamName.trim().toLowerCase().replace(/\s+/g, '-');
            if (!teamNameMap.has(normalizedTeamName)) {
                teamNameMap.set(normalizedTeamName, []);
            }
            teamNameMap.get(normalizedTeamName)?.push(item);
        });

        const uniquePayload = Array.from(teamNameMap.values());
        const teamNames = Array.from(teamNameMap.keys());

        const existingTeams = await db
            .select({ id: teams.id, slug: teams.slug })
            .from(teams)
            .where(
                and(
                    inArray(teams.slug, teamNames),
                    eq(teams.creator_id, enterprise_id)
                )
            );

        const existingTeamsMap = new Map(existingTeams.map(team => [team.slug, team.id]));

        let excludedUsers: any[] = [];
        let excludedCoaches: any[] = [];

        const insertData = await Promise.all(uniquePayload.map(async (teamItems) => {
            const item = teamItems[0];

            let teamNameFormatted = item.TeamName.trim().toLowerCase().replace(/\s+/g, '-');
            let teamId = existingTeamsMap.get(teamNameFormatted);

            if (!teamId) {
                const teamInsert = await db.insert(teams).values({
                    team_name: item.TeamName,
                    created_by: 'Enterprise',
                    creator_id: enterprise_id,
                    slug: teamNameFormatted,
                    team_type: item.Gender,
                    team_year: item.Year,
                    club_id: enterprise_id,
                    status: 'Active',
                    logo: '',
                    cover_image: '',
                    description: 'Team Created',
                }).returning({ teamId: teams.id });

                teamId = teamInsert[0]?.teamId;
                existingTeamsMap.set(teamNameFormatted, teamId);
            }

            const playersToInsert: any[] = [];
            for (const player of teamItems) {
                const password = generateRandomPassword(10);
                const hashedPassword = await hash(password, 10);
                const userEmail = player.PlayersEmail;

                const existingUser = await db.select().from(users).where(eq(users.email, userEmail));

                if (existingUser.length > 0) {
                    const user = existingUser[0];
                    if (user.enterprise_id !== enterprise_id) {
                        excludedUsers.push({
                            email: userEmail,
                            existingEnterprise: user.enterprise_id
                        });
                        continue;
                    }
                } else {
                    const user = await db.insert(users).values({
                        email: userEmail,
                        password: hashedPassword,
                        status: 'Inactive',
                        enterprise_id: enterprise_id
                    }).returning({ userId: users.id });

                    playersToInsert.push({
                        userId: user[0]?.userId,
                        password: hashedPassword,
                        email: userEmail,
                    });
                }
            }

            const coachesToInsert: any[] = [];
            for (const coach of teamItems) {
                const password = generateRandomPassword(10);
                const hashedPassword = await hash(password, 10);
                const userEmail = coach.CoachEmail;

                const existingCoach = await db.select().from(coaches).where(eq(coaches.email, userEmail));

                if (existingCoach.length > 0) {
                    const coach = existingCoach[0];
                    if (coach.enterprise_id !== enterprise_id) {
                        excludedCoaches.push({
                            email: userEmail,
                            existingEnterprise: coach.enterprise_id
                        });
                        continue;
                    }
                } else {
                    const user = await db.insert(coaches).values({
                        email: userEmail,
                        password: hashedPassword,
                        status: 'Active',
                        enterprise_id: enterprise_id
                    }).returning({ userId: coaches.id });

                    coachesToInsert.push({
                        coachId: user[0]?.userId,
                        password: hashedPassword,
                        email: userEmail,
                    });
                }
            }

            return { teamId, playersToInsert, coachesToInsert };
        }));

        for (const data of insertData) {
            const teamId = data.teamId;

            if (data.coachesToInsert.length > 0) {
                await db.insert(teamCoaches).values(
                    data.coachesToInsert.map((coach) => ({
                        enterprise_id: Number(enterprise_id),
                        teamId: Number(teamId),
                        coachId: Number(coach.coachId),
                    }))
                );
            }

            if (data.playersToInsert.length > 0) {
                await db.insert(teamPlayers).values(
                    data.playersToInsert.map((player) => ({
                        enterprise_id: Number(enterprise_id),
                        teamId: Number(teamId),
                        playerId: Number(player.userId),
                    }))
                );
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Teams and players inserted successfully',
            excludedUsers,
            excludedCoaches
        });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}









