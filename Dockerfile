FROM node:9.3

COPY . /app

WORKDIR /app/

RUN apt-get -y update && \
    apt-get -y upgrade && \
    apt-get -y install avahi-daemon avahi-discover libnss-mdns && \
    apt-get -y install libavahi-compat-libdnssd-dev && \
    yarn install

CMD service dbus start && service avahi-daemon start && node index.js