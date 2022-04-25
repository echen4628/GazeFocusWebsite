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
        ctx.lineTo(...this.points[0]);
    }
}