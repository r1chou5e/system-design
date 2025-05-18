const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'proto', 'calculator.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const calculatorProto =
  grpc.loadPackageDefinition(packageDefinition).calculator;

const client = new calculatorProto.Calculator(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

client.Add({ a: 4, b: 2 }, (err, response) => {
  if (err) return console.error(err);
  console.log('[gRPC] 4 + 2 =', response.value);
});

client.Subtract({ a: 7, b: 3 }, (err, response) => {
  if (err) return console.error(err);
  console.log('[gRPC] 7 - 3 =', response.value);
});
