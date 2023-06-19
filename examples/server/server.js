const fs = require ("fs");
const utils = require ("daveutils");
const metaweblog = require ("../../server/metaweblog.js");
//const metaweblog = require ("davemetaweblog");

function checkUsername (username, password, callback) {
	callback (undefined); //no error
	}

function newPost (blogid, username, password, struct, publish, callback) {
	checkUsername (username, password, function (err) {
		if (err) {
			callback (err);
			}
		else {
			var postid = utils.random (1, 1000);
			callback (undefined, postid);
			}
		});
	}
function editPost (postid, username, password, struct, publish, callback) {
	checkUsername (username, password, function (err) {
		if (err) {
			callback (err);
			}
		else {
			callback (undefined, true);
			}
		});
	}
function getPost (postid, username, password, callback) {
	checkUsername (username, password, function (err) {
		if (err) {
			callback (err);
			}
		else {
			const thePost = {
				title: "This is a test",
				link: "http://listings.opml.org/verbs/builtins/radio/weblog/metaWeblogApi/rpcHandlers/getPost.html",
				description: "Nothing interesting to read here."
				}
			callback (undefined, thePost);
			}
		});
	}

var config = {
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
readConfig ("config.json", config, function () {
	config.metaweblog = {
		newPost,
		editPost,
		getPost
		};
	
	metaweblog.start (config);
	});
