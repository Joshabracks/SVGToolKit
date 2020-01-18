class Sprite {
    constructor(string) {
        this.parseSVG(string)
        this.image = this.makeSVG(string)
        this.image.onload = this.displaySVG()
    }
    getSVG = () => {

    }
    parseSVG = (string) => {
        let paths = []
        const parser = new DOMParser();
        let xmlDoc = parser.parseFromString(string, "text/xml");
        for (let path of xmlDoc.getElementsByTagName('path')) {
            paths.push(path.getAttribute('d'))
        }
        this.paths = paths;
        this.svg = xmlDoc.getElementsByTagName('svg')[0]
        let wstring = this.svg.getAttribute('width')
        let hstring = this.svg.getAttribute('height')
        this.width = wstring.slice(0, wstring.length - 2)
        this.height = hstring.slice(0, hstring.length - 2)
        let xstring = this.svg.getAttribute('x')
        let ystring = this.svg.getAttribute('y')
        this.x = xstring.slice(0, xstring.length - 2)
        this.y = ystring.slice(0, ystring.length - 2)
    }
    displaySVG = () => {
        ctx.drawImage(this.image, this.x, this.y)
    }
    makeSVG = (string) => {
        const blob = new Blob([string], { type: 'image/svg+xml' })
        const url = window.URL.createObjectURL(blob)
        const image = new Image(this.width, this.height)
        image.src = url
        return image
    }
}