import { baseType } from "./baseType.js"

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
    update = function (event, io) {
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
            // New top donation
            if (parseFloat(event.amount) > parseFloat(topAmount)) {
                topAmount = event.amount
                
                if (config.settings.showDonationAmount) {
                    topDonation.msg = event.name + '<span class="special seetrough"> - </span><span class="special green">' + event.formatted_amount + '</span>'
                } else {
                    topDonation.msg = event.name
                }
                
                io.emit('update', topDonation)
            }
        }

        io.emit('update', latestDonation)
    }
}