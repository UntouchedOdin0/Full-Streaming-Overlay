import dotenv from 'dotenv';
import express from 'express';
import {Server} from 'http';
import SocketIO from 'socket.io';
import io from 'socket.io-client';
import config from './config.js';
import languages from './languages.js';
import types from './types.js';

dotenv.config();

// Required Stuff
const app = express()

app.use(express.static('./src/public'))

const httpServer = Server(app)
const socketServer = SocketIO(httpServer)

const language = languages[config.settings.language];

let initialised = {};

let client = io(`https://sockets.streamlabs.com?token=${process.env.STREAMLABS_SOCKET_TOKEN}`);

// Start the server
httpServer.listen(config.settings.port, function() {
    console.log('[SERVER] Listening on *:' + config.settings.port)
})

// Make the events work
client.on('event', e => {
    // Log the event data for testing
    // console.log(JSON.stringify(e, 0, 4))

    // Check if there even is a message
    if (e.message) {
        // Check if the message is an array and change it to the first object
        if (Array.isArray(e.message)) {
            e.message = e.message[0]
        }

        // Validate the message
        e.message.validated = true

        // Emit the event to the client
        client.emit('.' + e.type, e.message)
    }
})

// Setting up the overlay
socketServer.on('connection', (socket) => {
    console.log('[SERVER] New Connection! (' + socket.request.connection.remoteAddress + ')')

    // Send necessery data to the overlay and wait for a response
    socket.emit('setup', {config, language})
})

// Setting up the alerts
config.types.forEach((type) => {
    initialised[type] = new types[type];
    initialised[type].initiate(config, io, client)
})