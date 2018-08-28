const express = require('express');
const crypto  = require('crypto');
const bodyParser = require('body-parser');

const app  = express();
const port = process.env.PORT || 1337;
const salt = 'some-salt-key'; // TODO: Salt should be retrieved via environment variable

// Using bodyParser to save myself from 50 extra lines of code
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if(process.argv.length < 3) { // We take the password via argument
  throw new Error('Please include authentication password starting this process. `npm start password`');
}

/* === Generating Password Hash === */

const password = crypto.createHash('sha256')
                       .update(process.argv.slice(2).join(' ') + salt)
                       .digest('base64'); // NOTE: We're storing this in memory just because this is example code.

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

const pubKey = '';

function isSignedMessage(mes, sign) {
  return crypto.createVerify('sha256')
               .update(mes)
               .verify(pubKey, sign, 'base64');
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

  if(!res.body || !res.body.message || !res.body.signature) {
    return res.send(JSON.stringify({ verify: false }));
  }

  let message = res.body.message.toString();
  let signature = res.body.signature.toString();

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

  if(!res.body || !res.body.key) {
    return res.send(JSON.stringify({ success: false }));
  }

  pubKey = res.body.key;
  res.send(JSON.stringify({ success: true }));
});

app.listen(port, () => console.log('Listening on port ' + port));
