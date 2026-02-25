import { config } from 'dotenv';
config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import * as schema from '../src/db/schema';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function createAdmin() {
  const hash = await bcrypt.hash('admin1234', 12);
  await db.insert(schema.adminUsers).values({
    email: 'admin@climate.kr',
    passwordHash: hash,
    name: '관리자',
  });
  console.log('Admin created: admin@climate.kr / admin1234');
  process.exit(0);
}

createAdmin().catch(console.error);
