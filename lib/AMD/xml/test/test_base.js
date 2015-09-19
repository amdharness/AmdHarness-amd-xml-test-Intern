define([ 'assert', 'require', "xml" ], function ( assert, require, Xml )
{
    var noFileUrl   = require.toUrl("./nofile.xml"  )
    ,   xmlUrl      = require.toUrl("./test.xml"    )
    ,   txtUrl      = require.toUrl("./textxml.txt" )
    ,   xslUrl      = require.toUrl("./test.xsl"    )
    ,   CONTENT_TYPE_XML = "application/xml"
    ,   r = {   name: 'xml module AMD API'
            ,   'Xml API': function()
                   {   assert(Xml              );
                       assert(Xml.getXml       );
                       assert(Xml.createXml    );
                       assert(Xml.transform    );
                       assert(Xml.XPath_node   );
                       assert(Xml.XPath_nl     );
                       assert(Xml.$            );
                       assert(Xml.o2xml        );
                       assert(Xml.createElement);
                       assert(Xml.cleanElement );
                   }
            ,   "Content-Type application/xml for test.xml": function()
                   {   var d = this.async(100);
                       var promise = Xml.getXml(xmlUrl);
                       assert( promise.then );
                       promise.then( function( xmlDoc, xhr )
                       {
                           CONTENT_TYPE_XML == xhr.getResponseHeader("Content-type")
                           ? d.resolve(1)
                           : d.reject( new Error() );
                       },  ERR(d) );
                       return d;
                   }
            ,   "Content-Type text/plain for testxml.txt": function()
                   {   var d = this.async(100);
                       var promise = Xml.getXml(txtUrl);
                       assert( promise.then );
                       promise.then( function( xmlDoc, xhr )
                       {
                           CONTENT_TYPE_XML != xhr.getResponseHeader("Content-type")
                           ? d.resolve(1)
                           : d.reject( new Error() );
                       },  ERR(d) );
                       return d;
                   }
            ,   'Xml.getXml( 200 )': function()
                   {   var d = this.async(100);
                       var promise = Xml.getXml(xmlUrl);
                       promise.then( PASSX(d),  ERR(d) );
                       return d;
                   }
            ,   'Xml.getXml( 200 ).then.then': function()
                   {   var d = this.async(100);
                       var promise = Xml.getXml(xmlUrl);
                       promise
                            .then( CHECK_XML(d),  ERR(d) )
                            .then( function( xmlDoc )
                            {   "root" == xmlDoc.documentElement.nodeName
                              ? d.resolve(1)
                              : d.reject( new Error() );
                            },  ERR(d) );
                       return d;
                   }
            ,   'Xml.getXml( 404 )': function()
                   {   var d = this.async(100);
                       var promise = Xml.getXml(noFileUrl);
                       promise.then(   ERR(d)
                       , function( err )
                       {   err.message.indexOf( "404" ) >= 0
                           ? d.resolve(1)
                           : d.reject(err);
                       });
                       return d;
                   }
            ,   'Xml.getXml( 404 ).then.then': function()
                   {   var d = this.async(100);
                       var promise = Xml.getXml(noFileUrl);
                       promise.then(NOP,NOP).then(   ERR(d)
                       , function( err )
                       {   err.message.indexOf( "404" ) >= 0
                           ? d.resolve(1)
                           : d.reject(err);
                       });
                       return d;
                   }
            ,   'Xml.load.then.transform( xml, xsl, el )': function()
                   {   var d = this.async(100);
                       var promise = Xml.getXml(xmlUrl);
                       promise.then( function( xmlDoc )
                       {
                           Xml.getXml(xslUrl).then( function( xslDoc )
                           {
                               var el = document.createElement("div");
                               Xml.transform( xmlDoc, xslDoc, el );
                               el.innerHTML.indexOf("root") > 0
                               ? d.resolve(1)
                               : d.reject( new Error() );
                           },  ERR(d) );
                       },  ERR(d) );
                       return d;
                   }
            };
    return r;

    function NOP(){}
    function PASS(d){ return function( xmlDoc )
    {   d.resolve(1);
    } }
    function PASSX(d){ return function( xmlDoc )
    {   "root" == xmlDoc.documentElement.nodeName
        ? NOP()
        : d.reject( new Error() );
        d.resolve(1);
    } }
    function CHECK_XML(d){ return function( xmlDoc )
    {   "root" == xmlDoc.documentElement.nodeName
        ? NOP()
        : d.reject( new Error() );
    } }
    function ERR (d){ return function(err)
    {   debugger;
        d.reject(err);
    } }

});