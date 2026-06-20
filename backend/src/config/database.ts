import mongoose from 'mongoose';
import { env } from './env.js';
import { seedSampleDataIfEmpty } from '../services/seedService.js';

let connectionPromise: Promise<typeof mongoose> | null = null;
let seedPromise: Promise<number> | null = null;

export async function connectDatabase() {
  if (mongoose.connection.readyState !== 1) {
    connectionPromise ??= mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10_000,
    });

    try {
      await connectionPromise;
    } catch (error) {
      connectionPromise = null;
      throw error;
    }
  }

  seedPromise ??= seedSampleDataIfEmpty();
  try {
    await seedPromise;
  } catch (error) {
    seedPromise = null;
    throw error;
  }
}
