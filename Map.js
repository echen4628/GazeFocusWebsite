class Saliency_Map {
    constructor(width, height){
        this.width = width;
        this.height = height;
        // should use this.saliency(y,x); x indicates col, so should go second
        this.saliency = new Array(this.height).fill(0).map(() => new Array(this.width).fill(1));
        this.regions = {};
        this.num_regions = 1;
        this.blurred_saliency = null;
        this.level = 5;
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
        console.log(this.saliency);
        let mat = cv.matFromArray(this.width, this.height, cv.CV_8UC1, (this.saliency).flat());
        console.log("this is the matrix")
        console.log(mat.data);
        let vertices = cv.matFromArray(region.points.length, 1, cv.CV_32SC2, (region.points).flat());
        let pts = new cv.MatVector();
        pts.push_back(vertices);
        let color = new cv.Scalar(this.level);
        cv.fillPoly(mat, pts, color);
        console.log(Array.from(mat.data));
        // this.reshape(mat.data.slice(0, mat.data.length));
        this.reshape(Array.from(mat.data));
        vertices.delete();
        pts.delete();
        mat.delete();
    }

    // calling multiple times does not blur multiple times
    blur() {
        console.log("blurring");
        let mat = cv.matFromArray(this.height, this.width, cv.CV_8UC1, (this.saliency).flat());
        let dst = new cv.Mat();
        let ksize = new cv.Size(321, 321);
        // You can try more different parameters
        cv.GaussianBlur(mat, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
        let temp = Array.from(dst.data);
        let flat = this.saliency.flat()
        this.blurred_saliency = [...Array(this.width*this.height).keys()].map((idx) => Math.max(temp[idx], flat[idx]));
        console.log("finished blurring");
        dst.delete();
        mat.delete();
    }

    saturation_transform(input_image) {
        let output_image = structuredClone(input_image);
        console.log("changing saturation");
        this.blur();
        for (let pixel = 0; pixel < this.height*this.width; pixel++){
            let canvas_pixel = pixel*4;
            let R = output_image.data[canvas_pixel];
            let G = output_image.data[canvas_pixel+1];
            let B = output_image.data[canvas_pixel+2];

            // convert to lab
            let [l,a,b] = this.rgb2lab([R,G,B]);
            let factor = this.blurred_saliency[pixel] / this.level;
            a = factor * a;
            b = factor * b;

            [R,G,B] = this.lab2rgb([l,a,b]);

            // convert back to rgb
            output_image.data[canvas_pixel] = R;
            output_image.data[canvas_pixel+1] = G;
            output_image.data[canvas_pixel+2] = B;
        }
        return output_image;
    }

    contrast_transform(input_image) {
        console.log("changing contrast");
        let contrast_levels = {};
        for (let level = 0; level < this.level; level++) {
            current_level = new Array(this.height*this.width);
            // call change constrast on input_image
            contrast_levels[level] = current_level;
        }
        
    }

    blur_transform(input_image) {
        let output_image = structuredClone(input_image);
        console.log("changing blur");
        this.blur();
        let levels = new Array();
        for (let i = 1; i < this.level; i++){
            console.log("you are in the for loop");
            let mat = cv.matFromImageData(input_image);
            let kernel_size = Math.floor(this.width*(1-(i/this.level))/200)*2+1;
            console.log(`kernel size: ${kernel_size}`);
            let dst = new cv.Mat();
            let ksize = new cv.Size(kernel_size, kernel_size);
            // You can try more different parameters
            cv.GaussianBlur(mat, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
            levels.push(Array.from(dst.data));
        }
        levels.push(Array.from(input_image.data));
        console.log(levels);
        return this.combine(levels, output_image);
    }

    dot_transform(input_image) {
        this.blur();
        let output_image = structuredClone(input_image);
        let mat = cv.matFromImageData(input_image);
        let dst = cv.Mat.zeros(this.width, this.height, cv.CV_8UC3);
        cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY, 0);
        cv.threshold(mat, mat, 120, 200, cv.THRESH_BINARY);
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        // You can try more different parameters
        cv.findContours(mat, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
        // draw contours with random Scalar
        for (let i = 0; i < contours.size(); ++i) {
            let color = new cv.Scalar(255, 255, 255);
            cv.drawContours(dst, contours, i, color, 1, cv.LINE_8, hierarchy, 100);
        }
        let contour_outline = Array.from(dst.data);
        mat.delete(); dst.delete(); contours.delete(); hierarchy.delete();
        for (let pixel = 0; pixel < this.height*this.width; pixel++){
            let canvas_pixel = pixel*4;
            let outline_pixel = pixel*3;
            output_image.data[canvas_pixel] = contour_outline[outline_pixel];
            output_image.data[canvas_pixel+1] = contour_outline[outline_pixel+1];
            output_image.data[canvas_pixel+2] = contour_outline[outline_pixel+2];
        }
        // add circles/ hatches

        //create layers, lower saliencies have smaller more sparse circles 
        // (a percentage of the overall image)
        let levels = this.create_circles();

        // loop through saliency map, find the value of the corresponding layer, if
        // the value is a 1, then pick the color off the original image, if the value is a 0
        // then do nothing

        let temp_level;
        for (let pixel = 0; pixel < this.height*this.width; pixel++){
            let canvas_pixel = pixel*4;
            let pixel_saliency = this.blurred_saliency[pixel];
            temp_level = levels[pixel_saliency-1];
            if (temp_level[pixel] === 1){
                output_image.data[canvas_pixel] = input_image.data[canvas_pixel];
                output_image.data[canvas_pixel+1] = input_image.data[canvas_pixel+1];
                output_image.data[canvas_pixel+2] = input_image.data[canvas_pixel+2];
                output_image.data[canvas_pixel+3] = input_image.data[canvas_pixel+3];
            }
        }
        return output_image;
    }

    create_circles(){
        let ones = new Array(this.width*this.height*0.001).fill(1);
        let zeros = new Array(this.width*this.height*0.999).fill(0);
        let combined = ones.concat(zeros);
        let levels = new Array();
        let radius;
        let center;
        let level;
        let color = new cv.Scalar (1);
        for (let i = 1; i < this.level; i++){
            this.shuffleArray(combined);
            radius = Math.floor(Math.sqrt((i-1)/this.level)/0.01/Math.PI); 
            console.log(radius);
            level = new cv.Mat.zeros(this.height, this.width, cv.CV_8UC1);
            for (let row = 0; row < this.height; row++){
                for (let col = 0; col < this.width; col++){
                    if (combined[row*this.width + col] === 1){
                        center = new cv.Point(col, row);
                        cv.circle(level, center, radius, color, -1);
                    }
                }
            }
            // You can try more different parameters
            levels.push(Array.from(level.data));
        }
        levels.push(Array(this.height*this.width).fill(1));
        return levels;
    }

    combine(levels, output_image) {
        // picks the right rgb value from the right layer corresponding to the saliency value.
        let temp_level;
        for (let pixel = 0; pixel < this.height*this.width; pixel++){
            let canvas_pixel = pixel*4;
            let pixel_saliency = this.blurred_saliency[pixel];
            temp_level = levels[pixel_saliency-1];
            output_image.data[canvas_pixel] = temp_level[canvas_pixel];
            output_image.data[canvas_pixel+1] = temp_level[canvas_pixel+1];
            output_image.data[canvas_pixel+2] = temp_level[canvas_pixel+2];
            output_image.data[canvas_pixel+3] = temp_level[canvas_pixel+3];
        }
        return output_image;
    }

    lab2rgb(lab){
        let y = (lab[0] + 16) / 116,
            x = lab[1] / 500 + y,
            z = y - lab[2] / 200,
            r, g, b;
      
        x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16/116) / 7.787);
        y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16/116) / 7.787);
        z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16/116) / 7.787);
      
        r = x *  3.2406 + y * -1.5372 + z * -0.4986;
        g = x * -0.9689 + y *  1.8758 + z *  0.0415;
        b = x *  0.0557 + y * -0.2040 + z *  1.0570;
      
        r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1/2.4) - 0.055) : 12.92 * r;
        g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1/2.4) - 0.055) : 12.92 * g;
        b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1/2.4) - 0.055) : 12.92 * b;
      
        return [Math.max(0, Math.min(1, r)) * 255, 
                Math.max(0, Math.min(1, g)) * 255, 
                Math.max(0, Math.min(1, b)) * 255]
      }
      
      
    rgb2lab(rgb){
        let r = rgb[0] / 255,
            g = rgb[1] / 255,
            b = rgb[2] / 255,
            x, y, z;
      
        r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
      
        x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
        y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
        z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
      
        x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
        y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
        z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
      
        return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
      }

    reshape(mat) {
        console.log(mat);
        let temp = new Array();
        for (let x = 0; x < this.height* this.width; x = x + this.width) {
            temp.push(mat.slice(x, x + this.width));
        }
        this.saliency = temp;
        console.log(temp);
    }

    shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
}


// map = new Saliency_Map(5,5);
// point1 = new Point();
// point1.points = [[0,0], [2,1], [3,4]];
// point2 = new Point();
// point2.points = [[9,9], [7,9], [9,7]];
// console.log(`point1.points: ${point1.points[0]}`);
// let mat1 = map.push(point1);
// console.log(map.saliency);
// let mat2 = map.push(point2);
// console.log(map.saliency);


// b = new Array(625).fill(1);
// c = new Array(500*500-625).fill(0);
// d = b.concat(c);
// shuffleArray(d);
// let mat2 = cv.Mat.zeros(this.width, this.height, cv.CV_8UC1);
// for (let row = 0; row < this.height; row++){
//     for (let col = 0; col < this.width; col++){
//         if (d[row*this.width + col] === 1){
//             cv.circle(mat2, (col, row), r, 1, -1)
//         }
//     }
// }

// let center = new cv.Point(5, 5);
// let img = new cv.Mat.zeros(10, 10, cv.CV_8UC1);
// let color = new cv.Scalar (1);
// cv.circle(img, center, 3, color, -1);