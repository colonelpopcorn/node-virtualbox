"use strict";

// TODO: Move to mocha for automation
import {Virtualbox} from "../dist/virtualbox";

const vbox = new Virtualbox();
const args = process.argv.slice(2);

// TODO: Refactor with a promise
vbox.pause(args[0], (error) => {
  if (error) {
    throw error;
  }
});
