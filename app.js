// Getting elements
const canvas = document.querySelector("#saliency_map");
const ctx = canvas.getContext("2d");
const imageInput = document.querySelector("#imageInput");


const output = document.querySelector("#output_image");
const output_ctx = output.getContext("2d");

const start_button = document.querySelector("#start");
const finish_button = document.querySelector("#finish");
const convert_button = document.querySelector('#convert');

const method_menu = document.querySelector('#method');

const smooth_level = document.querySelector('#kernel_size');
const base_saliency = document.querySelector('#base_saliency');

const allPoints = new Array();
let draw = false;
let original;
let saliency_map;

function initialization(){
    console.log(getComputedStyle(canvas)['height']);
    console.log(getComputedStyle(canvas)['width']);
    console.log(canvas.height,canvas.width);

    // Setting the size of the output canvas according to the saliency map canvas
    output.height = getComputedStyle(canvas)['height'].slice(0,-2);
    output.width = getComputedStyle(canvas)['width'].slice(0,-2);

    // Creating buffers
    console.log(`Starting saliency map with width ${canvas.width} and height ${canvas.height}`);
    saliency_map = new Saliency_Map(canvas.width, canvas.height);
    draw = false;
}


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
                console.log(`canvas width is ${canvas.width} and canvas height is ${canvas.height}`);
                original = ctx.getImageData(0,0,canvas.width, canvas.height);
                initialization();

            }
        }
    }
});

// Setting up all buttons
start_button.addEventListener("dblclick", () => {addNewPoint()});
finish_button.addEventListener("dblclick", () => {finishDrawing()});

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
    current_point = allPoints[allPoints.length-1];
    current_point.finish(ctx);
    saliency_map.push(current_point);
    draw = false;
}

function displayOutput() {
    let kernel_size = parseInt(smooth_level.value);
    saliency_map.setBaseSaliency(parseInt(base_saliency.value))
    if (method_menu.value == "Saturation"){
        output_image = saliency_map.saturation_transform(original, kernel_size);
        console.log("saturation");
    } else if (method_menu.value == "Dot") {
        output_image = saliency_map.dot_transform(original, kernel_size);
        console.log("hatching");
    } else if (method_menu.value == "Blurring") {
        output_image = saliency_map.blur_transform(original, kernel_size);
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
