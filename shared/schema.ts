import { pgTable, text, serial, integer, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===

export const treks = pgTable("treks", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  region: text("region").notNull(),
  country: text("country").notNull(),
  durationDays: integer("duration_days").notNull(),
  distanceKm: integer("distance_km").notNull(),
  maxAltitudeM: integer("max_altitude_m").notNull(),
  difficulty: text("difficulty").notNull(),
  bestSeason: text("best_season").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  heroImage: text("hero_image").notNull(),
  riskAltitude: boolean("risk_altitude").notNull().default(false),
  riskWeather: boolean("risk_weather").notNull().default(false),
  riskRemoteness: boolean("risk_remoteness").notNull().default(false),
  riskPermitsRequired: boolean("risk_permits_required").notNull().default(false),
});

export const itineraryDays = pgTable("itinerary_days", {
  id: serial("id").primaryKey(),
  trekId: integer("trek_id").notNull(),
  dayNumber: integer("day_number").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  distanceKm: integer("distance_km"), // Optional in prompt
  altitudeM: integer("altitude_m"), // Renamed from maxAltitudeM to match prompt and made optional
  elevationGainM: integer("elevation_gain_m"), // Keeping for schema completeness but optional
  elevationLossM: integer("elevation_loss_m"),
  campType: text("camp_type"),
});

// === RELATIONS ===

export const treksRelations = relations(treks, ({ many }) => ({
  itinerary: many(itineraryDays),
}));

export const itineraryDaysRelations = relations(itineraryDays, ({ one }) => ({
  trek: one(treks, {
    fields: [itineraryDays.trekId],
    references: [treks.id],
  }),
}));

// === SCHEMAS ===

export const insertTrekSchema = createInsertSchema(treks);
export const insertItineraryDaySchema = createInsertSchema(itineraryDays);

// === TYPES ===

export type Trek = typeof treks.$inferSelect;
export type InsertTrek = z.infer<typeof insertTrekSchema>;

export type ItineraryDay = typeof itineraryDays.$inferSelect;
export type InsertItineraryDay = z.infer<typeof insertItineraryDaySchema>;

export type TrekDetail = Trek & { itinerary: ItineraryDay[] };
