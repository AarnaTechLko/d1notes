import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { users, otps, licenses } from '../../../../lib/schema'
import debug from 'debug';
import { eq, and, gt, or , ilike, count, desc } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';
 
import { SECRET_KEY } from '@/lib/constants';
import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken';
import next from 'next';

export async function POST(req: NextRequest) {
const {enterprise_id}=await req.json();


const players=await db.select({
    id: users.id,
    first_name: users.first_name,
    last_name: users.last_name,
    image: users.image}).from(users).where(eq(users.coach_id,enterprise_id));

return NextResponse.json(players, { status: 200 });

}