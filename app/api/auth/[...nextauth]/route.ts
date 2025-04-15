// app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db'; // Adjust path based on your directory
import { users, coaches, enterprises, teams } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { SECRET_KEY } from '@/lib/constants';


// Define the extended user type
interface ExtendedUser {
  id: string | null;
  type: string | null;
  name: string | null;
  email: string | null;
  image: string | null;
  teamName: string | null;
  coach_id?: string | null;
  package_id?: string | null;
  club_id?: string | null;
  expectedCharge?: string | null;
  club_name?: string | null;
  coachCurrency?: string | null;
  added_by?: string | null;
  visibility?: string | null;
  teamId?: string | null;
  buy_evaluation?: string | null;
  view_evaluation?: string | null;
  isCompletedProfile: boolean;
}

const handler = NextAuth({

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'email@example.com' },
        password: { label: 'Password', type: 'password' },
        loginAs: { label: 'Login As', type: 'text' },
        teamId: { label: 'teamId', type: 'text' },
        enterprise_id: { label: 'enterprise_id', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        const { email, password, loginAs, teamId, enterprise_id } = credentials;
        let club: any;
        let newEnterpriseID;
        if (loginAs === 'coach') {
          if (enterprise_id) {
            await db.update(coaches)
              .set({ enterprise_id: enterprise_id }) // Fields to update
              .where(eq(coaches.email, email));
          }
          const coach = await db.select().from(coaches).where(eq(coaches.email, email)).execute();
          if (coach.length === 0 || !(await bcrypt.compare(password, coach[0].password))) {
            return null; // Invalid credentials
          }

          if (coach[0].status === "Deactivated") {
            throw new Error("Your account has been deactivated.");
          }

          else {
            if (enterprise_id) {
              newEnterpriseID=enterprise_id;
            }
            else{
              newEnterpriseID=coach[0]?.enterprise_id;
            }
            return {
              id: coach[0].id.toString(),
              name: coach[0].firstName,
              email: coach[0].email,
              coachCurrency: coach[0].currency,
              expectedCharge: coach[0].expectedCharge,
              type: 'coach', // Custom field indicating coach or player
              image: coach[0].image === 'null' ? '/default.jpg' : coach[0].image,
              coach_id: coach[0].id,
              club_id: newEnterpriseID,
              club_name: club && club.length > 0 ? club[0].organizationName ?? '' : '',
              added_by: null,
              teamId: teamId,
              visibility: coach[0].visibility,
              isCompletedProfile: coach[0].isCompletedProfile
            };
          }
        } else if (loginAs === 'player') {
          if (enterprise_id) {
            await db.update(users)
              .set({ enterprise_id: enterprise_id }) // Fields to update
              .where(eq(users.email, email));
          }
          // Condition
          const user = await db.select().from(users).where(eq(users.email, email.toLowerCase())).execute();
          if (user.length === 0 || !(await bcrypt.compare(password, user[0].password))) {
            return null; // Invalid credentials
          }
          if (user[0].status === "Deactivated") {
            throw new Error("Your account has been deactivated.");
          }
          else {
            if (user[0].enterprise_id) {
              club = await db.select().from(enterprises).where(eq(enterprises.id, Number(user[0].enterprise_id))).execute();
            }
            return {
              id: user[0].id.toString(),
              name: user[0].first_name,
              email: user[0].email,
              type: 'player', // Custom field indicating player
              image: user[0].image === 'null' ? '/default.jpg' : user[0].image,
              expectedCharge: 0,
              coach_id: user[0].coach_id,
              club_id: enterprise_id ? enterprise_id : user[0]?.enterprise_id ?? '',
              club_name: user[0].team,
              teamName:user[0].team,
              added_by: null,
              teamId: teamId,
              visibility: user[0].visibility,
              isCompletedProfile: user[0].isCompletedProfile
            };
          }
        }
        else if (loginAs === 'team') {
          const team = await db.select().from(teams).where(eq(teams.manager_email, email)).execute();
          if (team.length === 0 || !team[0].password || !(await bcrypt.compare(password, team[0].password))) {
            return null; // Invalid credentials
          }

          else {
            if (team[0].creator_id) {
              club = await db.select().from(enterprises).where(eq(enterprises.id, Number(team[0].creator_id))).execute();
            }
            return {
              id: team[0].id.toString(),
              name: team[0].manager_name,
              email: team[0].manager_email,
              type: 'team', // Custom field indicating player
              image: team[0].logo === 'null' ? '/default.jpg' : team[0].logo,
              expectedCharge: 0,
              coach_id: team[0].coach_id,
              visibility: 'on',
              club_name: club && club.length > 0 ? club[0].organizationName ?? '' : '', added_by: null
            };
          }
        }
        else if (loginAs === 'enterprise') {
          const enterprise = await db.select().from(enterprises).where(eq(enterprises.email, email)).execute();
          if (enterprise.length === 0 || !(await bcrypt.compare(password, enterprise[0].password))) {
            return null; // Invalid credentials
          } 
          else if (enterprise[0].status === "Deactivated") {
            throw new Error("Your account has been deactivated.");
          }
          else {
            return {
              id: enterprise[0].id.toString(),
              name: enterprise[0].organizationName,
              email: enterprise[0].email,
              package_id: enterprise[0].package_id,
              expectedCharge: 0,
              type: 'enterprise', // Custom field indicating player
              image: enterprise[0].logo,
              view_evaluation: enterprise[0].view_evaluation,
              buy_evaluation: enterprise[0].buy_evaluation,
              coach_id: null,
              club_id: enterprise[0].id.toString(),
              visibility: 'on',
              added_by: null
            };

          }
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: SECRET_KEY ?? process.env.NEXTAUTH_SECRET
  },
  callbacks: {

    async jwt({ token, user, trigger, session }) {
      // Check if the user exists and is of the correct type
      if (user) {
        const extendedUser = user as ExtendedUser; // Cast the user to the extended type
        token.id = extendedUser.id;
        token.type = extendedUser.type; // Add user type (coach or player) to the token
        token.image = extendedUser.image;
        token.coach_id = extendedUser.coach_id;
        token.club_id = extendedUser.club_id;
        token.image = extendedUser.image;
        token.expectedCharge = extendedUser.expectedCharge;
        token.coachCurrency = extendedUser.coachCurrency;
        token.club_name = extendedUser.club_name;
        token.added_by = extendedUser.added_by;
        token.visibility = extendedUser.visibility;
        token.teamId = extendedUser.teamId;
        token.buy_evaluation = extendedUser.buy_evaluation;
        token.view_evaluation = extendedUser.view_evaluation;
        token.isCompletedProfile = extendedUser.isCompletedProfile;
        
        if (extendedUser.package_id) {
          token.package_id = extendedUser.package_id; // Add package_id to the token if available (enterprise)
        }
      }
      if (trigger === 'update') {
        return { ...token, isCompletedProfile: session.user.isCompletedProfile, club_id: session.user.club_id };
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.type = token.type as string; // Add the type to the session
        session.user.name = token.name as string; // Add the type to the session
        session.user.coachCurrency = token.coachCurrency as string; // Add the type to the session
        session.user.image = token.image as string | null;
        session.user.coach_id = token.coach_id as string | null; // Add the type to the session
        session.user.club_id = token.club_id as string | null;
        // session.user.image = token.image as string | null;
        session.user.expectedCharge = token.expectedCharge as string | null;
        session.user.club_name = token.club_name as string | null;
        session.user.added_by = token.added_by as string | null;
        session.user.visibility = token.visibility as string | null;
        session.user.teamId = token.teamId as string | null;
        session.user.buy_evaluation = token.buy_evaluation as string | null;
        session.user.view_evaluation = token.view_evaluation as string | null;
        session.user.isCompletedProfile = token.isCompletedProfile as boolean;
          //token.expectedCharge = extendedUser.expectedCharge;
        if (token.package_id) {
          session.user.package_id = token.package_id as string | null; // Add package_id to the session
        }
      }

      if (session.user.type == 'coach') {
        const updatedUser = await db.select().from(coaches).where(eq(coaches.id, Number(session.user.id))).execute();
        if (updatedUser.length > 0) {
          const user = updatedUser[0];
          session.user.name = user.firstName;
          session.user.image = user.image === 'null' ? '/default.jpg' : user.image;

          session.user.visibility = user.visibility;
        }
      }
      if (session.user.type == 'player') {
        const updatedUser = await db.select().from(users).where(eq(users.id, Number(session.user.id))).execute();
        if (updatedUser.length > 0) {
          const user = updatedUser[0];
          session.user.name = user.first_name;
          session.user.image = user.image === 'null' ? '/default.jpg' : user.image;

          session.user.visibility = user.visibility;
        }
      }
      if (session.user.type == 'team') {
        const updatedUser = await db.select().from(teams).where(eq(teams.id, Number(session.user.id))).execute();
        if (updatedUser.length > 0) {
          const user = updatedUser[0];
          session.user.name = user.team_name;
          session.user.image = user.logo === 'null' ? '/default.jpg' : user.logo;

          session.user.visibility = user.visibility;
        }
      }
      



      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});

// You need to export handler as GET and POST since this is now a Route Handler in the app directory
export { handler as GET, handler as POST };