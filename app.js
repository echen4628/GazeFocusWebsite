const canvas = document.querySelector("#saliency_map");
const ctx = canvas.getContext("2d");
canvas.addEventListener("click", (e) => {
    drawPoint(canvas, e);
})
window.addEventListener("resize", () => {
    console.log(getComputedStyle(canvas)['height']);
    console.log(getComputedStyle(canvas)['width']);
    canvas.height = getComputedStyle(canvas)['height'].slice(0,-2);
    canvas.width = getComputedStyle(canvas)['width'].slice(0,-2);
    console.log(canvas.height,canvas.width);
    ctx.putImageData(previous_canvas, 0,0);

})

// Setup
console.log(getComputedStyle(canvas)['height']);
console.log(getComputedStyle(canvas)['width']);
canvas.height = getComputedStyle(canvas)['height'].slice(0,-2);
canvas.width = getComputedStyle(canvas)['width'].slice(0,-2);
console.log(canvas.height,canvas.width);
ctx.moveTo(0,0);
ctx.lineTo(570/2,143);
ctx.stroke();
previous_canvas = ctx.getImageData(0,0,canvas.width, canvas.height);

function drawPoint(canvas, event) 
{
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    console.log(`x: ${x} y: ${y}`);
    ctx.lineTo(x,y);
    ctx.stroke();
    ctx.moveTo(x, y);
    previous_canvas = ctx.getImageData(0,0,canvas.width, canvas.height);
}
