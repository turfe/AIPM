document.addEventListener("DOMContentLoaded", function() {
    // DOM Elements
    const clothingName = document.getElementById("clothing-name");
    const clothingDescription = document.getElementById("clothing-description");
    const clothingPrize = document.getElementById("clothing-price");
    const clothingImage = document.getElementById("clothing-image");
    const prevImageBtn = document.getElementById("prev-image");
    const nextImageBtn = document.getElementById("next-image");
    const likeButton = document.getElementById("like-button");
    const dislikeButton = document.getElementById("dislike-button");
    const clothingUrl = document.getElementById("clothing-url");
    const currentCard = document.getElementById("current-card");

    // Variables
    let clothingQueue = []; // Queue to hold clothing items
    let currentClothing = null; // Currently displayed clothing item
    let currentImageIndex = 0; // Current image in the carousel

    // Initialize Hammer.js for swipe gestures
    const hammer = new Hammer(currentCard);
    hammer.on("swipeleft", function() {
        handleDislike();
    });
    hammer.on("swiperight", function() {
        handleLike();
    });

    // Fetch initial clothing items
    fetchImages();

    // Event Listeners for Image Carousel
    prevImageBtn.addEventListener("click", function() {
        if (currentClothing && currentClothing.images.length > 0) {
            currentImageIndex = (currentImageIndex - 1 + currentClothing.images.length) % currentClothing.images.length;
            updateImage();
        }
    });

    nextImageBtn.addEventListener("click", function() {
        if (currentClothing && currentClothing.images.length > 0) {
            currentImageIndex = (currentImageIndex + 1) % currentClothing.images.length;
            updateImage();
        }
    });

    // Event Listeners for Like and Dislike Buttons
    likeButton.addEventListener("click", handleLike);
    dislikeButton.addEventListener("click", handleDislike);

    // Event Listener for Description Toggle
    clothingDescription.addEventListener("click", function() {
        const shortDesc = clothingDescription.querySelector(".short-description");
        const fullDesc = clothingDescription.querySelector(".full-description");

        if (shortDesc.style.display === "none") {
            shortDesc.style.display = "inline";
            fullDesc.style.display = "none";
        } else {
            shortDesc.style.display = "none";
            fullDesc.style.display = "inline";
        }
    });

    /**
     * Function to fetch clothing items from the server
     */
    function fetchImages() {
        fetch("/get_images")
            .then(response => response.json())
            .then(data => {
                if (data.images && Array.isArray(data.images)) {
                    data.images.forEach(item => {
                        clothingQueue.push(item);
                    });
                    // If no current clothing is displayed, display the first item
                    if (!currentClothing && clothingQueue.length > 0) {
                        displayNextClothing();
                    }
                } else {
                    console.error("Invalid data format received from /get_images");
                }
            })
            .catch(error => {
                console.error("Error fetching images:", error);
            });
    }

    /**
     * Function to display the next clothing item from the queue
     */
    function displayNextClothing() {
        if (clothingQueue.length === 0) {
            clothingName.textContent = "No more items to display.";
            clothingDescription.innerHTML = "";
            clothingPrize.textContent = "";
            clothingImage.src = "";
            clothingImage.alt = "No image available";
            clothingUrl.href = "#";
            clothingUrl.textContent = "";
            return;
        }

        currentClothing = clothingQueue.shift();
        currentImageIndex = 0;
        updateCardUI();
        // Pre-fetch more items if queue is running low
        if (clothingQueue.length < 2) {
            fetchImages();
        }
    }

    /**
     * Function to update the card's UI with the current clothing item's details
     */
    function updateCardUI() {
        if (!currentClothing) return;

        clothingName.textContent = currentClothing.name;
        clothingPrize.textContent = `Price: ${currentClothing.prize}`;
        clothingUrl.href = currentClothing.url;
        clothingUrl.textContent = "View Listing";

        // Set short description as "Description" and the full description as the item's actual description
        const fullDesc = currentClothing.description;

        clothingDescription.innerHTML = `
            <span class="short-description">Description</span>
            <span class="full-description" style="display: none;">${fullDesc}</span>
        `;
        updateImage();
    }

    /**
     * Function to update the displayed image based on currentImageIndex
     */
    function updateImage() {
        if (!currentClothing || !currentClothing.images || currentClothing.images.length === 0) {
            clothingImage.src = "";
            clothingImage.alt = "No image available";
            return;
        }

        const imgSrc = currentClothing.images[currentImageIndex];
        clothingImage.src = imgSrc;
        clothingImage.alt = `${currentClothing.name} Image ${currentImageIndex + 1}`;
    }

    /**
     * Function to handle the Like action
     */
    function handleLike() {
        if (!currentClothing) return;
        animateSwipe("right");
        sendAction("like", currentClothing.clothing_id);
    }

    /**
     * Function to handle the Dislike action
     */
    function handleDislike() {
        if (!currentClothing) return;
        animateSwipe("left");
        sendAction("dislike", currentClothing.clothing_id);
    }

    /**
     * Function to send Like or Dislike action to the server
     * @param {string} action - "like" or "dislike"
     * @param {number} clothingId - Unique identifier of the clothing item
     */
    function sendAction(action, clothingId) {
        fetch(`/${action}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ clothing_id: clothingId }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    console.log(`Successfully ${action}d clothing ID: ${clothingId}`);
                } else {
                    console.error(`Failed to ${action} clothing ID: ${clothingId} - ${data.message}`);
                }
                // After handling the action, display the next clothing item
                setTimeout(displayNextClothing, 500); // Wait for animation to complete
            })
            .catch(error => {
                console.error(`Error during ${action}:`, error);
                // Even if there's an error, proceed to display the next item
                setTimeout(displayNextClothing, 500);
            });
    }

    /**
     * Function to animate the swipe based on action
     * @param {string} direction - "right" for like, "left" for dislike
     */
    function animateSwipe(direction) {
        if (direction === "right") {
            currentCard.classList.add("swipe-right");
        } else if (direction === "left") {
            currentCard.classList.add("swipe-left");
        }

        // Remove the animation class after it completes to reset the state
        currentCard.addEventListener(
            "animationend",
            function() {
                currentCard.classList.remove("swipe-right", "swipe-left");
            },
            { once: true }
        );
    }
});
