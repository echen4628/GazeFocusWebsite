class Saliency_Map {
    constructor(width, height){
        this.width = width;
        this.height = height;

        this.base_saliency = 3 // the value this.saliency is set to by default
        this.saliency = new Array(this.height).fill(0).map(() => new Array(this.width).fill(3));
        // index as this.saliency(y,x); x indicates col, y indicates row

        this.regions = {}; // a dictionary of all the added saliency regions
        this.num_regions = 1;
        this.blurred_saliency = null;
        this.level = 5; // levels of saliency, sets the highest saliency value to this level.
    }

    setBaseSaliency(new_saliency){
        // replaces base values in the this.saliency matrix
        this.saliency = this.saliency.map((arr) => arr.map((x) => x === this.base_saliency ? new_saliency : x));
        this.base_saliency = new_saliency;
    }

    push(region){
        // accepts a list of x,y pixel value pairs; adds and fills that region in the saliency map
        this.regions[this.num_regions] = region;
        this.num_regions++;
        let mat = cv.matFromArray(this.width, this.height, cv.CV_8UC1, (this.saliency).flat());
        let vertices = cv.matFromArray(region.points.length, 1, cv.CV_32SC2, (region.points).flat());
        let pts = new cv.MatVector();
        pts.push_back(vertices);
        let color = new cv.Scalar(this.level);
        cv.fillPoly(mat, pts, color);
        this.reshape(Array.from(mat.data));
        vertices.delete();
        pts.delete();
        mat.delete();
    }

    blur(kernel_size) {
        // a gaussian blur; calling multiple times will not blur multiple times
        // keeps the pixels with max saliency the same
        console.log("blurring");
        let mat = cv.matFromArray(this.height, this.width, cv.CV_8UC1, (this.saliency).flat());
        let dst = new cv.Mat();
        let ksize = new cv.Size(kernel_size, kernel_size);

        // You can try more different parameters
        cv.GaussianBlur(mat, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
        let temp = Array.from(dst.data);
        let flat = this.saliency.flat()
        this.blurred_saliency = [...Array(this.width*this.height).keys()].map((idx) => Math.max(temp[idx], flat[idx]));
        console.log("finished blurring");
        dst.delete();
        mat.delete();
    }

    saturation_transform(input_image, kernel_size) {
        // desaturates nonsalient regions of the image
        let output_image = structuredClone(input_image);
        console.log("changing saturation");
        this.blur(kernel_size);
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

    blur_transform(input_image, kernel_size) {
        // blurs nonsalient regions of the image
        let output_image = structuredClone(input_image);
        console.log("changing blur");
        this.blur(kernel_size);
        let levels = new Array();
        for (let i = 1; i < this.level; i++){
            console.log("you are in the for loop");
            let mat = cv.matFromImageData(input_image);
            let kernel_size = Math.floor(this.width*(1-(i/this.level))/200)*2+1;
            console.log(`kernel size: ${kernel_size}`);
            let dst = new cv.Mat();
            let ksize = new cv.Size(kernel_size, kernel_size);
            cv.GaussianBlur(mat, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
            levels.push(Array.from(dst.data));
        }
        levels.push(Array.from(input_image.data));
        console.log(levels);
        return this.combine(levels, output_image);
    }

    dot_transform(input_image, kernel_size) {
        // changes nonsalient regions of the image to dots and draws contour 
        // of the original image
        this.blur(kernel_size);

        // drawing contour
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

        // drawing circles

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
        // draws a layer of circles for each saliency value
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

    // The following two functions were written by Kevin Kwok (antimatter15)
    // and can be found here: https://github.com/antimatter15/rgb-lab. This 
    // code is covered under MIT license
    lab2rgb(lab){
        // taken from 
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
        // reshapes a float array into a saliency map of specified dimensions
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
