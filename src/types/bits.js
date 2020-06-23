import { baseType } from "./baseType.js"

// Static Objects
let latest = {
    'type': 'bits',
    'msg': ''
}

export class bits extends baseType {
    typeName = 'bits'

    update (event, io) {
        super.update(event, io)

        let config = this.config;

        // Check if tests are allowed
        if (event.isTest && !config.settings.showTests) {
            return
        }

        if (config.settings.showDonationAmount) {
            latest.msg = event.name + '<span class="special seetrough"> - </span><span class="special green">' + event.amount + (event.amount == 1 ? (' ' + config.language.types.bit) : (' ' + config.language.types.bits)) + '</span>'
        } else {
            latest.msg = event.name
        }

        io.emit('update', latest)
    }
}