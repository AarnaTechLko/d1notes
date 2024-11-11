// app/api/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "../../../lib/db";
import { users, coaches } from "../../../lib/schema";
import debug from "debug";
import { eq } from "drizzle-orm";
import { SECRET_KEY } from "@/lib/constants";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  const logError = debug("app:error");

  try {
    const { email, password, loginAs } = await req.json();

    if (loginAs === "coach") {
      const coach = await db
        .select()
        .from(coaches)
        .where(eq(coaches.email, email))
        .execute();

      if (coach.length === 0 || !(await bcrypt.compare(password, coach[0].password))) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      } else {
        const payload = {
          name: coach[0].firstName,
          id: coach[0].id,
          type: "coach",
          image: coach[0].image,
        };
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
        return NextResponse.json({ token, type: "coach" });
      }
    }

    if (loginAs === "player") {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .execute();

      if (user.length === 0 || !(await bcrypt.compare(password, user[0].password))) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      } else {
        const payload = {
          name: user[0].first_name,
          id: user[0].id,
          type: "player",
          image: user[0].image,
        };
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });
        return NextResponse.json({ token, type: "player" });
      }
    }

    // If loginAs is neither 'coach' nor 'player'
    return NextResponse.json({ error: "Invalid login type" }, { status: 400 });

  } catch (error) {
    logError("Error during registration:", error); // Log the error for debugging
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
