(function( root, factory )
{	if( typeof define === 'function' && define.amd )
		define([], factory);		// AMD
	else
		root.XmlAspect = factory();	// browser
}( this, function ()
{
	// todo validate JS w/ Lint

	// module:
	//		lib/AMD/xml
	// summary:
	//		This module implements the lib/AMD/xml! plugin and API for XML creation, transformation, XPath and node creation/removal.
	// description:
	//		As plugin returns XMLDOMDocument retrieved by XHR

	var XHTML	= "http://www.w3.org/1999/xhtml"
	,	AFNS	= "http://apifusion.com/ui/vc/1.0"
	,	DEFAULT_XML 	=	'<?xml version="1.0" encoding="UTF-8"?><r/>';

	var mod =
	{	load: function load(name, req, onLoad /*, config*/ ) // AMD plugin API
			{
				return getXml( req.toUrl( name ) ).then( onLoad, onLoad );
			}
	,	getXml		: getXml
	,	onSetHeader	: function(xhr){}
	,	createXml	: createXml
	,	transform	: transform 	// ( xml, xsl, el )
	,	XPath_node	: function XPath_node( xPath, node )
		{
			var d = node.ownerDocument || node
			,	nsResolver = d.createNSResolver && d.createNSResolver(d.documentElement);
			if( d.evaluate )
				return (node.ownerDocument || node)
					.evaluate(xPath, node, nsResolver, 9, null)
					.singleNodeValue;
			d.setProperty('SelectionLanguage', 'XPath');
			d.setProperty('SelectionNamespaces', 'xmlns:xsl="http://www.w3.org/1999/XSL/Transform"');

			return node.selectSingleNode( xPath );//,nsmgr )
		}
	,	XPath_nl : XPath_nl
	,	$ : XPath_nl
	,	o2xml			: object2Xml // ( o, tag, node )
	,	createElement 	: createElement
	,	cleanElement 	: cleanElement
	,	DEFAULT_XML		: DEFAULT_XML
	};
	return mod;

		function
	XPath_nl( /* string | Array */ xPath, node )
	{
		var	d	= ( node || xPath[0] ).ownerDocument || node
		,	nl	= [];
		nl.ownerDocument = d;
		if( "string" == typeof xPath )
			nl = xpath2arr(xPath, node);
		else
			nl.push.apply(nl,xPath);

		// WindJetQuery inlined
		var o = nl[0] || createElement('b',d);

		forEachProp( o, function(v,name)
		{
			nl[name] = function
				invokeElementMethod()
			{
				var args	= arguments
				,	i		= 0
				,	max		= this.length;

				this._ret = [];

				for( ; i<max ; i++ )
				{	var el	= this[i]
					,	v	= el[name];
					if( "function" === typeof v )
						v = v.apply( el, args );
					else if( args.length )	// setter
						v = el[name] = args[ i % args.length ];
					this._ret[i] = v;
				}
				return this;
			}
		}, nl );

		nl.attr = function( k,v )
		{	return arguments.length>1
			? nl.setAttribute(k,v)
			: nl[0] && nl[0].getAttribute(k);
		};
		nl.val	= function(){ return this[0] && this[0].value; };
		nl.createChild = createChild;
		nl.$ = function(xp)
		{	var ret = [];
			this.forEach( function( el )
			{
				ret.push.apply( ret, xpath2arr(xp,el) );
			});
			return XPath_nl( ret, d );
		};
		nl.$ret = function(){	return XPath_nl( this._ret, d ); };

		return nl;

			function
		xpath2arr(xPath, node)
		{
			var nl =[]
			,	e, xr
			,	nsResolver = d.createNSResolver && d.createNSResolver(d.documentElement);

			if( d.evaluate )
				xr = (node.ownerDocument || node).evaluate( xPath, node, nsResolver, 0, null );
			else
			{
				d.setProperty('SelectionLanguage', 'XPath');
				d.setProperty('SelectionNamespaces', 'xmlns:xsl="http://www.w3.org/1999/XSL/Transform"');
				xr = node.SelectNodes( xPath );//, nsmgr );
			}
			while( e = xr.iterateNext() )
				nl.push(e);
			return nl;
		}
	}
		function
	createChild(name, attrs)
	{	this.forEach(function(n,i)
		{	var c = this._ret[i] = n.ownerDocument.createElementNS(AFNS,name);
			for( var a in attrs )
				c.setAttribute( a, attrs[a] );
			n.appendChild( c );
		}, this);
		return this;
	}

		function /*  @returns { Promise<XMLDocument>, options:{headers:{}, method:'GET',async:true,responseHeaders:{}} }
					The promise that the result will load. */
	getXml	(	url
			,	options /* XHR properties or headers hashmap */
			)
	{
		if(!options )
			options = {};
		var callbacks 	= []
		,	errbacks	= []
		,	promise 	= {	then: then, options: options }
		,	xhr 		= new XMLHttpRequest(); // new ActiveXObject("Msxml2.XMLHTTP") 	// IE
		forEachProp( options, function( v, k ){	xhr[k] = v;	});
		options.method = options.method || "GET";
		if( 'onerror' in xhr )
			xhr.onerror = onError;
		xhr.onreadystatechange = function ()
		{
			if(   4 !== xhr.readyState )
				return;
			options.responseHeaders = xhr.getAllResponseHeaders();
            options.requestUrl      = url;
			if( 200 !== xhr.status )
				return onError( new Error( xhr.status + " " + xhr.statusText +" @ " + url ), xhr );
			// todo 300+ redirect
			try
			{	if( xhr.responseXML )
					return onLoad( xhr.responseXML, xhr );
				onLoad( new DOMParser().parseFromString( xhr.responseText, "application/xml" ), xhr );
			}catch( ex )
				{	onError( ex, xhr );	}
		};
		xhr.open( options.method, url, true );

		xhr.setRequestHeader &&  xhr.setRequestHeader("Accept", "application/xml, text/xml, application/xhtml+xml, text/xsl, text/html, text/plain");
		xhr.setRequestHeader &&  forEachProp( options.headers ||{}, function( v, k ){ xhr.setRequestHeader(k,v); });

		mod.onSetHeader(xhr);
		xhr.send();

		function then( onLoad, onError )
		{	onLoad 	&& callbacks.push(onLoad);
			onError && errbacks.push(onError);
			return this;
		}
		function onError(err, xhr)
		{
			errbacks.forEach( function(cb){ cb( err, xhr ); } );
		}
		function onLoad( xml, xhr )
		{
			callbacks.forEach( function(cb){ cb( xml, xhr ); } );
		}
		return promise;
	}
		function
	transform( xml, xsl, el )
	{
		var p = new XSLTProcessor();
		p.importStylesheet(xsl);

		if( el )
		{	cleanElement(el);
			el.appendChild( p.transformToFragment( xml, el.ownerDocument ) );
			return el;
		}else
			return p.transformToDocument(xml);
			// doc && ( doc.documentElement.outerHTML || doc.documentElement.outerXML );
	}
		function
	createXml()
	{
		return 	new DOMParser().parseFromString( DEFAULT_XML, "application/xml" );
	}
	// todo xml2Object, tests
		function
	object2Xml( o, tag, node )
	{
		// object2Xml( { aa:[1,2], b:{a:'asd'},c:'qwe'},'root')
		// returns <root><aa><r>1</r><r>1</r></aa><c>qwe</c></root>

		node = node || mod.createXml().documentElement;
		var n = createEl(tag);
		if( o instanceof Array )
			o.forEach( function( el )
				{	object2Xml( el, 'r', n );	});
		else if( o instanceof Object )
			forEachProp( o, function( v, k )
				{	object2Xml( v, k, n );	});
		else
		{	var t = n.ownerDocument.createTextNode( '' + o );
			n.appendChild(t);
		}
		return n;
		function createEl(k){ var e = mod.createElement( k, node.ownerDocument || node ); node.appendChild(e); return e; }
	}
		function
	createElement( name, document, nsUrl )
	{
		return nsUrl && document.createElementNS ? document.createElementNS( nsUrl, name ) : document.createElement(name);
	}
		function
	cleanElement(el)
	{
		while( el && el.lastChild)
			el.removeChild(el.lastChild);
	}

		function
	forEachProp( o, onProp, scope )
	{
		if( !o )
			return;
		var n;
		if( scope )
			if( 'string' === typeof onProp )
				for( n in o )
					scope[onProp].call( scope, o[n], n, o );
			else
				for( n in o )
					onProp.call( scope, o[n], n, o );
		else
			for( n in o )
				onProp( o[n], n, o );
	}
}));