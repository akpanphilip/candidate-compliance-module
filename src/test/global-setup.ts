import { execSync } from 'node:child_process';

import { TEST_DATABASE_URL } from './test-db';

export default function setup() {
  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'inherit',
  });
}
