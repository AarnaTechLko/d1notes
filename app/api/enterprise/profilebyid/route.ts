import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import { coaches, enterprises,joinRequest, playerEvaluation, teams, countries, users, states } from '../../../../lib/schema'
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
        const clubDetails=await db.select({
           
           organizationName: enterprises.organizationName,
             contactPerson: enterprises.contactPerson,
             owner_name: enterprises.owner_name,
             package_id: enterprises.package_id,
             email: enterprises.email,
             mobileNumber: enterprises.mobileNumber,
             countryCodes: enterprises.countryCodes,
             address: enterprises.address,
             country:enterprises.country,
             countryName:countries.name,
             state: enterprises.state,
             stateName: states.name,
             city: enterprises.city,
             logo: enterprises.logo,
             affiliationDocs: enterprises.affiliationDocs,
             slug: enterprises.slug,
             parent_id: enterprises.parent_id,
             role_id: enterprises.role_id,
             buy_evaluation: enterprises.buy_evaluation,
             view_evaluation:enterprises.view_evaluation,
             password: enterprises.password,
             description: enterprises.description,
             facebook: enterprises.facebook,
             instagram: enterprises.instagram,
             linkedin: enterprises.linkedin,
             xlink: enterprises.xlink,
             youtube:enterprises.youtube,

    }).from(enterprises).leftJoin( 
              countries,
              eq(countries.id, isNaN(Number(enterprises.country)) ? 231 : Number(enterprises.country)) 
            ).leftJoin(
                states,
                eq(states.id, isNaN(Number(enterprises.state)) ? 231 : Number(enterprises.state)) 
              ).where(eq(enterprises.id,clubid));
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
const {organizationName, id, contactPerson, owner_name,address, affiliationDocs, city ,country,countryCodes,email,logo,mobileNumber,state,facebook,linkedin,instagram,xlink,youtube} =await req.json();
 
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
            state: state,
            facebook:facebook,
            linkedin:linkedin,
            instagram: instagram,
            xlink: xlink,
            youtube: youtube,
        
        }).where(eq(enterprises.id,id));
        return NextResponse.json({ message: 'Club updated' }, { status: 200 });
    } catch (error) {
        
        return NextResponse.json({ message: 'Failed to Update Clubs' }, { status: 500 });
    }

}