

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
let height = window.innerHeight
let width = window.innerWidth * 0.70
ctx.canvas.height = height
ctx.canvas.width = width

let sprite;

function getSVG() {
    const file = new FormData(document.querySelector('form')).get('file');
    file.text()
        .then(svg => {
            let newSprite = new Sprite(svg)
            sprite = newSprite
        })
        .catch(console.log)
}