import { baseType } from "./baseType.js"

// Static Objects
let latest = {
    'type': 'song',
    'msg': ''
}

export class song extends baseType {
    update = function(event, io) {
        io.emit('update', latest)
    }
}