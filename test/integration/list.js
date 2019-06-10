"use strict";

//TODO: Move to mocha for automation
var util = require('util');
var Virtualbox = require('../dist/lib/virtualbox').Virtualbox,
    virtualbox = new Virtualbox(),
    args = process.argv.slice(2);

// TODO: Refactor with a promise
virtualbox.list().then(function(list_data, error){
  if(error) {
    throw error;
  }

  if(list_data) {
    console.log(util.inspect(list_data));
    //console.log(list_data);
  }
});