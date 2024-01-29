let frontLabelGenerated = false; // Flag to track front label generation
let backLabelGenerated = false; // Flag to track back label generation

// allows to toast messages 
function snackbar(message) {
    var x = document.getElementById("snackbar");
    x.textContent = message;
    x.className = "show";
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}

function saveCanvasAsImage(canvas, fileName) {
    return Promise.resolve().then(() => {
        const dataURL = canvas.toDataURL('image/jpeg');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = fileName;

        let downloadCompleted = false;
        link.addEventListener('load', () => {
            if (!downloadCompleted && document.body.contains(link)) {
                downloadCompleted = true;
                document.body.removeChild(link);
            }
        });

        link.click();

        setTimeout(() => {
            if (!downloadCompleted && document.body.contains(link)) {
                downloadCompleted = true;
                document.body.removeChild(link);
            }
        }, 5000);
    });
}




// Pick image
function selectImage() {
    document.getElementById('fileInput').click();
}

// Display image
function displaySelectedImage(event) {
    const selectedFile = event.target.files[0];
    const imageElement = document.querySelector('.Pick_Image');
    if (selectedFile && selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function (e) {
            imageElement.src = e.target.result;
            imageElement.style.width = '45px'; // Set a fixed width (change as needed)
            imageElement.style.height = '45px'; // Set a fixed height (change as needed)
            imageElement.style.objectFit = 'cover'; // Maintain aspect ratio and cover the container
        };
        reader.readAsDataURL(selectedFile);
    } else {
        snackbar('Please select an image file.');
    }
}

function addTextAndOverlayToFrontImage(name, empCode, overlaySrc) {
    console.log("Generating front Image");
    const overlayY = 240;
    const overlayWidth = 280;
    const overlayHeight = 320;
    const frontImg = new Image();
    frontImg.crossOrigin = "Anonymous";

    return new Promise((resolve, reject) => {
        frontImg.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = frontImg.width;
            canvas.height = frontImg.height;

            ctx.drawImage(frontImg, 0, 0);

            const overlayImg = new Image();
            overlayImg.crossOrigin = "Anonymous";

            overlayImg.onload = () => {
                const aspectRatio = overlayImg.width / overlayImg.height;
                let overlayWidthActual = overlayWidth;
                let overlayHeightActual = overlayWidthActual / aspectRatio;

                if (overlayHeightActual > overlayHeight) {
                    overlayHeightActual = overlayHeight;
                    overlayWidthActual = overlayHeightActual * aspectRatio;
                }

                const overlayX = (canvas.width - overlayWidthActual) / 2;
                const overlayYActual = overlayY + (overlayHeight - overlayHeightActual) / 2;

                ctx.drawImage(overlayImg, overlayX, overlayYActual, overlayWidthActual, overlayHeightActual);

                ctx.font = '35.2px Arial';
                ctx.fillStyle = 'black';
                ctx.fontWeight = 'normal';

                const nameTextWidth = ctx.measureText(`Name: ${name}`).width;
                const empCodeTextWidth = ctx.measureText(`Employee Code: ${empCode}`).width;
                const centerX = (canvas.width - Math.max(nameTextWidth, empCodeTextWidth)) / 2;

                ctx.fillText(`Name: ${name}`, centerX, 600);
                ctx.fillText(`Employee Code: ${empCode}`, centerX, 640);

                const FrontFileName = `${empCode}_Front_ID.jpg`;

                saveCanvasAsImage(canvas, FrontFileName)
                    .then(() => {
                        frontLabelGenerated = true;
                        console.log("Front label generated successfully");
                        resolve();
                    })
                    .catch(error => {
                        console.error("Error saving front canvas:", error);
                        reject(error);
                    });
            };

            overlayImg.src = overlaySrc;
        };

        frontImg.src = 'Templates/Front.jpeg';
    });
}

function addTextToBackImage(emergencyContact, bloodGroup, empCode) {
    console.log("Generating back Image");
    const backImg = new Image();
    backImg.crossOrigin = "Anonymous";

    return new Promise((resolve, reject) => {
        backImg.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = backImg.width;
            canvas.height = backImg.height;

            ctx.drawImage(backImg, 0, 0);

            ctx.font = '35.2px Arial';
            ctx.fillStyle = 'black';
            ctx.fontWeight = 'normal';

            ctx.fillText(bloodGroup, 360, 90);
            ctx.fillText(emergencyContact, 360, 135);

            const backFileName = `${empCode}_Back_ID.jpg`;
            saveCanvasAsImage(canvas, backFileName)
                .then(() => {
                    backLabelGenerated = true;
                    console.log("Back label generated successfully");
                    resolve();
                })
                .catch(error => {
                    console.error("Error saving back canvas:", error);
                    reject(error);
                });
        };

        backImg.src = 'Templates/back.jpeg';
    });
}




function validateFields() {
    const nameInput = document.getElementById('name').value.trim();
    const empCodeInput = document.getElementById('emp_code').value.trim();
    const emergencyContactInput = document.getElementById('emergency_contact').value.trim();
    const bloodGroupInput = document.getElementById('blood_group').value;
    const selectedImage = document.getElementById('fileInput').files[0]; // Get selected image file

    // Define error messages
    const errorMessages = {
        name: 'Please Enter Name & Spaces',
        empCode: 'Please Enter EMP CODE',
        emergencyContact: 'Emergency Contact Should Be Exactly 10 Digits.',
        bloodGroup: 'Please Select Blood Group.',
        image: 'Please Select An Image',
        allFieldsEmpty: 'All fields are Empty. Please Fill In The Details.'
    };

    // Check for errors
    const errors = [];
    if (nameInput === '') errors.push(errorMessages.name);
    if (empCodeInput.length === '') errors.push(errorMessages.empCode);
    if (emergencyContactInput.length !== 10) errors.push(errorMessages.emergencyContact);
    if (bloodGroupInput === '') errors.push(errorMessages.bloodGroup);
    if (!selectedImage) errors.push(errorMessages.image); // Validate if an image is selected

    // Check if all fields are empty
    const allFieldsEmpty = [nameInput, empCodeInput, emergencyContactInput, bloodGroupInput].every(field => field === '');
    if (allFieldsEmpty) {
        snackbar(errorMessages.allFieldsEmpty);
        return false;
    }

    // Display errors using snackbar
    if (errors.length > 0) {
        snackbar(errors.join(' '));
        return false;
    }
    return true;
}

// Function to clear all form fields and display "Cleared" message
function clearFields() {
    document.getElementById('name').value = ''; // Clear name field
    document.getElementById('emp_code').value = ''; // Clear EMP code field
    document.getElementById('emergency_contact').value = ''; // Clear emergency contact field
    document.getElementById('blood_group').value = ''; // Reset blood group selection to default
    document.querySelector('.Pick_Image').src = '/icons/square-fill.svg'; // Reset image source to default
    // Display "Cleared" snackbar message
    frontLabelGenerated = false;
    backLabelGenerated = false;
    window.location.reload();
}

// Get ImageDimensions
function getImageDimensions(selectedImage) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imgElement = document.createElement('img');
            imgElement.onload = function () {
                const dimensions = { width: imgElement.width, height: imgElement.height };
                resolve(dimensions);
            };
            imgElement.src = e.target.result;
        };
        reader.readAsDataURL(selectedImage);
    });
}

document.getElementById("Print").addEventListener("click", function () {
    window.location.href = "print.html";
});

// Get references to the input fields
const empCodeInput = document.getElementById('emp_code');
const emergencyContactInput = document.getElementById('emergency_contact');

// Allow only numbers for EMP Code input
empCodeInput.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 6); // Allow only numbers and limit to 6 characters
});

// Allow only numbers for Emergency Contact input and limit to 10 characters
emergencyContactInput.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 10); // Allow only numbers and limit to 10 characters
});

// Allow only alphabetic characters in the input field and limit to 120 charcters 
var inputField = document.getElementById("name");
// Regex pattern to match only alphabetic characters and space
var pattern = /^[A-Za-z\s]+$/;
inputField.addEventListener("input", function (event) {
    var inputValue = event.data || inputField.value;
    if (!pattern.test(inputValue)) {
        inputField.value = inputField.value.replace(/[^A-Za-z\s]/g, '');
    }
});



document.getElementById('Back').addEventListener('click', async function () {
    // Validate fields before generating the preview
    const isValid = validateFields();
    if (isValid) {
        // Assuming you have references to the form fields and the selected image
        const name = document.getElementById('name').value.trim();
        const empCode = document.getElementById('emp_code').value.trim();
        const emergencyContact = document.getElementById('emergency_contact').value.trim();
        const bloodGroup = document.getElementById('blood_group').value;
        const selectedImage = document.getElementById('fileInput').files[0];
        const imagePath = URL.createObjectURL(selectedImage); // Get the image path
        try {
            addTextToBackImage(emergencyContact, bloodGroup, empCode)
        } catch (error) {
            console.error("Error obtaining image dimensions:", error);
            snackbar("Error obtaining image dimensions");
            // Handle errors while obtaining image dimensions
        }
    }
});


document.getElementById('Front').addEventListener('click', async function () {
    // Validate fields before generating the preview
    const isValid = validateFields();
    if (isValid) {
        // Assuming you have references to the form fields and the selected image
        const name = document.getElementById('name').value.trim();
        const empCode = document.getElementById('emp_code').value.trim();
        const emergencyContact = document.getElementById('emergency_contact').value.trim();
        const bloodGroup = document.getElementById('blood_group').value;
        const selectedImage = document.getElementById('fileInput').files[0];
        const imagePath = URL.createObjectURL(selectedImage); // Get the image path
        try {
            addTextAndOverlayToFrontImage(name, empCode, imagePath);
        } catch (error) {
            console.error("Error obtaining image dimensions:", error);
            snackbar("Error obtaining image dimensions");
            // Handle errors while obtaining image dimensions
        }
    }
});


// Event listener for the reset button click
document.getElementById('resetButton').addEventListener('click', function () {
    clearFields(); // Call the function to clear fields and display message
});



