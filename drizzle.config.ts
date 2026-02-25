import { config } from 'dotenv';
import { existsSync } from 'fs';

if (existsSync('.env.local')) {
  config({ path: '.env.local' });
} else {
  config();
}

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
