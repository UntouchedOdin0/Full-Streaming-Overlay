const config = {
    "debug": true,
    "settings": {
        "showTests": true,
        "randomNamesOnTests": true,
        "randomMonthsOnTests": true,
        "port": 8080,
        "language": "english",
        "enableTopDonation": true,
        "enableBitDonation": true,
        "showDonationAmount": true,
        "showSubMonths": true,
        "showHostAmount": true,
        "showSongArtist": true,
        "songCheckingSpeed": 250
    },
    "overlay": {
        "backgroundColor": "rgba(0, 0, 0, 0.5)",
        "textColor": "white"
    },
    "types": [
        "song",
        "donation",
        "sub",
        "host",
        "follow"
    ]
};

export default config;