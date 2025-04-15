

import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { ticket, admin } from '@/lib/schema'; // Import admin schema
import { eq } from 'drizzle-orm'; // Ensure eq is imported correctly

export async function POST(req: Request) {
  try {
    const { ticketId, assignTo } = await req.json();

    // Validate the input data
    if (!ticketId || !assignTo) {
      return NextResponse.json({ error: "Ticket ID and sub-admin ID are required" }, { status: 400 });
    }

    // Log the received data for debugging
    console.log(`Assigning ticket ID: ${ticketId} to sub-admin ID: ${assignTo}`);

    // Perform the update operation in the ticket table
    const updatedTicket = await db
      .update(ticket)
      .set({ assign_to: assignTo })
      .where(eq(ticket.id, ticketId))
      .returning();

    // Check if any ticket was updated
    if (updatedTicket.length === 0) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Fetch the assigned sub-admin username using a join query
    const assignedTicket = await db
      .select({
        id: ticket.id,
        assignToUsername: admin.username, // Get the sub-admin username
      })
      .from(ticket)
      .leftJoin(admin, eq(ticket.assign_to, admin.id)) // Join with the admin table
      .where(eq(ticket.id, ticketId));

    // Check if we got the assigned sub-admin details
    if (assignedTicket.length === 0) {
      return NextResponse.json({ error: "Assigned sub-admin not found" }, { status: 404 });
    }

    // Return the updated ticket with assigned username
    return NextResponse.json({
      message: "Ticket successfully assigned",
      ticket: {
        id: assignedTicket[0].id,
        assign_to: assignedTicket[0].assignToUsername, // Convert ID to username
      }
    }, { status: 200 });

  } catch (error) {
    // Log the detailed error for debugging
    console.error("Error assigning sub-admin:", error);

    // Provide more specific error response
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error assigning sub-admin"
    }, { status: 500 });
  }
}

