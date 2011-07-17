
// add this directory to the require paths
require.paths.unshift(__dirname + '/lib');
require.paths.unshift(__dirname);

var	extjs = require("node-extjs"),
  	XeroViz = require("xeroviz");

// start the Xero visualization tracker...
var xeroviz = new XeroViz();
xeroviz.startServer();
