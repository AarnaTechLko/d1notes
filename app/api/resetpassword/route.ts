import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/helpers';
import { db } from '../../../lib/db';
import { hash } from 'bcryptjs';
import { coaches, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    const { userId, newPassword, type } = await req.json();
    let userQuery: any[] = [];
    const hashedPassword = await hash(newPassword, 10);
    let email;
    let name;
    if (type == "coach") {
        userQuery = await db.select().from(coaches).where(eq(coaches.id, userId));
        email = userQuery[0].email;
        name = userQuery[0].firstName;
        await db.update(coaches)
            .set({ password: hashedPassword })
            .where(eq(coaches.id, userId));
    }
    else if (type == "player") {
        userQuery = await db.select().from(users).where(eq(users.id, userId));
        email = userQuery[0].email;
        name = userQuery[0].first_name;
        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, userId));
    }
    if (userQuery.length > 0) {

    } else {

        return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const emailResult = await sendEmail({
        to: email,
        subject: "D1 NOTES Registration OTP",
        text: "D1 NOTES Registration",
        html: `<p>Dear ${name}! Your password has been reset by the club admin. Your new password  is ${newPassword}.</p>`,
    });


    return NextResponse.json({ message: "Password successfully reset." }, { status: 200 });
}
