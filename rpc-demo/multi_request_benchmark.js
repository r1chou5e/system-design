const { performance } = require('perf_hooks');

// JSON-RPC client
const fetch = require('node-fetch');
async function jsonRpcBenchmark(iterations = 100) {
  console.log(`Running JSON-RPC benchmark with ${iterations} requests...`);
  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    const response = await fetch('http://localhost:3000/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 4, b: 2 },
        id: i,
      }),
    });
    await response.json();
  }

  const endTime = performance.now();
  const totalTime = endTime - startTime;
  console.log(
    `JSON-RPC: ${iterations} requests took ${totalTime.toFixed(2)}ms`
  );
  console.log(`Average per request: ${(totalTime / iterations).toFixed(2)}ms`);
  return totalTime / iterations;
}

// gRPC client
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

async function grpcBenchmark(iterations = 100) {
  console.log(`Running gRPC benchmark with ${iterations} requests...`);

  const PROTO_PATH = path.join(__dirname, 'proto', 'calculator.proto');
  const packageDefinition = protoLoader.loadSync(PROTO_PATH);
  const calculatorProto =
    grpc.loadPackageDefinition(packageDefinition).calculator;

  const client = new calculatorProto.Calculator(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  const grpcCall = (method, params) => {
    return new Promise((resolve, reject) => {
      client[method](params, (err, response) => {
        if (err) return reject(err);
        resolve(response);
      });
    });
  };

  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    await grpcCall('Add', { a: 4, b: 2 });
  }

  const endTime = performance.now();
  const totalTime = endTime - startTime;
  console.log(`gRPC: ${iterations} requests took ${totalTime.toFixed(2)}ms`);
  console.log(`Average per request: ${(totalTime / iterations).toFixed(2)}ms`);
  return totalTime / iterations;
}

async function main() {
  console.log('=== Multi-Request JSON-RPC vs gRPC Benchmark ===\n');

  const jsonRpcAvg = await jsonRpcBenchmark(10000);
  const grpcAvg = await grpcBenchmark(10000);

  console.log('\n=== Results ===');
  console.log(`JSON-RPC average per request: ${jsonRpcAvg.toFixed(2)}ms`);
  console.log(`gRPC average per request: ${grpcAvg.toFixed(2)}ms`);
  console.log(`Difference: ${Math.abs(jsonRpcAvg - grpcAvg).toFixed(2)}ms`);
  console.log(
    `${jsonRpcAvg > grpcAvg ? 'gRPC' : 'JSON-RPC'} is faster by ${(
      (Math.abs(jsonRpcAvg - grpcAvg) / Math.max(jsonRpcAvg, grpcAvg)) *
      100
    ).toFixed(2)}%`
  );
}

main().catch(console.error);
