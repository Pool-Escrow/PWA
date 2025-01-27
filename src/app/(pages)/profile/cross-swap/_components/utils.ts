
import https from 'https';
import crypto from 'crypto';
import querystring from 'querystring';

// Define API credentials and project ids
const api_config = {
  "api_key": process.env.NEXT_PUBLIC_OKX_API_KEY,
  "secret_key": process.env.NEXT_PUBLIC_OKX_SECRET_KEY,
  "passphrase": process.env.NEXT_PUBLIC_OKX_PASSPHRASE,
  "project": process.env.NEXT_PUBLIC_OKX_PROJECT_ID // This applies only to onchainOS APIs
};

function preHash(timestamp, method, request_path, params) {
  // Create a pre-signature based on strings and parameters
  let query_string = '';
  if (method === 'GET' && params) {
    query_string = '?' + querystring.stringify(params);
  }
  if (method === 'POST' && params) {
    query_string = JSON.stringify(params);
  }
  return timestamp + method + request_path + query_string;
}

function sign(message, secret_key) {
  // Use HMAC-SHA256 to sign the pre-signed string
  const hmac = crypto.createHmac('sha256', secret_key);
  hmac.update(message);
  return hmac.digest('base64');
}

function createSignature(method, request_path, params) {
  // Get the timestamp in ISO 8601 format
  const timestamp = new Date().toISOString().slice(0, -5) + 'Z';
  // Generate a signature
  const message = preHash(timestamp, method, request_path, params);
  const signature = sign(message, api_config['secret_key']);
  return { signature, timestamp };
}

// eslint-disable-next-line @typescript-eslint/require-await
async function sendGetRequest(request_path, params) {
  
    
  
  // Generate a signature
  const { signature, timestamp } = createSignature("GET", request_path, params);
  console.log(request_path);
  // Generate the request header
  const headers = {
    'OK-ACCESS-KEY': api_config['api_key'],
    'OK-ACCESS-SIGN': signature,
    'OK-ACCESS-TIMESTAMP': timestamp,
    'OK-ACCESS-PASSPHRASE': api_config['passphrase'],
    'OK-ACCESS-PROJECT': api_config['project'] // This applies only to WaaS APIs
  };

  const options = {
    hostname: 'www.okx.com',
    path: request_path + (params ? `?${querystring.stringify(params)}` : ''),
    method: 'GET',
    headers: headers
  };
  console.log(options);
//   const req = https.request(options, (res) => {
//     let data = '';
//     res.on('data', (chunk) => {
//       data += chunk;
//     });
//     res.on('end', () => {
//       console.log(data);
//       return data;
//     });
//   });
// //   console.log();

//   req.end();
return new Promise((resolve, reject) => {
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        resolve(parsedData);
      } catch (error) {
        reject(error);
      }
    });
  });

  req.on('error', (error) => {
    reject(error);
  });

  req.end();
});
  
}

function sendPostRequest(request_path, params) {
  // Generate a signature
  const { signature, timestamp } = createSignature("POST", request_path, params);

  // Generate the request header
  const headers = {
    'OK-ACCESS-KEY': api_config['api_key'],
    'OK-ACCESS-SIGN': signature,
    'OK-ACCESS-TIMESTAMP': timestamp,
    'OK-ACCESS-PASSPHRASE': api_config['passphrase'],
    'OK-ACCESS-PROJECT': api_config['project'], // This applies only to WaaS APIs
    'Content-Type': 'application/json' // POST requests need this header
  };

  const options = {
    hostname: 'www.okx.com',
    path: request_path,
    method: 'POST',
    headers: headers
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(data);
    });
  });

  if (params) {
    req.write(JSON.stringify(params));
  }

  req.end();
}

const API_paths = {
  'tokenPairs/crosschain' : {'path': '/api/v5/dex/cross-chain/supported/bridge-tokens-pairs', 'call': 'GET'},
  'tokens' : {'path': '/api/v5/dex/aggregator/all-tokens', 'call':'GET'},
  'chains' : {'path': '/api/v5/dex/cross-chain/supported/chain', 'call':'GET'},
  'route' : {'path': '/api/v5/dex/cross-chain/quote', 'call':'GET'},
  'approve' : {'path': '/api/v5/dex/aggregator/approve-transaction', 'call':'GET'},
  'swap' : {'path': '/api/v5/dex/cross-chain/build-tx', 'call':'GET'},
  'status' : {'path': '/api/v5/dex/cross-chain/status', 'call':'GET'},
}

export {
    preHash,
    sign,
    createSignature,
    sendGetRequest,
    sendPostRequest,
    API_paths
};
// GET request example
// const getRequestPath = '/api/v5/dex/aggregator/quote';
// const getParams = {
//   'chainId': 42161,
//   'amount': 1000000000000,
//   'toTokenAddress': '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
//   'fromTokenAddress': '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
// };
// sendGetRequest(getRequestPath, getParams);

// // POST request example
// const postRequestPath = '/api/v5/mktplace/nft/ordinals/listings';
// const postParams = {
//   'slug': 'sats'
// };
// sendPostRequest(postRequestPath, postParams);