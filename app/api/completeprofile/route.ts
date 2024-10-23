import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../lib/db';
import { users } from '../../../lib/schema';
import { eq } from 'drizzle-orm';
import debug from 'debug';
 
import { SECRET_KEY } from '@/lib/constants';

export async function PATCH(req: NextRequest) {
  const logError = debug('app:error');

  try {
    // Parse the request body
    const body = await req.json();

    
    const {
      email,
      password,
      first_name,
      last_name,
      grade_level,
      location,
      birthday,
      gender,
      sport,
      team,
      position,
      number,
      image,
      playerID,
      country,
      bio,
      state,
      city
    } = body;

    // Update the user in the database
    const updatedUser = await db
      .update(users)
      .set({
        first_name: first_name || undefined,
        last_name: last_name || undefined,
        grade_level: grade_level || undefined,
        location: location || undefined,
        birthday: birthday || undefined,
        gender: gender || undefined,
        sport: sport || undefined,
        team: team || undefined,
        position: position || undefined,
        number: number || undefined,
        image: image || undefined,
        country: country || undefined,
        state: state || undefined,
        city: city || undefined,
      })
      .where(eq(users.id,playerID)) // Update by user ID
      .returning();

    // Respond with the updated user data
    return NextResponse.json({ message: 'User updated successfully', user: updatedUser }, { status: 200 });

  } catch (error) {
    logError('Error updating user: %O', error);
    return NextResponse.json({ message: 'Error updating user' }, { status: 500 });
  }
}
