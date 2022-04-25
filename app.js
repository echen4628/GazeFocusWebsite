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
}

const canvas = document.querySelector("#saliency_map");
const ctx = canvas.getContext("2d");
const imageInput = document.querySelector("#imageInput");

const start_button = document.querySelector("#start");
const finish_button = document.querySelector("#finish");
const fill_button = document.querySelector("#fill");

console.log(getComputedStyle(canvas)['height']);
console.log(getComputedStyle(canvas)['width']);
canvas.height = getComputedStyle(canvas)['height'].slice(0,-2);
canvas.width = getComputedStyle(canvas)['width'].slice(0,-2);
console.log(canvas.height,canvas.width);

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
console.log(`Starting saliency map with width ${canvas.width} and height ${canvas.height}`);
const saliency_map = new Map(canvas.width, canvas.height);
let draw = false;

start_button.addEventListener("dblclick", () => {addNewPoint()});
finish_button.addEventListener("dblclick", () => {finishDrawing()});
fill_button.addEventListener("dblclick", (e) => {fillRegion(e)});


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


