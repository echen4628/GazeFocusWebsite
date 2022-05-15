# GazeFocusWebsite
A webapp to that allows users to draw attention to specific regions of an image using styling tools such as selective desaturation, blurring and dotting. To access the webapp, simply clone this repository and open the index.html file using a browser such as Chrome.

Once the app opens, select an image. To enclose each important part of the image, 1. double click on "Start Drawing" 2. successively click on the contour of the desired region of the image (note that the indicator contour line is in black so if the region of the image being captured is black, it can be hard to see the contour, to change the color of the line, go to the Point.js class) 3. once the entire region is enclosed, double click on "Finish Drawing." Repeat this for each region of the image. Then select a style from the dropdown menu and double click convert. You may add additional regions to the same image and apply a new style, but to edit a new image, refresh the page to restart. Once you are done, save the image by right clicking on the output image and "save image as."

The two parameters that may be tuned are "Smooth Level" and "Base Saliency." Smooth Level controls the smoothness of the transition between regions with high importance and low importance. The value should be odd and less than the size of the image. High values of smoothness causes a more smooth transition. Base Saliency controls the difference between high importance and low importance. The web tool works by keeping the high importance regions the same and applying styles on low importance regions. The Base Saliency is how important each pixel starts of as. Reducing the Base Saliency value causes a more dramatic style to be applied. 

## Important files
* index.html - the page layout for the site
* style.css - basic styling for the site
* app.js - controls logic for the site, uses functions from Point.js, Map.js, and opencv.js
* Point.js - a class that stores and manages a series of points meant to be the contour of a region
* Map.js - a class that stores and manages all important regions of an image and has functions that applies styles to the image
* opencv.js - dependency

### Citation
The lab2rgb and rgb2lab functions in Map.js were written by Kevin Kwok (antimatter15) and can be found here: https://github.com/antimatter15/rgb-lab. This code is covered under MIT license. 
