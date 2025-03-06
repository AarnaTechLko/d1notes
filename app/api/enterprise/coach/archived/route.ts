import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../../lib/db';
import { coaches, otps, licenses, coachaccount, playerEvaluation, teamCoaches } from '../../../../../lib/schema';
import debug from 'debug';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '@/lib/constants';
import { eq, isNotNull, and, between, lt, ilike, or, count, desc,sql } from 'drizzle-orm';
import { sendEmail } from '@/lib/helpers';
 

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';  // Default to empty string if not provided
    const page = parseInt(url.searchParams.get('page') || '1', 10);  // Default to 1 if not provided
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);  // Default to 10 if not provided
    const enterprise_id = url.searchParams.get('enterprise_id');  
    
    try {
      if (!enterprise_id) {
        return NextResponse.json(
          { message: 'Enterprise ID not found!' },
          { status: 500 }
        );
      }
  
      const offset = (page - 1) * limit;
  
      // Modify whereClause to also filter by status "Archived"
      const whereClause = search
        ? and(
            eq(coaches.enterprise_id, enterprise_id),
            eq(coaches.status, 'Archived'), // Filter only archived coaches
            or(
              ilike(coaches.firstName, `%${search}%`),
              ilike(coaches.email, `%${search}%`),
              ilike(coaches.phoneNumber, `%${search}%`)
            )
          )
        : and(
            eq(coaches.enterprise_id, enterprise_id),
            eq(coaches.status, 'Archived') // Filter only archived coaches
          );
  
      // Query to fetch coaches data with the necessary joins
      const coachesData = await db
        .select(
          {
            firstName: coaches.firstName,
            lastName: coaches.lastName,
            gender: coaches.gender,
            image: coaches.image,
            id: coaches.id,
            email: coaches.email,
            phoneNumber: coaches.phoneNumber,
            slug: coaches.slug,
            sport: coaches.sport,
            qualifications: coaches.qualifications,
            status: coaches.status,
            consumeLicenseCount: sql<number>`COUNT(CASE WHEN licenses.status = 'Consumed' THEN 1 END)`,
            assignedLicenseCount: sql<number>`COUNT(CASE WHEN licenses.status = 'Assigned' THEN 1 END)`,
            earnings: sql<number>`SUM(CASE WHEN coachaccount.coach_id = coaches.id THEN coachaccount.amount ELSE 0 END)`, // Sum of earnings
            totalEvaluations: sql<number>`COUNT(CASE WHEN player_evaluation.status = 2 THEN player_evaluation.id END)` // Total evaluations with status = 2
          }
        )
        .from(coaches)
        .leftJoin(licenses, sql`${licenses.assigned_to} = ${coaches.id}`)
        .leftJoin(coachaccount, sql`${coachaccount.coach_id} = ${coaches.id}`) // Join coachaccount table
        .leftJoin(playerEvaluation, sql`${playerEvaluation.coach_id} = ${coaches.id}`) // Join player_evaluation table
        .where(whereClause)
        .groupBy(
          coaches.id,
          coaches.firstName,
          coaches.lastName,
          coaches.gender,
          coaches.image,
          coaches.email,
          coaches.phoneNumber,
          coaches.slug,
          coaches.sport,
          coaches.qualifications,
          coaches.status
        )
        .offset(offset)
        .orderBy(desc(coaches.createdAt))
        .limit(limit);
  
      // Query to get the total count of archived coaches
      const totalCount = await db
        .select({ count: count() })  // Use raw SQL for COUNT(*) function
        .from(coaches)
        .where(whereClause)
        .then((result) => result[0]?.count || 0);
  
      // Query to get the total count of free licenses for the specified enterprise
      const totalLicensesCount = await db
        .select({
          count: sql<number>`COUNT(*)`
        })
        .from(licenses)
        .where(
          and(
            eq(licenses.status, 'Free'),
            eq(licenses.enterprise_id, Number(enterprise_id)) // Replace `enterprise_id` with the desired variable or value
          )
        );
  
      const totalPages = Math.ceil(totalCount / limit);
      return NextResponse.json({ coaches: coachesData, totalLicensesCount: totalLicensesCount, totalPages });
  
    } catch (error) {
      return NextResponse.json(
        { 
          message: 'Failed to fetch coaches', 
          error: error instanceof Error ? error.message : String(error) // Include the error message in the response
        },
        { status: 500 }
      );
    }
  }

  /* restore */
  export async function PUT(req: NextRequest) {
    try {
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ success: false, message: 'Coach ID is required' }, { status: 400 });
        }

        // Update the coach's status to 'Active'
        await db.update(coaches).set({ status: 'Active' }).where(eq(coaches.id, id));

        return NextResponse.json({ success: true, message: 'Coach restored successfully' });
    } catch (error) {
        console.error('Error restoring coach:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}


  
  
  // ---------------------- PERMANENT DELETE TEAM ----------------------
  export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ success: false, message: 'Coach ID is required' }, { status: 400 });
        }

        // Permanently delete the coach
        await db.delete(coaches).where(eq(coaches.id, id));

        return NextResponse.json({ success: true, message: 'Coach deleted successfully' });
    } catch (error) {
        console.error('Error deleting coach:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}


