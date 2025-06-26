import { execSync } from 'child_process';
import { resolve } from 'path';
import * as dotenv from 'dotenv';

export default async () => {
  console.log('\nSetting up test environment...');

  // Load environment variables from .env.test
  dotenv.config({ path: resolve(__dirname, '..', '..', '.env.test') });

  // Ensure Prisma client is generated for the test environment
  console.log('Generating Prisma client for test environment...');
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: { ...process.env },
  });

  // Start Docker containers. The command is run from the 'backend' directory.
  execSync('docker-compose -f ../docker-compose.test.yml up -d', {
    stdio: 'inherit',
  });

  // Wait for the database to be ready and apply migrations
  let retries = 5;
  while (retries > 0) {
    try {
      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        env: { ...process.env }, // Pass environment variables
      });
      console.log('Database migrated successfully.');
      break; // Success
    } catch (e) {
      retries--;
      console.log(`Migration failed, retrying... (${retries} retries left)`);
      if (retries === 0) {
        console.error('Could not migrate the database. Aborting tests.');
        execSync('docker-compose -f ../docker-compose.test.yml down -v', {
          stdio: 'inherit',
        });
        throw e;
      }
      await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds
    }
  }

  console.log('Test environment setup complete.');
}; 