"use strict";

//TODO: Move to mocha for automation
var nvbox = require('../dist/virtualbox'),
    args = process.argv.slice(2);

virtualbox.modify(args[0], args[1], function(error){
    if(error) {
        throw error;
    }
});
