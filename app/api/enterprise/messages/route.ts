import { NextRequest, NextResponse } from 'next/server';
import { eq, and, sql, desc,or } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { chats, coaches, users }  from '../../../../lib/schema'
 
export async function GET(req: NextRequest) { 
  return NextResponse.json({ message: 'Failed to fetch coaches' }, { status: 500 });
}
