import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import {users} from '../../../../lib/schema'
import debug from 'debug';
import { eq, sql,inArray,and,ne } from 'drizzle-orm';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import next from 'next';
import { SECRET_KEY } from '@/lib/constants';


export async function POST(req: NextRequest) {
    const { playerId } = await req.json();

    const childrenQuery=await db.select(
        {
            id:users.id,
            first_name:users.first_name,
            last_name:users.last_name,
            image:users.image,
           
        }
    ).from(users).where(eq(users.parent_id,playerId)).execute();



    return NextResponse.json(childrenQuery, { status: 200 });
}