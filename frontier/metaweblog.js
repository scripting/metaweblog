on editPost (title="", link="", description="", adrstruct=nil, postId=0, username=nil, password=nil, blogId=nil, flPublish=true, adrdata=@metaWeblog.data)
	//Changes
		//6/9/02; 12:01:28 PM by DW
			//Created.
	local (url, struct)
	metaWeblog.init ()
	bundle //set defaults
		if username == nil
			username = user.metaWeblog.username
		if password == nil
			password = string (user.metaWeblog.password)
		if blogId == nil
			blogId = user.metaWeblog.blogId
	url = "xmlrpc://" + adrdata^.server + ":" + adrdata^.port + adrdata^.rpcPath
	if adrstruct == nil
		adrstruct = @struct
		new (tabletype, adrstruct)
	if title != ""
		adrstruct^.title = title
	if link != ""
		adrstruct^.link = link
	adrstruct^.description = description //description must be present, according to the Radio implementation
	return ([url].metaWeblog.editPost (postId, username, password, adrstruct^, flPublish))
on getCategories (blogid=nil, username=nil, password=nil, adrdata=@metaWeblog.data)
	//Changes
		//12/3/05; 8:32:23 PM by DW
			//Created. This is specified by the RFC, but until now we didn't have a glue script for it. 
			//http://www.xmlrpc.com/metaWeblogApi
	local (url)
	metaWeblog.init ()
	bundle //set defaults
		if username == nil
			username = user.metaWeblog.username
		if password == nil
			password = string (user.metaWeblog.password)
		if blogId == nil
			blogId = user.metaWeblog.blogId
	url = "xmlrpc://" + adrdata^.server + ":" + adrdata^.port + adrdata^.rpcPath
	return ([url].metaWeblog.getCategories (blogid, username, password))
on getPost (postId=0, username=nil, password=nil, blogId=nil, adrstruct=nil, adrdata=@metaWeblog.data)
	if adrstruct != nil
		local (url)
		metaWeblog.init ()
		bundle //set defaults
			if username == nil
				username = user.metaWeblog.username
			if password == nil
				password = string (user.metaWeblog.password)
			if blogId == nil
				blogId = user.metaWeblog.blogId
		url = "xmlrpc://" + adrdata^.server + ":" + adrdata^.port + adrdata^.rpcPath
		adrstruct^ = [url].metaWeblog.getPost (postid, username, password)
on getRecentPosts (blogid, username, password, numberOfPosts, adrdata=@metaWeblog.data)
	//Changes
		//8/24/06; 2:47:48 PM by DW
			//Created.
	local (url)
	metaWeblog.init ()
	bundle //set defaults
		if username == nil
			username = user.metaWeblog.username
		if password == nil
			password = string (user.metaWeblog.password)
		if blogId == nil
			blogId = user.metaWeblog.blogId
	url = "xmlrpc://" + adrdata^.server + ":" + adrdata^.port + adrdata^.rpcPath
	return ([url].metaWeblog.getRecentPosts (blogid, username, password, numberOfPosts))
on getRsdData (weblogurl, adrtable)
	//Changes
		//8/29/06; 10:52:26 AM by DW
			//Manila sometimes includes its <link> element without a closing />. Rather than force the user to update, or hack up the Manila source, we go ahead and put the slash in there for them. An example:
				//<link rel="EditURI" type="application/rsd+xml" title="RSD" href="http://fmcpherson.weblogger.com/xml/rsd.xml" >
		//8/26/06; 11:50:38 AM by DW
			//Allow for redirection on the HTTP read.
		//1/20/06; 8:33:14 AM by DW
			//Created.
			//Given the address of a weblog, read its source, find the RSD file, see if it supports the MetaWeblog API, and if so, fill teh table with its url and blogID, and return true.
	local (pat = "<link rel=\"EditURI\"")
	local (s = tcp.httpreadurl (weblogurl, ctFollowRedirects:5))
	local (ix = string.patternmatch (pat, s))
	if ix == 0
		return (false)
	s = string.delete (s, 1, ix-1)
	local (i, xstruct)
	for i = 1 to sizeof (s)
		if s [i] == '>'
			s = string.mid (s, 1, i)
			break
	if not (s endswith "/>") //8/29/06 by DW
		s = string.insert ("/", s, sizeof (s))
	xml.compile (s, @xstruct)
	//scratchpad.xstruct = xstruct; scratchpad.s = s
	
	local (adrlink = xml.getaddress (@xstruct, "link"))
	local (rsdurl = adrlink^.["/atts"].href)
	local (xmltext = tcp.httpreadurl (rsdurl))
	xml.compile (xmltext, @xstruct)
	//scratchpad.xstruct = xstruct
	
	local (adrrsd = xml.getaddress (@xstruct, "rsd"))
	local (adrservice = xml.getaddress (adrrsd, "service"))
	local (adrapis = xml.getaddress (adrservice, "apis"), adr)
	for adr in adrapis
		if nameof (adr^) contains "api"
			if adr^.["/atts"].name == "MetaWeblog"
				new (tabletype, adrtable)
				adrtable^.url = adr^.["/atts"].apiLink
				adrtable^.blogID = adr^.["/atts"].blogID
				return (true)
	return (false) //doesn't support the MetaWeblog API
on init ()
	if not defined (user.metaWeblog)
		new (tabletype, @user.metaWeblog)
	if not defined (user.metaWeblog.username)
		user.metaWeblog.username = ""
	if not defined (user.metaWeblog.password)
		user.metaWeblog.password = ""
	if not defined (user.metaWeblog.blogid)
		user.metaWeblog.blogid = 0
on newMediaObject (name, type, bits, username=nil, password=nil, blogId=nil, adrdata=@metaweblog.data)
	//Changes
		//1/31/08; 2:27:55 PM by DW
			//Created. New glue for MetaWeblog API call, tested with wordpress.com.
	local (url, struct)
	metaWeblog.init ()
	bundle //set defaults
		if username == nil
			username = user.metaWeblog.username
		if password == nil
			password = string (user.metaWeblog.password)
		if blogId == nil
			blogId = user.metaWeblog.blogId
	bundle //set up struct
		new (tabletype, @struct)
		struct.name = name
		struct.type = type
		struct.bits = bits
	url = "xmlrpc://" + adrdata^.server + ":" + adrdata^.port + adrdata^.rpcPath
	return ([url].metaWeblog.newMediaObject (string (blogid), username, password, struct))
on newPost (title="", link="", description="", adrstruct=nil, username=nil, password=nil, blogId=nil, flPublish=true, adrdata=@metaweblog.data)
	//Changes
		//11/23/05; 3:39:02 PM by DW
			//blogId must be a string.
		//6/9/02; 11:34:06 AM by DW
			//Created. See the server-side at radio.weblog.metaweblogapi.
	local (url, struct)
	metaWeblog.init ()
	bundle //set defaults
		if username == nil
			username = user.metaWeblog.username
		if password == nil
			password = string (user.metaWeblog.password)
		if blogId == nil
			blogId = user.metaWeblog.blogId
	url = "xmlrpc://" + adrdata^.server + ":" + adrdata^.port + adrdata^.rpcPath
	if adrstruct == nil
		adrstruct = @struct
		new (tabletype, adrstruct)
	if title != ""
		adrstruct^.title = title
	if link != ""
		adrstruct^.link = link
	adrstruct^.description = description //description must be present, according to the Radio implementation
	return ([url].metaWeblog.newPost (string (blogid), username, password, adrstruct^, flPublish))

on testEditPost ()
	local (struct)
	new (tabletype, @struct)
	struct.categories = {"Michegas", "Mind Bombs"}
	dialog.alert (editPost (postId: 1330, description:"I am working on Frontier/Radio glue for the MetaWeblog API. At first I thought it wasn't needed, but then I got to a place where I wanted the distinction betweeen using the Blogger API and the MetaWeblog API to be minimal, so it was time to build a parallel way of calling the MWA. That's what these glue scripts are for.", link:"http://www.xmlrpc.com/metaWeblogApi", adrstruct:@struct))
function testGetPost ()
	getpost (postid:1330, adrstruct:@scratchpad.struct)
on testGetCategories ()
	local (adrblog = @user.wordpress.blogs.default, data)
	local (username = adrblog^.username, password = string (adrblog^.password))
	local (blogid = 1)
	new (tabletype, @data)
	bundle //set up data
		local (urllist = string.urlsplit (adrblog^.url))
		new (tabletype, @data)
		data.protocol = "xml-rpc"
		data.port = 80
		data.rpcPath = "/" + urllist [3] 
		data.server = urllist [2]
	local (thelist = getCategories (blogid, username, password, @data), cats, item)
	new (tabletype, @cats)
	for item in thelist
		cats.[string.padwithzeros (sizeof (cats)+1, 3)] = item
	scratchpad.categories = cats
on testGetRsdData ()
	getRsdData ("http://scripting.wordpress.com/", @scratchpad.rsdData)
on testNewMediaObject ()
	local (bits = file.readwholefile ("Macintosh HD:tmp.jpg"))
	scratchpad.mediaresult = metaweblog.newmediaobject ("tmp.jpg", "image/jpeg", bits, user.wordPress.blogs.default.username, user.wordPress.blogs.default.password, 1)
on testNewPost ()
	local (struct)
	new (tabletype, @struct)
	struct.categories = {"Michegas", "Mind Bombs"}
	dialog.alert (newPost (description:"Now is the time for all good men to come to the aid of their country.", link:"http://www.scripting.com/", title:"Test Post for Metaweblog API glue", adrstruct:@struct))
