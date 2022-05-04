// Define a global variable 'Module' with a method 'onRuntimeInitialized':
// Module = {
//   onRuntimeInitialized() {
//     // this is our application:
//     console.log(cv.getBuildInformation())
//   }
// }
// cv = require('./opencv.js')


// -------------------- Start of Point class ---------------
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

// ------------------- Start of Saliency Map class ---------------------

class Map {
    constructor(width, height){
        this.width = width;
        this.height = height;
        // should use this.saliency(y,x); x indicates col, so should go second
        this.saliency = new Array(this.height).fill(0).map(() => new Array(this.width).fill(0));
        this.regions = {};
        this.num_regions = 1;
    }

    connectPoints(x1,y1,x2,y2) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        if( dx < 0 & dy < 0) {
            let temp = x1;
            x1 = x2;
            x2 = temp;
            temp = y1;
            y1 = y2;
            y2 = temp;
            dx = x2 - x1;
            dy = y2-y1;
        }
        let steps = dx>dy ? dx : dy;
        let xinc = dx/steps;
        let yinc = dy/steps;
        console.log(`dx: ${dx}; dy: ${dy}`);
        let x = x1;
        let y = y1;
        for (let i = 0; i<steps+1; i++){
            // console.log(`(${x}, ${y})`);
            // console.log(`trying to change ${this.saliency[parseInt(y)][parseInt(x)]}`);
            this.saliency[parseInt(y)][parseInt(x)] = 1;
            x+=xinc;
            y+=yinc;
        }
    }

    push(region){
        this.regions[this.num_regions] = region;
        console.log(region.points);
        this.num_regions++;
        for (let i=0; i< region.points.length; i++){
            // console.log(`Currently starting with point ${i}`);
            this.connectPoints(region.points[i][0], region.points[i][1], region.points[(i+1)%region.points.length][0], region.points[(i+1)%region.points.length][1]);
        }
    }

    fill(ctx, x, y){
        x = parseInt(x);
        y = parseInt(y);
        if (this.saliency[y][x] == 1 || y < 0 || y > this.height-1 || x < 0 || x > this.width-1){
            return;
        }
        else {
            this.saliency[y][x] = 1;
            ctx.fillRect(x,y,1,1);
            this.fill(ctx, x+1, y);
            this.fill(ctx, x-1, y);
            this.fill(ctx, x, y+1);
            this.fill(ctx, x, y-1);
            return;
        }
    }

    blur() {
        console.log("blurring");
        let mat = cv.matFromArray(2, 2, cv.CV_8UC1, [1, 2, 3, 4]);
    }
}

//------------- start of code --------------------
// Getting elements
const canvas = document.querySelector("#saliency_map");
const ctx = canvas.getContext("2d");
const imageInput = document.querySelector("#imageInput");

const output = document.querySelector("#output_image");
const output_ctx = output.getContext("2d");

const start_button = document.querySelector("#start");
const finish_button = document.querySelector("#finish");
const fill_button = document.querySelector("#fill");
const convert_button = document.querySelector('#convert');

const method_menu = document.querySelector('#method');

// Setting the size of canvas according to css
console.log(getComputedStyle(canvas)['height']);
console.log(getComputedStyle(canvas)['width']);
canvas.height = getComputedStyle(canvas)['height'].slice(0,-2);
canvas.width = getComputedStyle(canvas)['width'].slice(0,-2);
console.log(canvas.height,canvas.width);

output.height = getComputedStyle(output)['height'].slice(0,-2);
output.width = getComputedStyle(output)['width'].slice(0,-2);

// Creating buffers
const allPoints = new Array();
console.log(`Starting saliency map with width ${canvas.width} and height ${canvas.height}`);
const saliency_map = new Map(canvas.width, canvas.height);
let draw = false;

// Input and output
let original = new ImageData(canvas.width, canvas.height);


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
                original = ctx.getImageData(0,0,canvas.width, canvas.height);

                // canvas.height = rect.top-rect.bot;
                // console.log(`canvas width is ${canvas.width} and canvas height is ${canvas.height}`);
                // rect = canvas.getBoundingClientRect();
                // console.log(`canvas width is ${rect.right-rect.left}`);
            }
        }
    }
});

// Setting up all buttons
start_button.addEventListener("dblclick", () => {addNewPoint()});
finish_button.addEventListener("dblclick", () => {finishDrawing()});
fill_button.addEventListener("dblclick", (e) => {fillRegion(e)});
convert_button.addEventListener("dblclick", ()=> {displayOutput()});
method_menu.addEventListener("change", (e)=> {
    console.log(method_menu.value);
})

function addNewPoint() {
    current_point = new Point();
    allPoints.push(current_point);
    draw = true;
}

function finishDrawing() {
    console.log("hi");
    current_point = allPoints[allPoints.length-1];
    current_point.finish(ctx);
    saliency_map.push(current_point);
    draw = false;
}

function fillRegion(e) {
    fill = true;
}

function displayOutput() {
    console.log("display?!");
    if (method_menu.value == "Contrast"){
        console.log("contrast");
    } else if (method_menu.value == "Saturation"){
        console.log("saturation");
    } else if (method_menu.value == "Hatching") {
        console.log("hatching");
    } else if (method_menu.value == "Blurring") {
        console.log("blurring");
    } else {
        console.log(`${method_menu.value} has not been implemented`);
    }
    output_ctx.putImageData(original, 0, 0);
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
    else if (fill == true){
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        console.log(`Filling area starting with point ${x}, ${y}.`);
        saliency_map.fill(ctx,x,y);
        fill = false;
    }
})


window.addEventListener("resize", () => {
    console.log(getComputedStyle(canvas)['height']);
    console.log(getComputedStyle(canvas)['width']);
    canvas.height = getComputedStyle(canvas)['height'].slice(0,-2);
    canvas.width = getComputedStyle(canvas)['width'].slice(0,-2);
    console.log(canvas.height,canvas.width);
    ctx.putImageData(previous_canvas, 0,0);

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


