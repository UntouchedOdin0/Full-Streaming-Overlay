import dotenv from 'dotenv';
import express from 'express';
import {Server} from 'http';
import SocketIO from 'socket.io';
import io from 'socket.io-client';
import languages from './languages.js';
import types from './types.js';
import fetch from 'node-fetch';
import btoa from 'btoa';
import fs from 'fs';
import path from 'path';
import AppDirectory from 'appdirectory';
import _ from 'lodash';

dotenv.config();

global.__dirname = path.resolve(path.dirname(''));

global.dirs = new AppDirectory({
    appName: 'full-streaming-overlay',
    appAuthor: "daft.host",
    useRoaming: true
})

for (let storageFolder of ['config', 'logs', 'cache']) {
    fs.mkdirSync(dirs.userConfig() + path.sep + storageFolder, {
        recursive: true
    });
}

import baseConfig from './config.js';

function fileExists(filepath)
{
    try {
        fs.statSync(filepath)
        return true
    } catch (err) {}

    return false;
}

let userConfigFile = dirs.userConfig() + path.sep + 'config' + path.sep + 'config.json';

let userConfig;
if (fileExists(userConfigFile)) {
    userConfig = JSON.parse(fs.readFileSync(userConfigFile));
    userConfig = _.merge(baseConfig, userConfig)

    fs.writeFileSync(userConfigFile, JSON.stringify(userConfig, '', 2));
} else {
    userConfig = baseConfig;
    fs.writeFileSync(userConfigFile, JSON.stringify(baseConfig, '', 2));
}

const config = userConfig;

let spotifyFile = dirs.userConfig() + path.sep + 'config' + path.sep + 'spotify.json';

if (fileExists(spotifyFile)) {
    try {
        config.spotify.token = JSON.parse(fs.readFileSync(spotifyFile));
        if (config.spotify.token.expires === undefined) {
            config.spotify.token = null;
        }
    } catch (err) {}
}

if (config.spotify.token && config.spotify.token.expires !== undefined) {
    if (config.spotify.token.expires < (new Date).getTime()) {
        refreshToken();
    }
}

async function refreshToken()
{
    let token = await fetch(' https://accounts.spotify.com/api/token', {
        method: 'POST',
        body: `grant_type=refresh_token&refresh_token=${config.spotify.token.refresh_token}`,
        headers:{
            'Authorization': 'Basic ' + btoa(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`),
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(res => res.json())

    if (token.error !== undefined) {
        throw new Error(token.error_description);
    }

    config.spotify.token = token;
    config.spotify.token.expires = (((new Date).getTime() / 1000) + config.spotify.token.expires_in) * 1000;

    setTimeout(refreshToken, config.spotify.token.expires_in * 1000)

    socketServer.emit('setup.spotify', config.spotify.token);

    fs.writeFileSync(spotifyFile, JSON.stringify(config.spotify.token));

    // database.set('spotifyToken', token);
    console.log('Refreshed your spotify token!')
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

    if (!config.spotify.token || config.spotify.token && config.spotify.token.expires < ((new Date).getTime() / 1000).toFixed(0)) {
        console.log('Authenticate spotify width: %s', buildSpotifyUrl());
    }
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
    config.spotify.token.expires = (((new Date).getTime() / 1000) + config.spotify.token.expires_in) * 1000;

    setTimeout(refreshToken, config.spotify.token.expires_in * 1000)

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
            case 'resub':
                initialised['subscription'].update(event.message, socketServer)
                break;
            case 'bits':
                if (config.settings.enableBitDonation && initialised['donations'] !== undefined) {
                    initialised['donations'].update(event.message, socketServer);
                } else if (initialised['bits'] !== undefined) {
                    initialised['bits'].update(event.message, socketServer);
                }

                break;
            default:
                if (initialised[event.type] !== undefined) {
                    initialised[event.type].update(event.message, socketServer);
                } else {
                    console.info('Event type not defined: %s (This is not an error, just a note)', event.type);
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

    socket.on('ready', () => {
        config.types.forEach((type) => {
            if (initialised[type] === undefined) {
                return;
            }

            let cachedFile = dirs.userConfig() + path.sep + 'cache' + path.sep + type + '.cache.json';
            let topCachedFile = dirs.userConfig() + path.sep + 'cache' + path.sep + 'top' + type + '.cache.json';

            if (fileExists(cachedFile)) {
                initialised[type].update(JSON.parse(fs.readFileSync(cachedFile)), socket);
            }

            if (fileExists(topCachedFile)) {
                initialised[type].updateTop(JSON.parse(fs.readFileSync(topCachedFile)), socket, true);
            }
        })
    });
})

// Setting up the alerts
config.types.forEach((type) => {
    if (type === "bits" && config.settings.enableBitDonation === true) {
        return;
    }

    initialised[type] = new types[type];
    initialised[type].initiate(config, io, client)
})