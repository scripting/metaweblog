var urlEndpoint = "//localhost:1417/rpc2";

function testNewpost () {
	const params = [
		1, //blogid
		"captainkirk", //username
		"ilookcool", //password
		{
			"title": "This is a test of the MetaWeblog API.",
			"link": "http://xmlrpc.com/metaweblog",
			"description": "The MetaWeblog API is a standard protocol for remotely managing and posting content on blogging platforms, enabling cross-platform compatibility and streamlined content management."
			},
		true //publish
		];
	xmlRpcClient (urlEndpoint, "metaWeblog.newPost", params, "xml", function (err, data) {
		if (err) {
			console.log ("err.message == " + err.message);
			}
		else {
			console.log (jsonStringify (data));
			}
		});
	}

function startup () {
	console.log ("startup");
	
	testNewpost ();
	}


