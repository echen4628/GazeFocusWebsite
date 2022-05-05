class Saliency_Map {
    constructor(width, height){
        this.width = width;
        this.height = height;
        // should use this.saliency(y,x); x indicates col, so should go second
        this.saliency = new Array(this.height).fill(0).map(() => new Array(this.width).fill(3));
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
        let mat = cv.matFromArray(this.height, this.width, cv.CV_8UC1, (this.saliency).flat());
        console.log("this is the matrix")
        console.log(mat.data);
        let vertices = cv.matFromArray(region.points.length, 1, cv.CV_32SC2, region.points.flat());
        let pts = new cv.MatVector();
        pts.push_back(vertices);
        let color = new cv.Scalar(this.level);
        cv.fillPoly(mat, pts, color);
        console.log(mat.data);
        this.reshape(mat.data.slice(0, mat.data.length));
        pts.delete();
        mat.delete();
        
    }

    // push(region){
    //     this.regions[this.num_regions] = region;
    //     console.log(region.points);
    //     this.num_regions++;
    //     let mat = this.fill(region);
    //     this.reshape(mat.data);
    //     return mat;
    //     // for (let i=0; i< region.points.length; i++){
    //     //     // console.log(`Currently starting with point ${i}`);
    //     //     this.connectPoints(region.points[i][0], region.points[i][1], region.points[(i+1)%region.points.length][0], region.points[(i+1)%region.points.length][1]);
    //     // }
    // }

    // fill(region) {
    //     let mat = cv.matFromArray(this.width, this.height, cv.CV_8UC1, (this.saliency).flat());
    //     let vertices = cv.matFromArray(region.points.flat().length, 1, cv.CV_32SC2, region.points.flat())
    //     let pts = new cv.MatVector();
    //     pts.push_back(vertices);
    //     let color = new cv.Scalar(this.level);
    //     cv.fillPoly(mat, pts, color);
    //     pts.delete();
    //     console.log("this is mat")
    //     console.log(mat.data);
    //     return mat;
        // let npts = 4;
        // let square_point_data = new Uint8Array([
        //     1, 1,
        //     4, 1,
        //     4, 4,
        //     1, 4]);
        // let square_points = cv.matFromArray(npts, 1, cv.CV_32SC2, square_point_data);
        // let pts = new cv.MatVector();
        // pts.push_back (square_points);
        // let color = new cv.Scalar (255);
    // }
    // fill(ctx, x, y){
    //     x = parseInt(x);
    //     y = parseInt(y);
    //     if (this.saliency[y][x] == this.level || y < 0 || y > this.height-1 || x < 0 || x > this.width-1){
    //         return;
    //     }
    //     else {
    //         this.saliency[y][x] = this.level;
    //         ctx.fillRect(x,y,1,1);
    //         this.fill(ctx, x+1, y);
    //         this.fill(ctx, x-1, y);
    //         this.fill(ctx, x, y+1);
    //         this.fill(ctx, x, y-1);
    //         return;
    //     }
    // }

    // should only be called once
    blur() {
        console.log("blurring");
        let mat = cv.matFromArray(this.height, this.width, cv.CV_8UC1, (this.saliency).flat());
        let dst = new cv.Mat();
        let ksize = new cv.Size(21, 21);
        // You can try more different parameters
        cv.GaussianBlur(mat, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
        this.blurred_saliency = dst;
        mat.delete();
    }

    saturation_transform(input_image) {
        console.log("changing saturation");
        if (!this.blurred_saliency) {
            this.blur();
        }
        for (let pixel = 0; pixel < this.height*this.width; pixel++){
            let canvas_pixel = pixel*4;
            let R = input_image.data[canvas_pixel];
            let G = input_image.data[canvas_pixel+1];
            let B = input_image.data[canvas_pixel+2];

            // convert to lab
            let [l,a,b] = this.rgb2lab([R,G,B]);
            let factor = this.blurred_saliency.data[pixel] / this.level;
            a = factor * a;
            b = factor * b;

            [R,G,B] = this.lab2rgb([l,a,b]);

            // convert back to rgb
            input_image.data[canvas_pixel] = R;
            input_image.data[canvas_pixel+1] = G;
            input_image.data[canvas_pixel+2] = B;
        }
        return input_image;
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

    combine() {
        // picks the right rgb value from the right layer corresponding to the saliency value.
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

}


// map = new Saliency_Map(10,11);
// point1 = new Point();
// point1.points = [[9,10], [2,1], [3,4]];
// // point2 = new Point();
// // point2.points = [[4,4], [6,4], [9,7]];
// console.log(`point1.points: ${point1.points[0]}`);
// // let mat1 = map.push(point1);
// // console.log(map.saliency);
// // let mat2 = map.push(point2);
// console.log(map.saliency);
