import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { ticket,admin,users ,ticket_messages} from '@/lib/schema';
import { ilike, desc, sql, count, or,eq } from 'drizzle-orm';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions"; // or wherever it's located

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id,name, email, subject, message } = await req.json();

    // Insert the ticket into the database
    const result = await db.insert(ticket).values({
      id,
      name,
      email,
      subject,
      message,
      assign_to: 0,
  ticket_from: parseInt(session.user.id),
  role: session.user.name, 
      status:"pending",
    }).returning(); // Ensure it returns the inserted data
    return NextResponse.json({ message: 'Ticket created successfully', ticket: result[0] }, { status: 200 });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json({ error: "Error creating ticket" }, { status: 500 });
  }
}

// GET: Fetch tickets with optional filters, pagination & search
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const userId = parseInt(session.user.id); // Ensure it's a number

    const url = new URL(req.url);
    const search = url.searchParams.get('search')?.trim() || '';  
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    
    const offset = (page - 1) * limit;
    
    const baseCondition = eq(ticket.ticket_from, userId);

    // Dynamic search conditions across multiple fields
    const whereClause = search
      ? or(
          ilike(ticket.name, `%${search}%`),
          ilike(ticket.email, `%${search}%`),
          ilike(ticket.subject, `%${search}%`),
          ilike(ticket.message, `%${search}%`)
        )
      : baseCondition;

    // Query to fetch tickets with additional aggregations (optional)
    const ticketsData = await db
      .select({
        id: ticket.id,
        name: ticket.name,
        email: ticket.email,
        subject: ticket.subject,
        message: ticket.message,
        assign_to:ticket.assign_to,
        ticket_from:ticket.ticket_from,
        status:ticket.status,
        role:ticket.role,
        assignToUsername: admin.username,
        createdAt: ticket.createdAt,
        ticketCount: sql<number>`COUNT(*) OVER()`, // Get total count without separate query
      })
      .from(ticket)
      .leftJoin(admin, eq(ticket.assign_to, admin.id)) // Join with the admin table
      .leftJoin(users, eq(ticket.ticket_from, users.id))

      .where(whereClause)
      .orderBy(desc(ticket.createdAt))
      .offset(offset)
      .limit(limit);
      

          // For each ticket, fetch the latest reply message
          const enrichedTickets = await Promise.all(
            ticketsData.map(async (t) => {
              const latestReply = await db
                .select({ message: ticket_messages.message })
                .from(ticket_messages)
                .where(eq(ticket_messages.ticket_id, t.id))
                .orderBy(desc(ticket_messages.createdAt))
                .limit(1);
          
              return {
                ...t,
                message: latestReply[0]?.message || t.message,
              };
            })
          );
      

    // Get total ticket count for pagination
    const totalCount = await db
      .select({ count: count() })
      .from(ticket)
      .where(whereClause)
      .then((result) => result[0]?.count || 0);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      tickets: enrichedTickets,
      currentPage: page,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      totalCount: totalCount
    });

  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to fetch tickets',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req:Request) {
  try {
    const url = new URL(req.url);
    const ticketId = url.searchParams.get("id");

    if (!ticketId) {
      return NextResponse.json({ message: "ticket ID is required" }, { status: 400 });
    }

    const ticketIdNumber = Number(ticketId);
    if (isNaN(ticketIdNumber)) {
      return NextResponse.json({ message: "Invalid ticket ID" }, { status: 400 });
    }

    // Delete the ticket by ID
    await db.delete(ticket).where(eq(ticket.id, ticketIdNumber));

    return NextResponse.json({ message: "ticket deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete ticket", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

