

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
let height = window.innerHeight
let width = window.innerWidth * 0.70
ctx.canvas.height = height
ctx.canvas.width = width

let sprite = false;

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
    console.log("POPULATING")
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