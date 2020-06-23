const config = {
    "debug": true,
    "settings": {
        "port": 8080,
        "language": "english",
        "enableTopDonation": true,
        "enableBitDonation": true,
        "showDonationAmount": true,
        "showSubMonths": true,
        "showHostAmount": true,
        "showSongArtist": true,
        "songCheckingSpeed": 5000,
        "hideIfEmpty": false
    },
    "overlay": {
        "backgroundColor": "rgba(0, 0, 0, 0.5)",
        "textColor": "white"
    },
    "types": [
        "song",
        "donation",
        "subscription",
        "host",
        "follow",
    ],
    "spotify": {
        "scopes": [
            "user-read-playback-state"
        ]
    }
};

export default config;