/**
 * Main file for helloworld API.
 */

// Main dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

// Configure the server.
const httpServer = http.createServer((req, res) => {
    handleEachRequest(req, res);
});

const handleEachRequest = (req, res) => {
    // Parse the url
    var parsedUrl = url.parse(req.url, true);

    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    var queryString = parsedUrl.query;

    // Get the HTTP method
    var method = req.method.toLowerCase();

    //Get the headers as an object
    var headers = req.headers;

    // Get the payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();

        // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        var data = {
            'trimmedPath' : trimmedPath,
            'queryString' : queryString,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, (statusCode, payload) => {

        // Use the status code returned from the handler, or set the default status code to 200
        statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

        // Use the payload returned from the handler, or set the default payload to an empty object
        payload = typeof(payload) == 'object'? payload : {};

        // Convert the payload to a string
        var payloadString = JSON.stringify(payload);

        // Return the response
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(statusCode);
        res.end(payloadString);
        console.log("Returning this response: ",statusCode,payloadString);
        });
    });
};

// Start the server
httpServer.listen(3000, () => {
  console.log('The server is up and running now on port 3000');
});

// Define all the handlers
const handlers = {};

// Helloworld handler
handlers.hello = (data, callback) => {
    // Extract the name from query string object.
    var name = data.queryString.name;

    // If name is not part of query string.
    var payload = {
        "message" : "Hello World"
    };

    // Return Hello <name>.
    if (typeof(name) === "string") {
        payload.message = "Hello " + name;
    }

    callback(200, payload);
};

// Not found handler
handlers.notFound = (data, callback) => {
  callback(404);
};

// Define the request router
const router = {
  "hello" : handlers.hello
};
