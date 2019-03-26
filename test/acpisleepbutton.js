"use strict";

var Virtualbox = require('../dist/virtualbox').Virtualbox,
    virtualbox = new Virtualbox(),
    args = process.argv.slice(2);

virtualbox.acpisleepbutton(args[0]); 
