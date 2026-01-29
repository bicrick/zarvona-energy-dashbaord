import { appState } from './config.js';
import { uploadDiagramFile, validateDiagramFile } from './firebase-storage-service.js';
import { saveDiagramMetadata } from './firestore-storage.js';
import { showWellView } from './views.js';

let selectedFile = null;

/**
 * Initialize diagram modal event handlers
 */
export function initializeDiagramModalHandlers() {
    const modal = document.getElementById('diagramModal');
    const overlay = document.getElementById('diagramModalOverlay');
    const closeBtn = document.getElementById('btnCloseDiagramModal');
    const cancelBtn = document.getElementById('btnCancelDiagram');
    const submitBtn = document.getElementById('btnSubmitDiagram');
    const form = document.getElementById('diagramForm');
    const fileInput = document.getElementById('diagramFileInput');
    const dropZone = document.getElementById('diagramDropZone');
    const fileInfo = document.getElementById('diagramFileInfo');
    const fileName = document.getElementById('diagramFileName');
    const fileSize = document.getElementById('diagramFileSize');
    const progressContainer = document.getElementById('diagramUploadProgress');
    const progressBar = document.getElementById('diagramProgressBar');
    const progressText = document.getElementById('diagramProgressText');

    // Note: diagram button click handler is attached in attachDiagramButtonHandler()
    // because the button is created dynamically when well view is shown

    // Close modal handlers
    closeBtn?.addEventListener('click', closeDiagramModal);
    cancelBtn?.addEventListener('click', closeDiagramModal);
    overlay?.addEventListener('click', closeDiagramModal);

    // File input change
    fileInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelection(file);
        }
    });

    // Drag and drop
    dropZone?.addEventListener('click', () => {
        fileInput?.click();
    });

    dropZone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone?.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone?.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelection(file);
        }
    });

    // Form submit
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleDiagramUpload();
    });
}

/**
 * Attach event handler to the diagram button
 * This must be called after the well view is rendered
 */
export function attachDiagramButtonHandler() {
    console.log('attachDiagramButtonHandler called');
    const diagramBtn = document.getElementById('btnWellDiagram');
    console.log('diagramBtn element:', diagramBtn);
    if (diagramBtn) {
        console.log('Attaching click handler to diagram button');
        // Remove any existing listener to avoid duplicates
        diagramBtn.replaceWith(diagramBtn.cloneNode(true));
        const newBtn = document.getElementById('btnWellDiagram');
        newBtn.addEventListener('click', handleDiagramButtonClick);
    } else {
        console.warn('btnWellDiagram not found in DOM');
    }
}

/**
 * Handle diagram button click - open upload modal
 */
async function handleDiagramButtonClick() {
    console.log('handleDiagramButtonClick called');
    console.log('currentSheet:', appState.currentSheet, 'currentWell:', appState.currentWell);
    const sheetId = appState.currentSheet;
    const wellId = appState.currentWell;
    
    if (!sheetId || !wellId) {
        console.warn('No sheet or well selected');
        return;
    }

    // Always open the upload modal (allows replacing existing diagrams)
    openDiagramModal();
}

/**
 * Open diagram upload modal
 */
function openDiagramModal() {
    console.log('openDiagramModal called');
    const modal = document.getElementById('diagramModal');
    console.log('modal element:', modal);
    modal?.classList.add('visible');
    console.log('modal classList after add:', modal?.classList);
    document.body.style.overflow = 'hidden';
    
    // Show existing diagram info if one exists
    showExistingDiagramInfo();
}

/**
 * Close diagram upload modal
 */
function closeDiagramModal() {
    console.log('closeDiagramModal called');
    const modal = document.getElementById('diagramModal');
    modal?.classList.remove('visible');
    console.log('modal classList after remove:', modal?.classList);
    document.body.style.overflow = '';
    
    // Reset form
    resetDiagramForm();
}

/**
 * Reset the diagram form
 */
function resetDiagramForm() {
    const form = document.getElementById('diagramForm');
    const fileInput = document.getElementById('diagramFileInput');
    const dropZone = document.getElementById('diagramDropZone');
    const fileInfo = document.getElementById('diagramFileInfo');
    const progressContainer = document.getElementById('diagramUploadProgress');
    const submitBtn = document.getElementById('btnSubmitDiagram');
    
    form?.reset();
    selectedFile = null;
    
    if (fileInput) fileInput.value = '';
    
    dropZone.style.display = 'flex';
    fileInfo.style.display = 'none';
    progressContainer.style.display = 'none';
    
    if (submitBtn) submitBtn.disabled = false;
}

/**
 * Handle file selection
 */
function handleFileSelection(file) {
    const dropZone = document.getElementById('diagramDropZone');
    const fileInfo = document.getElementById('diagramFileInfo');
    const fileName = document.getElementById('diagramFileName');
    const fileSize = document.getElementById('diagramFileSize');
    
    // Validate file
    const validation = validateDiagramFile(file);
    
    if (!validation.valid) {
        alert(validation.error);
        return;
    }
    
    selectedFile = file;
    
    // Show file info
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    dropZone.style.display = 'none';
    fileInfo.style.display = 'flex';
}

/**
 * Handle diagram upload
 */
async function handleDiagramUpload() {
    if (!selectedFile) {
        alert('Please select a file to upload');
        return;
    }
    
    const sheetId = appState.currentSheet;
    const wellId = appState.currentWell;
    
    if (!sheetId || !wellId) {
        alert('Error: No well selected');
        return;
    }
    
    const submitBtn = document.getElementById('btnSubmitDiagram');
    const progressContainer = document.getElementById('diagramUploadProgress');
    const progressBar = document.getElementById('diagramProgressBar');
    const progressText = document.getElementById('diagramProgressText');
    
    try {
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';
        
        // Show progress
        progressContainer.style.display = 'flex';
        
        // Upload file
        const fileMetadata = await uploadDiagramFile(
            sheetId,
            wellId,
            selectedFile,
            (progress) => {
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `${Math.round(progress)}%`;
            }
        );
        
        // Save metadata to Firestore
        const success = await saveDiagramMetadata(sheetId, wellId, fileMetadata);
        
        if (success) {
            // Close modal
            closeDiagramModal();
            
            // Refresh well view to show the new diagram icon state
            showWellView(sheetId, wellId);
        } else {
            throw new Error('Failed to save diagram metadata');
        }
    } catch (error) {
        console.error('Error uploading diagram:', error);
        alert('Failed to upload diagram. Please try again.');
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Upload';
    }
}

/**
 * Show existing diagram info in modal
 */
function showExistingDiagramInfo() {
    console.log('showExistingDiagramInfo called');
    const sheetId = appState.currentSheet;
    const wellId = appState.currentWell;
    const well = appState.appData[sheetId]?.wells.find(w => w.id === wellId);
    
    console.log('Well data:', well);
    console.log('Diagram data:', well?.diagram);
    
    const modalHeader = document.querySelector('.diagram-modal .edit-modal-header h3');
    const modalBody = document.querySelector('.diagram-modal .edit-modal-body');
    
    if (well?.diagram?.fileUrl && modalHeader && modalBody) {
        console.log('Showing existing diagram info:', well.diagram);
        modalHeader.textContent = 'Upload New Well Diagram';
        
        // Check if existing diagram info already exists
        let existingInfo = document.getElementById('existingDiagramInfo');
        if (!existingInfo) {
            existingInfo = document.createElement('div');
            existingInfo.id = 'existingDiagramInfo';
            existingInfo.style.cssText = 'margin-bottom: 16px; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;';
            
            modalBody.insertBefore(existingInfo, modalBody.firstChild);
        }
        
        existingInfo.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <strong style="color: var(--text-primary); display: block; margin-bottom: 4px;">Current Diagram:</strong>
                    <span style="color: var(--text-secondary); font-size: 0.875rem;">${well.diagram.fileName || 'diagram'}</span>
                </div>
                <a href="${well.diagram.fileUrl}" target="_blank" download="${well.diagram.fileName || 'diagram'}" 
                   style="padding: 6px 12px; background: var(--accent); color: white; border-radius: 4px; text-decoration: none; font-size: 0.875rem;">
                    Download
                </a>
            </div>
        `;
    } else {
        console.log('No existing diagram found or modal elements missing');
        if (modalHeader) {
            modalHeader.textContent = 'Upload Well Diagram';
            const existingInfo = document.getElementById('existingDiagramInfo');
            if (existingInfo) {
                existingInfo.remove();
            }
        }
    }
}

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
