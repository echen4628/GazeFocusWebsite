let saliency_map = new Array(500);
for (i = 0; i<saliency_map.length; i++){
    let row = new Array(500);
    for (j=0; j<row.length; j++){
        row[j] = Math.random();
    }
    saliency_map[i] = row;
}
console.log(saliency_map);

