const fs     = require('fs');
const crypto = require('crypto');
const qs     = require('querystring');
const http   = require('http');

/**
 * Retrieves the keys provided in the keys directory.
 *
 * @return Object
 */
function getKeys() {
  let pubKey = fs.readFileSync(__dirname + '/keys/test.pub').toString();
  let priKey = fs.readFileSync(__dirname + '/keys/test').toString();
  return { pubKey, priKey };
}

/**
 * Sends our public key to `server.js`.
 */
function sendPubKey(pass) {
  return new Promise((respond, reject) => {
    let keys = getKeys();
    let data = qs.stringify({ key: keys.pubKey });

    let opts = {
      host: '127.0.0.1',
      port: process.env.PORT || 1337,
      path: '/set-public-key?pass=' + pass,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    let req = http.request(opts, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        respond(chunk);
      });
    });

    req.write(data);
    req.end();
  });
}

function verifySignature(message, signature) {
  return new Promise((respond, reject) => {
    let data = qs.stringify({ message, signature });

    let opts = {
      host: '127.0.0.1',
      port: process.env.PORT || 1337,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    let req = http.request(opts, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log('Response: ' + chunk);
      });
    });

    req.write(data);
    req.end();
  });
}

/**
 * Gets the signature to relate to given message
 *
 * @param String message The message to generate a signature for
 *
 * @return String
 */
function getSignature(message) {
  let keys = getKeys();

  let hash = crypto.createSign('sha256');
  hash.update(message);
  return hash.sign(keys.priKey, 'base64');
}

/* === BEGIN Command Line Actions === */

if(process.argv.length < 4) { // Must provide an action
  throw new Error('Please provide an action for the client to take. Available actions: `send-key <password>`, `sign <message>`, `verify <message> <signature>`');
}

let action = process.argv[2];
let message, signature;

switch(action) {
  case 'send-key':

    sendPubKey(process.argv[3]).then(res => {
      console.log('Sent public key to server.js!');
      console.log('Response: ' + res);
    });

    break;
  case 'sign':

    message   = process.argv[3];
    signature = getSignature(message);
    console.log({ message, signature });

    break;
  case 'verify':

    if(process.argv.length < 5) {
      throw new Error('Verify must include message and signature arguments.');
    }

    message   = process.argv[3];
    signature = process.argv[4];

    verifySignature(message, signature).then(function(res) {
      console.log('Response: ' + res);
    });

    break;
}
