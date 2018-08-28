# Public and Private Key Message Signing

**Requirements:**

- Node.js only
- Make a server and a client
  - Client should just be a javascript file we can call with different arguments from command line, or a series of js files which are specialized to each endpoint
- Client should authenticate to the Server with a password
  - No real registration needed, just have an endpoint where we can set a password for the user, or let us set it via an argument when starting the server
  - Once submitted, the password should be stored on the server securely
- Allow an authenticated user to store a public key of some kind on the server
- Client should be able to sign a given message with its private key
- Allow anyone to submit a signed message to the server to verify if it has been signed by the private key associated with a specified user’s public key
- For data storage you can either keep everything in memory or, if you want to use a database, use mongo.
- Upload to a git repository named YourFirstName-2018
  - Include a Readme file which describes how to use your project
