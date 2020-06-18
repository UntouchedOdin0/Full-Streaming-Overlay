import dotenv from 'dotenv';
import express from 'express';
import {Server} from 'http';
import SocketIO from 'socket.io';
import io from 'socket.io-client';
import config from './config.js';
import languages from './languages.js';
import types from './types.js';
import fetch from 'node-fetch';
import btoa from 'btoa';
import fs from 'fs';
import path from 'path';
import { exit } from 'process';

dotenv.config();

global.__dirname = path.resolve(path.dirname(''));

let spotifyExists = false;
let spotifyFile = __dirname + path.sep + '.spotify.json';

try {
    spotifyExists = fs.statSync(spotifyFile);
} catch (err) {}

if (spotifyExists) {
    config.spotify.token = JSON.parse(fs.readFileSync(spotifyFile));
}

// Required Stuff
const app = express()

app.use(express.static('./src/public'))

const httpServer = Server(app)
const socketServer = SocketIO(httpServer)

const language = languages[config.settings.language];
config.language = language;

let initialised = {};

let client = io(`https://sockets.streamlabs.com?token=${process.env.STREAMLABS_SOCKET_TOKEN}`);

// Start the server
httpServer.listen(config.settings.port, function() {
    console.log('[SERVER] Listening on *:' + config.settings.port)
    console.log('Authenticate spotify width: %s', buildSpotifyUrl());
})

app.get('/spotify', async (req, res) => {
    let token = await fetch(' https://accounts.spotify.com/api/token', {
        method: 'POST',
        body: `grant_type=authorization_code&code=${req.query.code}&redirect_uri=http://localhost:${config.settings.port}/spotify`,
        headers:{
            'Authorization': 'Basic ' + btoa(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`),
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(res => res.json())

    if (token.error !== undefined) {
        throw new Error(token.error_description);
    }

    config.spotify.token = token;
    socketServer.emit('setup.spotify', config.spotify.token);

    fs.writeFileSync(spotifyFile, JSON.stringify(config.spotify.token));

    res.send('THANKS');
})

function buildSpotifyUrl()
{
    return "https://accounts.spotify.com/authorize" +
        '?response_type=code' +
        '&client_id=' + process.env.SPOTIFY_CLIENT_ID +
        '&scope=' + encodeURIComponent(config.spotify.scopes.join(' ')) +
        '&redirect_uri=' + encodeURIComponent(`http://localhost:${config.settings.port}/spotify`);
}

// Make the events work
client.on('event', event => {
    // Log the event data for testing
    // console.log(JSON.stringify(e, 0, 4))

    // Check if there even is a message
    if (event.message) {
        // Check if the message is an array and change it to the first object
        if (Array.isArray(event.message) && event.message.length) {
            event.message = event.message[0]
        }

        // Emit the event to the client
        switch (event.type) {
            case 'raid':
                initialised['host'].update(event.message, socketServer)
                break;
            default:
                if (initialised[event.type] !== undefined) {
                    initialised[event.type].update(event.message, socketServer);
                } else {
                    console.warn('Event type not defined: %s', event.type);
                }

                return;
        }
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