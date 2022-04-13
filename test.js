const uploadedImage = document.querySelector("#uploadedImage");
const imageInput = document.querySelector("#imageInput");

imageInput.addEventListener("change", (e) => {
    if(e.target.files) {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function (e) {
            let image = new Image();
            image.src = e.target.result;
            console.log(image.src);
            image.onload = function(e) {
                uploadedImage.append(image);
                uploadedImage.width = image.width;
                uploadedImage.height = image.height;
            }
            // image.onload = function(e) {
            //     canvas.width = image.width;
            //     canvas.height = image.height;
            //     ctx.drawImage(image, 0, 0);
            // }
        }
    }
});