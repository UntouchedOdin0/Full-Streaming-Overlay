import { baseType } from "./baseType.js"

// Static objects
let latest = {
    'type': 'host',
    'msg': ''
}

export class host extends baseType {
    typeName = 'host'

    update (event, io) {
        super.update(event, io)

        let config = this.config;

        // Check if tests are allowed
        if (event.isTest && !config.settings.showTests) {
            return
        }

        if (config.settings.showHostAmount) {
            latest.msg = event.name + '<span class="special seetrough"> - ' + (event.viewers || event.raiders) + ((event.viewers === 1 || event.raiders === 1) ? (" " + config.language.types.viewer) : (" " + config.language.types.viewers)) + '</span>'
        } else {
            latest.msg = event.name
        }

        io.emit('update', latest)
    }
}