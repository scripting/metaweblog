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

function newPost (username, blogid, struct, publish, callback) {
	//Changes
		//6/18/23; 12:43:04 PM by DW
			//Here's how Radio created a new post. 
				//http://listings.opml.org/verbs/builtins/radio/weblog/metaWeblogApi/rpcHandlers/newPost.html
	var postid = utils.random (1, 1000);
	callback (undefined, postid);
	}
function editPost (username, postid, struct, publish, callback) {
	//Changes
		//6/18/23; 12:43:04 PM by DW
			//Here's how Radio eduts a post. 
				//http://listings.opml.org/verbs/builtins/radio/weblog/metaWeblogApi/rpcHandlers/editPost.html
	callback (undefined, true);
	}
function getPost (username, postid, callback) {
	//Changes
		//6/18/23; 12:43:04 PM by DW
			//Here's how Radio gets a post. 
				//http://listings.opml.org/verbs/builtins/radio/weblog/metaWeblogApi/rpcHandlers/getPost.html
	const thePost = {
		title: "This is a test",
		link: "http://listings.opml.org/verbs/builtins/radio/weblog/metaWeblogApi/rpcHandlers/getPost.html",
		description: "Nothing interesting to read here."
		}
	callback (undefined, thePost);
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
				callWithUsername (function (username) {
					newPost (username, params.blogid, params.struct, params.publish, httpReturn);
					});
				return (true);
			case "/editpost": 
				callWithUsername (function (username) {
					editPost (username, params.postid, params.struct, params.publish, httpReturn);
					});
				return (true);
			case "/getpost": 
				callWithUsername (function (username) {
					getPost (username, params.postid, httpReturn);
					});
				return (true);
			default: 
				theRequest.httpReturn (404, "text/plain", "Not found.");
				return (true);
			}
		});
	});

