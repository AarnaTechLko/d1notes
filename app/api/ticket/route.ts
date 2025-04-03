import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { ticket } from '@/lib/schema';

export async function POST(req: Request) {
  try {
    const { name, email, subject, message,assign_to } = await req.json();

    // Insert the ticket into the database
    const result = await db.insert( ticket).values({
      name,
      email,
      subject,
      message,
      assign_to,
    });

    return NextResponse.json({ message: 'Ticket created successfully', result }, { status: 200 });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json({ error: "Error creating ticket" }, { status: 500 });
  }
}
