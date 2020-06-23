import { baseType } from "./baseType.js"

// Static Objects
let latest = {
    'type': 'song',
    'msg': ''
}

export class song extends baseType {
    typeName = 'song'

    update (event, io) {
        super.update(event, io)

        io.emit('update', latest)
    }
}