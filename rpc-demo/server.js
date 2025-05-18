const express = require('express');
const bodyParser = require('body-parser');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// ======= JSON-RPC Server =======
const app = express();
const httpPort = 3000;
app.use(bodyParser.json());

const jsonMethods = {
  add: ({ a, b }) => a + b,
  subtract: ({ a, b }) => a - b,
};

app.post('/rpc', (req, res) => {
  const { jsonrpc, method, params, id } = req.body;
  if (jsonrpc !== '2.0' || !jsonMethods[method]) {
    return res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32601, message: 'Method not found' },
      id,
    });
  }
  const result = jsonMethods[method](params);
  res.json({ jsonrpc: '2.0', result, id });
});

app.listen(httpPort, () => {
  console.log(`✅ JSON-RPC server running at http://localhost:${httpPort}/rpc`);
});

// ======= gRPC Server =======
const PROTO_PATH = path.join(__dirname, 'proto', 'calculator.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const calculatorProto =
  grpc.loadPackageDefinition(packageDefinition).calculator;

const grpcServer = new grpc.Server();
grpcServer.addService(calculatorProto.Calculator.service, {
  Add: (call, callback) =>
    callback(null, { value: call.request.a + call.request.b }),
  Subtract: (call, callback) =>
    callback(null, { value: call.request.a - call.request.b }),
});

const grpcPort = '0.0.0.0:50051';
grpcServer.bindAsync(grpcPort, grpc.ServerCredentials.createInsecure(), () => {
  console.log(`✅ gRPC server running at ${grpcPort}`);
  grpcServer.start();
});
