// Static Objects
let latest = {
    'type': 'sub',
    'msg': ''
}


export class sub {
    initiate = function(config, io, client) {
        client.on('.subscription', (data) => {
            console.log(data);
            // Check if tests are allowed
            if (data.isTest && !config.settings.showTests) {
                return
            }
            
            if (config.settings.showSubMonths) {
                latest.msg = data.name + '<span class="special seetrough"> - ' + data.months + (data.months == 1 ? (" " + language.types.month) : (" " + language.types.months)) + '</span>'
            } else {
                latest.msg = data.name
            }

            io.emit('update', latest)
        })
    }

    update = function(io) {
        io.emit('update', latest)
    }
}