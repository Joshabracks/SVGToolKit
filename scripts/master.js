

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
let height = window.innerHeight
let width = window.innerWidth * 0.70
ctx.canvas.height = height
ctx.canvas.width = width

let sprite = false;
let animation = false;
let selectedKey = false;
let lastFrame = Date.now()

document.getElementById("file").onchange = function () {
    document.getElementById("spriteForm").onsubmit()
}

function openFile() {
    document.getElementById('file').click()
}

function loadSprite() {
    const file = new FormData(document.querySelector('form')).get('file');
    if (file.name.slice(file.name.length - 3) == "svg") {
        file.text()
            .then(svg => {
                let newSprite = new Sprite(svg)
                sprite = newSprite
                populateSliders(sprite.paths[0])
                draw([sprite])
                showTools()
            })
            .catch(console.log)
    }
    if (file.name.slice(file.name.length - 3) == "spt") {
        sprite = new Sprite(`<?xml version="1.0" encoding="utf-8" ?>
        <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="238.5px" height="360px" viewBox="121.5 0 238.5 360" enable-background="new 121.5 0 238.5 360" xml:space="preserve">
            <path fill="#BE1E2D" d="M245.5,30.75c0,94.5-96,100-96,194s74.75,104.5,96,104.5s96-10.5,96-104.5S245.5,125.25,245.5,30.75z" />
        </svg>`)
        file.text()
            .then(spt => {
                let data = JSON.parse(spt)
                sprite.paths = data.paths
                sprite.animations = data.animations
                sprite.states = data.states
                for ( path in sprite.paths ) {
                    sprite.updatePath(path)
                }
                populateSliders(sprite.paths[0])
                draw([sprite])
                showTools()
                if (Object.keys(sprite.states).length > 0) {
                    stateSelect()
                }
                if (Object.keys(sprite.animations).length > 0) {
                    animationSelect()
                }
            })
            .catch(console.log)
    }
}

function populateSliders(v) {
    let htmGo = ''
    for (let i = 0; i < v.length; i++) {
        if (v[i].number == true) {
            htmGo += i + `<input type="range" min="-100" max="100" value="0" class="slider" id="` + i + `"><br>`
        }
    }
    document.getElementById('slidewrap').innerHTML = htmGo
    for (let i = 0; i < v.length; i++) {
        if (v[i].number == true) {
            let slider = document.getElementById(i)
            slider.oninput = function () {
                let pathVal = parseFloat(sprite.originalPaths[0][i].value) + (this.value / 2)
                sprite.paths[0][i].value = pathVal
                sprite.updatePath(0)
                draw([sprite])
            }
        }
    }
}

function resetSVG() {
    for (let i = 0; i < sprite.paths[0].length; i++) {
        if (sprite.paths[0][i].number) {
            let slider = document.getElementById(i)
            slider.value = 0
            let pathVal = parseFloat(sprite.originalPaths[0][i].value) + (slider.value / 2)
            sprite.paths[0][i].value = pathVal
            sprite.updatePath(0)
        }
    }
    draw([sprite])
}

async function draw(sprites) {
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
    sprite.newAnimation(Object.keys(sprite.animations).length)
        .then(data => {
            console.log(data)
            animation = data;
            loadAnimation(data)
        })
        .catch(err => alert(err))
}

function loadAnimation(anim) {
    console.log("Anim: ", anim)
    console.log("Animation: ", animation)
    let footer = document.getElementById('footer')
    let htmGo = ''
    htmGo += "<div id='keyFrames'>"
    for (key in anim.keyframes) {
        htmGo += "<button onclick='loadFrame(" + anim.keyframes[key].timestamp + ")'class='keyFrame' id='key" + anim.keyframes[key].timestamp + "' style='left:" + (anim.keyframes[key].timestamp / anim.length) * 99 + "%;'></button>"
    }
    htmGo += "</div>"
    htmGo += `<input type="range" min="0" max="` + anim.length + `" value="0" class="slider" id="animSlider"></input>`
    htmGo += `<br><button onclick='addKeyFrame()'>new key frame</button>  <button onclick='deleteKeyFrame()'>delete keyframe</button>`
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
}

function reloadAnim() {
    loadAnimation(animation)
}

function loadFrame(ts) {
    let slider = document.getElementById('animSlider')
    let lowFrame = JSON.parse(JSON.stringify(animation.keyframes[0]))
    let hiFrame = JSON.parse(JSON.stringify(animation.keyframes[0]))
    for (key in animation.keyframes) {
        lowFrame = hiFrame
        hiFrame = JSON.parse(JSON.stringify(animation.keyframes[key]))
        if (ts > lowFrame.timestamp && ts < hiFrame.timestamp) {
            for (i in sprite.paths) {
                let path = sprite.paths[i]
                for (j in path) {
                    if (path[j].number) {
                        // console.log((hiFrame.paths[i][j].value - lowFrame.paths[i][j].value) / 2)
                        let frameDiff = hiFrame.timestamp - lowFrame.timestamp
                        let tsDiff = ts - lowFrame.timestamp
                        let percent = parseFloat(tsDiff / frameDiff).toFixed(2)
                        let diff = parseFloat(lowFrame.paths[i][j].value) + ((hiFrame.paths[i][j].value - lowFrame.paths[i][j].value) * percent)
                        path[j].value = diff
                    }
                }
                sprite.updatePath(i)
            }
            sprite.updateImage()
            draw([sprite])
        }
        if (key == parseInt(ts)) {
            slider.value = ts;
            for (i in sprite.paths) {
                sprite.paths[i] = animation.keyframes[key].paths[i]
                sprite.updatePath(i)
            }
            sprite.updateImage()
            draw([sprite])
            return
        }

    }
}

function addKeyFrame() {
    let slider = document.getElementById('animSlider')
    let value = JSON.parse(JSON.stringify(slider.value))
    animation = sprite.addKeyFrame(animation.name, value)
    loadAnimation(animation)
    document.getElementById('animSlider').value = value
    stateSelect()
}

function deleteKeyFrame() {
    let value = document.getElementById('animSlider').value
    for (let key of animation.keyframes) {
        if (value == 0) {
            alert('Cannot Delete Key at Time Stamp 0')
        } else if (key.timestamp == value) {
            delete key;
        }
    }
    loadAnimation(animation)
}

function downloadSprite() {
    if (sprite) {
        let blob = new Blob([JSON.stringify(sprite, undefined, 2)], { type: "application/json" })
        let url = window.URL.createObjectURL(blob)
        let a = document.createElement('a')
        a.href = url
        a.download = sprite.name + '.spt'
        a.click()
        window.URL.revokeObjectURL(url)

    } else {
        alert("No Sprite is Loaded")
    }
}

function saveState(){
    sprite.saveState()
    stateSelect()
}

function stateSelect() {
    let htmGo = ''
    for ( state in sprite.states ) {
        htmGo += `<button onclick="loadState(` + state + `)">` + state + `</button>`
    }
    document.getElementById('states').innerHTML = htmGo
}

function animationSelect() {
    let htmGo = ''
    for ( anim in sprite.animations ) {
        htmGo += `<button onclick="animLoad(` + anim + `)">` + anim + `</button>`
    }
    document.getElementById('animations').innerHTML = htmGo
}

function animLoad(id) {
    animation = sprite.animations[id]
    loadAnimation(animation)
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
    sprite.name = document.getElementById('spriteName').value
    alert("Sprite name changed to " + sprite.name )
    return 'success'
}