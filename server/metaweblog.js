const fs = require ("fs");
const utils = require ("daveutils");
const davehttp = require ("davehttp");

var config = {
	port: process.env.PORT || 1417,
	flLogToConsole: true,
	flAllowAccessFromAnywhere: true
	};

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

function newPost (iduser, idblog, jstruct, flpublish, callback) {
	var idpost = utils.random (1, 1000);
	callback (undefined, idpost);
	}

readConfig ("config.json", config, function () {
	console.log ("config == " + utils.jsonStringify (config));
	davehttp.start (config, function (theRequest) {
		const params = theRequest.params;
		function returnPlainText (theString) {
			if (theString === undefined) {
				theString = "";
				}
			//console.log ("returnPlainText: theString == " + theString + ", typeof theString == " + typeof theString);
			theRequest.httpReturn (200, "text/plain", theString);
			}
		function returnData (jstruct) {
			if (jstruct === undefined) {
				jstruct = {};
				}
			theRequest.httpReturn (200, "application/json", utils.jsonStringify (jstruct));
			}
		function returnError (jstruct) {
			theRequest.httpReturn (500, "application/json", utils.jsonStringify (jstruct));
			}
		function returnJsontext (jsontext) { 
			theRequest.httpReturn (200, "application/json", jsontext.toString ());
			}
		function httpReturn (err, returnedValue) {
			//Changes
				//9/14/22; 3:47:35 PM by DW
					//If the returned value is an object, call returnData, but if it's something else, return it as a string. 
					//In all cases, the returned type is application/json.
					//This allows the river routines to convert the object to jsontext so it can cache that instead of an object.
			if (err) {
				returnError (err);
				}
			else {
				if (typeof returnedValue == "object") {
					returnData (returnedValue);
					}
				else {
					returnJsontext (returnedValue); //9/14/22 by DW
					}
				}
			}
		
		function callWithUsername (callback) {
			//Changes
				//6/18/23; 12:30:23 PM by DW
					//To start, all usernames and passwords are valid. ;-)
			callback (1); 
			}
		
		switch (theRequest.lowerpath) {
			case "/now": 
				returnPlainText (new Date ().toString ());
				return (true);
			case "/newpost": 
				callWithUsername (function (idUser) {
					newPost (iduser, params.blogid, params.struct, params.flpublish, httpReturn);
					});
				return (true);
			default: 
				theRequest.httpReturn (404, "text/plain", "Not found.");
				break;
			}
		});
	});

