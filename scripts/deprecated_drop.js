const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
let height = window.innerHeight
let width = window.innerWidth * 0.70
ctx.canvas.height = height
ctx.canvas.width = width

// let v = [245.5, 30.75, 0, 94.5, 96, 100, 96, 194, 74.75, 104.5, 96, 104.5, 96, 10.5, 96, 104.5, 245.5, 125.25, 245.5, 30.75]
let v = [245.5, 30.75, 0, 94.5, 98, 117.5, 108.5, 186, 70.25, 111, 121, 83, 67, -39.5, 96, 104.5, 239, 175.25, 245, 22.75]
let vStatic = [245.5, 30.75, 0, 94.5, 98, 117.5, 108.5, 186, 70.25, 111, 121, 83, 67, -39.5, 96, 104.5, 239, 175.25, 245, 22.75]
let vtop = [245.5, 30.75, -50, 65.5, 116, 118, 108.5, 182, 71.75, 113.5, 121, 84, 65, -39.5, 96, 104.5, 239, 175.25, 245, 22.75]
let vbottom = [245.5, 30.75, 4, 112, 61.5, 117.5, 108.5, 194.5, 70.25, 111, 121, 83, 67, -39.5, 96, 104.5, 239, 175.25, 245, 22.75]
let htmGo = ``
for (let i = 0; i < v.length; i++) {
    htmGo += i + `<input type="range" min="-100" max="100" value="0" class="slider" id="` + i + `"><br>`
}
document.getElementById('slidewrap').innerHTML = htmGo
for (let i = 0; i < v.length; i++) {
    let slider = document.getElementById(i)
    slider.oninput = function () {
        v[i] = (parseFloat(vStatic[i]) + (this.value / 2))
        draw(200, 200, drop())
    }
}

function drop(x = 0, y = 0, fill = '#BE1E2D') {
    let svgHead = `<?xml version="1.0" encoding="utf-8" ?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="500px" height="360px" viewBox="121.5 0 238.5 360" enable-background="new 121.5 0 238.5 360" xml:space="preserve">`
    let path = `<path fill=" ` + fill + `" d="M`
    let d = ``
    d += v[0]
    d += `,`
    d += v[1]
    d += `c`
    d += v[2]
    d += `,`
    d += v[3]
    d += `-`
    d += v[4]
    d += `,`
    d += v[5]
    d += `-`
    d += v[6]
    d += `,`
    d += v[7]
    d += `s`
    d += v[8]
    d += `,`
    d += v[9]
    d += `,`
    d += v[10]
    d += `,`
    d += v[11]
    d += `s`
    d += v[12]
    d += `-`
    d += v[13]
    d += `,`
    d += v[14]
    d += `-`
    d += v[15]
    d += `S`
    d += v[16]
    d += `,`
    d += v[17]
    d += `,`
    d += v[18]
    d += `,`
    d += v[19]
    let closePath = `z" />`
    let tempV = []
    let tempPath = ''
    let svgClose = `</svg>`
    let string = svgHead + path + d + closePath + svgClose
    return string
}

function draw(x, y, svg) {
    ctx.fillStyle = 'white';
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = window.URL.createObjectURL(blob)
    const image = new Image(238.5, 360)
    image.src = url
    image.onload = function () {
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(image, x, y)
    }
}

window.onload = function () {
    draw(200, 200, drop())
}


let bounce = 100
let incr = .05
let direction = 1
let loc = 0
let gravity = .75
let gravitySpeed = 0
let range = []
let rangeUp = []
let rangeDown = []
let maxSpeed = 1
for (let i = 0; i < v.length; i++) {
    range.push(vtop[i] - vbottom[i])
    rangeUp.push(vtop[i] - vStatic[i])
    rangeDown.push(vStatic[i] - vbottom[i])
}
v = vtop
let pull = 100
let topp = 100;
let falling = true
let count = 0
let bouncing = false

function startBounce() {
    const bouncer = setInterval(function bounceTimer() {
        if (!bouncing) {
            bouncing = true
        }
        if (v[4] >= vStatic[4]) {
            gravitySpeed += gravity
        } else {
            gravitySpeed -= gravity
        }
        bounce -= gravitySpeed
        for (let i = 0; i < v.length; i++) {
            if (v[4] >= vStatic[4]) {
                v[i] = (vStatic[i] + ((rangeUp[i] * (bounce / 100))))
            } else {
                v[i] = (vStatic[i] + ((rangeDown[i] * (bounce / 100))))
            }
        }
        if (bounce < 0 && falling) {
            gravitySpeed *= .75
            falling = false
        }
        if (bounce > 0 && !falling) {
            falling = true
        }
        if (bounce > -2 && bounce < 2) {
            count++
        } else {
            count = 0
        }
        if (count > 50) {
            bouncing = false
            clearInterval(bouncer)
        }
        // for (i = 0; i < v.length; i++) {
        //     if (range[i] != 0) {
        //         v[i] = (vbottom[i] + ((range[i] * (bounce / 100))))
        //     }
        // }

        // if (direction == 1) {
        //     gravitySpeed += gravity
        //     bounce -= gravitySpeed
        // } else {
        //     gravitySpeed -= gravity
        //     if (gravitySpeed < -maxSpeed) {
        //         gravitySpeed = -maxSpeed
        //     }
        //     bounce += gravitySpeed
        // }
        // if (bounce <= -.5) {
        //     bounce = -.5
        //     direction = -1
        //     topp = topp * .5
        //     gravitySpeed *= .75
        //     // gravity /= 2
        // }
        // if (bounce > topp) {
        //     console.log('redirect')
        //     bounce = topp
        //     direction = 1
        // }
        // if (topp < 0.01) {
        //     clearInterval(bouncer)
        // }

        draw(200, 200, drop())
    }, 1000 / 60);
}


function bouncy() {
    bounce += 1
    if (bounce > 1) {
        bounce = 1
    }
}
document.addEventListener('click', function (e) {
    bounce += 50
    if (!bouncing) {
        startBounce()
    }
    
})
startBounce()