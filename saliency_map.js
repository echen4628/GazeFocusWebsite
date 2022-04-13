// row is width, (i,j)
// col is height
function randomMap(width, height){
    let saliency_map = new Array(height);
    for (i = 0; i<saliency_map.length; i++){
        let row = new Array(width);
        for (j=0; j<row.length; j++){
            row[j] = Math.random();
        }
        saliency_map[i] = row;
    }
    return saliency_map;
}

function blankMap(width, height){
    let saliency_map = new Array(height);
    for (i = 0; i<saliency_map.length; i++){
        let row = new Array(width);
        for (j=0; j<row.length; j++){
            row[j] = 0;
        }
        saliency_map[i] = row;
    }
    return saliency_map;
}

// (r1, c1) is left top
// (r2, c2) is right bot
function rect_patch(r1,c1, r2,c2, saliency_map) {
    for(i=r1; i<r2; i++){
        for(j=c1; j<c2; j++){
            saliency_map[i][j] = 1.0;
        }
    }
    return saliency_map
}

sample_map  = randomMap(10,15)
console.log(sample_map);
console.log(rect_patch(2,3,7,8, sample_map));
