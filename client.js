var crypto = require('crypto');

function makeSignedMessage(mes) {
  return crypto.createSign('sha256')
                     .update(mes)
                     .sign(privateKey, 'base64');
}

function generateKeys() {
  let plen = 60;
  let dH = crypto.createDiffieHellman(plen).generateKeys('base64');

  let pubKey = dH.getPublicKey('base64');
  let priKey = dH.getPrivateKey('base64');
}
