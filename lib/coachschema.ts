// @ts-ignore
import {
    pgTable,
    serial,
    text,
    varchar,
    timestamp,
    uniqueIndex,
    date,
    integer
  } from "drizzle-orm/pg-core";
  
  export const coaches = pgTable(
    "coaches",
    {
      id: serial("id").primaryKey(),
      first_name: varchar("first_name").notNull(),
      last_name: varchar("last_name").notNull(),
      experience_years: integer("experience_years").notNull(),
      certification_level: varchar("certification_level"),
      location: varchar("location").notNull(),
      gender: varchar("gender"),
      sport: varchar("sport").notNull(),
      team: varchar("team"),
      email: varchar("email").notNull().unique(),
      phone: varchar("phone").notNull(),
      image: text("image"),
      password: text("password").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
    },
    (coaches) => {
      return {
        uniqueIdx: uniqueIndex("unique_idx").on(coaches.email),
      };
    }
  );
  