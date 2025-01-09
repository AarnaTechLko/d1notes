import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { coaches, enterprises,joinRequest, playerEvaluation, teams, users } from '../../../../lib/schema'
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
        const clubDetails=await db.select().from(enterprises).where(eq(enterprises.id,clubid));
        if(clubDetails.length>0)
        {
            return NextResponse.json(clubDetails);
        }
        else{

        }
        
    } catch (error) {
        const err = error as any;
        console.error('Error fetching enterprises:', error);
        return NextResponse.json({ message: 'Failed to fetch Clubs' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
const {organizationName, id, contactPerson, owner_name,address, affiliationDocs, city ,country,countryCodes,email,logo,mobileNumber} =await req.json();
 
try{
    await db.update(enterprises).set(
        { 
            organizationName: organizationName,
            contactPerson: contactPerson,
            owner_name: owner_name,
            address: address,
            affiliationDocs: affiliationDocs,
            city: city,
            country: country,
            countryCodes: countryCodes,
            email: email,
            logo: logo,
            mobileNumber: mobileNumber,
        
        }).where(eq(enterprises.id,id));
        return NextResponse.json({ message: 'Club updated' }, { status: 200 });
    } catch (error) {
        
        return NextResponse.json({ message: 'Failed to Update Clubs' }, { status: 500 });
    }

}