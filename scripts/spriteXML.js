// const parser = new DOMParser();
// const s = new XMLSerializer()

const xmlTemplate = `<root>
<original></original>
<states current="0" id="states">
</states>
<animations current="0" length="1000" frame="0" id="animations">
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
        this.x = 50
        this.y = 50
    }
    getSVG = () => {
        return new Promise((resolve, reject) => {
            let currentState = this.states.getElementsByTagName('svg')[this.states.getAttribute('current')]
            const blob = new Blob([s.serializeToString(currentState)], { type: 'image/svg+xml' })
            const url = window.URL.createObjectURL(blob)
            const image = new Image(parseFloat(currentState.getAttribute('width')), parseFloat(currentState.getAttribute('height')))
            image.src = url
            image.onload = () => {
                return resolve({ image: image, x: this.x, y: this.y })
            }
        })
    }
}