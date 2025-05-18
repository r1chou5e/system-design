const fetch = require('node-fetch');

const rpcRequest = async (method, params) => {
  const response = await fetch('http://localhost:3000/rpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
  });
  const data = await response.json();
  return data.result;
};

(async () => {
  const sum = await rpcRequest('add', { a: 4, b: 2 });
  console.log('[JSON-RPC] 4 + 2 =', sum);

  const diff = await rpcRequest('subtract', { a: 7, b: 3 });
  console.log('[JSON-RPC] 7 - 3 =', diff);
})();
