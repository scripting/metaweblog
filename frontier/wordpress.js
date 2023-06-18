on getEnclosureHtml (enclosureUrl, pubDate=clock.now ())
	local (t, length)
	new (tabletype, @t)
	t.enclosureUrl = enclosureUrl
	t.enclosureFname = string.lastField (enclosureUrl, "/")
	tcp.httpGetTypeLength (enclosureUrl, @t.enclosureType, @length)
	t.enclosureMegabytes = string.megabytestring (length)
	t.pubDateString = date.longstring (pubDate)
	return (string.multiplereplaceall (string (wordPress.data.enclosureTemplate), @t, false, ", "))
on getPost (siteUrl, username, password, postid, adrstruct)
	//Changes
		//10/28/09; 12:04:50 PM by DW
			//Created. 
	local (adrdata = wordPress.init (), rpcdata)
	local (adrsite = wordPress.getSiteData (siteurl))
	wordPress.getRpcData (siteurl, @rpcdata)
	metaweblog.getpost (postId, username, password, adrsite^.blogId, adrstruct, @rpcdata)
on getRpcData (siteurl, adrrpcdata)
	local (adrsite = wordPress.getSiteData (siteurl))
	local (ul = string.urlsplit (adrsite^.url))
	new (tabletype, adrrpcdata)
	adrrpcdata^.server = ul [2]
	adrrpcdata^.port = 80
	adrrpcdata^.rpcPath = "/" + ul [3]
on getSiteData (siteUrl)
	//Changes
		//10/28/09; 9:11:35 AM by DW
			//Created. 
	local (adrdata = wordPress.init (), adrsite = @adrdata^.sites.[siteUrl], now = clock.now ())
	if not defined (adrsite^)
		if not metaweblog.getRsdData (siteUrl, adrsite)
			scriptError ("Can't get site data because " + siteUrl + " isn't a WordPress site.")
		new (tabletype, @adrsite^.stats)
		adrsite^.stats.ctAccesses = 0
		adrsite^.stats.whenFirstAccess = now
	adrsite^.stats.ctAccesses++
	adrsite^.stats.whenLastAccess = now
	return (adrsite)
on init ()
	//Changes
		//10/28/09; 9:01:39 AM by DW
			//Created. 
	local (adrdata = @config.wordPress)
	if not defined (adrdata^)
		new (tabletype, adrdata)
	bundle //prefs
		if not defined (adrdata^.prefs)
			new (tabletype, @adrdata^.prefs)
	bundle //stats
		if not defined (adrdata^.stats)
			new (tabletype, @adrdata^.stats)
	if not defined (adrdata^.sites)
		new (tabletype, @adrdata^.sites)
	bundle //temp table
		if not defined (system.temp.wordPress)
			new (tabletype, @system.temp.wordPress)
	return (adrdata)
on newMediaObject (siteUrl, username, password, name, type, bits)
	//Changes
		//11/11/09; 11:33:55 AM by DW
			//Created. 
	local (adrdata = wordPress.init (), objectdata)
	local (adrsite = wordPress.getSiteData (siteurl), struct, rpcdata)
	wordPress.getRpcData (siteurl, @rpcdata)
	objectdata = metaWeblog.newMediaObject (name, type, bits, username, password, adrsite^.blogid, adrdata:@rpcdata)
	return (objectdata.url)
on savePost (siteUrl, username, password, title=nil, bodytext=nil, postId = nil, pubDate=nil, enclosureUrl=nil)
	//Changes
		//10/28/09; 12:28:27 PM by DW
			//Created. 
	local (adrdata = wordPress.init ())
	local (adrsite = wordPress.getSiteData (siteurl), struct, rpcdata)
	wordPress.getRpcData (siteurl, @rpcdata)
	bundle //fill struct
		new (tabletype, @struct)
		if pubDate != nil
			struct.dateCreated = pubDate
		if enclosureUrl != nil
			new (tabletype, @struct.enclosure)
			struct.enclosure.url = enclosureUrl
			tcp.httpGetTypeLength (enclosureUrl, @struct.enclosure.type, @struct.enclosure.length, 5)
	bundle //set defaults
		if title == nil
			title = ""
		if bodytext == nil
			bodytext = ""
	if postid == nil
		postid = metaweblog.newPost (title, "", bodytext, @struct, username, password, adrsite^.blogid, adrdata:@rpcdata) 
	else
		metaweblog.editpost (title, "", bodytext, @struct, postid, username, password, adrsite^.blogid, adrdata:@rpcdata)
	return (postid)

on testGetEnclosureHtml ()
	clipboard.putvalue (getEnclosureHtml ("http://mp3.morningcoffeenotes.com/reboot09Sep08.mp3"))
on testGetPost () //test code
	getpost ("http://rebootnews.wordpress.com/", user.wordpress.prefs.username, user.wordpress.prefs.password, 9, @scratchpad.wpstruct)
on testGetRpcData ()
	getrpcdata ("http://rebootnews.wordpress.com/", @scratchpad.rpcdata)
on testInit ()
	init ()
on testNewMediaObject ()
	local (f = "ohio:pictures:DSCN2944.JPG", fname = file.filefrompath (f))
	local (bits = file.readwholefile (f), type = "image/jpeg")
	webbrowser.openurl (newMediaObject ("http://unberkeley.com/", user.wordpress.prefs.username, user.wordpress.prefs.password, fname, type, bits))
on testSavePost ()
	local (adrtable = @config.myTwitterProfile.calendar.["2009"].["10"].["28"].["00041"])
	local (title = adrtable^.title, pubdate = adrtable^.pubdate)
	local (bodytext = string (adrtable^.description), postid = nil)
	if defined (adrtable^.postid)
		postid = adrtable^.postid
	adrtable^.postid = savePost ("http://rebootnews.wordpress.com/", user.wordpress.prefs.username, user.wordpress.prefs.password, title, bodytext, postid, pubdate, enclosureUrl:"http://mp3.morningcoffeenotes.com/reboot09Oct26.mp3")
