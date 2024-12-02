import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { users, otps, licenses,teamPlayers } from '../../../../lib/schema'
import debug from 'debug';
import { eq, and, gt, or , ilike, count, desc,isNull,sql } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';
 
import { SECRET_KEY } from '@/lib/constants';
import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken';
import next from 'next';

export async function POST(req: NextRequest) {
const {enterprise_id, teamId}=await req.json();
const players = await db.execute(
    sql`SELECT id, first_name, last_name,position,location,height,weight,team,grade_level, image FROM users WHERE id NOT IN (SELECT player_id FROM "teamPlayers" where team_id=${teamId}) and status='Active' and enterprise_id=${enterprise_id}`
  );


return NextResponse.json(players.rows, { status: 200 });

}