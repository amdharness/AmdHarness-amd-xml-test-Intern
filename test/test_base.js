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
                       },  function( err ){ d.reject(err); } );
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
                       },  function( err ){ d.reject(err); } );
                       return d;
                   }
            ,   'Xml.getXml( 200 )': function()
                   {   var d = this.async(100);
                       var promise = Xml.getXml(xmlUrl);
                       promise.then( function( xmlDoc )
                       {   "root" == xmlDoc.documentElement.nodeName
                           ? d.resolve(1)
                           : d.reject( new Error() );
                       },  function( err ){ d.reject(err); } );
                       return d;
                   }
            ,   'Xml.getXml( 404 )': function()
                   {   var d = this.async(100);
                       var promise = Xml.getXml(noFileUrl);
                       promise.then(   function(){ d.reject(); }
                       , function( err )
                       {   err.message.indexOf( "404" ) >= 0
                           ? d.resolve(1)
                           : d.reject(err);
                       });
                       return d;
                   }
            ,   'Xml.transform( xml, xsl, el )': function()
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
                           },  fail );
                       },  fail );
                       function fail( err ){ d.reject(err); }
                       return d;
                   }
            };
    return r;
});