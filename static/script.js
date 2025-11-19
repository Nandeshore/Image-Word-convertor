const dropArea = document.getElementById("drop-area");
const fileElem = document.getElementById("fileElem");
const convertBtn = document.getElementById("convertBtn");
const uploadForm = document.getElementById("uploadForm");

const notification = document.getElementById("notification");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");

const resultSection = document.getElementById("result");
const extractedText = document.getElementById("extractedText");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");

// Click to open file dialog
dropArea.addEventListener("click", () => fileElem.click());

// Drag events
dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.style.borderColor = "#00ff00";
});
dropArea.addEventListener("dragleave", () => {
    dropArea.style.borderColor = "#2a3a5d";
});
dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.style.borderColor = "#2a3a5d";
    fileElem.files = e.dataTransfer.files;
    toggleConvert();
});

// Enable button when file chosen manually
fileElem.addEventListener("change", toggleConvert);

function toggleConvert() {
    convertBtn.disabled = !(fileElem.files && fileElem.files.length > 0);
}

// Notification helper
function showNotification(message, type = "success") {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    setTimeout(() => {
        notification.classList.remove("show");
    }, 2500);
}

// Auto-resize textarea to content
function autoresizeTextarea(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 600) + "px";
}

// Intercept form submit to use XHR (for progress)
uploadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!(fileElem.files && fileElem.files.length > 0)) {
        showNotification("Please upload an image first.", "error");
        return;
    }

    const formData = new FormData(uploadForm); // includes name="image"
    progressContainer.style.display = "block";
    progressBar.style.width = "0%";
    progressBar.textContent = "0%";
    resultSection.style.display = "none";

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload", true);

    // Expect text response; if you switch to JSON, set xhr.responseType = "json"
    xhr.responseType = "text";

    // Upload progress
    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            progressBar.style.width = percent + "%";
            progressBar.textContent = percent + "%";
        }
    };

    xhr.onload = () => {
        progressContainer.style.display = "none";

        if (xhr.status >= 200 && xhr.status < 300) {
            // If backend returns plain text, use it directly
            const text = xhr.response || "";
            extractedText.value = text.trim() || "(No text detected)";
            autoresizeTextarea(extractedText);
            resultSection.style.display = "block";
            showNotification("Image processed successfully!", "success");
        } else {
            showNotification("Conversion failed.", "error");
        }
    };

    xhr.onerror = () => {
        progressContainer.style.display = "none";
        showNotification("Network error. Please try again.", "error");
    };

    xhr.send(formData);
});

// Copy and clear actions
copyBtn.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(extractedText.value || "");
        showNotification("Copied to clipboard!", "success");
    } catch {
        showNotification("Copy failed.", "error");
    }
});

clearBtn.addEventListener("click", () => {
    extractedText.value = "";
    resultSection.style.display = "none";
    convertBtn.disabled = true;
    window.location.reload();
});
