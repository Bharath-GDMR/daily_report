// Libraries to consider for PDF rendering and flip effects:
// - PDF.js (for rendering PDFs on canvas)
// - Turn.js (for page flip animation) - Note: Turn.js might be outdated or require jQuery. Consider exploring alternatives or adapting it.

const pdfUpload = document.getElementById('pdf-upload');
const loadUploadedPdfBtn = document.getElementById('load-uploaded-pdf');
const demoPdfSelect = document.getElementById('demo-pdf-select');
const loadDemoPdfBtn = document.getElementById('load-demo-pdf');
const flipbookContainer = document.getElementById('flipbook-container');
const pageFlipSound = document.getElementById('page-flip-sound');

let currentPage = 0;
let pdfDoc = null;
let pages = []; // Array to store page elements

// Function to load a PDF and render it as a flipbook
async function loadPdfIntoFlipbook(pdfUrl) {
    try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        pdfDoc = await loadingTask.promise;
        pages = []; // Clear existing pages

        // Clear flipbook container before loading new PDF
        flipbookContainer.innerHTML = '';

        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 }); // Adjust scale as needed
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            await page.render(renderContext).promise;

            const pageElement = document.createElement('div');
            pageElement.classList.add('page');
            pageElement.appendChild(canvas);
            flipbookContainer.appendChild(pageElement);
            pages.push(pageElement);
        }

        initializeFlipbook(pages);
        } catch (error) {
        console.error('Error loading or rendering PDF:', error);
        alert('Error loading PDF. Please ensure it\'s a valid PDF file.');
    }
}

// Function to initialize the flipbook with page-turning animation (using Turn.js)
function initializeFlipbook(pages) {
    // If using Turn.js:
    $(flipbookContainer).turn({
        width: 800, // Adjust to match your flipbook container size
        height: 600, // Adjust to match your flipbook container size
        autoCenter: true,
        gradients: true,
        acceleration: true,
        elevation: 50,
        when: {
            turning: function(event, page, view) {
                // Play page flip sound
                pageFlipSound.play();
            }
        }
    });

    // You might need to add code here to dynamically update Turn.js with new pages
    // or re-initialize it if you're loading new PDFs.
}

// Event Listeners

// Load demo PDF
loadDemoPdfBtn.addEventListener('click', () => {
    const selectedPdf = demoPdfSelect.value;
    loadPdfIntoFlipbook(selectedPdf);
});

// Load uploaded PDF
loadUploadedPdfBtn.addEventListener('click', () => {
    const file = pdfUpload.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const pdfDataUrl = e.target.result;
            loadPdfIntoFlipbook(pdfDataUrl);
        };
        reader.readAsDataURL(file);
    } else {
        alert('Please select a PDF file to upload.');
    }
});

// Initial load of the first demo PDF on page load
loadPdfIntoFlipbook(demoPdfSelect.value);
