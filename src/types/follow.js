import { baseType } from "./baseType.js"

// Static Objects
let latest = {
    'type': 'follow',
    'msg': ''
}

export class follow extends baseType {
    typeName = 'follow'

    update (event, io) {
        super.update(event, io)

        let config = this.config;

        // Check if tests are allowed
        if (event.isTest && !config.settings.showTests) {
            return
        }

        latest.msg = event.name

        io.emit('update', latest)
    }
}