const parser = new DOMParser();
const s = new XMLSerializer()
// const canvas = document.getElementById('canvas')
// const ctx = canvas.getContext('2d')
// let height = window.innerHeight
// let width = window.innerWidth * 0.80
// ctx.canvas.height = height
// ctx.canvas.width = width

const xmlTemplate = `<root name="Sprite" type="sprite">
<original></original>
<currentImage></currentImage>
<states current="0" id="states">
</states>
<animations current="0" length="1000" frame="0" id="animations">
</animations>
</root>`

class XMLSprite {
    xmlDoc;
    root;
    states;
    animations;
    original;
    image;
    x;
    y;
    drawImage;
    currentAnimation;
    constructor(string, x = 0, y = 0) {
        let doc = parser.parseFromString(string, 'text/xml')
        let tempImage;
        if (doc.documentElement.getAttribute("type") === 'sprite') {
            this.xmlDoc = doc
            this.root = this.xmlDoc.documentElement
            this.states = this.xmlDoc.getElementsByTagName('states')[0]
            this.animations = this.xmlDoc.getElementsByTagName('animations')[0]
            this.original = this.xmlDoc.getElementsByTagName('original')[0]
            this.name = this.xmlDoc.documentElement.getAttribute('name')
        } else {
            doc.documentElement.setAttribute('type', 'sprite')
            this.xmlDoc = parser.parseFromString(xmlTemplate, 'text/xml')
            tempImage = doc.getElementsByTagName('svg')[0]
            tempImage.setAttribute('name', '0')
            this.root = this.xmlDoc.documentElement
            this.states = this.xmlDoc.getElementsByTagName('states')[0]
            this.animations = this.xmlDoc.getElementsByTagName('animations')[0]
            this.original = this.xmlDoc.getElementsByTagName('original')[0]
            this.states.appendChild(tempImage.cloneNode(true))
            this.original.appendChild(tempImage.cloneNode(true))
            this.xmlDoc.getElementsByTagName('currentImage')[0].appendChild(tempImage.cloneNode(true))
        }
        this.image = this.xmlDoc.getElementsByTagName('currentImage')[0].getElementsByTagName('svg')[0]
        this.x = x
        this.y = y
        this.root.setAttribute('idCount', 0)
    }
    setId = (node) => {
        node.setAttribute('id', 'path' + this.root.getAttribute('idCount'))
        this.root.setAttribute('idCount', parseInt(this.root.getAttribute('idCount')) + 1)
    }
    getSVG = () => {
        return new Promise((resolve, reject) => {
            // let currentState = this.states.getElementsByTagName('svg')[this.states.getAttribute('current')]
            const blob = new Blob([s.serializeToString(this.image)], { type: 'image/svg+xml' })
            const url = window.URL.createObjectURL(blob)
            const image = new Image(parseFloat(this.image.getAttribute('width')), parseFloat(this.image.getAttribute('height')))
            image.src = url
            image.onload = () => {
                this.drawImage = image
                return resolve({ image: image, x: this.x, y: this.y })
            }
        })
    }
    setSVG = () => {
        const blob = new Blob([s.serializeToString(this.image)], { type: 'image/svg+xml' })
        const url = window.URL.createObjectURL(blob)
        const image = new Image(parseFloat(this.image.getAttribute('width')), parseFloat(this.image.getAttribute('height')))
        image.src = url
        image.onload = () => {
            this.drawImage = image
        }
    }
    draw = () => {
        const blob = new Blob([s.serializeToString(this.image)], { type: 'image/svg+xml' })
        const url = window.URL.createObjectURL(blob)
        const image = new Image(parseFloat(this.image.getAttribute('width')), parseFloat(this.image.getAttribute('height')))
        image.src = url
        image.onload = () => {
            this.drawImage = image
        }
        if (this.drawImage != undefined) {
            ctx.drawImage(this.drawImage, this.x, this.y)
        }
    }
    saveState = () => {
        return new Promise((resolve, reject) => {
            this.states.appendChild(this.clone(this.image))
            let states = this.states.getElementsByTagName('svg')
            states[states.length - 1].setAttribute('name', states.length - 1)
            return resolve(this.states.getElementsByTagName('svg')[this.states.getElementsByTagName('svg').length - 1])
        })
    }
    loadState = (stateNumber) => {
        // this.image.parentNode.replaceChild(this.states.getElementsByTagName('svg')[stateNumber].cloneNode(true), this.image)
        // for (let child of this.image.childNodes) {
        //     this.image.removeChild(child)
        // }
        // for (let child of this.states.getElementsByTagName('svg')[stateNumber].childNodes) {
        //     if (child.nodeName != '#text') {
        //         this.image.appendChild(this.clone(child))
        //     }
        // }
        this.image = this.clone(this.states.getElementsByTagName('svg')[stateNumber])
        return this.getSVG()
    }
    reset = () => {
        for (let child of this.image.childNodes) {
            this.image.removeChild(child)
        }
        for (let child of this.original.getElementsByTagName('svg')[0].childNodes) {
            this.image.appendChild(this.clone(child))
        }
        return this.getSVG()
    }
    rename = (name) => {
        return new Promise((resolve, reject) => {
            if (typeof (name) === 'string') {
                this.root.setAttribute('name', name)
                return resolve(this.root.getAttribute('name'))
            } else {
                reject('name must be typeof "string"')
            }
        })
    }
    saveSprite = () => {
        let blob = new Blob([s.serializeToString(this.xmlDoc)], { type: "text/xml" })
        let url = window.URL.createObjectURL(blob)
        let a = document.createElement('a')
        a.href = url
        a.download = this.root.getAttribute('name') + '.spt'
        a.click()
        window.URL.revokeObjectURL(url)
    }
    newAnimation = (length = 1000) => {
        let newAnimation = this.xmlDoc.createElement('animation')
        newAnimation.setAttribute('name', this.animations.getElementsByTagName('animation').length)
        this.animations.appendChild(newAnimation)
        newAnimation.setAttribute('length', length)
        newAnimation.setAttribute('frame', 0)
        newAnimation.appendChild(this.xmlDoc.createElement('renderQ'))
        let keyFrames = this.xmlDoc.createElement('keyFrames')
        let keyFrameZero = this.clone(this.image)
        keyFrameZero.setAttribute('frame', '0')
        keyFrames.appendChild(keyFrameZero)
        newAnimation.appendChild(keyFrames)
        this.currentAnimation = newAnimation
    }
    addKeyFrame = (frame) => {
        let newKeyFrame = this.clone(this.image)
        newKeyFrame.setAttribute('frame', frame)
        this.currentAnimation.getElementsByTagName('keyFrames')[0].appendChild(newKeyFrame)
        this.orderKeyFrames()
    }
    clone = (node) => {
        let newNode = node.cloneNode(true)
        this.setId(newNode)
        return newNode
    }
    orderKeyFrames = () => {
        function sort(arr) {
            if (arr.length < 2) {
                return arr
            }
            let less = []
            let more = []
            let pivot = arr[0]
            let pivotVal = pivot.getAttribute('frame')
            for (let i = 1; i < arr.length; i++) {
                let val = parseInt(arr[i].getAttribute('frame'))
                if (val < pivotVal) {
                    less.push(arr[i])
                } else if (val > pivotVal) {
                    more.push(arr[i])
                } else {
                    pivot = arr[i]
                }
            }
            pivot = [pivot]
            let result = pivot.concat(sort(less)).concat(sort(more))
            return result
        }
        let keyframes = this.currentAnimation.getElementsByTagName('keyFrames')[0].getElementsByTagName('svg')
        let sorter = []
        for (let frame of keyframes) {
            sorter.push(frame)
        }
        for (let frame of keyframes) {
            this.currentAnimation.getElementsByTagName('keyFrames')[0].removeChild(frame)
        }
        let sorted = sort(sorter)
        for (let i = 0; i < sorted.length; i++) {
            this.currentAnimation.getElementsByTagName('keyFrames')[0].appendChild(sorted[i])
        }
    }
    deleteKeyframe = (frame) => {
        let keyframes = this.currentAnimation.getElementsByTagName('keyFrames')[0].getElementsByTagName('svg')
        for (let _frame of keyframes) {
            if (parseInt(_frame.getAttribute('frame')) == parseInt(frame)) {
                this.currentAnimation.getElementsByTagName('keyFrames')[0].removeChild(_frame)
            }
        }
    }
    inbetweenFrame = (frame) => {
        //SOMETIMES DOUBLES UP THIS.IMAGE PATHS FIND ISSUE AND FIX
        function colorValues(color) {
            let val1;
            let val2;
            let val3;
            if (color[0] === '#') {
                if (color.length == 7) {
                    val1 = parseInt(color[1] + color[2], 16)
                    val2 = parseInt(color[3] + color[4], 16)
                    val3 = parseInt(color[5] + color[6], 16)
                }
                if (color.length == 4) {
                    val1 = parseInt(color[1], 16)
                    val2 = parseInt(color[2], 16)
                    val3 = parseInt(color[3], 16)
                }
            } else if (color.slice(0, 2) == 'rgb') {
                for (let ch of color) {
                    let mode = 0;
                    let temp = ''
                    if (mode = 0) {
                        if (ch = '(') {
                            mode++
                        } else if (mode === 1) {
                            if (ch === ',') {
                                val1 = parseInt(temp)
                                temp = ''
                            } else {
                                temp += ch
                            }
                        } else if (mode === 2) {
                            if (ch === ',') {
                                val2 = parseInt(temp)
                                temp = ''
                            } else {
                                temp += ch
                            }
                        } else if (mode === 3) {
                            if (ch === ',') {
                                val3 = parseInt(temp)
                                temp = ''
                            } else {
                                temp += ch
                            }
                        }
                    }
                }
            }
            return [val1, val2, val3]
        }
        let keyframes = this.currentAnimation.getElementsByTagName('keyFrames')[0].getElementsByTagName('svg')
        if (keyframes.length < 2) {
            return keyframes[0]
        }
        if (parseInt(keyframes[keyframes.length - 1].getAttribute('frame')) < parseInt(frame)) {
            return keyframes[keyframes.length - 1]
        }
        let bottomFrame;
        let topFrame;
        let midFrame;
        let i = 0;
        while (bottomFrame == undefined || topFrame == undefined) {
            let node = keyframes[i]
            let val = parseInt(node.getAttribute('frame'))
            if (val == frame) {
                return node
            } else if (val <= frame) {
                bottomFrame = node
            } else if (val >= frame) {
                topFrame = node
            }
            i++
        }
        let botVal = parseInt(bottomFrame.getAttribute('frame'))
        let topVal = parseInt(topFrame.getAttribute('frame'))
        let range = topVal - botVal
        let bottomRange = frame - botVal
        // let topRange = topVal - frame
        let percent = (bottomRange / range).toFixed(2)
        midFrame = this.clone(bottomFrame)
        // let colorVal;
        for (let p = 0; p < midFrame.childNodes.length; p++) {
            let path = midFrame.childNodes[p]
            let topAttributes = topFrame.childNodes[p].attributes
            let botAttributes = bottomFrame.childNodes[p].attributes
            if (path.nodeName != '#text') {
                for (let i = 0; i < path.attributes.length; i++) {
                    if (path.attributes[i].name != "id" && (topAttributes[i] && botAttributes[i])) {
                        if (topAttributes[i].value != botAttributes[i].value) {
                            let attr = path.attributes[i]
                            if (attr.name == 'fill' || attr.name == 'stroke') {
                                let topColorVal = colorValues(topAttributes[i].value)
                                let botColorVal = colorValues(botAttributes[i].value)
                                let colorVal = colorValues(attr.value)
                                let color = 'rgb('
                                for (let i = 0; i < colorVal.length; i++) {
                                    color += Math.floor(parseFloat(botColorVal[i]) + ((parseFloat(topColorVal[i]) - parseFloat(botColorVal[i])) * percent))
                                    color += ','
                                }
                                color = color.slice(0, color.length - 1)
                                color += ')'
                                path.setAttribute(attr.name, color)
                            } else if (attr.name == 'x' || attr.name == 'y' || attr.name == 'x1' || attr.name == 'y1' || attr.name == 'x2' || attr.name == 'y2' || attr.name == 'stroke-miterlimit' || attr.name == 'cx' || attr.name == 'cy' || attr.name == 'r' || attr.name == 'rx' || attr.name == 'ry' || attr.name == 'width' || attr.name == 'height') {
                                let middleVal = (parseFloat(botAttributes[i].value) + ((parseFloat(topAttributes[i].value) - parseFloat(botAttributes[i].value)) * percent))
                                path.setAttribute(attr.name, middleVal)
                            } else if (attr.name == 'd' || attr.name == 'points') {
                                let keys = this.parsePath(attr.value)
                                let topKeys = this.parsePath(topAttributes[i].value)
                                let botKeys = this.parsePath(botAttributes[i].value)
                                for (let i = 0; i < keys.length; i++) {
                                    if (keys[i].number) {
                                        keys[i].value = parseFloat(botKeys[i].value) + ((parseFloat(topKeys[i].value) - parseFloat(botKeys[i].value)) * percent)
                                    }
                                    path.setAttribute(attr.name, this.buildPath(keys))
                                }
                            }
                        }
                    }
                }
            }
        }
        return midFrame
    }
    getFrame = (frame) => {
        this.image = this.clone(this.inbetweenFrame(frame))
        this.setSVG()
    }
    parsePath(string) {
        let key = []
        let val = ''
        for (let ch of string) {
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
        return key
    }
    buildPath(keys) {
        let path = ''
        for (let i = 0; i < keys.length; i++) {
            path += keys[i].value
        }
        return path
    }
}