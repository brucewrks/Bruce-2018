# Public and Private Key Message Signing

This project is a proof of concept for verification of private-key-signed messages strings with Node.js.

`client.js` generates signatures for messages with a private key, and `server.js` provides an endpoint for verification
of if `client.js`'s private key was used to create a signature.

## Installation and Setup

Clone this repository and run `npm i` to install:

```
git clone git@github.com:brucewsinc/Bruce-2018.git
npm i
```

**You will need to generate SSH keys within the keys directory.** You can use `npm run generate` to do so automatically on OSX.

```
cd keys
ssh-keygen -b 2048 -t rsa -f test
openssl rsa -in test -pubout -outform PEM -out test.pub
```

## Usage

**To start the server:**

```
npm start yourPasswordHere # Replace with a password of your choosing
```

**Using the client:**

```
npm run send-key yourPasswordHere    # Updating the public key requires authentication
npm run sign 'Your message here'     # This will return a JavaScript Object including the original message and signature
npm run verify 'message' 'signature' # Requests a signature verification from `server.js`
```

## Endpoints

`server.js` has two `POST` endpoints:

#### **POST** `/` For verification of signed messages:

- Required POST parameters:
	- `message` - The plaintext message that was signed
	- `signature` - The signature related to the above message

**Endpoint returns JSON array** with boolean property of `verify`

#### **POST** `/set-public-key` for updating public key:

- Required GET paramters:
	- `pass` The password set when the `server.js` file was initialized

- Required POST parameters:
	- `key` - The public key you would like to set on the server

**Endpoint returns JSON array** with boolean property of `success`
