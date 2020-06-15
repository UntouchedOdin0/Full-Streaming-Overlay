// Static objects
let latest = {
    'type': 'host',
    'msg': ''
}

export class host {
    // Initiate the host alerts
    initiate = function(config, io, client) {
        client.on('.host', (data) => {
            // Check if tests are allowed
            if (data.isTest && !config.settings.showTests) {
                return
            }

            if (config.settings.showHostAmount) {
                latest.msg = data.name + '<span class="special seetrough"> - ' + data.viewers + (data.viewers == 1 ? (" " + language.types.viewer) : (" " + language.types.viewers)) + '</span>'
            } else {
                latest.msg = data.name
            }

            io.emit('update', latest)
        })
    }

    update = function (io) {
        io.emit('update', latest)
    }
}