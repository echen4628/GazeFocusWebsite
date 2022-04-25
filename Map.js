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
            console.log(`(${x}, ${y})`);
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
            console.log(`Currently starting with point ${i}`);
            this.connectPoints(region.points[i][0], region.points[i][1], region.points[(i+1)%region.points.length][0], region.points[(i+1)%region.points.length][1]);
        }
    }

    fill(ctx, x, y){
        console.log("Not made yet!");
    }
}


map = new Map(10,10);
point1 = new Point();
point1.points = [[0,3], [2,1], [3,4]];
point2 = new Point();
point2.points = [[4,4], [6,4], [9,7]];
console.log(`point1.points: ${point1.points[0]}`);
map.push(point1);
// console.log(map.saliency);
map.push(point2);
console.log(map.saliency);
