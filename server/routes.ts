import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.treks.list.path, async (req, res) => {
    const treksList = await storage.getTreks();
    res.json(treksList);
  });

  app.get(api.treks.get.path, async (req, res) => {
    // Check if it's a numeric ID or a slug
    const id = req.params.id;
    let trek;
    if (/^\d+$/.test(id)) {
      trek = await storage.getTrek(Number(id));
    } else {
      trek = await storage.getTrekBySlug(id);
    }
    
    if (!trek) {
      return res.status(404).json({ message: "Trek not found" });
    }
    res.json(trek);
  });

  // Seed data function
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingTreks = await storage.getTreks();
  if (existingTreks.length > 0) return;

  const treksJson = [
    {
      "id": "annapurna-circuit",
      "name": "Annapurna Circuit",
      "region": "Himalayas",
      "country": "Nepal",
      "duration_days": 14,
      "distance_km": 160,
      "max_altitude_m": 5416,
      "difficulty": "Hard",
      "best_season": "March–May, September–November",
      "risk": {
        "altitude": true,
        "weather": true,
        "remoteness": true,
        "permits_required": true
      },
      "latitude": 28.5983,
      "longitude": 83.9311,
      "hero_image": "/images/annapurna.jpg"
    },
    {
      "id": "tour-du-mont-blanc",
      "name": "Tour du Mont Blanc",
      "region": "Alps",
      "country": "France / Italy / Switzerland",
      "duration_days": 11,
      "distance_km": 170,
      "max_altitude_m": 2665,
      "difficulty": "Moderate",
      "best_season": "June–September",
      "risk": {
        "altitude": false,
        "weather": true,
        "remoteness": false,
        "permits_required": false
      },
      "latitude": 45.8326,
      "longitude": 6.8652,
      "hero_image": "/images/tmb.jpg"
    },
    {
      "id": "torres-del-paine-o",
      "name": "Torres del Paine O Circuit",
      "region": "Patagonia",
      "country": "Chile",
      "duration_days": 8,
      "distance_km": 130,
      "max_altitude_m": 1200,
      "difficulty": "Hard",
      "best_season": "November–March",
      "risk": {
        "altitude": false,
        "weather": true,
        "remoteness": true,
        "permits_required": true
      },
      "latitude": -50.9423,
      "longitude": -73.4068,
      "hero_image": "/images/torres.jpg"
    },
    {
      "id": "alta-via-1",
      "name": "Alta Via 1",
      "region": "Dolomites",
      "country": "Italy",
      "duration_days": 10,
      "distance_km": 120,
      "max_altitude_m": 2750,
      "difficulty": "Moderate",
      "best_season": "July–September",
      "risk": {
        "altitude": false,
        "weather": true,
        "remoteness": false,
        "permits_required": false
      },
      "latitude": 46.4102,
      "longitude": 12.2231,
      "hero_image": "/images/altavia1.jpg"
    },
    {
      "id": "kilimanjaro",
      "name": "Mount Kilimanjaro",
      "region": "East Africa",
      "country": "Tanzania",
      "duration_days": 7,
      "distance_km": 65,
      "max_altitude_m": 5895,
      "difficulty": "Hard",
      "best_season": "January–March, June–October",
      "risk": {
        "altitude": true,
        "weather": true,
        "remoteness": false,
        "permits_required": true
      },
      "latitude": -3.0674,
      "longitude": 37.3556,
      "hero_image": "/images/kilimanjaro.jpg"
    },
    {
      "id": "pacific-crest-trail",
      "name": "Pacific Crest Trail (Section)",
      "region": "North America",
      "country": "USA",
      "duration_days": 30,
      "distance_km": 430,
      "max_altitude_m": 4009,
      "difficulty": "Extreme",
      "best_season": "June–September",
      "risk": {
        "altitude": true,
        "weather": true,
        "remoteness": true,
        "permits_required": true
      },
      "latitude": 36.7783,
      "longitude": -119.4179,
      "hero_image": "/images/pct.jpg"
    },
    {
      "id": "routeburn-track",
      "name": "Routeburn Track",
      "region": "South Island",
      "country": "New Zealand",
      "duration_days": 3,
      "distance_km": 33,
      "max_altitude_m": 1255,
      "difficulty": "Moderate",
      "best_season": "November–April",
      "risk": {
        "altitude": false,
        "weather": true,
        "remoteness": false,
        "permits_required": true
      },
      "latitude": -44.7397,
      "longitude": 168.0848,
      "hero_image": "/images/routeburn.jpg"
    },
    {
      "id": "everest-base-camp",
      "name": "Everest Base Camp",
      "region": "Himalayas",
      "country": "Nepal",
      "duration_days": 12,
      "distance_km": 130,
      "max_altitude_m": 5364,
      "difficulty": "Hard",
      "best_season": "March–May, September–November",
      "risk": {
        "altitude": true,
        "weather": true,
        "remoteness": true,
        "permits_required": true
      },
      "latitude": 28.0043,
      "longitude": 86.8571,
      "hero_image": "/images/ebc.jpg"
    },
    {
      "id": "laugavegur",
      "name": "Laugavegur Trail",
      "region": "Iceland Highlands",
      "country": "Iceland",
      "duration_days": 4,
      "distance_km": 55,
      "max_altitude_m": 1050,
      "difficulty": "Moderate",
      "best_season": "June–September",
      "risk": {
        "altitude": false,
        "weather": true,
        "remoteness": true,
        "permits_required": false
      },
      "latitude": 63.9833,
      "longitude": -19.0619,
      "hero_image": "/images/laugavegur.jpg"
    },
    {
      "id": "huayhuash",
      "name": "Cordillera Huayhuash",
      "region": "Andes",
      "country": "Peru",
      "duration_days": 10,
      "distance_km": 130,
      "max_altitude_m": 5020,
      "difficulty": "Extreme",
      "best_season": "May–September",
      "risk": {
        "altitude": true,
        "weather": true,
        "remoteness": true,
        "permits_required": true
      },
      "latitude": -10.2706,
      "longitude": -76.9025,
      "hero_image": "/images/huayhuash.jpg"
    }
  ];

  for (const t of treksJson) {
    await storage.createTrek({
      slug: t.id,
      name: t.name,
      region: t.region,
      country: t.country,
      durationDays: t.duration_days,
      distanceKm: t.distance_km,
      maxAltitudeM: t.max_altitude_m,
      difficulty: t.difficulty,
      bestSeason: t.best_season,
      latitude: t.latitude,
      longitude: t.longitude,
      heroImage: t.hero_image,
      riskAltitude: t.risk.altitude,
      riskWeather: t.risk.weather,
      riskRemoteness: t.risk.remoteness,
      riskPermitsRequired: t.risk.permits_required,
    });
  }
}
