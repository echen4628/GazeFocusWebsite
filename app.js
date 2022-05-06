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
const saliency_map = new Saliency_Map(canvas.width, canvas.height);
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
// fill_button.addEventListener("dblclick", (e) => {fillRegion(e)});
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

// function fillRegion(e) {
//     fill = true;
// }

function displayOutput() {
    console.log("display?!");
    if (method_menu.value == "Contrast"){
        console.log("contrast");
    } else if (method_menu.value == "Saturation"){
        output_image = saliency_map.saturation_transform(original);
        console.log("saturation");
    } else if (method_menu.value == "Dot") {
        output_image = saliency_map.dot_transform(original);
        console.log("hatching");
    } else if (method_menu.value == "Blurring") {
        output_image = saliency_map.blur_transform(original);
        console.log("blurring");
    } else if (method_menu.value == "Original"){
        output_image = original;
        console.log("original");
    }
    else {
        console.log(`${method_menu.value} has not been implemented`);
    }
    output_ctx.putImageData(output_image, 0, 0);
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


window.addEventListener("resize", () => {
    console.log(getComputedStyle(canvas)['height']);
    console.log(getComputedStyle(canvas)['width']);
    canvas.height = getComputedStyle(canvas)['height'].slice(0,-2);
    canvas.width = getComputedStyle(canvas)['width'].slice(0,-2);
    console.log(canvas.height,canvas.width);
    ctx.putImageData(previous_canvas, 0,0);

})


