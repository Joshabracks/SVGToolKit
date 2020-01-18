const s = new XMLSerializer()

class Sprite {
    constructor(string) {
        this.parseSVG(string)
        this.image = this.draw(string)
    }
    parseSVG = (string) => {
        let paths = {}
        const parser = new DOMParser();
        this.xmlDoc = parser.parseFromString(string, "text/xml");
        let xmlPaths = this.xmlDoc.getElementsByTagName('path')
        for (let i = 0; i < xmlPaths.length; i++) {
            let current = xmlPaths[i].getAttribute('d')
            let key = []
            let val = ''
            for (let ch of current) {
                if (ch == 'M' || ch == 'm' || ch == 'L' || ch == 'l' || ch == 'H' || ch == 'h' || ch == 'V' || ch == 'v' || ch == 'Z' || ch == 'z' || ch == ',' || ch == ' ' || ch == 'C' || ch == 'c' || ch == 'S' || ch == 's') {
                    if (val.length > 0) {
                        key.push({number: true, value: val})
                        val = ''
                    }
                    key.push({number: false, value: ch})
                } else if (ch == '-') {
                    if (val.length > 0) {
                        key.push({number: true, value: val})
                        val = ch
                    }
                } else {
                    val += ch
                }
            }
            paths[i] = key
        }
        this.paths = paths;
        this.svg = this.xmlDoc.getElementsByTagName('svg')[0]
        let wstring = this.svg.getAttribute('width')
        let hstring = this.svg.getAttribute('height')
        this.width = wstring.slice(0, wstring.length - 2)
        this.height = hstring.slice(0, hstring.length - 2)
        let xstring = this.svg.getAttribute('x')
        let ystring = this.svg.getAttribute('y')
        this.x = xstring.slice(0, xstring.length - 2)
        this.y = ystring.slice(0, ystring.length - 2)
    }
    // displaySVG = () => {
    //     ctx.drawImage(this.image, this.x, this.y)
    // }
    draw = (string) => {
        const blob = new Blob([string], { type: 'image/svg+xml' })
        const url = window.URL.createObjectURL(blob)
        const image = new Image(this.width, this.height)
        image.src = url
        image.onload = () => {
            ctx.drawImage(image, this.x, this.y)
        } 
        return image
    }
    updatePath = (path) => {
        let string = ''
        for (let i = 0; i < this.paths[path].length; i++) {
            string += this.paths[path][i].value
        }
        this.xmlDoc.getElementsByTagName('path')[path].setAttribute('d', string)
    }
    updateImage = () => {
        this.draw(s.serializeToString(this.xmlDoc))
    }
}