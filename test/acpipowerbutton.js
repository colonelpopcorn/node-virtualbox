"use strict";

//TODO: Move to mocha for automation
var Virtualbox = require('../dist/virtualbox').Virtualbox,
    virtualbox = new Virtualbox(),
    args = process.argv.slice(2);
  
virtualbox.acpipowerbutton(args[0]);