import { processImageWithOpenCV } from "./opencvProcessing.js";
let uploadedFileData = null;
document.addEventListener("DOMContentLoaded", () => {
  const SELECTORS = {
    hamburgerIcon: document.getElementById("hamburger-icon"),
    menuOverlay: document.getElementById("menu-overlay"),
    uploadButton: document.querySelector("#upload-floorplan"),
    uploadModal: document.getElementById("upload-modal"),
    modalNextButton: document.getElementById("modal-next-button"),
    modalCloseButton: document.getElementById("modal-close-button"),
    imagePreview: document.querySelector("#preview-image"),
    fileDropArea: document.querySelector(".file-drop-area"),
    fileInput: document.getElementById("file-upload"),
    imageDisplayModal: document.getElementById("image-display-modal"),
    uploadedImagePreview: document.getElementById("uploaded-image-preview"),
    showUploadedImageBtn: document.getElementById("show-uploaded-image"),
  };
  // Close the modal and clear the image preview
  const closeModal = () => {
    toggleModal(SELECTORS.uploadModal, false);
    clearImagePreview();
  };
  // Clear the image preview in the modal
  const clearImagePreview = () => {
    SELECTORS.imagePreview.src = "";
    SELECTORS.imagePreview.style.display = "none";
  };
  // Utility function to toggle modal visibility
  const toggleModal = (modal, isVisible) => {
    if (isVisible) {
      modal.classList.add("active"); // Add 'active' class to show the modal
    } else {
      modal.classList.remove("active"); // Remove 'active' class to hide the modal
    }
  };

  toggleModal(SELECTORS.uploadModal, true);

  // Hamburger menu functionality
  const setupHamburgerMenu = () => {
    // Toggle the menu overlay and icon when the hamburger icon is clicked
    SELECTORS.hamburgerIcon.addEventListener("click", () => {
      const isActive = SELECTORS.menuOverlay.classList.contains("active");
      SELECTORS.menuOverlay.classList.toggle("active", !isActive); // Toggle 'active' class
      SELECTORS.hamburgerIcon.innerHTML = isActive
        ? '<i class="fa fa-bars"></i>' // Show hamburger icon
        : '<i class="fa fa-times"></i>'; // Show close icon
    });

    // Close the menu overlay when clicking outside the menu content
    SELECTORS.menuOverlay.addEventListener("click", (e) => {
      if (e.target === SELECTORS.menuOverlay) {
        SELECTORS.menuOverlay.classList.remove("active"); // Remove 'active' class
        SELECTORS.hamburgerIcon.innerHTML = '<i class="fa fa-bars"></i>';
      }
    });
  };

  // Upload floorplan modal functionality
  const setupUploadModal = () => {
    // Open the modal when the upload button is clicked
    SELECTORS.uploadButton.addEventListener("click", () =>
      toggleModal(SELECTORS.uploadModal, true)
    );

    // Close the modal when the close button is clicked
    SELECTORS.modalCloseButton.addEventListener("click", closeModal);
  };

  // Drag and drop functionality for file upload
  const setupDragAndDrop = () => {
    // Highlight the drop area when a file is dragged over it
    SELECTORS.fileDropArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      SELECTORS.fileDropArea.classList.add("drag-over");
    });

    // Remove the highlight when the file is dragged out
    SELECTORS.fileDropArea.addEventListener("dragleave", () => {
      SELECTORS.fileDropArea.classList.remove("drag-over");
    });

    // Handle file drop
    SELECTORS.fileDropArea.addEventListener("drop", (e) => {
      e.preventDefault();
      SELECTORS.fileDropArea.classList.remove("drag-over");

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          SELECTORS.fileInput.files = e.dataTransfer.files; // Assign dropped files to the file input
          displayImagePreview(file, SELECTORS.fileDropArea); // Display the image preview
          SELECTORS.fileDropArea.disabled = false;
          uploadedFileData = file;
          console.log("Accepted file:", file.name);
          SELECTORS.modalNextButton.disabled = false;
        } else {
          alert("Please upload an image file (JPEG, PNG, etc.).");
        }
      }
    });
  };

  // Display the uploaded image in the modal
  const displayImagePreview = (file, fileDropArea) => {
    SELECTORS.imagePreview.style.display = "block";
    SELECTORS.imagePreview.src = URL.createObjectURL(file); // Create a URL for the uploaded file
    localStorage.setItem("uploadedImage", SELECTORS.imagePreview.src); // Store the image URL in local storage
    SELECTORS.imagePreview.alt = "Uploaded Image";
    SELECTORS.imagePreview.style.maxWidth = "100%";
    SELECTORS.imagePreview.style.marginTop = "10px";

    // Remove any existing preview and append the new one
    const existingPreview = fileDropArea.querySelector("img");
    if (existingPreview) {
      existingPreview.remove();
    }
    fileDropArea.appendChild(SELECTORS.imagePreview);
  };

  // File input change functionality
  const setupFileInput = () => {
    // Handle file selection via the file input
    SELECTORS.fileInput.addEventListener("change", (e) => {
      const files = e.target.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          SELECTORS.fileInput.value = ""; // Clear the file input
          displayImagePreview(file, SELECTORS.fileDropArea); // Display the image preview
          SELECTORS.fileDropArea.disabled = false;
          console.log("Selected file:", file.name);
          uploadedFileData = file;
          SELECTORS.modalNextButton.disabled = false;
        } else {
          alert("Please upload an image file (JPEG, PNG, etc.).");
        }
      }
    });
  };

  document
    .getElementById("image-modal-close-button")
    .addEventListener("click", () => {
      SELECTORS.imageDisplayModal.classList.remove("active");
    });
  // Initialize all functionalities
  setupHamburgerMenu(); // Initialize hamburger menu
  setupUploadModal(); // Initialize upload modal
  setupDragAndDrop(); // Initialize drag and drop functionality
  setupFileInput(); // Initialize file input functionality

  SELECTORS.showUploadedImageBtn.addEventListener("click", () => {
    showPreviewimage();
  });

  SELECTORS.modalNextButton.addEventListener("click", () => {
    closeModal();
    if (uploadedFileData) {
      handleFileUpload(uploadedFileData);
    }
  });

  const showPreviewimage = () => {
    // Set the uploaded image's src to the preview image's src
    SELECTORS.uploadedImagePreview.src = localStorage.getItem("uploadedImage");

    // Show the image display modal
    SELECTORS.imageDisplayModal.classList.add("active");
  };

  function handleFileUpload(file) {
    if (file && file.type.startsWith("image/")) {
      closeModal();
      const reader = new FileReader();
      reader.onload = () => {
        let img = new Image();
        img.src = URL.createObjectURL(file);
        setTimeout(() => toggleSpinner(), 100);

        img.onload = function () {
          setTimeout(() => {
            processImageWithOpenCV(img);
          }, 2000);
        };
      };
      reader.readAsDataURL(file);
    }
  }
});

export function toggleSpinner() {
  // Check if spinner container exists
  const spinnerContainer = document.getElementById("spinner-container");
  if (spinnerContainer) {
    spinnerContainer.classList.remove("active"); // Remove active class for fade-out
    setTimeout(() => spinnerContainer.remove(), 300); // Wait for animation to complete before removing
    return;
  } else {
    // Create a container for the spinner and text
    const spinnerContainer = document.createElement("div");
    spinnerContainer.id = "spinner-container";
    spinnerContainer.classList.add("centered-spinner-container");

    // Create the spinner
    const spinner = document.createElement("div");
    spinner.id = "loading-spinner";
    spinner.classList.add("spinner-border", "centered-spinner");

    // Create the text
    const spinnerText = document.createElement("div");
    spinnerText.classList.add("spinner-text");
    spinnerText.textContent = "Processing...";

    // Append spinner and text to the container
    spinnerContainer.appendChild(spinner);
    spinnerContainer.appendChild(spinnerText);

    // Add the container to the body
    document.body.appendChild(spinnerContainer);

    // Trigger the animation
    setTimeout(() => spinnerContainer.classList.add("active"), 10);
  }
}
