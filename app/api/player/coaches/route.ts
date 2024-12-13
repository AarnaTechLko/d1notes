import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { teams, playerEvaluation, users, teamPlayers, coaches, playerbanner } from '../../../../lib/schema'
import debug from 'debug';
import { eq, sql,inArray,and,ne } from 'drizzle-orm';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import next from 'next';
import { SECRET_KEY } from '@/lib/constants';


export async function POST(req: NextRequest) {
    const { clubId } = await req.json();

    const coachQuery=await db.select().from(coaches).where(eq(coaches.enterprise_id,clubId)).execute();



    return NextResponse.json(coachQuery, { status: 200 });
}