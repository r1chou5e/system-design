const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function runBenchmark(command, iterations = 10, warmup = 2) {
  console.log(
    `Running ${command} ${iterations} times (with ${warmup} warmup runs)...`
  );

  // Warmup runs
  for (let i = 0; i < warmup; i++) {
    await execAsync(command);
    console.log(`Warmup ${i + 1} completed`);
  }

  const times = [];
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await execAsync(command);
    const end = Date.now();
    times.push(end - start);
    console.log(`Run ${i + 1}: ${times[i]}ms`);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(`Average time for ${command}: ${avg.toFixed(2)}ms`);
  return avg;
}

async function main() {
  console.log('=== JSON-RPC vs gRPC Benchmark ===');

  const jsonRpcAvg = await runBenchmark('node jsonrpc_client.js');
  const grpcAvg = await runBenchmark('node grpc_client.js');

  console.log('\n=== Results ===');
  console.log(`JSON-RPC average: ${jsonRpcAvg.toFixed(2)}ms`);
  console.log(`gRPC average: ${grpcAvg.toFixed(2)}ms`);
  console.log(`Difference: ${Math.abs(jsonRpcAvg - grpcAvg).toFixed(2)}ms`);
  console.log(
    `${jsonRpcAvg > grpcAvg ? 'gRPC' : 'JSON-RPC'} is faster by ${(
      (Math.abs(jsonRpcAvg - grpcAvg) / Math.max(jsonRpcAvg, grpcAvg)) *
      100
    ).toFixed(2)}%`
  );
}

main().catch(console.error);
