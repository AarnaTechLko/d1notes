// @ts-ignore
import { Certificate } from "crypto";
import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  uniqueIndex,
  date,
  decimal,
  pgEnum,
  integer // Ensure integer is imported from drizzle-orm/pg-core
} from "drizzle-orm/pg-core";
import { number } from "zod";
 

// Users table
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    first_name: varchar("first_name"),
    last_name: varchar("last_name"),
    grade_level: varchar("grade_level"),
    location: varchar("location"),
    birthday: date("birthday"),
    gender: varchar("gender"),
    sport: varchar("sport"),
    team: varchar("team"),
    jersey:varchar("jersey"),
    position: varchar("position"),
    number: varchar("number"),
    email: varchar("email").notNull().unique(),
    image: text("image"),
    bio:text("bio"),
    country:varchar("country"),
    state:varchar("state"),
    city:varchar("city"),
    league:text("league"),
    countrycode:text("countrycode"),
    password: text("password").notNull(),
    enterprise_id: text("enterprise_id"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (users) => {
    return {
      uniqueIdx: uniqueIndex("users_unique_idx").on(users.email), // Renamed index for users
    };
  }
);

// Coaches table
export const coaches = pgTable(
  "coaches",
  {
    id: serial("id").primaryKey(),
    firstName: varchar("firstName"),
    lastName: varchar("lastName"),
    email: varchar("email"),
    phoneNumber: varchar("phoneNumber"),
    gender: varchar("gender"),
    location: varchar("location"),
    sport: varchar("sport"),
    clubName: varchar("clubName"),
    qualifications: text("qualifications"),
    expectedCharge: decimal("expectedCharge", { precision: 10, scale: 2 }), // Decimal type with precision and scale
    image: text("image"),
    slug: text("slug"),
    enterprise_id: text("enterprise_id"),
    country:varchar("country"),
    state:varchar("state"),
    city:varchar("city"),
    rating: integer("rating").default(0),
    password: text("password").notNull(),
    certificate:text("certificate"),
    countrycode:text("countrycode"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (coaches) => {
    return {
      uniqueIdx: uniqueIndex("coaches_unique_idx").on(coaches.email), // Renamed index for coaches
    };
  }
);

// Player Evaluation table


// 2. Use the defined enum type in your table schema
export const playerEvaluation = pgTable(
  "player_evaluation",
  {
    id: serial("id").primaryKey(),
    player_id: integer("player_id").notNull(),
    coach_id: integer("coach_id").notNull(),
    review_title: varchar("review_title").notNull(),
    primary_video_link: text("primary_video_link").notNull(),
    video_link_two: text("video_link_two"),
    video_link_three: text("video_link_three"),
    video_description: text("video_description").notNull(),
    status: integer("status").notNull(), // Use enum type here
    turnaroundTime: varchar("turnaroundTime"), // Use enum type here
    payment_status: varchar("payment_status"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    rating: integer("rating"), // New field for rating, nullable by default
    remarks: text("remarks"),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  }
);

// Payments table
export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),
    player_id: integer("player_id").notNull(),
    coach_id: integer("coach_id").notNull(),
    evaluation_id: integer("evaluation_id").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status"),
    payment_info: text("payment_info"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    description: text("description"),
  },
  (payments) => {
    return {
      uniqueIdx: uniqueIndex("payments_unique_idx").on(payments.player_id, payments.coach_id, payments.evaluation_id),
    };
  }
);

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  sessionToken: text('session_token').notNull().unique(),
  userId: serial('user_id').notNull(),
  expires: timestamp('expires').notNull(),
});

export const evaluationResults = pgTable('evaluation_results', {
  id: serial('id').primaryKey(),
  playerId: integer('playerId').notNull(),
  coachId: integer('coachId').notNull(),
  evaluationId: integer('evaluation_id').notNull(),
  finalRemarks: text('finalRemarks'),           // Long text for final remarks
  physicalRemarks: text('physicalRemarks'),     // Long text for physical remarks
  tacticalRemarks: text('tacticalRemarks'),     // Long text for tactical remarks
  technicalRemarks: text('technicalRemarks'),     // Long text for tactical remarks
  physicalScores: text('physicalScores').notNull(), // JSON field for physical scores
  tacticalScores: text('tacticalScores').notNull(), // JSON field for tactical scores
  technicalScores: text('technicalScores').notNull(), // JSON field for technical scores
});

export const otps = pgTable('otps', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  otp: text('otp').notNull()
});

export const enterprises=pgTable('enterprises', {
  id: serial('id').primaryKey(),
  organizationName: text('organizationName').notNull(),
  contactPerson: text('contactPerson').notNull(),
  package_id: integer('package_id'),
  email: text('email').notNull(),
  mobileNumber: text('mobileNumber'),
  countryCodes: text('countryCodes'),
  address: text('address'),
  country: text('country'),
  state: text('state'),
  city: text('city'),
  logo: text('logo'),
  affiliationDocs: text('affiliationDocs'),
  slug: text('slug'),
  password: text('password').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const packages=pgTable('packages', {
  id: serial('id').primaryKey(),
  packageName: text('packageName').notNull(),
  amount: text('amount').notNull(),
  noOfLicnese: integer('noOfLicnese'),
  details: text('details').notNull(),
  status:text('status').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const orderHistory=pgTable('orderHistory', {
  id: serial('id').primaryKey(),
  enterprise_id: integer('enterprise_id').notNull(),
  package_id: integer('package_id').notNull(),
  amount: text('amount').notNull(),
  description: text('description').notNull(),
  status:text('status').notNull(),
  payment_info:text('payment_info'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const licenses=pgTable('licenses', {
  id: serial('id').primaryKey(),
  enterprise_id: integer('enterprise_id').notNull(),
  package_id: integer('package_id').notNull(),
  payment_info:text('payment_info'),
  licenseKey: text('licenseKey').notNull(),
  used_for:text('used_for'),
  used_by:text('used_by'),
  status:text('status').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const forgetPassword=pgTable('forgetPassword', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  token: text('token').notNull(),
  role: text('role').notNull(),
 
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

