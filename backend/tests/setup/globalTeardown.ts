import { execSync } from 'child_process';

export default async () => {
  console.log('\nTearing down test environment...');
  execSync('docker-compose -f ../docker-compose.test.yml down -v', { stdio: 'inherit' });
  console.log('Test environment teardown complete.');
}; 