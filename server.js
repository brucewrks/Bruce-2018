const express    = require('express');
const crypto     = require('crypto');
const bodyParser = require('body-parser');

const app  = express();
const port = process.env.PORT || 1337;
const salt = process.env.SALT || 'sample-salt-string';

// Using bodyParser to save myself from 50 extra lines of code
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if(process.argv.length < 3) { // We take the password via argument
  throw new Error('Please include authentication password starting this process. `npm start password`');
}

/* === Generating Password Hash === */

// NOTE: We're storing this in memory just because this is example code.
const password = crypto.createHash('sha256')
                       .update(process.argv[2] + salt)
                       .digest('base64');

/**
 * Verifies that password passed (in plain text) matches the password provided
 * via `process.argv`.
 *
 * @param String pass The password to verify
 *
 * @return Boolean
 */
function passValid(pass) {
  let hash = crypto.createHash('sha256');
  hash.update(pass + salt);
  return password === hash.digest('base64');
}

/**
 * Ends and Logs Connections which have either no password or an incorrect
 * password.
 *
 * @param ServerResponse res The response variable for the request to block
 */
function stopBadPass(res) {
  console.log('Request using incorrect password blocked.');
  res.status(403);
  res.end();
};

/* === Public Key Verification Stuff === */

let pubKey = '';

/**
 * Determines whether or not a message has been signed with the private key
 * related to the set public key.
 *
 * @param String mes  The message to validate
 * @param String sign The signature related to this message
 *
 * @return Boolean
 */
function isSignedMessage(mes, sign) {
  try {
    return crypto.createVerify('sha256')
                 .update(mes)
                 .verify(pubKey, sign, 'base64');
  } catch(e) {
    console.log('!!ERROR: It looks like an invalid Public Key has been provided.!!');
    return false;
  }
}

/* === Server Requests === */

/**
 * This is the endpoint for verifying signed messages. Open to all.
 *
 * Takes 2 POST paramters:
 *   - message
 *   - signature
 */
app.post('/', (req, res) => {

  res.setHeader('Content-Type', 'application/json');

  if(!req.body || !req.body.message || !req.body.signature || !pubKey) {
    return res.send(JSON.stringify({ verify: false }));
  }

  let message = req.body.message.toString();
  let signature = req.body.signature.toString();

  let verify = isSignedMessage(message, signature);
  res.send(JSON.stringify({ verify }));
});

/**
 * This is the endpoint for setting server public key to verify signed messages.
 *
 * Takes 1 POST paramter:
 *   - key
 */
app.post('/set-public-key', (req, res) => {
  if(!req.query.pass || !passValid(req.query.pass)) return stopBadPass(res);

  res.setHeader('Content-Type', 'application/json');

  if(!req.body || !req.body.key) {
    return res.send(JSON.stringify({ success: false }));
  }

  console.log('Setting server public key.');

  pubKey = req.body.key;

  if(!pubKey.match(/^\-\-/)) {
    console.log('Input public key does not include header and footer. Appending now.');
    pubKey = '-----BEGIN PUBLIC KEY-----\n' + pubKey + '\n-----END PUBLIC KEY-----';
  }

  res.send(JSON.stringify({ success: true }));
});

app.listen(port, () => console.log('Server listening on port ' + port));
