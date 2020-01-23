# chromecast-kiosk

Use chromecasts to display websites and act as dashboards, information displays or digitial signage.

## Features
* Cast websites without browser
* Reload websites after a certian timeout
* Re(Cast) the website when a user stops their cast

## Installation
1. Install dependencies with `yarn install`
2. Adjust the config.json
3. Specify one or multiple chromecasts hosts and the website that they should display
4. run `node index.js`
5. The chromecasts will start to cast the website

As soon as you stop the website casting and cast your own content the application will wait until you stop casting and will start the casting again (after 60s timeout).


## Special Thanks
Special Thanks to Michael Rothenbücher for providing a usable (chromecast) app for casting content in his [Chromecast Kiosk](https://github.com/mrothenbuecher/Chromecast-Kiosk) project.
