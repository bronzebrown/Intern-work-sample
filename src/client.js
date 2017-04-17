var http = require('http'),
    port = require('./constants').port,
    logger = require('./constants').logger,

    // We use async.waterfall to simplify asynchronous requests which depend on the results
    // of previous requests. See https://github.com/caolan/async#waterfall for more details.
    async = require('async'),

    // We use the npm package request (https://github.com/request/request) to greatly
    // simply making http requests.
    request = require('request');

// Tell the server we're going to communicate using JSON.
var baseOptions = {
    headers: {
        'Content-Type': 'application/json',
    }
};

// URI of the server.
var baseURI = 'http://localhost:' + port;

async.waterfall(
    [
        function (done){
            var options = Object.assign(
                {},
                baseOptions,
                { url: baseURI+'/people'}
            )
            request.body = {
                name: 'Jason Doe',
                age: 20,
                job: 'Consultant',
                friends:[]
            };
            request.post(options,function(err,response,body){
                var statusCode = response.statusCode;
                if(err|| statusCode!== 201)
                    return done(err || new Error('Error: '+ statusCode+ response.body));
                try {
                    body = JSON.parse(body);
                } catch (error) {
                    return done(null, body);
                }
            })  
        },

        function (done) {
            // Options for the request.
            var options = Object.assign(
                {},
                baseOptions,
                { url: baseURI + '/people' }
            );

            // GET http://localhost:9000/people
            request.get(options, function (err, response, body) {
                var statusCode = response.statusCode;

                // Handle errors
                if (err || statusCode !== 200)
                    return done(err || new Error('Error: ' + statusCode + response.body));

                // Parse the response.
                try {
                    body = JSON.parse(body);
                } catch (parseErr) {
                    return done(new Error('Error parsing response body.'));
                }

                return done(null, body);
            });
        },

        function (allPeople, done) {
            // Pick a random person from the list of people.
            var index = Math.floor(Math.random() * allPeople.length),
                person = allPeople[index];

            // Options for the request.
            var options = Object.assign(
                {},
                baseOptions,
                { url: baseURI + '/people/' + person.id }
            );

            // Get more info about the peron using the /person/:id endpoint.
            // GET http://localhost:9000/people/:id
            request.get(options, function (err, response, body) {
                var statusCode = response.statusCode;

                // Handle errors
                if (err || statusCode !== 200)
                    return done(err || new Error('Error: ' + statusCode));

                // Parse the response.
                try {
                    body = JSON.parse(body);
                } catch (parseErr) {
                    return done(new Error('Error parsing response body.'));
                }

                return done(null, body);
            });
        },

        
    ], function (err, person) {
        // Handle any errors from the requests.
        if (err) {
            console.error('An error occurred while contacting the server.');
            console.log(err);
            return;
        }

        logger('Retrieved info about person:');
        console.log(person);
    }
)
