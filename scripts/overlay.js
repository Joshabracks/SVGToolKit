let overlay = document.getElementById('overlay')
overlay.style.display = 'none'
function toggleOverlay() {
    if (overlay.style.display == 'none') {
        overlay.style.display = 'block'
    } else {
        overlay.style.display = 'none'
    }
}