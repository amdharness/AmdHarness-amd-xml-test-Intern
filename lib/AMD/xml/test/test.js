require.config({    map: { "*":{ "xml": "lib/AMD/xml/xml"}} });
define( ["require", 'intern!object',  "./test_base" ], function( require, registerSuite, xmlTest )
{
    registerSuite( xmlTest );
});