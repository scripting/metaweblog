const myProductName = "metaweblog", myVersion = "0.4.1"; 

exports.start = start; 

const fs = require ("fs");
const utils = require ("daveutils");
const davehttp = require ("davehttp");
const xmlrpc = require ("davexmlrpc");


function readConfig (f, config, callback) {
	fs.readFile (f, function (err, jsontext) {
		if (!err) {
			try {
				var jstruct = JSON.parse (jsontext);
				for (var x in jstruct) {
					config [x] = jstruct [x];
					}
				}
			catch (err) {
				console.log ("Error reading " + f);
				}
			}
		callback ();
		});
	}


var config = {
	port: process.env.PORT || 1417,
	flPostEnabled: true,
	xmlRpcPath: "/rpc2",
	flLogToConsole: true,
	flAllowAccessFromAnywhere: true,
	metaweblog: {
		newPost: function (blogid, username, password, struct, publish, callback) {
			callback (undefined, "");
			},
		editPost: function (postid, username, password, struct, publish, callback) {
			callback (undefined, true);
			},
		getPost: function (postid, username, password, callback) {
			callback (undefined, new Object ());
			}
		}
	};

function handleXmlrpcRequest (theRequest) {
	const params = theRequest.params;
	switch (theRequest.verb) {
		case "metaWeblog.newPost": 
			config.metaweblog.newPost (params.blogid, params.username, params.password, params.struct, params.publish, theRequest.returnVal);
			return (true);
		case "metaWeblog.editPost": 
			config.metaweblog.editPost (params.postid, params.username, params.password, params.struct, params.publish, theRequest.returnVal);
			return (true);
		case "metaWeblog.getPost": 
			config.metaweblog.getPost (params.postid, params.username, params.password, theRequest.returnVal);
			return (true);
		//case "mail.send":
			//mailSend (xmlRpcRequest.params, xmlRpcRequest.returnVal);
			//return (true); //we handled it
		}
	return (false); //not handled
	}

function start (options, callback) {
	if (options !== undefined) {
		for (var x in options) {
			config [x] = options [x];
			}
		}
	console.log ("metaweblog.start: config == " + utils.jsonStringify (config));
	xmlrpc.startServerOverHttp (config, handleXmlrpcRequest);
	}

