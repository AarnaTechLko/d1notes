import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teams, teamPlayers, coaches, teamCoaches, users } from "@/lib/schema";
import { eq, inArray, and} from "drizzle-orm";
import { sendEmail } from "@/lib/helpers";
import { any } from "zod";



export async function DELETE(req: NextRequest) {
  try {
    const { id, creator_id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: 'Team ID is required' }, { status: 400 });
    }

    // Archive the team instead of deleting
    await db.update(teams).set({ status: 'Archived' }).where(eq(teams.id, id));

    console.log("Teams ID: ",id);

    console.log("Enterprise ID: ",creator_id)
    // Get the list of coach IDs associated with the team
    const coachesInTeam = await db
      .select({ coachId: teamCoaches.coachId }) // Use correct select syntax
      .from(teamCoaches)
      .where(eq(teamCoaches.teamId, id)); // Changed 'team_id' to 'teamId'

    // const coachesIds = coachesInTeam.map((entry) => entry.coachId);
    
    const coachesIds = coachesInTeam.map((entry) => entry.coachId); 

    //gets the list of teams each coach is apart of within the organization
    const anyOtherActiveTeam = await 
        db.select({status:teams.status, team_id: teams.id, coach_id: teamCoaches.coachId})
        .from(teams)
        .leftJoin(teamCoaches, eq(teamCoaches.teamId, teams.id))
        .where(and(eq(teams.creator_id, creator_id), inArray(teamCoaches.coachId, coachesIds) ))


    // const statusOfTeams = anyOtherActiveTeam.map((stat) => stat.status)

    // const teamsId = anyOtherActiveTeam.map((id) => id.team_id);

    // const coachesId = anyOtherActiveTeam.map((coach) => coach.coach_id);

    //this will group all the teams by which coach is a part of them via a hashmap
      const coachesInSameTeamObj = new Map<number, string[]>();

      for (const sameTeam of anyOtherActiveTeam) {

        if (!coachesInSameTeamObj.has(Number(sameTeam.coach_id))){
          coachesInSameTeamObj.set(Number(sameTeam.coach_id), [])
        }
        coachesInSameTeamObj.get(Number(sameTeam.coach_id))?.push(String(sameTeam.status))
      }

      console.log(coachesInSameTeamObj)


      //checks if all the teams a coach is part of has been archived, if yes then it's pushed to an array
      const coachesMustArchive: number[] = [];

      for (const [coachId, status] of coachesInSameTeamObj){
        const checkStatus = status.every(status => status === 'Archived')
        if (checkStatus){
          coachesMustArchive.push(coachId);
        }
      }

    await db.update(coaches).set({ status: 'Archived' }).where(inArray(coaches.id, coachesMustArchive));

    //getting all the players that belong to the team
    const playersInTeam = await db
      .select({ playerId: teamPlayers.playerId }) // Use correct select syntax
      .from(teamPlayers)
      .where(eq(teamPlayers.teamId, id)); // Changed 'team_id' to 'teamId'


    const playerIds = playersInTeam.map((entry) => entry.playerId); 

    //gets the list of teams each player is apart of within the organization
    const playerInOtherActiveTeam = await 
        db.select({status:teams.status, team_id: teams.id, player_id: teamPlayers.playerId})
        .from(teams)
        .leftJoin(teamPlayers, eq(teamPlayers.teamId, teams.id))
        .where(and(eq(teams.creator_id, creator_id), inArray(teamPlayers.playerId, playerIds)))


    //this will group all the teams by which player is a part of them via a hashmap
    const playersInSameTeamObj = new Map<number, string[]>();

    for (const sameTeam of  playerInOtherActiveTeam) {

      if (!playersInSameTeamObj.has(Number(sameTeam.player_id))){
        playersInSameTeamObj.set(Number(sameTeam.player_id), [])
      }
      playersInSameTeamObj.get(Number(sameTeam.player_id))?.push(String(sameTeam.status))
    }

    console.log(playersInSameTeamObj)


    //checks if all the teams a player is part of has been archived, if yes then it's pushed to an array
    const playersMustArchive: number[] = [];

    for (const [coachId, status] of playersInSameTeamObj){
      const checkStatus = status.every(status => status === 'Archived')
      if (checkStatus){
        playersMustArchive.push(coachId);
      }
    }

  await db.update(users).set({ status: 'Archived' }).where(inArray(users.id, playersMustArchive));

    return NextResponse.json({ success: true, message: 'Team and related players and coaches archived successfully' });
  } catch (error) {
    console.error('Error archiving team:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}