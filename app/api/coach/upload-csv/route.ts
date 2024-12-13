import { NextRequest, NextResponse } from "next/server";
import multer from "multer";
import { hash } from 'bcryptjs';
import { parse } from "papaparse";
import fs from "fs/promises";
import path from "path";
import { db } from '../../../../lib/db';
import { eq } from "drizzle-orm";
import { users } from '../../../../lib/schema';

// Define the type of your CSV rows
interface CSVRow {
    FirstName: string; // Replace with actual column names and types
    LastName: string; // Replace as needed
    Gender: string; // Replace as needed
    Email: string; // Replace as needed
    CountryCode: string; // Replace as needed
    Country: string; // Replace as needed
    Sport: string; // Replace as needed
    Team: string; // Replace as needed
    Position: string; // Replace as needed
    State: string; // Replace as needed
    City: string; // Replace as needed
    League: string; // Replace as needed
    Experience: string; // Replace as needed
    PhoneNumber: string; // Replace as needed
    BirthDay: string; // Replace as needed
    Password: string; // Replace as needed
    
  }

// Configure multer for file handling
const upload = multer({
  storage: multer.diskStorage({
    destination: "./uploads", // Temporary folder
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
});

export async function POST(req: NextRequest) {
  try {
    // Parse multipart form-data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const coach_id = formData.get("coach_id") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Save file to disk temporarily
    const tempPath = path.join("./uploads", file.name);
    await fs.writeFile(tempPath, Buffer.from(await file.arrayBuffer()));

    // Parse CSV file
    const fileContents = await fs.readFile(tempPath, "utf-8");
    const { data, errors } = parse<CSVRow>(fileContents, { header: true });
   
    if (errors.length > 0) {
      return NextResponse.json({ error: "CSV parsing failed", details: errors }, { status: 400 });
    }

    // Insert parsed data into the database
    const insertData = await Promise.all(
        data.map(async (row) => ({
          first_name: row.FirstName,
          last_name: row.LastName,
          gender: row.Gender,
          email: row.Email,
          countrycode: row.CountryCode,
          number: row.PhoneNumber,
          sport: row.Sport,
          team: row.Team,
          position: row.Position,
          country: row.Country,
          state: row.State,
          city: row.City,
          league: row.League,
          bio: row.Experience,
          birthday: row.BirthDay,
          coach_id: coach_id,
          password: await hash(row.Password, 10), // Hashing the password
          // Map the rest of the columns if needed
        }))
      );
    
    await db.insert(users).values(insertData);

    // Cleanup temporary file
    await fs.unlink(tempPath);

    return NextResponse.json({ message: "Data inserted successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};

 