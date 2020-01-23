const
    nodecastor = require('nodecastor'),
    JSON5 = require('json5'),
    fs = require('fs');

function log(s) {
    console.log(new Date().toISOString() + " " + s)
}

function shouldCast(status) {
    if (status.applications === undefined || status.applications === null) {
        return false;
    }
    if (status.applications.length !== 1) {
        return false;
    }
    if (status.applications[0].isIdleScreen !== true && status.applications[0].appId !== '10B2AF08') {
        return false;
    }
    return true
}

function cast(host, device, url, reload) {
    device.status((err, status) => {
        if (err !== null && err !== undefined) {
            log(`${host}: error on getting status: ${err}`)
            return
        }
        if (!shouldCast(status)) {
            log(`${host}: is not idle`)
            return
        }

        log(`${device.address}: casting...${url}`)

   

        if (reload !== undefined && reload !== null && reload >= 0) {
            log(`${device.address}: reloading in ${reload}ms`)
            setTimeout(()=>{
                cast(host, device, url, reload)
            }, reload)
        }

        // alternative to de.michaelkuerbis.kiosk (also change shouldCast function!)
        // device.application('5C3F0A3C', function (err, app) {
        //     app.run('urn:x-cast:es.offd.dashcast', function (err, s) {
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


function watch(host, url, timeout, reload) {
    log(`connecting to ${host}`)

    if (timeout === undefined || timeout === null || timeout <= 0) {
        timeout = 60000;
    }

    const device = new nodecastor.CastDevice({
        friendlyName: 'Chromecast',
        address: host,
        port: 8009,
        reconnect: false,
    })


    device.on('connect', function () {
        cast(host, device, url, reload)
    });
    device.on('status', (status) => {
        if (!shouldCast(status)) {
            log(`${host}: is not idle`)
            return
        }

        log(`${host}: casting in ${timeout}ms`)
        setTimeout(() => {
            cast(host, device, url, reload)
        }, timeout)
    })
    device.on('error', () => {
        log(`${host}: error, retrying in ${timeout}ms`)
        setTimeout(() => {
            watch(host, url, timeout, reload)
        }, timeout)
    })
    device.on('disconnect', () => {
        log(`${host}: disconnect, retrying in ${timeout}ms`)
        setTimeout(() => {
            watch(host, url, timeout, reload)
        }, timeout)
    })
}





let config = JSON5.parse(fs.readFileSync('config.json'));

for (let i = 0; i < config.length; i++) {
    watch(config[i].Host, config[i].URL, config[i].Timeout, config[i].Reload);
}
