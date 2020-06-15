// Static Objects
let latest = {
    'type': 'follow',
    'msg': ''
}

export class follow {
// Initiate the follower alerts
    initiate = function(config, io, client) {
        client.on('.follow', (data) => {
            // Check if tests are allowed
            if (data.isTest && !config.settings.showTests) {
                return
            }

            latest.msg = data.name

            io.emit('update', latest)
        })
    }

    update = function(io) {
        io.emit('update', latest)
    }
}