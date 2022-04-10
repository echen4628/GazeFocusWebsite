const canvas = document.querySelector("#saliency_map");
const ctx = canvas.getContext("2d");
const imageInput = document.querySelector("#imageInput");

imageInput.addEventListener("change", (e) => {
    if(e.target.files) {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function (e) {
            let image = new Image();
            image.src = e.target.result
            image.onload = function(e) {
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0);
            }
        }
    }
});


// allowing user to draw on the canvas
canvas.addEventListener("click", (e) => {
    drawPoint(canvas, e);
})

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


