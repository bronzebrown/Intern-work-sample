// Import the logger from constants.
var logger = require('./constants').logger;

// The simple in-memory database we'll be using.
// People are indexed by their ids.
// ids don't need to be in order.
var database = {
    people: {
        1: {
            id: 1,
            name: 'Sarah Peterson',
            age: 42,
            job: 'Designer',
            friends: []
        },

        2: {
            id: 2,
            name: 'Jane Brown',
            age: 43,
            job: 'Designer',
            friends: []
        },

        3: {
            id: 3,
            name: 'Margaret Johnson',
            age: 24,
            job: 'QA',
            friends: []
        },

        4: {
            id: 4,
            name: 'Patti Robertson',
            age: 46,
            job: 'Mechanical Engineer',
            friends: []
        }
    }
};
var lastkey = function(){
    var keys = Object.keys(database.people);
    var max = 0
    for (var index = 0; index < keys.length; index++) {
        var element = parseInt(keys[index]);
        if(max<element)
        max=element;
    }
    return max;
};
/**
 * Returns true if the argument passed to it is a valid person.
 * Does not require the id field to be present.
 *
 * Note: you don't have to use this function, but it may be helpful.
 */
function isPerson (person) {
    return (
        typeof person === 'object' &&
        'name' in person &&
        'age' in person &&
        'job' in person &&
        'friends' in person
    );
}

/**
 * Adds a new person to the database.
 * Throws if
 *      + the person is invalid
 *      + the person doesn't have an id
 *      + the id is already being used in the db
 *
 * Note: you don't have to use this function, but it may be helpful.
 */
function addPersonToDatabase (person) {
    if (!isPerson(person)) {
        throw new Error('Expected person to be a valid person, but got ' + JSON.stringify(person));
    }

    if (!('id' in person)) {
        throw new Error('You must supply an id to add a new person to the database.');
    }

    if (person.id in database.people) {
        throw new Error('A person already exists with id ' + person.id);
    }

    database.people[person.id] = person;
}

// Load the express library and the body parsing middleware, body-parser
var express = require('express'),
    bodyParser = require('body-parser');

// The server application is an instance of express.
var app = express();

// Add body parsing middleware so JSON request bodies will be understood.
app.use(bodyParser.json());

// Logging middleware.
app.use(function (request, response, next) {
    // The HTTP method, request URL, and originating IP.
    var method = request.method,
        URL = request.originalUrl,
        ip = request.ip;

    // Log the info to console.
    logger(method + ' ' + URL + ', ' + ip);

    // Pass control to the next middleware.
    return next();
});

/**
 * GET /people/
 * Returns a list of all of the people in the database.
 */
app.get('/people', function (request, response, next) {
    return response.json(
        Object.keys(database.people).map(function (id) {
            return database.people[id]
        })
    );
});

/**
 * GET /people/:id
 * Returns the person specified by id.
 */
app.get('/people/:id', function (request, response, next) {
    var id = request.params.id;
    var person = database.people[id];

    // Return 404 if the person isn't in the database.
    if (person === null || person === undefined)
        return response.status(404).send("Sorry, a person with that id isn't in the database.");

    // Otherwise, return the person.
    return response.json(person);
});

/**
 * POST /people/
 * Recieves a new person to add to the database
 */
app.post('/people/', function (request, response, next){
    try {
        var person = request.body;
        var newId = lastkey() + 1;
        person.id = newId;
        addPersonToDatabase(person);
        response.status(201);
        response.json(person);
        return response
    } catch (error) {
        return response.status(500).send(error.message);
    }
});

// Middleware to catch any 404s
app.use(function (request, response, next) {
    var error404 = new Error('Not Found');
    error404.status = 404;
    error404.message = 'The endpoint ' + request.originalUrl + ' does not exist.';
    return next(error404);
});

// Error handling middleware
app.use(function (error, request, response, next) {
    var status = error.status || 500,
        message = error.message || 'Error';
    logger(request.method, request.originalUrl, status, message);

    return response.status(status).send();
});

// Start an http server on port 9000 which runs the application
var http = require('http'),
    port = require('./constants').port;
http.createServer(app).listen(port);
logger('Server started on port ' + port + '.');
