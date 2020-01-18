const parser = new DOMParser();
const s = new XMLSerializer()

class Sprite {
    constructor(string) {
        this.parseSVG(string)
        this.image = this.draw(string)
        this.animations = {}
        this.animFrame = 0
        this.animKey = 0
        this.animate = false
    }
    parseSVG = (string) => {
        let paths = {}
        this.xmlDoc = parser.parseFromString(string, "text/xml");
        let xmlPaths = this.xmlDoc.getElementsByTagName('path')
        for (let i = 0; i < xmlPaths.length; i++) {
            let current = xmlPaths[i].getAttribute('d')
            let key = []
            let val = ''
            for (let ch of current) {
                if (ch == 'M' || ch == 'm' || ch == 'L' || ch == 'l' || ch == 'H' || ch == 'h' || ch == 'V' || ch == 'v' || ch == 'Z' || ch == 'z' || ch == ',' || ch == ' ' || ch == 'C' || ch == 'c' || ch == 'S' || ch == 's') {
                    if (val.length > 0) {
                        key.push({ number: true, value: val })
                        val = ''
                    }
                    key.push({ number: false, value: ch })
                } else if (ch == '-') {
                    if (val.length > 0) {
                        key.push({ number: true, value: val })
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
    newAnimation = (name, length = 1000) => {
        this.animations[name] = {
            length: length,
            keyframes: [{ timestamp: 0, paths: JSON.parse(JSON.stringify(this.paths)) }],
        }
    }
    addKeyFrame = (animation, timestamp) => {
        animation.keyframes.push({ timestamp: timestamp, paths: JSON.parse(JSON.stringify(this.paths)) })
        animation.keyframes = this.orderKeyFrames(animation.keyframes)
    }
    orderKeyFrames = (frames) => {
        if (frames.length < 2) {
            return frames
        }
        let more = []
        let less = []
        let pivot = frames[0]
        for (let i = 1; i < frames.length; i++) {
            if (frames[i].timestamp <= pivot.timestamp) {
                less.push(frames[i])
            } else {
                more.push[frames[i]]
            }
        }
        return this.orderKeyFrames(less).push(pivot).concat(this.orderKeyFrames(more))
    }
    playback = (animation) => {
        this.currentAnim = animation
        this.animFrame = 0
        this.animKey = 0
        this.animate = true
    }
    nextFrame = () => {
        if (this.animate) {
            this.updateImage()
            if (this.animFrame == this.currentAnim.keyframes[animKey].timestamp) {
                this.animKey++
            }
            let steps = this.currentAnim.keyframes[animKey].timestamp - this.animFrame
            for (path in this.paths) {
                let current = this.paths[path]
                for (let i = 0; i < current.length; i++) {
                    if (current[i].number) {
                        let diff = this.currentAnim.keyframes[animKey].paths[i].value - current[i].value
                        current[i].value += (diff / steps)
                    }
                }
                this.updatePath(path)
            }
            if (this.currentAnim.length == this.animFrame) {
                this.animate == false
            }
        }
    }
}