import mongoose from 'mongoose';
import { app } from './app.js';
import { env } from './config/env.js';
import { seedSampleDataIfEmpty } from './services/seedService.js';

async function start() {
  await mongoose.connect(env.mongoUri);
  await seedSampleDataIfEmpty();
  app.listen(env.port, () => {
    console.log(`CBOS API running on http://localhost:${env.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
