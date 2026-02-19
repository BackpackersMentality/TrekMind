import { db } from "./db";
import {
  treks,
  itineraryDays,
  type Trek,
  type ItineraryDay,
  type TrekDetail,
  type InsertTrek,
  type InsertItineraryDay
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getTreks(): Promise<Trek[]>;
  getTrek(id: number): Promise<TrekDetail | undefined>;
  getTrekBySlug(slug: string): Promise<TrekDetail | undefined>;
  createTrek(trek: InsertTrek): Promise<Trek>;
  createItineraryDay(day: InsertItineraryDay): Promise<ItineraryDay>;
  clearAll(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getTreks(): Promise<Trek[]> {
    return await db.select().from(treks);
  }

  async getTrek(id: number): Promise<TrekDetail | undefined> {
    const trek = await db.select().from(treks).where(eq(treks.id, id)).limit(1);
    if (trek.length === 0) return undefined;

    const itinerary = await db
      .select()
      .from(itineraryDays)
      .where(eq(itineraryDays.trekId, id))
      .orderBy(itineraryDays.dayNumber);

    return { ...trek[0], itinerary };
  }

  async getTrekBySlug(slug: string): Promise<TrekDetail | undefined> {
    const trek = await db.select().from(treks).where(eq(treks.slug, slug)).limit(1);
    if (trek.length === 0) return undefined;

    const itinerary = await db
      .select()
      .from(itineraryDays)
      .where(eq(itineraryDays.trekId, trek[0].id))
      .orderBy(itineraryDays.dayNumber);

    return { ...trek[0], itinerary };
  }

  async createTrek(trek: InsertTrek): Promise<Trek> {
    const [newTrek] = await db.insert(treks).values(trek).returning();
    return newTrek;
  }

  async createItineraryDay(day: InsertItineraryDay): Promise<ItineraryDay> {
    const [newDay] = await db.insert(itineraryDays).values(day).returning();
    return newDay;
  }

  async clearAll(): Promise<void> {
    await db.delete(itineraryDays);
    await db.delete(treks);
  }
}

export const storage = new DatabaseStorage();
