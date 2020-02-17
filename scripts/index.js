

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
let height = window.innerHeight * 0.90
let width = window.innerWidth * 0.60
ctx.canvas.height = height
ctx.canvas.width = width

let sprite = false;
let animation = false;
let selectedKey = false;
let lastFrame = Date.now()
let playing = false;
let render = false;
let drawingQ = []

let overlay = document.getElementById('overlay')
overlay.style.display = 'none'

document.getElementById("file").onchange = function () {
    document.getElementById("spriteForm").onsubmit()
}

function openFile() {
    document.getElementById('file').click()
}

function loadSprite() {
    const file = new FormData(document.querySelector('form')).get('file');
    file.text()
        .then(svg => {
            let newSprite = new XMLSprite(svg)
            sprite = newSprite
            let paths = sprite.image
            pathsLoader(paths)
            draw([sprite])
            showTools()
            stateSelect()
            if (sprite.currentAnimation != undefined) {
                loadAnimation(sprite.currentAnimation)
            }
        })
        .catch(console.log)
}

function pathsLoader(paths) {
    let i = 0;
    let first = true
    let htmGo = ''
    for (let node of paths.childNodes) {
        if (node.nodeName != '#text') {
            sprite.setId(node)
            htmGo += `<button onclick="populateSlidersById('` + node.getAttribute('id') + `')">` + i + `</button>`
            i++
            if (first) {
                populateSliders(node)
                first = false
            }
        }
    }
    document.getElementById('pathList').innerHTML = htmGo
}

function populateSlidersById(id) {
    let node = sprite.image.getElementById(id)
    populateSliders(node)
}

function populateSliders(node) {
    let htmGo = ''
    let idList = []
    if (node.getAttribute('fill') != undefined) {
        htmGo += `fill<input type="text" id="fill" value="` + node.getAttribute('fill') + `"><br>`
        idList.push('fill')
    }
    if (node.getAttribute('stroke') != undefined) {
        htmGo += `stroke<input type="text" id="stroke" value="` + node.getAttribute('stroke') + `"><br>`
        idList.push('stroke')
    }
    if (node.getAttribute('x') != undefined) {
        htmGo += `x<input type="range" min="-1000" max="1000" value="` + node.getAttribute('x') + `" class="slider" id="x"><br>`
        idList.push('x')
    }
    if (node.getAttribute('x1') != undefined) {
        htmGo += `x1<input type="range" min="-1000" max="1000" value="` + node.getAttribute('x1') + `" class="slider" id="x1"><br>`
        idList.push('x1')
    }
    if (node.getAttribute('cx') != undefined) {
        htmGo += `cx<input type="range" min="-1000" max="1000" value="` + node.getAttribute('cx') + `" class="slider" id="cx"><br>`
        idList.push('cx')
    }
    if (node.getAttribute('cy') != undefined) {
        htmGo += `cy<input type="range" min="-1000" max="1000" value="` + node.getAttribute('cy') + `" class="slider" id="cy"><br>`
        idList.push('cy')
    }
    if (node.getAttribute('r') != undefined) {
        htmGo += `r<input type="range" min="-1000" max="1000" value="` + node.getAttribute('r') + `" class="slider" id="r"><br>`
        idList.push('r')
    }
    if (node.getAttribute('rx') != undefined) {
        htmGo += `rx<input type="range" min="-1000" max="1000" value="` + node.getAttribute('rx') + `" class="slider" id="rx"><br>`
        idList.push('rx')
    }
    if (node.getAttribute('ry') != undefined) {
        htmGo += `ry<input type="range" min="-1000" max="1000" value="` + node.getAttribute('ry') + `" class="slider" id="ry"><br>`
        idList.push('ry')
    }
    if (node.getAttribute('x2') != undefined) {
        htmGo += `x2<input type="range" min="-1000" max="1000" value="` + node.getAttribute('x2') + `" class="slider" id="x2"><br>`
        idList.push('x2')
    }
    if (node.getAttribute('y') != undefined) {
        htmGo += `y<input type="range" min="-1000" max="1000" value="` + node.getAttribute('y') + `" class="slider" id="y"><br>`
        idList.push('y')
    }
    if (node.getAttribute('y1') != undefined) {
        htmGo += `y1<input type="range" min="-1000" max="1000" value="` + node.getAttribute('y1') + `" class="slider" id="y1"><br>`
        idList.push('y1')
    }
    if (node.getAttribute('y2') != undefined) {
        htmGo += `y2<input type="range" min="-1000" max="1000" value="` + node.getAttribute('y2') + `" class="slider" id="y2"><br>`
        idList.push('y2')
    }
    if (node.getAttribute('width') != undefined) {
        htmGo += `width<input type="range" min="-1000" max="1000" value="` + node.getAttribute('width') + `" class="slider" id="width"><br>`
        idList.push('width')
    }
    if (node.getAttribute('height') != undefined) {
        htmGo += `height<input type="range" min="-1000" max="1000" value="` + node.getAttribute('height') + `" class="slider" id="height"><br>`
        idList.push('height')
    }
    let v = false;
    if (node.getAttribute('d') != undefined) {
        v = sprite.parsePath(node.getAttribute('d'))
        if (node.getAttribute('oPath') == undefined) {
            node.setAttribute('oPath', node.getAttribute('d'))
        }
    }
    if (node.getAttribute('points') != undefined) {
        v = sprite.parsePath(node.getAttribute('points'))
        if (node.getAttribute('oPath') == undefined) {
            node.setAttribute('oPath', node.getAttribute('points'))
        }
    }
    if (v != false) {
        for (let i = 0; i < v.length; i++) {
            if (v[i].number == true) {
                htmGo += i + `<input type="range" min="-100" max="100" value="0" class="slider" id="` + i + `"><br>`
            }
        }
        document.getElementById('slidewrap').innerHTML = htmGo
        for (let i = 0; i < v.length; i++) {
            if (v[i].number == true) {
                let slider = document.getElementById(i)
                slider.setAttribute('nodeId', node.id)
                slider.oninput = function () {
                    let thisNode = sprite.image.getElementById(this.getAttribute('nodeId'))
                    let orig = sprite.parsePath(thisNode.getAttribute('oPath'))
                    let pathVal = parseFloat(orig[i].value) + (this.value / 2)
                    v[i].value = pathVal
                    if (thisNode.getAttribute('d') != undefined) {
                        thisNode.setAttribute('d', sprite.buildPath(v))
                    } else if (thisNode.getAttribute('points') != undefined) {
                        thisNode.setAttribute('points', sprite.buildPath(v))
                    }
                    draw([sprite])
                }
            }
        }
    } else {
        document.getElementById('slidewrap').innerHTML = htmGo
    }

    if (idList.length > 0) {
        for (let id of idList) {
            let elem = document.getElementById(id)
            elem.oninput = function () {
                node.setAttribute(id, this.value)
                draw([sprite])
            }
        }
    }
    populateOverlay(node)
}

function resetSVG() {
    sprite.reset()
    draw([sprite])
}

async function draw(sprites) {
    drawingQ = sprites
    let drawQ = []
    ctx.fillStyle = 'white';
    for (let sprite of sprites) {
        await sprite.getSVG()
            .then(data => {
                drawQ.push(data)
            })
            .catch(console.log)
    }
    ctx.fillRect(0, 0, width, height)
    for (let q of drawQ) {
        ctx.drawImage(q.image, q.x, q.y)
    }
}

function newAnimation() {
    sprite.newAnimation(1000)
    animationSelect()
}

function loadAnimation(anim) {
    let footer = document.getElementById('footer')
    let htmGo = ''
    htmGo += "<div id='keyFrames'>"
    for (let frame of anim.getElementsByTagName('keyFrames')[0].getElementsByTagName('svg')) {
        htmGo += "<button onclick='selectKeyFrame(event)'class='keyFrame' id='key" + frame.getAttribute('frame') + "' style='left:" + (frame.getAttribute('frame') / anim.getAttribute('length')) * 98.3 + "%;'></button>"
    }
    htmGo += "</div>"
    htmGo += `<input type="range" min="0" max="` + anim.getAttribute('length') + `" value="0" class="slider" id="animSlider"></input>`
    htmGo += `<br><button onclick='addKeyFrame()'>new key frame</button>  <button onclick='deleteKeyFrame()'>delete keyframe</button>  <button onclick="play()">play</button>  <button onclick="stop()">stop</button>  <button onclick="moveKey()">move key frame</button>`
    footer.innerHTML = htmGo
    const slider = document.getElementById('animSlider')
    slider.oninput = () => {
        if (Date.now() - lastFrame > (50)) {
            loadFrame(slider.value)
            lastFrame = Date.now()
        }
    }
    animationSelect()
    // render = false;
    slider.value = 0;
}

function reloadAnim() {
    loadAnimation(sprite.currentAnimation)
}

function loadFrame(ts) {
    sprite.getFrame(ts)
    let paths = sprite.image
    let i = 0;
    let first = true
    let htmGo = ''
    pathsLoader(paths)
    draw([sprite])
    // showTools()
    stateSelect()

    let slider = document.getElementById('animSlider')
    slider.value = ts
    animatorFrame = ts
}

function addKeyFrame() {
    let slider = document.getElementById('animSlider')
    let value = JSON.parse(JSON.stringify(slider.value))
    sprite.addKeyFrame(value)
    loadAnimation(sprite.currentAnimation)
    document.getElementById('animSlider').value = value
    stateSelect()
    animationSelect()
    render = false;
}

function deleteKeyFrame() {
    let value = document.getElementById('animSlider').value
    if (value == 0) {
        alert('Cannot Delete Key at Time Stamp 0')
    } else {
        sprite.deleteKeyframe(value)
    }
    loadAnimation(sprite.currentAnimation)
    animationSelect()
    document.getElementById('animSlider').value = value
    render = false;
}

function downloadSprite() {
    if (sprite) {
        sprite.saveSprite()

    } else {
        alert("No Sprite is Loaded")
    }
}

function saveState() {
    sprite.saveState()
    stateSelect()
}

function stateSelect() {
    let htmGo = ''
    let states = sprite.states.getElementsByTagName('svg')
    for (let i = 0; i < states.length; i++) {
        htmGo += `<button onclick="loadState(` + i + `)">` + states[i].getAttribute('name') + `</button>`
    }
    document.getElementById('states').innerHTML = htmGo
    // populateOverlay()
}

function animationSelect() {
    let htmGo = ''
    for (let anim of sprite.animations.getElementsByTagName('animation')) {
        htmGo += `<button onclick="animLoad(` + anim.getAttribute('name') + `)">` + anim.getAttribute('name') + `</button>`
    }
    document.getElementById('animations').innerHTML = htmGo
}

function animLoad(id) {
    sprite.currentAnimation = sprite.animations.getElementsByTagName('animation')[id]
    loadAnimation(sprite.currentAnimation)
    render = false
}

function loadState(state) {
    sprite.loadState(state)
    pathsLoader(sprite.image)
    let first = true
    for (let node of sprite.image.childNodes) {
        if (node.nodeName != '#text') {
            if (first) {
                populateSliders(node)
                first = false
            }
        }
    }
    draw([sprite])
}

function showTools() {
    let buttons = document.getElementsByClassName('tool')
    for (let i of buttons) {
        i.style.display = "inline"
    }
    document.getElementById('spriteName').value = sprite.name
}

function renameSprite() {
    sprite.rename(document.getElementById('spriteName').value)
}

let animator;
let animatorData;
let animatorFrame;
let animatorLength;

function nextFrame() {
    if (animatorFrame + 1 > animatorLength) {
        animatorFrame = 0
    }
    document.getElementById('animSlider').value = animatorFrame
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(animatorData[animatorFrame], sprite.x, sprite.y)
    animatorFrame++
}

function player(data, length, frame = 0) {
    if (render) {
        animatorData = data
        animatorFrame = parseInt(frame)
        animatorLength = parseInt(length)
        animator = setInterval(() => {
            nextFrame()
        }, 1000 / 60)
    }
}

function play() {
    if (render) {
        player(animatorData, animatorLength, animatorFrame)
    } else { renderAnimation() }
}

function stop() {
    clearInterval(animator)
    // render = false;
}

async function renderAnimation() {
    let current = 0
    let total = sprite.currentAnimation.getAttribute('length')
    let htmGo = `<h1 class="alert">Rendering: ` + current + '/' + total + `</h1>`
    const renderUpdate = setInterval(() => {
        if (sprite.currentAnimation.render != undefined) {
            current = sprite.currentAnimation.render.length
        }
        htmGo = `<h1 class="alert">Rendering: ` + current + '/' + total + `</h1>`
        document.getElementById('footer').innerHTML = htmGo
    }, 100)
    await sprite.renderQueue()
        .then(data => {
            // stateSelect()
            // animationSelect()
            loadAnimation(sprite.currentAnimation)
            render = true;
            clearInterval(renderUpdate)
            player(data, sprite.currentAnimation.getAttribute('length'))
        })
        .catch(console.log)
}


function selectKeyFrame(e) {
    if (selectedKey) {
        selectedKey.style.backgroundColor = 'slategray'
    }
    selectedKey = e.target
    loadFrame(selectedKey.id.slice(3))
    selectedKey.style.backgroundColor = 'red'
}

function moveKey() {
    let value = selectedKey.id.slice(3)
    if (value == 0) {
        alert("Cannot move Key Frame at 0")
        return
    }
    let sliderVal = document.getElementById('animSlider').value
    if (value == sliderVal) {
        return
    }
    let keyframes = sprite.currentAnimation.getElementsByTagName('keyFrames')[0].childNodes
    for (let node of keyframes) {
        if (node.nodeName != "#text") {
            if (node.getAttribute('frame') == value) {
                node.setAttribute('frame', sliderVal)
            }
        }
    }
    loadAnimation(sprite.currentAnimation)
    document.getElementById('animSlider').value = sliderVal
    render = false
}


function toggleOverlay() {
    if (overlay.style.display == 'none') {

        overlay.style.display = 'block'
    } else {
        overlay.style.display = 'none'
    }
}

let positionStart;
let positionDrop;

function populateOverlay(node) {
    htmGo = ''
    const specifics = {
        rect: () => {
            if (node.getAttribute('x') == undefined) {
                node.setAttribute('x', 0)
            }
            if (node.getAttribute('y') == undefined) {
                node.setAttribute('y', 0)
            }
            htmGo += `<div draggable="true" style="top: ` + node.getAttribute('y') + `px;left: ` + node.getAttribute('x') + `px;" ondrag="changePositionRect(event)" class="positionNode overlayNode" _id="` + node.getAttribute('id') + `"></div>`
            htmGo += `<div draggable="true" style="top: ` + (parseInt(node.getAttribute('y')) + parseFloat(node.getAttribute('height'))) + `px;left:` + parseInt(node.getAttribute('x')) + `px;" ondrag="changeHeightRect(event)" class="positionNode overlayNode" _id="` + node.getAttribute('id') + `"></div>`
            htmGo += `<div draggable="true" style="left: ` + (parseInt(node.getAttribute('x')) + parseFloat(node.getAttribute('width'))) + `px;top:` + parseInt(node.getAttribute('y')) + `px;" ondrag="changeWidthRect(event)" class="positionNode overlayNode" _id="` + node.getAttribute('id') + `"></div>`
        },
        circle: () => {
            if (node.getAttribute('cx') == undefined) {
                node.setAttribute('cx', 0)
            }
            if (node.getAttribute('cy') == undefined) {
                node.setAttribute('cy', 0)
            }
            htmGo += `<div draggable="true" style="top: ` + node.getAttribute('cy') + `px;left: ` + node.getAttribute('cx') + `px;" ondrag="changePositionCircle(event)" class="positionNode overlayNode" _id="` + node.getAttribute('id') + `"></div>`
            htmGo += `<div draggable="true" style="left: ` + (parseFloat(parseFloat(node.getAttribute('cx')) + parseFloat(node.getAttribute('r')))) + `px;top:` + parseInt(node.getAttribute('cy')) + `px;" ondrag="changeRadiusCircle(event)" class="positionNode overlayNode" _id="` + node.getAttribute('id') + `"></div>`
        },
        ellipse: () => {
            if (node.getAttribute('cx') == undefined) {
                node.setAttribute('cx', 0)
            }
            if (node.getAttribute('cy') == undefined) {
                node.setAttribute('cy', 0)
            }
            htmGo += `<div draggable="true" style="top: ` + node.getAttribute('cy') + `px;left: ` + node.getAttribute('cx') + `px;" ondrag="changePositionCircle(event)" class="positionNode overlayNode" _id="` + node.getAttribute('id') + `"></div>`
            htmGo += `<div draggable="true" style="left: ` + (parseFloat(parseFloat(node.getAttribute('cx')) + parseFloat(node.getAttribute('rx')))) + `px;top:` + parseInt(node.getAttribute('cy')) + `px;" ondrag="changeWidthEllipse(event)" class="positionNode overlayNode" _id="` + node.getAttribute('id') + `"></div>`
            htmGo += `<div draggable="true" style="left: ` + (parseFloat(parseFloat(node.getAttribute('cx')))) + `px;top:` + (parseFloat(parseFloat(node.getAttribute('cy'))) + parseFloat(node.getAttribute('ry'))) + `px;" ondrag="changeHeightEllipse(event)" class="positionNode overlayNode" _id="` + node.getAttribute('id') + `"></div>`
        },
        line: () => {
            htmGo += `<div draggable="true" style="top: ` + node.getAttribute('y1') + `px;left: ` + node.getAttribute('x1') + `px;" ondrag="changePositionLine1(event)" class="positionNode overlayNode" _id="` + node.getAttribute('id') + `"></div>`
            htmGo += `<div draggable="true" style="top: ` + node.getAttribute('y2') + `px;left: ` + node.getAttribute('x2') + `px;" ondrag="changePositionLine2(event)" class="positionNode overlayNode" _id="` + node.getAttribute('id') + `"></div>`
        },
        polygon: () => {
            let points = sprite.parsePath(node.getAttribute('points'))
            let x = false;
            let y = false;
            let xi;
            let yi;
            let xTotal = 0
            let yTotal = 0
            let count = 0
            for (let i = 0; i < points.length; i++) {
                if (points[i].number) {
                    if (!x) {
                        x = points[i].value
                        xi = i
                        xTotal += parseFloat(x)
                    } else if (!y) {
                        y = points[i].value
                        yi = i
                        yTotal += parseFloat(y)
                        htmGo += `<div draggable="true" style="top: ` + y + `px; left: ` + x + `px;" ondrag="changePoint(event)" class="positionNode overlayNode" _id="` + node.getAttribute('id') + `" _x="` + xi + `" _y="` + yi + `"></div>`
                        x = false
                        y = false
                        count++
                    }
                }
            }
            x = xTotal / count
            y = yTotal / count
            htmGo += `<div draggable="true" style="top: ` + y + `px; left: ` + x + `px;" ondrag="changePositionPoly(event)" class="positionNodeMaster overlayNode" _id="` + node.getAttribute('id') + `"></div>`
        },
        polyline: () => {
            specifics.polygon()
        },
        path: () => {
            let absolutes = {
                M: 'M',
                L: 'L',
                H: 'H',
                V: 'V',
                Z: 'Z',
                C: 'C',
                S: 'S',
                Q: 'Q',
                T: 'T',
                A: 'A'
            }
            let relatives = {
                m: 'm',
                l: 'l',
                h: 'h',
                v: 'v',
                z: 'z',
                c: 'c',
                s: 's',
                q: 'q',
                t: 't',
                a: 'a'
            }
            let mode = 'absolute'
            let _d = node.getAttribute('d')
            let points = sprite.parsePath(_d)
            console.log(points)
            let x = 0;
            let y = 0;
            let X;
            let Y;
            let xi;
            let yi;
            let xer = false;
            let yer = false;
            let xTotal = 0
            let yTotal = 0
            let count = 0
            for (let i = 0; i < points.length; i++) {
                if (points[i].number) {
                    if (!xer) {
                        xer = true
                        xi = i
                        if (mode == 'absolute') {
                            x = parseFloat(points[i].value)
                        } else {
                            x = X + parseFloat(points[i].value)
                            points[i].offsetter = X
                        }
                        xTotal += x
                    } else if (!yer) {
                        if (mode == 'absolute') {
                            y = parseFloat(points[i].value)
                        } else {
                            y = Y + parseFloat(points[i].value)
                            points[i].offsetter = Y
                        }
                        yi = i
                        yTotal += parseFloat(y)
                        htmGo += `<div draggable="true" style="top: ` + y + `px; left: ` + x + `px;" ondrag="changePathPoint(event)" class="positionNode overlayNode" _id="` + node.getAttribute('id') + `" _x="` + xi + `" _y="` + yi + `"></div>`
                        xer = false
                        yer = false
                        count++
                    }
                }
                if (absolutes[points[i].value]) {
                    X = x
                    Y = y
                    mode = 'absolute'
                } else if (relatives[points[i].value]) {
                    mode = 'relative'
                    X = x
                    Y = y
                }
            }
            x = xTotal / count
            y = yTotal / count
            htmGo += `<div draggable="true" style="top: ` + y + `px; left: ` + x + `px;" ondrag="changePositionPath(event)" class="positionNodeMaster overlayNode" _id="` + node.getAttribute('id') + `"></div>`
        },
        // path: () => {
        //     let points = sprite.parsePath(node.getAttribute('d'))
        //     let x = false;
        //     let y = false;
        //     let xi;
        //     let yi;
        //     let xTotal = 0
        //     let yTotal = 0
        //     let count = 0
        //     let xs = points[1].value
        //     let ys = points[3].value
        //     for (let i = 0; i < points.length; i++) {
        //         if (points[i].number) {
        //             if (!x) {
        //                 x += points[i].value
        //                 xi = i
        //                 xTotal += parseFloat(x)
        //             } else if (!y) {
        //                 y += points[i].value
        //                 yi = i
        //                 yTotal += parseFloat(y)
        //                         if (i > 3) {
        //                         }
        //                 htmGo += `<div draggable="true" style="top: ` + (parseFloat(y) + parseFloat(ys)) + `px; left: ` + (parseFloat(x) + parseFloat(xs)) + `px;" ondrag="changePathPoint(event)" class="positionNode overlayNode" _id="` + node.getAttribute('id') + `" _x="` + xi + `" _y="` + yi + `"></div>`
        //                 x = false
        //                 y = false
        //                 count++
        //             }
        //         }
        //     }
        //     x = xTotal / count
        //     y = yTotal / count
        //     htmGo += `<div draggable="true" style="top: ` + (parseFloat(y) + parseFloat(ys)) + `px; left: ` + (parseFloat(x) + parseFloat(xs)) + `px;" ondrag="changePositionPath(event)" class="positionNodeMaster overlayNode" _id="` + node.getAttribute('id') + `"></div>`
        // }
        // path: () => {
        //     let m = {}
        //     let points = sprite.parsePath(node.getAttribute('d'))
        //     let command;
        //     let start;
        //     let parameters = []
        //     let options = {}
        //     for (let i = 0; i < points.length; i++) {
        //         let box = points[i]
        //         if (!box.number) {
        //             if (box.value == 'M') {
        //                 command = 'moveto'
        //             }
        //             if (box.value == 'c' || box.value == 'C') {
        //                 command = 'curve'
        //             }

        //         } else {
        //             if (command == 'moveto') {
        //                 if (!m.x) {
        //                     m.x = box.value
        //                     m.xPointer = i
        //                 } else {
        //                     m.y = box.value
        //                     m.yPointer = i
        //                     command = false
        //                     htmGo += specifics.moveTo(m)
        //                 }
        //             } else if (command == 'curve') {
        //                 if (!options.x1) {
        //                     options.x1 = box.value
        //                     options.x1Pointer = i
        //                 } else if (!options.y1) {
        //                     options.y1 = box.value
        //                     options.y1Pointer = i
        //                 } else if (!options.x2) {
        //                     options.x2 = box.value
        //                     options.x2Pointer = i
        //                 } else if (!options.y2) {
        //                     options.y2 = box.value
        //                     options.y2Pointer = i
        //                 } else if (!options.x) {
        //                     options.x = box.value
        //                     options.xPointer = i
        //                 } else if (!options.y) {
        //                     options.y = box.value
        //                     options.yPointer = i
        //                     htmGo += specifics.curve(options, m)
        //                     options = {}
        //                     command = false
        //                 }
        //             } else if (command == false) {
        //                 if (!options.x) {
        //                     options.x = box.value
        //                 } else if (!options.y) {
        //                     options.y = box.value-
        //                     htmGo = point(options)
        //                     options = false
        //                     command = false
        //                 }
        //             }
        //         }
        //     }
        // },
        // curve: (options, m) => {
        //     options.x1 += m.x
        //     options.x2 += m.x
        //     options.x += m.x
        //     options.y1 += m.y
        //     options.y2 += m.y
        //     options.y += m.y
        // }

    }
    specifics[node.nodeName]()
    document.getElementById('overlay').innerHTML = htmGo
}
document.addEventListener("dragover", function (event) {

    // prevent default to allow drop
    event.preventDefault();

}, false);

function changePositionRect(e) {
    let div = e.target
    let node = sprite.image.getElementById(div.getAttribute('_id'))
    let x = e.clientX - document.getElementById('canvas').offsetLeft
    let y = e.clientY - document.getElementById('canvas').offsetTop
    node.setAttribute('x', x)
    node.setAttribute('y', y)

    for (let box of document.getElementsByClassName('positionNode')) {
        if (box != div) {
            let yDif = (box.style.top.slice(0, box.style.top.length - 2) - parseFloat(div.style.top.slice(0, div.style.top.length - 2)))
            box.style.top = (y + yDif) + 'px'
            let xDif = (box.style.left.slice(0, box.style.left.length - 2) - parseFloat(div.style.left.slice(0, div.style.left.length - 2)))
            box.style.left = (x + xDif) + 'px'
        }
    }
    div.style.top = y + 'px'
    div.style.left = x + 'px'
    draw([sprite])
}

function changePositionPoly(e) {
    let div = e.target
    let node = sprite.image.getElementById(div.getAttribute('_id'))
    let points = sprite.parsePath(node.getAttribute('points'))
    let x = e.clientX - document.getElementById('canvas').offsetLeft
    let y = e.clientY - document.getElementById('canvas').offsetTop
    for (let box of document.getElementsByClassName('positionNode')) {
        let yDif = (box.style.top.slice(0, box.style.top.length - 2) - parseFloat(div.style.top.slice(0, div.style.top.length - 2)))
        box.style.top = (y + yDif) + 'px'
        let xDif = (box.style.left.slice(0, box.style.left.length - 2) - parseFloat(div.style.left.slice(0, div.style.left.length - 2)))
        box.style.left = (x + xDif) + 'px'
        let _x = box.getAttribute('_x')
        let _y = box.getAttribute('_y')
        points[_x].value = parseFloat(parseFloat(x) + parseFloat(xDif))
        points[_y].value = parseFloat(parseFloat(y) + parseFloat(yDif))
    }
    div.style.left = x + 'px'
    div.style.top = y + 'px'
    node.setAttribute('points', sprite.buildPath(points))
    draw([sprite])
}

function changePositionPath(e) {
    let div = e.target
    let node = sprite.image.getElementById(div.getAttribute('_id'))
    let points = sprite.parsePath(node.getAttribute('d'))
    let x = e.clientX - document.getElementById('canvas').offsetLeft
    let y = e.clientY - document.getElementById('canvas').offsetTop
    for (let box of document.getElementsByClassName('positionNode')) {
        let yDif = (box.style.top.slice(0, box.style.top.length - 2) - parseFloat(div.style.top.slice(0, div.style.top.length - 2)))
        box.style.top = (y + yDif) + 'px'
        let xDif = (box.style.left.slice(0, box.style.left.length - 2) - parseFloat(div.style.left.slice(0, div.style.left.length - 2)))
        box.style.left = (x + xDif) + 'px'
        let _x = box.getAttribute('_x')
        let _y = box.getAttribute('_y')
        points[_x].value = parseFloat(parseFloat(x) + parseFloat(xDif))
        points[_y].value = parseFloat(parseFloat(y) + parseFloat(yDif))
    }
    div.style.left = x + 'px'
    div.style.top = y + 'px'
    node.setAttribute('d', sprite.buildPath(points))
    draw([sprite])
}

function changePositionCircle(e) {
    let div = e.target
    let node = sprite.image.getElementById(div.getAttribute('_id'))
    let x = e.clientX - document.getElementById('canvas').offsetLeft
    let y = e.clientY - document.getElementById('canvas').offsetTop
    node.setAttribute('cx', x)
    node.setAttribute('cy', y)
    for (let box of document.getElementsByClassName('positionNode')) {
        if (box != div) {
            let yDif = (box.style.top.slice(0, box.style.top.length - 2) - parseFloat(div.style.top.slice(0, div.style.top.length - 2)))
            box.style.top = (y + yDif) + 'px'
            let xDif = (box.style.left.slice(0, box.style.left.length - 2) - parseFloat(div.style.left.slice(0, div.style.left.length - 2)))
            box.style.left = (x + xDif) + 'px'
        }
    }
    div.style.top = y + 'px'
    div.style.left = x + 'px'
    draw([sprite])
}

function changePositionLine1(e) {
    let div = e.target
    let node = sprite.image.getElementById(div.getAttribute('_id'))
    let x = e.clientX - document.getElementById('canvas').offsetLeft
    let y = e.clientY - document.getElementById('canvas').offsetTop
    node.setAttribute('x1', x)
    node.setAttribute('y1', y)
    div.style.top = y + 'px'
    div.style.left = x + 'px'
    draw([sprite])
}

function changePositionLine2(e) {
    let div = e.target
    let node = sprite.image.getElementById(div.getAttribute('_id'))
    let x = e.clientX - document.getElementById('canvas').offsetLeft
    let y = e.clientY - document.getElementById('canvas').offsetTop
    node.setAttribute('x2', x)
    node.setAttribute('y2', y)
    div.style.top = y + 'px'
    div.style.left = x + 'px'
    draw([sprite])
}

function changeHeightRect(e) {
    let div = e.target
    let node = sprite.image.getElementById(div.getAttribute('_id'))
    // let x = e.clientX - document.getElementById('canvas').offsetLeft
    let y = e.clientY - document.getElementById('canvas').offsetTop
    node.setAttribute('height', y - (parseFloat(node.getAttribute('y'))))
    div.style.top = y + 'px'
    draw([sprite])
}

function changeWidthRect(e) {
    let div = e.target
    let node = sprite.image.getElementById(div.getAttribute('_id'))
    // let x = e.clientX - document.getElementById('canvas').offsetLeft
    let x = e.clientX - document.getElementById('canvas').offsetLeft
    node.setAttribute('width', x - (parseFloat(node.getAttribute('x'))))
    div.style.left = x + 'px'
    draw([sprite])
}

function changeRadiusCircle(e) {
    let div = e.target
    let node = sprite.image.getElementById(div.getAttribute('_id'))
    let x = e.clientX - document.getElementById('canvas').offsetLeft
    node.setAttribute('r', x - (parseFloat(node.getAttribute('cx'))))
    div.style.left = x + 'px'
    draw([sprite])
}

function changeWidthEllipse(e) {
    let div = e.target
    let node = sprite.image.getElementById(div.getAttribute('_id'))
    let x = e.clientX - document.getElementById('canvas').offsetLeft
    node.setAttribute('rx', x - (parseFloat(node.getAttribute('cx'))))
    div.style.left = x + 'px'
    draw([sprite])
}

function changeHeightEllipse(e) {
    let div = e.target
    let node = sprite.image.getElementById(div.getAttribute('_id'))
    let y = e.clientY - document.getElementById('canvas').offsetTop
    node.setAttribute('ry', y - (parseFloat(node.getAttribute('cy'))))
    div.style.top = y + 'px'
    draw([sprite])
}

function changePoint(e) {
    let div = e.target
    let node = sprite.image.getElementById(div.getAttribute('_id'))
    let points = sprite.parsePath(node.getAttribute('points'))
    let x = e.clientX - document.getElementById('canvas').offsetLeft
    let y = e.clientY - document.getElementById('canvas').offsetTop
    let _x = div.getAttribute('_x')
    let _y = div.getAttribute('_y')
    div.style.top = y + 'px'
    div.style.left = x + 'px'
    points[_x].value = x
    points[_y].value = y
    node.setAttribute('points', sprite.buildPath(points))
    draw([sprite])
}

let waiter = false;

function changePathPoint(e) {
    let div = e.target
    let node = sprite.image.getElementById(div.getAttribute('_id'))
    let points = sprite.parsePath(node.getAttribute('d'))
    let x = e.clientX - document.getElementById('canvas').offsetLeft
    let y = e.clientY - document.getElementById('canvas').offsetTop
    let _x = div.getAttribute('_x')
    let _y = div.getAttribute('_y')
    let diffY = y - parseFloat(div.style.top.slice(0, div.style.top.length - 2))
    let diffX = x - parseFloat(div.style.left.slice(0, div.style.left.length - 2))
    div.style.top = y + 'px'
    div.style.left = x + 'px'
    if (points[_x].offsetter) {
        x += parseFloat(points[_x].offsetter)
        y += parseFloat(points[_y].offestter)
    }
    points[_x].value = diffX + parseFloat(points[_x].value)
    points[_y].value = diffY + parseFloat(points[_y].value)
    let newPath = sprite.buildPath(points)
    console.log(newPath)
    node.setAttribute('d', newPath)
    draw([sprite])
}

window.onresize = () => {
    height = window.innerHeight
    width = window.innerWidth * 0.60
    ctx.canvas.height = height * 0.90
    ctx.canvas.width = width
    draw(drawingQ)
}