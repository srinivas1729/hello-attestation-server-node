# Hello Attestation Server for Node

The repo provides an example REST API Server that can check the integrity of
clients and their requests. It supports iOS clients (for now) and the clients
need to use App Attest API's to certify their integrity ([reference](https://developer.apple.com/documentation/devicecheck/establishing-your-app-s-integrity)).
This server checks the integrity using guidance [here](https://developer.apple.com/documentation/devicecheck/validating-apps-that-connect-to-your-server).

The server is implemented using [Node.js](https://en.wikipedia.org/wiki/Node.js)
and [Express](https://expressjs.com/) framework. It uses [appattest-checker-nodelibrary](https://github.com/srinivas1729/appattest-checker-node)
for core of the Attestation verification. An example client app that uses
Attestation can be found at [RNHelloAttestationClient](https://github.com/srinivas1729/RNHelloAttestationClient).

## Steps to run this server

### Common setup

1. Clone this repo.
1. `npm install`

### Using VSCode + REST Client extension

1. Use VSCode and install [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
   extension.
1. Use common env params: `cp sample.env .env`. This contains the test App id
   that made sample requests in `requests/*.http` files. Without this step, the
   server will error out at startup.
1. Run the server: `npm run dev`
1. Open up files `request/registerAppAttestKey.http` and
   `request/highValueRequest.http`. Execute the requests one by one. They show
   the sequence of requests a client would execute to first register their
   public Attestation Key and then make high-value requests.

### Using RNHelloAttestationClient

See instructions in [RNHelloAttestationClient](https://github.com/srinivas1729/RNHelloAttestationClient)
repo to get your app building and running. From Xcode, get the app-Id.
It should be of the form: `<team-id>.<bundle-id>`.

1. Setup config for the server. `cp sample.env .env`. Then replace 
IOS_APP_ID in `.env` with your app-Id.
1. Run the server: `npm run dev`.
1. Run the app and use its UI to register App Attest keys and make attested
   requests.
