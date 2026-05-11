#!/bin/bash
ACTION=${1:-run}
NWJS="/home/mustakim/Flash/Emu/nwjs-cordova/pookie/nwjs"
WWW=~/Flash/Emu/flash-emu/platforms/cordova-platform-nwjs/www

cordova prepare nwjs

if [ "$ACTION" = "build" ]; then
    echo "Building NW.js package..."
    mkdir -p ~/Flash/Emu/flash-emu/build-nwjs
    cp -r "$NWJS/." ~/Flash/Emu/flash-emu/build-nwjs/
    cp -r "$WWW/." ~/Flash/Emu/flash-emu/build-nwjs/
    echo "Built to ~/Flash/Emu/flash-emu/build-nwjs/"
    echo "Run it with: ~/Flash/Emu/flash-emu/build-nwjs/nw ."
else
    "$NWJS/nw" "$WWW"
fi
