class Saliency_Map {
    constructor(width, height){
        this.width = width;
        this.height = height;
        // should use this.saliency(y,x); x indicates col, so should go second
        this.saliency = new Array(this.height).fill(0).map(() => new Array(this.width).fill(0));
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
            this.saliency[y][x] = this.level;
            ctx.fillRect(x,y,1,1);
            this.fill(ctx, x+1, y);
            this.fill(ctx, x-1, y);
            this.fill(ctx, x, y+1);
            this.fill(ctx, x, y-1);
            return;
        }
    }

    // should only be called once
    blur() {
        console.log("blurring");
        let mat = cv.matFromArray(this.width, this.height, cv.CV_8UC1, (this.saliency).flat());
        let dst = new cv.Mat();
        let ksize = new cv.Size(3, 3);
        // You can try more different parameters
        cv.GaussianBlur(mat, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
        this.blurred_saliency = dst;
    }

    saturation_transform(input_image) {
        console.log("changing saturation");
        if (!this.blurred_saliency) {
            this.blur();
        }
        for (let pixel = 0; pixel < this.height*this.width; pixel++){
            canvas_pixel = pixel*4;
            let R = input_image.data[canvas_pixel];
            let G = input_image.data[canvas_pixel+1];
            let B = input_image.data[canvas_pixel+2];

            // convert to lab
            let factor = this.blurred_saliency.data[pixel] / this.level;
            let a = factor * a;
            let b = factor * b;

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

}


map = new Saliency_Map(10,10);
point1 = new Point();
point1.points = [[0,3], [2,1], [3,4]];
point2 = new Point();
point2.points = [[4,4], [6,4], [9,7]];
console.log(`point1.points: ${point1.points[0]}`);
map.push(point1);
// console.log(map.saliency);
map.push(point2);
console.log(map.saliency);
