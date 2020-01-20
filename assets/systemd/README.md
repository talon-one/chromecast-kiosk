Create the user who should run the service, or choose an existing one.

Copy the chromecast-kiosk@.service file into the load path of the system instance. (https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Unit%20File%20Load%20Path)

Enable and start the service. Replace “myuser” with the actual user after the @:

systemctl enable chromecast-kiosk@myuser.service
systemctl start chromecast-kiosk@myuser.service