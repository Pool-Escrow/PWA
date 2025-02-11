/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import https from 'https';
import crypto from 'crypto';
import querystring from 'querystring';
import { wait } from '@testing-library/user-event/dist/cjs/utils/index.js'


// OKX API configuration
const api_config = {
  "api_key": process.env.NEXT_PUBLIC_OKX_API_KEY,
  "secret_key": process.env.NEXT_PUBLIC_OKX_SECRET_KEY,
  "passphrase": process.env.NEXT_PUBLIC_OKX_PASSPHRASE,
  "project": process.env.NEXT_PUBLIC_OKX_PROJECT_ID
};

// OKX SIGNATURE GENERATION
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
  // Generate the request header
  const headers = {
    'Content-Type': 'application/json',
    'OK-ACCESS-KEY': api_config['api_key'],
    'OK-ACCESS-SIGN': signature,
    'OK-ACCESS-TIMESTAMP': timestamp,
    'OK-ACCESS-PASSPHRASE': api_config['passphrase'],
    'OK-ACCESS-PROJECT': api_config['project'],
  };

  const options = {
    hostname: 'www.okx.com',
    path: request_path + (params ? `?${querystring.stringify(params)}` : ''),
    method: 'GET',
    headers: headers
  };

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

async function sendPostRequest(request_path, params) {
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
    headers: headers,
  };

  try {
    const response = await fetch(`https://www.okx.com${request_path}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(params)
    });
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error('Error:', error);
}
}

const API_paths = {
  'tokenPairs/crosschain' : {'path': '/api/v5/dex/cross-chain/supported/bridge-tokens-pairs', 'call': 'GET'},
  'tokens' : {'path': '/api/v5/dex/cross-chain/supported/tokens', 'call':'GET'},
  'tokens/all' : {'path': '/api/v5/dex/aggregator/all-tokens', 'call':'GET'},
  'chains' : {'path': '/api/v5/dex/cross-chain/supported/chain', 'call':'GET'},
  'route' : {'path': '/api/v5/dex/cross-chain/quote', 'call':'GET'},
  'route/detailed' : {'path': '/priapi/v1/dx/trade/bridge/v3/quote', 'call':'GET'},
  'approve' : {'path': '/api/v5/dex/aggregator/approve-transaction', 'call':'GET'},
  'swap' : {'path': '/api/v5/dex/cross-chain/build-tx', 'call':'GET'},
  'status' : {'path': '/api/v5/dex/cross-chain/status', 'call':'GET'},
  'approval/status': {'path': '/priapi/v1/dx/trade/multi/batchGetTokenApproveInfo', 'call': 'GET'},
  'history' : {'path': '/api/v5/wallet/post-transaction/transactions-by-address', 'call':'GET'},
  'orders' : {'path': '/priapi/v1/dx/trade/multi/orders', 'call':'GET'},
  'account/OKX' : {'path': '/api/v5/wallet/account/create-wallet-account', 'call':'POST'},
  'accounts' : {'path': '/api/v5/wallet/account/accounts', 'call':'GET'},
}

const USDC_BASE =[
  {
    chainId:"8453",
    chainName:"Base",
    dexTokenApproveAddress:"0x57df6092665eb6058DE53939612413ff4B09114E"
  },
  {
    decimals: "6",
    tokenContractAddress: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    tokenLogoUrl: "https://static.okx.com/cdn/web3/currency/token/784-0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC-1.png/type=default_350_0?v=1735272019523",
    tokenName: "usdc",
    tokenSymbol: "USDC",
  }
]

export type BridgeInfo = {
  protocol: string
  rate: {
    from: { amount: number; token: string }
    to: { amount: number; token: string }
  }
  fee: {
    networkFee: number
    token: string
  }
  estimatedTime: string
  slippage: string
}

const checkApprovalStatus = async ( tokenContractAddress: string, userAddress, totalAmount) : Promise<boolean> => {
  const {path, call} = API_paths['approval/status'];
  const params = {
    'userWalletAddress': userAddress,
    'tokenContractAddress': tokenContractAddress,
    'chainId': 8453,
    'defiPlatformIds': 11,
  }
  try {
    const res = await sendGetRequest(path, params);
      const approvedAmount = res?.data[11]?.amount;
      if (approvedAmount === "0") {
        return false;
      } else if (approvedAmount > totalAmount) {
        return true;
      } else {
        return false;
      }
  } catch (err) {
    console.log(err);
    return false;
  }
}

const fetchStatus = async (txnHash: string) => {
  // console.log('txHistory', txHistory)
  const { path, call } = API_paths['status']
  const params = {
      hash: txnHash,
  }
  const res = await sendGetRequest(path, params).then(async res => {
    if (res === undefined || res.code == '51000') {
        // console.log('RETRYING')
        return "INVALID"
      } else if (res.code == '50011') {
        console.log('TIMEOUT')
        wait(1000)
        await fetchStatus(txnHash)
    } else {
        console.log('{{{{{{{{res}}}}}}}}', res)
        return res.data[0]
    }
    console.log('{{{{{{{{res}}}}}}}}', res)
  })
  return res
}

const getOKXAccount = async (userAddress: string) => {
  const { path, call } = API_paths['account/OKX']
  const params = {
    addresses: [{
      chainIndex: "1",
      address: userAddress
    }]
  }
  // const res = await sendPostRequest(path, params).then(async res => {
  //   // console.log('{{{{{{{{res}}}}}}}}', res)
  //   return res?.data[0]?.accountId
  // })
  const res = await fetch(`/api/accounts`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
})
  console.log(res)
  return res
}

const tokenAddressToName = (tokenAddress: string, tokens) => {
  const token = tokens.find(token => token.tokenContractAddress === tokenAddress);
  return token?.tokenSymbol;
}

const tokenAddressToLogo = (tokenAddress: string, tokens) => {
  const token = tokens.find(token => token.tokenContractAddress === tokenAddress);
  return token?.tokenLogoUrl;
}

const chainIdToName = (chainId: string, chains) => {
  const chain = chains.find(chain => chain.chainId === chainId);
  return chain?.chainName;
}


const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}


const toDecimals = (amount: number, decimals: number) => {
  return amount * Math.pow(10, decimals);
}

const toWholeNumber = (amount: number, decimals: number) => {
  return amount / Math.pow(10, decimals);
}

const toHex = (value: number): string => {
  return `0x${value.toString(16)}`;
}

export {
    preHash,
    sign,
    createSignature,
    sendGetRequest,
    sendPostRequest,
    API_paths,
    USDC_BASE,
    toDecimals,
    toWholeNumber,
    toHex,
    checkApprovalStatus,
    formatTime,
    fetchStatus,
    getOKXAccount,
    tokenAddressToName,
    tokenAddressToLogo,
    chainIdToName
};
