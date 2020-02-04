

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
let height = window.innerHeight
let width = window.innerWidth * 0.80
ctx.canvas.height = height
ctx.canvas.width = width

let sprite = false;
let animation = false;
let selectedKey = false;
let lastFrame = Date.now()
let playing = false;
let render = false;
let drawingQ = []

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
            let i = 0;
            let first = true
            let htmGo = ''
            for (let node of paths.childNodes) {
                if (node.nodeName != '#text') {
                    node.setAttribute('id', "path" + i)
                    htmGo += `<button onclick="populateSlidersById('` + node.id + `')">` + i + `</button>`
                    i++
                    if (first) {
                        populateSliders(node)
                        first = false
                    }
                }
            }
            document.getElementById('pathList').innerHTML = htmGo
            draw([sprite])
            showTools()
            stateSelect()
        })
        .catch(console.log)
}

function populateSlidersById(id) {
    let node = sprite.xmlDoc.getElementById(id)
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
    // if (node.getAttribute('stroke-miterlimit') != undefined) {
    //     htmGo += `stroke-miterlimit<input type="text" id="stroke-miterlimit" value="` + node.getAttribute('stroke-miterlimit') + `"><br>`
    //     idList.push('stroke-miterlimit')
    // }
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
    if (!node.keyMap) {
        node.keyMap = JSON.parse(node.getAttribute('keyMap'))
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
                    // USE sprite.parsePath() and sprite.buildPath() to update paths
                    let thisNode = sprite.xmlDoc.getElementById(this.getAttribute('nodeId'))
                    let orig = sprite.parsePath(thisNode.getAttribute('oPath'))
                    let pathVal = parseFloat(orig[i].value) + (this.value / 2)
                    v[i].value = pathVal
                    if (thisNode.getAttribute('d') != undefined) {
                        thisNode.setAttribute('d', sprite.buildPath(v))
                    } else if (thisNode.getAttribute('points') != undefined) {
                        thisNode.setAttribute('points', sprite.buildPath(v))
                    }
                    // console.log(thisNode.getAttribute('points'))
                    draw([sprite])
                }
            }
        }
        node.setAttribute('keyMap', JSON.stringify(node.keyMap))
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
}

function resetSVG() {
    sprite.reset()
    // for (let i = 0; i < sprite.paths[0].length; i++) {
    //     if (sprite.paths[0][i].number) {
    //         let slider = document.getElementById(i)
    //         slider.value = 0
    //         let pathVal = parseFloat(sprite.originalPaths[0][i].value) + (slider.value / 2)
    //         sprite.paths[0][i].value = pathVal
    //         sprite.updatePath(0)
    //     }
    // }
    draw([sprite])
}

async function draw(sprites) {
    drawingQ = sprites
    let drawQ = []
    ctx.fillStyle = 'white';
    for (let sprite of sprites) {
        await sprite.getSVG()
            .then(data => {
                // console.log(data)
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
        htmGo += "<button onclick='selectKeyFrame(event)'class='keyFrame' id='key" + frame.getAttribute('frame') + "' style='left:" + (frame.getAttribute('frame') / anim.getAttribute('length')) * 99 + "%;'></button>"
    }
    htmGo += "</div>"
    htmGo += `<input type="range" min="0" max="` + anim.getAttribute('length') + `" value="0" class="slider" id="animSlider"></input>`
    htmGo += `<br><button onclick='addKeyFrame()'>new key frame</button>  <button onclick='deleteKeyFrame()'>delete keyframe</button>  <button onclick="play()">play</button>  <button onclick="stop()">stop</button>  <button onclick="moveKey()">move key frame</button>`
    footer.innerHTML = htmGo
    const slider = document.getElementById('animSlider')
    slider.oninput = () => {
        if (Date.now() - lastFrame > (50)) {
            // requestAnimationFrame()
            loadFrame(slider.value)
            lastFrame = Date.now()
        }
    }
    animationSelect()
    render = false;
    // sprite.animFrame = 0
    slider.value = 0;
}

function reloadAnim() {
    loadAnimation(animation)
}

function loadFrame(ts) {
    sprite.getFrame(ts)
    let paths = sprite.image
    let i = 0;
    let first = true
    let htmGo = ''
    for (let node of paths.childNodes) {
        if (node.nodeName != '#text') {
            node.setAttribute('id', "path" + i)
            htmGo += `<button onclick="populateSlidersById('` + node.id + `')">` + i + `</button>`
            i++
            if (first) {
                populateSliders(node)
                first = false
            }
        }
    }
    document.getElementById('pathList').innerHTML = htmGo
    draw([sprite])
    showTools()
    stateSelect()

    // let slider = document.getElementById('animSlider')
    // let lowFrame = JSON.parse(JSON.stringify(animation.keyframes[0]))
    // let hiFrame = JSON.parse(JSON.stringify(animation.keyframes[0]))
    // for (key in animation.keyframes) {
    //     lowFrame = hiFrame
    //     hiFrame = JSON.parse(JSON.stringify(animation.keyframes[key]))
    //     if (ts > lowFrame.timestamp && ts < hiFrame.timestamp) {
    //         for (i in sprite.paths) {
    //             let path = sprite.paths[i]
    //             for (j in path) {
    //                 if (path[j].number) {
    //                     let frameDiff = hiFrame.timestamp - lowFrame.timestamp
    //                     let tsDiff = ts - lowFrame.timestamp
    //                     let percent = parseFloat(tsDiff / frameDiff).toFixed(2)
    //                     let diff = parseFloat(lowFrame.paths[i][j].value) + ((hiFrame.paths[i][j].value - lowFrame.paths[i][j].value) * percent)
    //                     path[j].value = diff
    //                 }
    //             }
    //             sprite.updatePath(i)
    //         }
    //         sprite.updateImage()
    //         draw([sprite])
    //     }
    //     if (key == parseInt(ts)) {
    //         slider.value = ts;
    //         for (i in sprite.paths) {
    //             sprite.paths[i] = animation.keyframes[key].paths[i]
    //             sprite.updatePath(i)
    //         }
    //         sprite.updateImage()
    //         draw([sprite])
    //         return
    //     }

    // }
    // render = false;
    // playing = false;
    // if (player) {
    //     clearInterval(player)
    // }
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
    } else if (animation.keyframes[value].timestamp) {
        delete animation.keyframes[value]
    }
    loadAnimation(animation)
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
}

function loadState(state) {
    sprite.loadState(state)
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

// function play() {
//     if (render) {
//         sprite.animFrame = document.getElementById('animSlider').value
//         playing = true
//         playTrue()
//     } else {
//         renderAnimation()
//     }
// }

// let player;

// function play() {
//     if (render) {
//         player = setInterval(() => {
//             let slider = document.getElementById('animSlider')
//             if (sprite.animFrame <= animation.render.length) {
//                 slider.value = sprite.animFrame
//                 sprite.animFrame++
//                 // window.requestAnimationFrame(function () { playTrue() })
//             } else if (sprite.animFrame > animation.render.length) {
//                 sprite.animFrame = 0
//                 slider.value = sprite.animFrame
//                 // window.requestAnimationFrame(function () { playTrue() })
//             }
//             let blob = new Blob([animation.render[sprite.animFrame]], { type: 'image/svg+xml' })
//             const url = window.URL.createObjectURL(blob)
//             const image = new Image(this.width, this.height)
//             image.src = url
//             ctx.fillStyle = 'white';
//             image.onload = () => {
//                 ctx.fillRect(0, 0, width, height)
//                 ctx.drawImage(image, sprite.x, sprite.y)
//             }
//         }, 1000 / 60)
//     } else {
//         renderAnimation()
//     }
// }

function player() {
    if (render) {
        let slider = document.getElementById('animSlider')
        if (sprite.animFrame <= animation.render.length) {
            slider.value = sprite.animFrame
            sprite.animFrame++
        } else if (sprite.animFrame > animation.render.length) {
            sprite.animFrame = 0
            slider.value = sprite.animFrame
        }
        let blob = new Blob([animation.render[sprite.animFrame]], { type: 'image/svg+xml' })
        const url = window.URL.createObjectURL(blob)
        const image = new Image(this.width, this.height)
        image.src = url
        ctx.fillStyle = 'white';
        image.onload = () => {
            ctx.fillRect(0, 0, width, height)
            ctx.drawImage(image, sprite.x, sprite.y)
        }
        window.requestAnimationFrame(function () { player() })
    }
}

function play() {
    if (render) {
        player()
    } else { renderAnimation() }
}

// function playTrue() {
//     player()
// }

function stop() {
    sprite.animFrame = 0
    render = false;

}

async function renderAnimation() {
    animation.render = []
    let renderStep = 0;
    document.getElementById('animations').innerHTML = ''
    document.getElementById('states').innerHTML = ''
    document.getElementById('footer').innerHTML = "<h1> RENDERING </h1>"

    let lowFrame = JSON.parse(JSON.stringify(animation.keyframes[0]))
    let hiFrame = JSON.parse(JSON.stringify(animation.keyframes[0]))
    for (key in animation.keyframes) {
        lowFrame = JSON.parse(JSON.stringify(hiFrame))
        hiFrame = JSON.parse(JSON.stringify(animation.keyframes[key]))
        while (renderStep <= key) {
            if (renderStep > lowFrame.timestamp && renderStep < hiFrame.timestamp) {
                for (i in sprite.paths) {
                    let path = sprite.paths[i]
                    for (j in path) {
                        if (path[j].number) {
                            let frameDiff = hiFrame.timestamp - lowFrame.timestamp
                            let tsDiff = renderStep - lowFrame.timestamp
                            let percent = parseFloat(tsDiff / frameDiff)
                            let diff = parseFloat(lowFrame.paths[i][j].value) + ((hiFrame.paths[i][j].value - lowFrame.paths[i][j].value) * percent)
                            path[j].value = diff
                        }
                    }
                    sprite.updatePath(i)
                }
                let string;
                await sprite.renderFrame()
                    .then(data => { string = data })
                    .catch(console.log)
                animation.render.push(string)
            } else if (key == parseInt(renderStep)) {
                for (i in sprite.paths) {
                    sprite.paths[i] = JSON.parse(JSON.stringify((animation.keyframes[key].paths[i])))
                    sprite.updatePath(i)
                }
                let string;
                await sprite.renderFrame()
                    .then(data => { string = data })
                    .catch(console.log)
                animation.render.push(string)
            }
            renderStep++
        }
    }
    stateSelect()
    animationSelect()
    loadAnimation(animation)
    render = true;
    play()
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
    let oldKey = animation.keyframes[value]
    let newKey = JSON.parse(JSON.stringify(oldKey))
    newKey.timestamp = parseInt(sliderVal)
    animation.keyframes[sliderVal] = newKey
    delete animation.keyframes[value]
    loadAnimation(animation)
}

window.onresize = () => {
    height = window.innerHeight
    width = window.innerWidth * 0.80
    ctx.canvas.height = height
    ctx.canvas.width = width
    draw(drawingQ)
}