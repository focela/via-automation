// tools/daily-refresh.js
import { execSync } from 'child_process';

console.log('🧪 1. Kiểm tra trạng thái via...');
execSync('node bots/check-status.js', { stdio: 'inherit' });

console.log('\n🧹 2. Lọc ra via còn sống...');
execSync('node tools/filter-alive-via.js', { stdio: 'inherit' });

console.log('\n🔥 3. Bắt đầu warmup via sống...');
execSync('node bots/warmup.js', { stdio: 'inherit' });
