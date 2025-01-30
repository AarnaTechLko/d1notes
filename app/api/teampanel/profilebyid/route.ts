import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { coaches, teams,joinRequest, playerEvaluation, users } from '../../../../lib/schema'
import debug from 'debug';
import { eq ,and, isNotNull} from 'drizzle-orm';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import next from 'next';
import { SECRET_KEY } from '@/lib/constants';


export async function POST(req: NextRequest) {
    const { clubid } = await req.json();

    try {
        const clubDetails=await db.select().from(teams).where(eq(teams.id,clubid));
        if(clubDetails.length>0)
        {
            return NextResponse.json(clubDetails);
        }
        else{

        }
        
    } catch (error) {
        const err = error as any;
        console.error('Error fetching teams:', error);
        return NextResponse.json({ message: 'Failed to fetch Clubs' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
const {organizationName, id, contactPerson, owner_name,address, affiliationDocs, city ,country,countryCodes,email,logo,mobileNumber} =await req.json();
 
try{
    await db.update(teams).set(
        { 
            team_name: organizationName,
            manager_name: contactPerson,
         
            address: address,
            
            city: city,
            country: country,
            countryCodes: countryCodes,
            manager_email: email,
            logo: logo,
            manager_phone: mobileNumber,
        
        }).where(eq(teams.id,id));
        return NextResponse.json({ message: 'Club updated' }, { status: 200 });
    } catch (error) {
        
        return NextResponse.json({ message: 'Failed to Update Clubs' }, { status: 500 });
    }

}