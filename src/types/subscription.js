import { baseType } from "./baseType.js"

// Static Objects
let latest = {
    'type': 'subscription',
    'msg': ''
}


export class subscription extends baseType {
    update = function(event, io) {
        let config = this.config;
        
        // Check if tests are allowed
        if (event.isTest && !config.settings.showTests) {
            return
        }
        
        if (config.settings.showSubMonths) {
            latest.msg = event.name + '<span class="special seetrough"> - ' + event.months + (event.months == 1 ? (" " + config.language.types.month) : (" " + config.language.types.months)) + '</span>'
        } else {
            latest.msg = event.name
        }

        io.emit('update', latest)
    }
}