# Full Streaming Overlay
A streaming overlay fully made using only code.

# Todo:
- Rename it from Full Streaming Overlay - I feel it is not a relevant name
- Make the sign in process easier
- Add token refreshing
- Retrieve latest values on startup
- Basic Settings page?


## Getting Started
These instructions will help you installing the overlay!

### Prerequisites
You will need the following programs and software setup to get the overlay to work.

```
NodeJS v14.4.0
NPM 6.14.5
```

#### Spotify Developer Application
You need to register for a Spotify application and store the client ID and client secret in the .env file. You can get those from [here](https://developer.spotify.com/dashboard/applications).

#### Streamlabs
You need to store the Streamlabs access token and socket token in the .env file. You can get those from [here](https://streamlabs.com/dashboard#/settings/api-settings).

### Installing

1. Install the dependencies `npm i`
1. Modify the config to your liking

### Starting
1. `npm start`
1. If not done already, authenticate spotify using link provided in terminal

## Using the overlay
Add a browser source to your streaming client with the url `http://localhost:PORT/side` - replacing PORT with your port. The default is `8080`.

### A Neat Gif
![Neat Gif](https://image.ibb.co/epeP1c/wadwd_made_dis.gif)

## Contribution
* VirtualPhilipp (German Translation/Testing)

## Forked from: https://github.com/Coocla33/Full-Streaming-Overlay