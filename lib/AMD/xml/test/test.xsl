<?xml version="1.0"  encoding="utf-8"?>
<?xml-stylesheet type="text/xsl" href="test.xsl"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:output method="html" version="5.0" encoding="UTF-8" indent="yes"/>

    <xsl:template match="/"><html><body><xsl:apply-templates select="*|@*"></xsl:apply-templates></body></html></xsl:template>
    <xsl:template match="*" >
        &lt;<xsl:value-of select="name()"/> <xsl:apply-templates select="@*"/> &gt;
        <xsl:apply-templates select="*" />
        &lt;/<xsl:value-of select="name()"/>&gt;
    </xsl:template>
    <xsl:template match="@*" >
        <xsl:text> </xsl:text><xsl:value-of select="name()"/>="<xsl:value-of select="."/>
    </xsl:template>
</xsl:stylesheet>