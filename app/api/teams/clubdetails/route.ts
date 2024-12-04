import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { teams, playerEvaluation, users, teamPlayers, coaches, enterprises } from '../../../../lib/schema'
import debug from 'debug';
import { desc, eq, asc } from 'drizzle-orm';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import next from 'next';
import { SECRET_KEY } from '@/lib/constants';

export async function POST(req: NextRequest) {
    const { club_id, coach_id } = await req.json();
    const clubData=await db.select({enterprises:enterprises.organizationName}).from(enterprises).where(eq(enterprises.id,club_id)).execute();
    const coachData=await db.select({firstName:coaches.firstName, lastName:coaches.lastName}).from(coaches).where(eq(coaches.id,coach_id)).execute();
    return NextResponse.json({clubData,coachData});
}