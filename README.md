# GazeFocusWebsite
A webapp to that allows users to draw attention to specific regions of an image using styling tools such as selective desaturation, blurring and dotting. To access the webapp, simply clone this repository and open the index.html file using a browser such as Chrome.

## Important files
* index.html - the page layout for the site
* style.css - basic styling for the site
* app.js - controls logic for the site, uses functions from Point.js, Map.js, and opencv.js
* Point.js - a class that stores and manages a series of points meant to be the contour of a region
* Map.js - a class that stores and manages all important regions of an image and has functions that applies styles to the image
* opencv.js - dependency
