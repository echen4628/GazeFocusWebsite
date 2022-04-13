class Point{
    constructor(){
        this.points = new Array();
        this.firstpoint = true;
    }

    draw(ctx,x,y){
        if (this.firstpoint){
            ctx.moveTo(x,y);
            this.firstpoint = false;
        }
        else{
            ctx.lineTo(x,y);
        }
        ctx.stroke();
        ctx.moveTo(x,y);
        this.points.push([x,y]);
    }

    finish(ctx){
        console.log("finishing");
        ctx.lineTo(this.points[0][0], this.points[0][1]);
        ctx.stroke();

    }
}

const canvas = document.querySelector("#saliency_map");
const ctx = canvas.getContext("2d");
const imageInput = document.querySelector("#imageInput");

const start_button = document.querySelector("#start");
const finish_button = document.querySelector("#finish");

imageInput.addEventListener("change", (e) => {
    if(e.target.files) {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function (e) {
            let image = new Image();
            image.src = e.target.result
            image.onload = function(e) {
                // canvas.width = image.width;
                console.dir(image);
                image.width = canvas.width;
                image.height = canvas.height;
                // canvas.width=image.width;
                // canvas.height = image.height;
                ctx.drawImage(image, 0, 0);
                console.log(`canvas width is ${canvas.width} and canvas height is ${canvas.height}`);


                // canvas.height = rect.top-rect.bot;
                // console.log(`canvas width is ${canvas.width} and canvas height is ${canvas.height}`);
                // rect = canvas.getBoundingClientRect();
                // console.log(`canvas width is ${rect.right-rect.left}`);
            }
        }
    }
});

const allPoints = new Array();
let draw = false;

start_button.addEventListener("dblclick", () => {addNewPoint()});
finish_button.addEventListener("dblclick", () => {finishDrawing()});

function addNewPoint() {
    current_point = new Point();
    allPoints.push(current_point);
    draw = true;
}

function finishDrawing() {
    console.log("hi");
    current_point = allPoints[allPoints.length-1];
    current_point.finish(ctx);
    draw = false;
}

// allowing user to draw on the canvas
canvas.addEventListener("click", (e) => {
    //check if you can draw first, then just draw using the current_point
    console.log(draw);
    if (draw == true){
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        current_point= allPoints[allPoints.length - 1];
        current_point.draw(ctx,x,y);
    }
})

// function drawPoint(canvas, event) 
// {
//     const rect = canvas.getBoundingClientRect();
//     const x = event.clientX - rect.left;
//     const y = event.clientY - rect.top;
//     console.log(`x: ${x} y: ${y}`);
//     ctx.lineTo(x,y);
//     ctx.stroke();
//     ctx.moveTo(x, y);
//     previous_canvas = ctx.getImageData(0,0,canvas.width, canvas.height);
// }

window.addEventListener("resize", () => {
    console.log(getComputedStyle(canvas)['height']);
    console.log(getComputedStyle(canvas)['width']);
    canvas.height = getComputedStyle(canvas)['height'].slice(0,-2);
    canvas.width = getComputedStyle(canvas)['width'].slice(0,-2);
    console.log(canvas.height,canvas.width);
    ctx.putImageData(previous_canvas, 0,0);

})

console.log(getComputedStyle(canvas)['height']);
console.log(getComputedStyle(canvas)['width']);
canvas.height = getComputedStyle(canvas)['height'].slice(0,-2);
canvas.width = getComputedStyle(canvas)['width'].slice(0,-2);
console.log(canvas.height,canvas.width);
// ctx.putImageData(previous_canvas, 0,0);

// Setup
// console.log(getComputedStyle(canvas)['height']);
// console.log(getComputedStyle(canvas)['width']);
// canvas.height = getComputedStyle(canvas)['height'].slice(0,-2);
// canvas.width = getComputedStyle(canvas)['width'].slice(0,-2);
// console.log(canvas.height,canvas.width);
// ctx.moveTo(0,0);
// ctx.lineTo(570/2,143);
// ctx.stroke();
// previous_canvas = ctx.getImageData(0,0,canvas.width, canvas.height);


