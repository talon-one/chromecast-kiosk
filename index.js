const
    nodecastor = require('nodecastor'),
    JSON5 = require('json5'),
    fs = require('fs');

function log(s) {
    console.log(new Date().toISOString() + " " + s)
}

function isIdle(status) {
    if (status.applications === undefined || status.applications === null) {
        return false;
    }
    if (status.applications.length != 1) {
        return false;
    }

    if (status.applications[0].isIdleScreen !== true) {
        return false;
    }
    return true
}

function cast(host, device, url) {
    device.status((err, status) => {
        if (err !== null && err !== undefined) {
            log(`${host}: error on getting status: ${err}`)
            return
        }
        if (!isIdle(status)) {
            log(`${host}: is not idle`)
            return
        }

        log(`${device.address}: casting...${url}`)

        // device.application('5C3F0A3C', function (err, app) {
        //     if (err) {
        //       log("unable to start application: ", err)
        //       return
        //     }
        //     // log('Application', util.inspect(a));
        //     app.run('urn:x-cast:es.offd.dashcast', function (err, s) {
        //       if (err) {
        //         log("unable to run cast: ", err)
        //         return 
        //       }
        //       s.send({ url: url });
        //     });
        // });
        device.application('10B2AF08', function (err, app) {
            if (err !== null && err !== undefined) {
                log(`${device.address}: unable to start application: ${err}`)
                return
            }
            // log('Application', util.inspect(a));
            app.run('urn:x-cast:de.michaelkuerbis.kiosk', function (err, s) {
                if (err !== null && err !== undefined) {
                    log(`${device.address}: unable to start cast: ${err}`)
                    return
                }
                s.send({ url: url, type: "load", refresh: 0 });
            });
        });
    });
}


function watch(host, url, timeout) {
    log(`connecting to ${host}`)

    const device = new nodecastor.CastDevice({
        friendlyName: 'Chromecast',
        address: host,
        port: 8009,
        reconnect: false,
    })


    device.on('connect', function () {
        cast(host, device, url)
    });
    device.on('status', (status) => {
        if (!isIdle(status)) {
            log(`${host}: is not idle`)
            return
        }

        log(`${host}: casting in ${timeout}ms`)
        setTimeout(() => {
            cast(host, device, url)
        }, timeout)
    })
    device.on('error', () => {
        log(`${host}: error, retrying in ${timeout}ms`)
        setTimeout(() => {
            watch(host, url)
        }, timeout)
    })
    device.on('disconnect', () => {
        log(`${host}: disconnect, retrying in ${timeout}ms`)
        setTimeout(() => {
            watch(host, url)
        }, timeout)
    })
}





let config = JSON5.parse(fs.readFileSync('config.json'));

for (let i = 0; i < config.length; i++) {
    watch(config[i].Host, config[i].URL, config[i].Timeout || 60000);
}
