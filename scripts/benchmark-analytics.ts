/**
 * Performance benchmark for Analytics Service optimization
 * 
 * Run: node --loader tsx scripts/benchmark-analytics.ts
 */

interface BenchmarkResult {
  method: string;
  duration: number;
  recordsFetched: number;
  networkSize: number;
}

async function benchmark() {
  console.log('🚀 Analytics Service Performance Benchmark\n');
  console.log('Testing with real user data...\n');

  const results: BenchmarkResult[] = [];

  // Test 1: getDailyGoalStatus
  console.log('1️⃣  Testing getDailyGoalStatus...');
  const start1 = performance.now();
  const response1 = await fetch('http://localhost:3000/api/analytics/events/daily-goal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      date: new Date().toISOString(),
      timezoneOffset: new Date().getTimezoneOffset()
    })
  });
  const data1 = await response1.json();
  const end1 = performance.now();
  
  results.push({
    method: 'getDailyGoalStatus',
    duration: end1 - start1,
    recordsFetched: data1.data?.dailyGoal ? 1 : 0,
    networkSize: JSON.stringify(data1).length
  });

  // Test 2: getWeeklyActivity (7 days)
  console.log('2️⃣  Testing getWeeklyActivity (7 days)...');
  const start2 = performance.now();
  const endDate = new Date();
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const response2 = await fetch(
    `http://localhost:3000/api/analytics/events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&timezoneOffset=${new Date().getTimezoneOffset()}`
  );
  const data2 = await response2.json();
  const end2 = performance.now();
  
  results.push({
    method: 'getWeeklyActivity (7d)',
    duration: end2 - start2,
    recordsFetched: data2.data?.weeklyActivity?.length || 0,
    networkSize: JSON.stringify(data2).length
  });

  // Test 3: getWeeklyActivity (30 days)
  console.log('3️⃣  Testing getWeeklyActivity (30 days)...');
  const start3 = performance.now();
  const startDate30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const response3 = await fetch(
    `http://localhost:3000/api/analytics/events?startDate=${startDate30.toISOString()}&endDate=${endDate.toISOString()}&timezoneOffset=${new Date().getTimezoneOffset()}`
  );
  const data3 = await response3.json();
  const end3 = performance.now();
  
  results.push({
    method: 'getWeeklyActivity (30d)',
    duration: end3 - start3,
    recordsFetched: data3.data?.weeklyActivity?.length || 0,
    networkSize: JSON.stringify(data3).length
  });

  // Test 4: getMonthlyGoalStatuses
  console.log('4️⃣  Testing getMonthlyGoalStatuses...');
  const start4 = performance.now();
  const response4 = await fetch(
    `http://localhost:3000/api/analytics/monthly-goals?timezoneOffset=${new Date().getTimezoneOffset()}`
  );
  const data4 = await response4.json();
  const end4 = performance.now();
  
  const monthlyGoals = data4.data?.goalStatuses || {};
  results.push({
    method: 'getMonthlyGoalStatuses',
    duration: end4 - start4,
    recordsFetched: Object.keys(monthlyGoals).length,
    networkSize: JSON.stringify(data4).length
  });

  // Print results
  console.log('\n📊 BENCHMARK RESULTS\n');
  console.log('┌─────────────────────────────┬──────────┬────────────┬──────────────┐');
  console.log('│ Method                      │ Duration │ Records    │ Network Size │');
  console.log('├─────────────────────────────┼──────────┼────────────┼──────────────┤');
  
  results.forEach(r => {
    const method = r.method.padEnd(27);
    const duration = `${r.duration.toFixed(1)}ms`.padStart(8);
    const records = r.recordsFetched.toString().padStart(10);
    const size = `${(r.networkSize / 1024).toFixed(1)}KB`.padStart(12);
    console.log(`│ ${method} │ ${duration} │ ${records} │ ${size} │`);
  });
  
  console.log('└─────────────────────────────┴──────────┴────────────┴──────────────┘');

  // Summary
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const totalSize = results.reduce((sum, r) => sum + r.networkSize, 0);
  
  console.log(`\n📈 Summary:`);
  console.log(`   Total request time: ${totalDuration.toFixed(1)}ms`);
  console.log(`   Total network transfer: ${(totalSize / 1024).toFixed(1)}KB`);
  console.log(`   Average request time: ${(totalDuration / results.length).toFixed(1)}ms`);
  
  // Performance ratings
  console.log(`\n⚡ Performance Rating:`);
  const avgDuration = totalDuration / results.length;
  if (avgDuration < 50) {
    console.log('   🟢 EXCELLENT - Optimized queries working perfectly!');
  } else if (avgDuration < 100) {
    console.log('   🟡 GOOD - Performance is acceptable');
  } else {
    console.log('   🔴 NEEDS IMPROVEMENT - Consider adding database indexes');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  benchmark().catch(console.error);
}

export { benchmark };
