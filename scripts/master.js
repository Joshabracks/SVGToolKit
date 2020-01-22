

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
let height = window.innerHeight
let width = window.innerWidth * 0.70
ctx.canvas.height = height
ctx.canvas.width = width

let sprite = false;
let animation = false;
let selectedKey = false;

function getSVG() {
    const file = new FormData(document.querySelector('form')).get('file');
    file.text()
        .then(svg => {
            let newSprite = new Sprite(svg)
            sprite = newSprite
            populateSliders(sprite.paths[0])
            draw([sprite])
        })
        .catch(console.log)
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
            animation = data;
            loadAnimation(data)
        })
        .catch(err => alert(err))
}

function loadAnimation(anim) {
    let footer = document.getElementById('footer')
    let htmGo = ''
    htmGo += "<div id='keyFrames'>"
    for (let key of anim.keyframes) {
        htmGo += "<button onclick='loadFrame(" + key.timestamp + ")'class='keyFrame' id='key" + key.timestamp + "' style='left:" + (key.timestamp / anim.length) * 99 + "%;'></button>"
    }
    htmGo += "</div>"
    htmGo += `<input type="range" min="0" max="` + anim.length + `" value="0" class="slider" id="animSlider"></input>`
    htmGo += `<br><button onclick='addKeyFrame()'>new key frame</button>  <button onclick='deleteKeyFrame()'>delete keyframe</button>`
    footer.innerHTML = htmGo
}

function loadFrame(ts) {
    let slider = document.getElementById('animSlider')
    slider.value = ts;
}

function addKeyFrame() {
    let slider = document.getElementById('animSlider')
    let value = JSON.parse(JSON.stringify(slider.value))
    animation = sprite.addKeyFrame(animation.name, value)
    loadAnimation(animation)
    document.getElementById('animSlider').value = value
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