import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../../lib/db';
import { eq, inArray, and } from "drizzle-orm";
import { users, teamPlayers, licenses, teams } from '../../../../../lib/schema';
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

        // Normalize and filter unique team names in the input data
        const teamNameMap = new Map();

        payload.forEach((item) => {
            const normalizedTeamName = item.TeamName.trim().toLowerCase().replace(/\s+/g, '-');
            if (!teamNameMap.has(normalizedTeamName)) {
                teamNameMap.set(normalizedTeamName, []);
            }
            teamNameMap.get(normalizedTeamName)?.push(item); // Collect all players for the team
        });

        const uniquePayload = Array.from(teamNameMap.values());

        // Fetch existing team names from the database
        const teamNames = Array.from(teamNameMap.keys());
        const existingTeams = await db.select()
            .from(teams)
            .where(inArray(teams.slug, teamNames));

        const existingSlugs = new Set(existingTeams.map(team => team.slug));

        const insertData = await Promise.all(uniquePayload.map(async (teamItems) => {
            const item = teamItems[0]; // Just pick the first item to determine the team details
            let teamNameFormatted = item.TeamName.trim().toLowerCase().replace(/\s+/g, '-');
            let slug = teamNameFormatted;

            // Ensure unique slug
            let counter = 1;
            while (existingSlugs.has(slug)) {
                slug = `${teamNameFormatted}-${counter}`;
                counter++;
            }
            existingSlugs.add(slug); // Add to set to track used slugs

            const playersToInsert = [];
            for (const player of teamItems) {
                const password = generateRandomPassword(10);
                const hashedPassword = await hash(password, 10);
                const userEmail = player.PlayersEmail;

                // Check if user already exists
                let userId;
                const existingUser = await db.select()
                    .from(users)
                    .where(eq(users.email, userEmail));

                if (existingUser.length > 0) {
                    // If the user exists, use their existing userId
                    userId = existingUser[0].id;
                } else {
                    // If the user doesn't exist, create a new user
                    const user = await db.insert(users).values({
                        email: userEmail,
                        password: hashedPassword,
                        status: 'Inactive',
                        enterprise_id: enterprise_id
                    }).returning({ userId: users.id });

                    userId = user[0].userId;
                }

                playersToInsert.push({
                    userId, // associate the correct player with the team
                    password: hashedPassword,
                    email: userEmail,
                });
            }

            const teamData = {
                team_name: item.TeamName,
                created_by: 'Enterprise',
                creator_id: enterprise_id,
                slug: slug,
                team_type: item.Gender,
                team_year: item.Year,
                club_id: enterprise_id,
                status: 'Active',
                logo: '',
                cover_image: '',
                description: 'Team Created',
            };

            return { teamData, playersToInsert };
        }));

        // Insert teams and players for each unique team
        const insertTeamsData = insertData.map((data) => data.teamData);

        if (insertTeamsData.length > 0) {
            // Insert teams
            const teamInserted = await db.insert(teams).values(insertTeamsData).returning({ teamId: teams.id });

            // Now insert players for each respective team
            for (let i = 0; i < insertData.length; i++) {
                const teamData = insertData[i];
                const teamId = teamInserted[i].teamId; // Get the inserted teamId

                // Insert players into teamPlayers (one player can belong to multiple teams)
                const insertedPlayers = await db.insert(teamPlayers).values(
                    teamData.playersToInsert.map((player) => ({
                        enterprise_id: Number(enterprise_id),
                        teamId: Number(teamId),
                        playerId: Number(player.userId),
                    }))
                ).returning({playerId:teamPlayers.playerId}); // Adjust based on your database and library support
                
                // Process the result if needed
                for (const insertedPlayer of insertedPlayers) {
                    const player_id = insertedPlayer.playerId;
                  
                    // Find one free license for the given enterprise
                    const licenseToUse = await db.select()
                      .from(licenses)
                      .where(
                        and(
                          eq(licenses.enterprise_id, Number(enterprise_id)),
                          eq(licenses.status, 'Free')
                        )
                      )
                      .limit(1);  // Fetch only one license
                  
                    if (licenseToUse.length > 0) {
                      const updateLicenses = await db.update(licenses)
                        .set({
                          status: 'Consumed',
                          used_by: player_id.toString(),
                          used_for: 'Player',
                        })
                        .where(eq(licenses.id, licenseToUse[0].id));  // Update specific license
                  
                      if (updateLicenses) {
                        await db.update(users)
                          .set({
                            status: 'Active'
                          })
                          .where(eq(users.id, player_id));
                      }
                    }
                  }
                  



                

            }
        }

        return NextResponse.json({ success: true, message: 'Teams and players inserted successfully' });

    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}







