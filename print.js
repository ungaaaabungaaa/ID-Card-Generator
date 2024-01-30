// Snackbar 
function snackbar(message) {
    var x = document.getElementById("snackbar");
    x.textContent = message;
    x.className = "show";
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}

// Check if the DOM is fully loaded
// Function to open file picker
function selectImage(cardId) {
    var fileInput = document.getElementById(`fileInput${cardId}`);
    if (fileInput) {
        fileInput.click();
    }
}

// Function to display selected image on the image view
function displaySelectedImage(inputId, cardId) {
    var input = document.getElementById(inputId);
    var card = document.getElementById(cardId);
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            card.src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function addRotatedAndScaledImageToCanvas(ctx, img, x, y, rotationDegrees, scaledWidth, scaledHeight) {
    ctx.save(); // Save the current canvas state
    ctx.translate(x + scaledWidth / 2, y + scaledHeight / 2);
    ctx.rotate((rotationDegrees * Math.PI) / 180);
    ctx.drawImage(img, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
    ctx.restore(); // Restore the previous canvas state
}

function createCanvasAndDownload(overlayImageSources) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const backgroundImageSrc = "Print Template/Print Template.jpeg";
    const backgroundImg = new Image();
    backgroundImg.crossOrigin = "Anonymous"; // Enable CORS for the image
    backgroundImg.onload = () => {
        canvas.width = backgroundImg.width;
        canvas.height = backgroundImg.height;
        ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
        let loadedCount = 0;
        const loadedImages = [];
        const onLoadComplete = () => {
            loadedCount++;
            if (loadedCount === overlayImageSources.length) {
                loadedImages.forEach((img, index) => {
                    const overlayParams = getOverlayParams(index); // Replace this with your parameters logic
                    addRotatedAndScaledImageToCanvas(ctx, img, ...overlayParams);
                });
                downloadCanvasAsImage(canvas);
            }
        };

        overlayImageSources.forEach((overlaySrc, index) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                loadedImages[index] = img;
                onLoadComplete();
            };
            img.src = overlaySrc;
        });
    };
    backgroundImg.src = backgroundImageSrc;
}


function getOverlayParams(index) {
    // Example parameters based on the index
    if (index === 0) {
        return [280, 10, 270, 265, 395]; // Parameters for the first overlay image
    } else if (index === 1) {
        return [280, 325, 270, 265, 395]; // Parameters for the second overlay image
    }
    // Add more conditions or a different approach based on your specific requirements
}

function downloadCanvasAsImage(canvas) {
    const link = document.createElement('a');
    link.download = 'canvas_output.jpg';
    link.href = canvas.toDataURL('image/jpeg');
    link.click();
}

document.getElementById("genrator").addEventListener("click", function () {
    console.log("index page");
    window.location.href = "index.html";
});


// Add event listeners to the image views
document.getElementById('Card1').addEventListener('click', function () {
    selectImage('Card1');
});

document.getElementById('Card2').addEventListener('click', function () {
    selectImage('Card2');
});


document.getElementById('Print').addEventListener('click', function () {
    var card1Src = document.getElementById('Card1').src;
    var card2Src = document.getElementById('Card2').src;
    const blankImageSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAwAB/aurfg0AAAAASUVORK5CYII="; // 1x1 white pixel

    // Check if at least one image is selected
    if ((card1Src && card1Src !== 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7') ||
        (card2Src && card2Src !== 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7')) {

        // Use a blank image for any missing card images
        card1Src = (card1Src && card1Src !== 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7') ? card1Src : blankImageSrc;
        card2Src = (card2Src && card2Src !== 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7') ? card2Src : blankImageSrc;

        snackbar("Generating Print Template");
        const overlayImageSources = [card1Src, card2Src];
        createCanvasAndDownload(overlayImageSources);
    } else {
        // Neither image is selected
        snackbar("At least one image must be selected.");
    }
});



// Function to reset selected images and hide snackbar
// Function to reset selected images and hide snackbar
function resetSelection() {
    var card1 = document.getElementById('Card1');
    var card2 = document.getElementById('Card2');
    var fileInput1 = document.getElementById('fileInputCard1');
    var fileInput2 = document.getElementById('fileInputCard2');
    // Reset image sources to clear selected images
    card1.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    card2.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    // Reset file inputs to allow selecting images again
    fileInput1.value = '';
    fileInput2.value = '';
    snackbar("Cleared");
}


document.getElementById('resetButton').addEventListener('click', function () {
    resetSelection();
});

const downloadButton = document.getElementById('Print');
downloadButton.addEventListener('click', createCanvasAndDownload);
