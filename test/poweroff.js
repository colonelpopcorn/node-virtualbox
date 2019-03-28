"use strict";

//TODO: Move to mocha for automation
var Virtualbox = require('../dist/virtualbox').VirtualBox,
    args = process.argv.slice(2),
    virtualbox = new Virtualbox();

virtualbox.poweroff(args[0]).then(value => { console.log(value); }).catch(err => { console.error(err); });
