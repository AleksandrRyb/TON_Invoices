const { keyPairFromSeed, sign } = require('@ton/crypto');
const { getSecureRandomBytes } = require('@ton/crypto');

async function main() {
  // 1. Get the payload from the command line arguments
  const payloadToSign = process.argv[2];
  if (!payloadToSign) {
    console.error('Error: Please provide the payload from the /challenge endpoint as an argument.');
    console.error('Usage: node backend/scripts/generate-signature.js <payload>');
    process.exit(1);
  }

  // 2. Generate a new random key pair (like a new wallet)
  const seed = await getSecureRandomBytes(32);
  const keyPair = keyPairFromSeed(seed);

  // 3. Sign the payload with the private key
  const signature = sign(Buffer.from(payloadToSign, 'hex'), keyPair.secretKey);

  // 4. Output the results in hex format
  console.log('--- Copy these values for your /verify request ---');
  console.log('publicKey:', keyPair.publicKey.toString('hex'));
  console.log('signature:', signature.toString('hex'));
  console.log('----------------------------------------------------');
}

main(); 