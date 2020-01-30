// const parser = new DOMParser();
// const s = new XMLSerializer()

const xmlTemplate = `<root>
<original></original>
<states current="0">
</states>
<animations current="0" length="1000" frame="0">
</animations>
</root>`

class XMLSprite {
    constructor(svg) {
        let image = parser.parseFromString(svg, 'text/xml').getElementsByTagName('svg')[0]
        this.xmlDoc = parser.parseFromString(xmlTemplate, 'text/xml')
        this.states = this.xmlDoc.getElementsByTagName('states')[0]
        this.animations = this.xmlDoc.getElementsByTagName('animations')[0]
        this.original = this.xmlDoc.getElementsByTagName('original')[0]
        this.states.appendChild(image.cloneNode(true))
        this.original.appendChild(image.cloneNode(true))
    }
}