const Web3 = require('web3');
require('dotenv').config(); // Load environment variables
const readline = require('readline');

// Get the API key and network from environment variables
const apiKey = process.env.apiKey; // Replace with your API key
const network = 'sepolia';

// Create the web3 instance
const node = `https://eth.getblock.io/${apiKey}/${network}/`;
const web3 = new Web3(node);

// Load the private key from environment variables
const privateKey = process.env.privateKey;

// Check if privateKey is defined
if (!privateKey) {
  console.error('Private key not found in environment variables. Make sure to set privateKey in your .env file.');
  process.exit(1); // Exit the script with an error code
}

// Create an Ethereum account from the private key
const accountFrom = web3.eth.accounts.privateKeyToAccount(privateKey);

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to get user input for accountToAddress and amountTo
const getUserInput = () => {
  return new Promise((resolve) => {
    rl.question('Enter recipient address (accountToAddress): ', (recipientAddress) => {
      rl.question('Enter amount in Ether (amountTo): ', (amount) => {
        resolve({ accountToAddress: recipientAddress, amountTo: amount });
        rl.close();
      });
    });
  });
};

const createSignedTx = async (rawTx) => {
  rawTx.gas = await web3.eth.estimateGas(rawTx);
  return await accountFrom.signTransaction(rawTx);
}

const sendSignedTx = async (signedTx) => {
  web3.eth.sendSignedTransaction(signedTx.rawTransaction).then(console.log)
}

// Main function
const main = async () => {
  const userInput = await getUserInput();

  const rawTx = {
    to: userInput.accountToAddress,
    value: web3.utils.toWei(userInput.amountTo, "ether")
  }

  createSignedTx(rawTx).then(sendSignedTx);
};

main();
