import { baseType } from "./baseType.js"
import fs from 'fs';
import path from 'path';

// Static Objects
let latestDonation = {
    'type': 'donation',
    'msg': ''
}

let topDonation = {
    'type': 'topDonation',
    'msg': ''
}

let topAmount = 0

export class donation extends baseType {
    typeName = 'donation'

    update (event, io) {
        super.update(event, io)

        let config = this.config;
        
        // Check if tests are allowed
        if (event.isTest && !config.settings.showTests) {
            return
        }

        if (config.settings.showDonationAmount) {
            latestDonation.msg = event.name + '<span class="special seetrough"> - </span><span class="special green">' + event.formatted_amount + '</span>'
        } else {
            latestDonation.msg = event.name
        }

        // Top Donation Calculations
        if (config.settings.enableTopDonation) {
            this.updateTop (event, io)
        }

        io.emit('update', latestDonation)
    }

    updateTop (event, io, initial) {
        let config = this.config;
        initial = initial || false;

        // New top donation
        if (parseFloat(event.amount) > parseFloat(topAmount) || initial === true) {
            if (initial === false) {
                fs.writeFileSync(dirs.userConfig() + path.sep + 'cache' + path.sep + 'top' + this.typeName + '.cache.json', JSON.stringify(event, '', 2))
            }

            topAmount = event.amount
            
            if (config.settings.showDonationAmount) {
                topDonation.msg = event.name + '<span class="special seetrough"> - </span><span class="special green">' + event.formatted_amount + '</span>'
            } else {
                topDonation.msg = event.name
            }
            
            io.emit('update', topDonation)
        }
    }
}