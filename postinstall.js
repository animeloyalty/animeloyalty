const fs = require('fs-extra');
const path = require('path');
const public = require('animeloyalty-client');
const root = path.resolve(__dirname, 'app', 'public');
fs.removeSync(root);
fs.copySync(public, root);
