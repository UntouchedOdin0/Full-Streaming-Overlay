// Static Objects
let latest = {
    'type': 'song',
    'msg': ''
}

export class song {
    // Initiate the song alerts
    initiate = function(config, io, client) {

    }

    update = function(io) {
        io.emit('update', latest)
    }
}