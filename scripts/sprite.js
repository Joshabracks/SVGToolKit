const parser = new DOMParser();
const s = new XMLSerializer()

class Sprite {
    constructor(string) {
        this.animations = {}
        this.parseSVG(string)
        this.image = this.updateImage(string)
        this.animations = {}
        this.animFrame = 0
        this.animKey = 0
        this.animate = false
        this.originalPaths = JSON.parse(JSON.stringify(this.paths))
        this.states = {}
        this.name = "sprite"
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
    getSVG = () => {
        return new Promise((resolve, reject) => {
            for (let i = 0; i < this.paths.length; i++) {
                this.updatePath(i)
            }
            const blob = new Blob([s.serializeToString(this.xmlDoc)], { type: 'image/svg+xml' })
            const url = window.URL.createObjectURL(blob)
            const image = new Image(this.width, this.height)
            image.src = url
            image.onload = () => {
                return resolve({ image: image, x: this.x, y: this.y })
            }
        })
    }
    updatePath = (path) => {
        let string = ''
        for (let i = 0; i < this.paths[path].length; i++) {
            string += this.paths[path][i].value
        }
        this.xmlDoc.getElementsByTagName('path')[path].setAttribute('d', string)
    }
    updateImage = () => {
        const blob = new Blob([s.serializeToString(this.xmlDoc)], { type: 'image/svg+xml' })
        const url = window.URL.createObjectURL(blob)
        const image = new Image(this.width, this.height)
        image.src = url
        return image
    }
    newAnimation = (name, length = 1000) => {
        return new Promise((resolve, reject) => {
            if (!this.animations[name]) {
                this.animations[name] = {
                    name: name,
                    length: length,
                    keyframes: {
                        0: { timestamp: 0, paths: JSON.parse(JSON.stringify(this.paths)) }
                    },
                }
                return resolve(this.animations[name])
            } else {
                reject ("An animation with the name " + name + " already exists.")
            }
        })
    }
    addKeyFrame = (animation, timestamp) => {
        this.animations[animation].keyframes[parseInt(timestamp)] = { timestamp: parseInt(timestamp), paths: JSON.parse(JSON.stringify(this.paths)) }
        // let kf = this.orderKeyFrames(this.animations[animation].keyframes)
        return this.animations[animation]
    }
    orderKeyFrames = (frames) => {
        if (frames.length < 2) {
            return frames
        }
        let more = []
        let less = []
        let pivot = frames[0]
        for (let frame of frames) {
            if (frame.timestamp > pivot.timestamp) {
                more.push(frame)
            } else if (frame.timestamp < pivot.timestamp){
                less.push(frame)
            } else if (frame.timestamp == pivot.timestamp) {
                pivot = frame
            }
        }
        pivot = [pivot]
        return this.orderKeyFrames(less).concat(pivot).concat(this.orderKeyFrames(more))
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
                this.paths = this.originalPaths
            }
        } else {
            this.updateImage()
        }
    }
    saveState() {
        let newState = JSON.parse(JSON.stringify(this.paths))
        this.states[Object.keys(this.states).length] = newState
    }
    loadState(state){
        if (this.states[state]) {
            this.paths = this.states[state]
            for ( path in this.paths ) {
                this.updatePath(path)
            }
            this.updateImage()
        } else {
            alert("State of " + state + " does not exist.")
        }
    }
}