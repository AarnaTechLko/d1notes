import { NextResponse } from 'next/server';
import { compare, hash } from 'bcryptjs'; // Correct bcrypt import
import { db } from '@/lib/db'; // Adjust this import based on your database setup
import { getSession } from 'next-auth/react';
import { coaches, enterprises, teams, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { useId } from 'react';

export async function POST(request: Request) {
    try {
        const { currentPassword, newPassword, user_type, user_id } = await request.json();
     

        let query;

        if (user_type === 'player') {
            query = await db.select().from(users).where(eq(users.id, user_id)).limit(1); // Ensure we get a single result
        } else if (user_type === 'coach') {
            query = await db.select().from(coaches).where(eq(coaches.id, user_id)).limit(1);
        } else if (user_type === 'enterprise') {
            query = await db.select().from(enterprises).where(eq(enterprises.id, user_id)).limit(1);
        } else if (user_type === 'team') {
            query = await db.select().from(teams).where(eq(teams.id, user_id)).limit(1);
        } else {
            return NextResponse.json(
                { message: 'Invalid user type' },
                { status: 400 }
            );
        }


        if (!query || query.length === 0) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }


        const user = query[0];


        if (!user.password) {
            return NextResponse.json(
                { message: 'Password not found' },
                { status: 500 }
            );
        }


        const passwordMatch = await compare(currentPassword, user.password);

        if (!passwordMatch) {
            return NextResponse.json(
                { message: 'Current password is incorrect' },
                { status: 400 }
            );
        }


        const hashedPassword = await hash(newPassword, 10);


        if (user_type === 'player') {
            query = await db.update(users)
                .set({ password: hashedPassword })
                .where(eq(users.id, user_id));
        } else if (user_type === 'coach') {
            query = await db.update(coaches)
            .set({ password: hashedPassword })
            .where(eq(coaches.id, user_id));
        } else if (user_type === 'enterprise') {
            query = await db.update(enterprises)
                .set({ password: hashedPassword })
                .where(eq(enterprises.id, user_id));
        } else if (user_type === 'team') {
            query = await db.update(teams)
            .set({ password: hashedPassword })
            .where(eq(teams.id, user_id));
        } else {
            return NextResponse.json(
                { message: 'Invalid user type' },
                { status: 400 }
            );
        }



        return NextResponse.json(
            { message: 'Password changed successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
