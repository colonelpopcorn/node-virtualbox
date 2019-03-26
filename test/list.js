"use strict";

var util = require('util');
var nvbox = require('../dist/virtualbox'),
    args = process.argv.slice(2);

virtualbox.list(function(list_data, error){
  if(error) {
    throw error;
  }

  if(list_data) {
    console.log(util.inspect(list_data));
    //console.log(list_data);
  }
});
