/**
 * Shim with IE support for AMD/xml
 * the triggering condition should be (window.ActiveXObject !== undefined)
 */
(function (root, factory)
{	if( typeof define === 'function' && define.amd )
	define(["./xml"], factory);			// AMD
else if ( typeof exports === 'object' )
	module.exports = factory();		// Node
else
	root.returnExports = factory();	// browser
}( this, function( mod )
{
	// module:
	//		lib/AMD/xml_ie
	// summary:
	//		This module is a IE shim for lib/AMD/xml! plugin and API .
	// description:
	//		As plugin returns XMLDOMDocument retrieved by XHR

	// todo validate JS w/ Lint
	if( 'ActiveXObject' in window )
	{	mod.onSetHeader = function(xhr){ try { xhr.responseType = "msxml-document"; }catch(err){} }; // Helping IE11
		mod.transform = transform;
		mod.createXml = createXml;
	}

	return mod;

	function
	transform( xml, xsl, el )
	{
		xsl.setProperty( "AllowXsltScript", true );
		var txt = xml.transformNode(xsl);
		if( el )
			el.innerHTML = txt;
		return txt;
	}
	function
	createXml()
	{
		var doc = new ActiveXObject( "Msxml2.DOMDocument.6.0" );
		doc.loadXML( DEFAULT_XML );
		return doc;
	}

}));