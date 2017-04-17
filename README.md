# Untethered Labs Work Sample
Hi! We ask developers applying for engineering positions at Untethered Labs 
to complete this small Node.js project. It shouldn't take more than a couple hours.

After you've completed the project, we'll make plans to go over your solution. You'll either

1. Come to the Untethered office in College Park, MD
2. Or schedule a conference call if you're interviewing for a remote position

We'll discuss the approach you took and any issues you encountered.

Speed is not important when you submit your solution. Take your time and read the spec carefully. When we evaluate these solutions, we look at (in order of importance):

1. Does the solution meet all of the requirements of the specification?
2. Is the code logically organized, well-documented, and maintainable?
3. Where applicable, were current best practices followed?

```
################### NOTE ######################
# You will need node version 4.X.X or greater #
# to run the project files.                   #
###############################################
```

## Project overview

For this project, you will extend a web service to add a new API endpoint
and support for authentication. You'll then modify a client to consume the
data from your new endpoint.

#### Project directory layout
<pre><code>·
├─ /src/              # Folder containing the project files
│  ├─ /server.js      # Starts the server. This is the file you'll modify to extend the web service.
│  ├─ /client.js      # Starts the client. This is the file that consumes the web service.
│  ├─ /constants.js   # Contains constants and functions used by both the client and the server. Feel free to use and modify this file.
│
├─ /node_modules/     # Folder containing Node.js <a href="https://docs.npmjs.com/files/folders#node-modules">third-party libraries and modules</a>.
│
├─ <a href="https://docs.npmjs.com/files/package.json">package.json</a>       # File which lists all of the third party libraries used by the project.
│                     # <a href="https://docs.npmjs.com">npm</a> uses this file to download the libraries.
│                     # Feel free to use any npm packages you wish to complete the project.
</code></pre>

## Getting started

First you'll need to install Node.js (if you don't already have it installed).
It's available [here](https://nodejs.org/en/download/).

If you've already installed Node, make sure you have v4.X.X or higher.

Once you've got Node up and running, clone this repository and cd into
the project directory.
```
git clone https://github.com/coolcad/intern-work-sample.git
cd intern-work-sample
```

Then you'll need to install the third party libs used by the project.
```
npm install
```

Now, you're ready to test the client and server.
You'll need to run the client and server in separate shells.
```
# Start up the server. You can leave this running in its own shell.
node src/server.js

# Run the client.
node src/client.js
```

## Project tasks

##### 1. Add the `POST http://localhost:9000/people/` endpoint
This endpoint should add a new person to the database based on the request body
and return the newly created entity.

For example, the request `POST http://localhost:9000/people/` with request body

`REQUEST BODY`
```
{
    name: 'Jason Doe',
    age: 20,
    job: 'Consultant',
    friends: []
}
```
should add Jason Doe to the database with the fields in the request, and 
return HTTP response code `201` (created). The response body should contain
the entity added to the database, so the response to the example above would be

`RESPONSE BODY`
```
{
    id: $uniqueID,      # The id you return must be the same id assigned to the entity in the database
    name: 'Jason Doe',
    age: 20,
    job: 'Consultant',
    friends: []
}
```

Details:
+   `friends` is an array of `ids`
    + A person cannot be their own friend.
    + A person *can* have no friends.
+   Duplicate names, ages, and jobs are allowed in the database. Duplicate ids are not.
+   An `id` **should not** be supplied in the request body.
+   Instead you should automatically assign an `id` to the new person when adding it to the database.
+   Only accept requests with JSON request body content.
+   Handle invalid requests.

##### 2. Add middleware to require clients to provide authentication to access the API
Add middleware to the server that reads the `X-Project-Authentication` header,
and only allows a client to access the API if they supply a base64 encoding
of the string `this is terrible API key`.

If the server fails to authenticate the request, it should return the HTTP 
response code `400` (Bad Request).

##### 3. Add the `GET http://localhost:9000/degrees?source=$id&destination=$id`
Create an endpoint that returns the degrees of separation between two people.
Keep in mind the algorithmic complexity of your solution!

The `source` and `destination` parameters in the query string specify which two people
to compute the degrees of separation between. `source` and `destination` will both
be the `ids` of people in the databse.

The degrees of separation between two people is defined as the shortest chain of 
"friend of a friend" statements needed to connect the two people.

There are a few special cases:
* The degree between a person and himself is 0
* The degree between two friends is 1
* If there is no chain between two people, their degree is defined to be -1

```
degrees :: Person -> Person -> Integer

// The degrees between a person and himself is always 0
degrees(personA, personA) = 0

// The degrees between friends is 1
friend(personA, personB) => degrees(personA, personB) = 1
```

For example suppose we have the following database of people:
```
{0: {
    id: 0,
    name: 'John',
    age: 10,
    job: 'None',
    friends: [ 1 ]
}, 1: {
    id: 1,
    name: 'Jane',
    age: 10,
    job: 'None',
    friends: [ 0, 2 ]
}, 2: {
    id: 2,
    name: 'Joe',
    age: 10,
    job: 'None',
    friends: [ 1 ]
}}
```

We can infer from the database the following:
```
"John is friends with Jane"
"Jane is friends with John and Joe"
"Joe is friends with Jane"
```

Then `degrees()` returns the following:
* NB: this is pseudocode, and in your implementation you will probably want the `degrees()`
to accept person `ids` rather than strings or objects.
```
degrees(John, Jane) === 1
degrees(Jane, Joe) === 1
degrees(John, Joe) === 2
```

* `GET http://localhost:9000/degrees?source=$id&destination=$id` should return a `Number`
    * So for the database above, the response of
    `GET http://localhost:9000/degrees?source=0&destination=2` is `2`
    
__Hint:__ you can think of the people as an undirected, unweighted graph.

##### 4. Modify the client to consume the new endpoints
Modify `client.js` to perform the following tasks every time it is run:

1. Using a method of your choice, add all of the people objects in `people.json` to the database
2. Compute the degrees of separation between two *different* people in the db (doesn't matter which)
3. For all requests, verify the correctness of the server's response. 
4. Generate a valid `X-Project-Authentication` header for any requests to the server
    
##### 5. You're done!

## Documentation

### The server
`/src/server.js`
The project server uses [Express](http://expressjs.com/en/guide/routing.html), a popular web framework for Node.js
that we here at Untethered use internally for the Gatekeeper Server.
Inside `server.js` you will see a mock database, middleware, and API endpoint
implementations which are explained below:

#### Mock database
Instead of running an external database, for this project you will just use
an in-memory database defined in `server.js`. 

The database contains a map of people, keyed by `id`, with the following fields:

+   `id`, a unique identifier
+   `name`, `age`, `job`, `friends`
    + `friends` is an array of person `ids` corresponding to the person's friends
    + The `ids` should all correspond to other people in the database.

##### Middleware
Logging middleware has already been implemented for you in `server.js`

##### API endpoints
| HTTP method   | URI                                       | Description                                       |
| ------------- | ---------------------------------         | ------------------------------------------------- |
| `GET`         | `http://localhost:9000/people/`           | Returns a list of all the people in the database. |
| `GET`         | `http://localhost:9000/people/:PERSON_ID` | Returns the person with id equal to `PERSON_ID`   |

## Examples
If the database contains

`COMPLETE DATABASE CONTENTS`
```
{
    0: {
        id: 0,
        name: 'Jane Doe',
        age: 40,
        job: 'Software Engineer',
        friends: [],
    },
    1: {
        id: 1,
        name: 'John Doe',
        age: 35,
        job: 'Designer',
        friends: [],
    }
}
```

Then the following requests should return:

<table>
    <thead>
        <tr>
            <th>
                Request
            </th>
            <th>
                Response
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                <code>GET http://localhost:9000/people/</code>
            </td>
            <td>
                <pre><code>[
    {
        id: 0,
        name: 'Jane Doe',
        age: 40,
        job: 'Software Engineer',
        friends: []
    },
    {
        id: 1,
        name: 'John Doe',
        age: 35,
        job: 'Designer',
        friends: []
    }
]</code></pre>
            </td>
        </tr>
        
        <tr>
            <td>
                <code>GET http://localhost:9000/people/0</code>
            </td>
            <td>
<pre><code>{
    id: 0,
    name: 'Jane Doe',
    age: 40,
    job: 'Software Engineer',
    friends: []
}
</code></pre>
        
            </td>
        </tr>
        
        <tr>
            <td>
                <code>GET http://localhost:9000/people/1</code>
            </td>
            <td>
<pre><code>{
    id: 1,
    name: 'John Doe',
    age: 35,
    job: 'Designer',
    friends: []
}
</code></pre>
        
            </td>
        </tr>
    </tbody>
</table>
