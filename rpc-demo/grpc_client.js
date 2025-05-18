const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { performance } = require('perf_hooks');

const PROTO_PATH = path.join(__dirname, 'proto', 'calculator.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const calculatorProto =
  grpc.loadPackageDefinition(packageDefinition).calculator;

const client = new calculatorProto.Calculator(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

function timeGrpcCall(method, params) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    client[method](params, (err, response) => {
      const endTime = performance.now();
      if (err) {
        console.error(err);
        return reject(err);
      }
      console.log(`[gRPC] ${method} took ${endTime - startTime}ms`);
      resolve(response);
    });
  });
}

(async () => {
  try {
    const addResult = await timeGrpcCall('Add', { a: 4, b: 2 });
    console.log('[gRPC] 4 + 2 =', addResult.value);

    const subtractResult = await timeGrpcCall('Subtract', { a: 7, b: 3 });
    console.log('[gRPC] 7 - 3 =', subtractResult.value);
  } catch (error) {
    console.error('Error:', error);
  }
})();
