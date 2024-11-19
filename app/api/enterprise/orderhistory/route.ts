import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '../../../../lib/db';
import {packages, orderHistory, enterprises} from '../../../../lib/schema';

import { eq, and, gt,desc } from 'drizzle-orm';

export async function POST(req: NextRequest) {

const {enterprise_id}= await req.json();
const orderWithPackageDetails = await db
  .select({
    orderId: orderHistory.id,
    packageName: packages.packageName,
    orderStatus: orderHistory.status,
    orderDate: orderHistory.createdAt,
    amount: orderHistory.amount,
    description: orderHistory.description,
  })
  .from(orderHistory)
  .innerJoin(packages, eq(orderHistory.package_id, packages.id))
  .innerJoin(enterprises, eq(orderHistory.enterprise_id, enterprises.id))  // Adding the join to enterprises
  .where(
    and(
    eq(orderHistory.enterprise_id, enterprise_id),
    eq(orderHistory.status, 'paid'),
    eq(enterprises.id, enterprise_id)
    )
  )  // Combining both conditions
  .orderBy(desc(orderHistory.createdAt));

return NextResponse.json({ orderWithPackageDetails}, { status: 200 });

}
