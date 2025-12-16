import jsPDF from 'jspdf';
import { apiConfig } from '../api/api';

// --- Helper Functions ---

const getFileUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${apiConfig.baseUrl}${cleanUrl}`;
};

const getBase64FromUrl = async (url) => {
    if (!url) return null;
    try {
        const response = await fetch(url, {
            mode: 'cors',
            credentials: 'omit'
        });
        if (!response.ok) return null;
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error loading image for PDF:', error);
        return null;
    }
};

const formatPrice = (price) => {
    if (!price) return '-';
    return new Intl.NumberFormat('fr-DZ', {
        style: 'decimal',
        minimumFractionDigits: 0,
    }).format(price) + ' DA';
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

// --- Main Export Function ---

export const exportPropertiesToPDF = async (properties) => {
    // A4 Size: 210mm x 297mm
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const sidebarWidth = 70; // Left column width
    const contentWidth = pageWidth - sidebarWidth; // Right column width
    const margin = 10;

    // Colors
    const sidebarColor = [52, 73, 94]; // Dark Blue/Grey #34495e
    const sidebarTextColor = [255, 255, 255]; // White
    const mainTextColor = [51, 51, 51]; // Dark Grey
    const accentColor = [44, 62, 80]; // Darker for headers

    for (let i = 0; i < properties.length; i++) {
        if (i > 0) doc.addPage();
        const property = properties[i];

        // --- 1. Draw Layout ---
        
        // Sidebar Background
        doc.setFillColor(...sidebarColor);
        doc.rect(0, 0, sidebarWidth, pageHeight, 'F');

        // --- 2. Sidebar Content (Left) ---
        
        let yPos = 20;

        // A. Photo (Top Left)
        let mainPhotoUrl = null;
        if (property.piecesJointes) {
            let photo = property.piecesJointes.find(pj => pj.type === 'PHOTO' && pj.visibilite === 'PUBLIABLE');
            // Fallback to any photo if no publiable one found
            if (!photo) photo = property.piecesJointes.find(pj => pj.type === 'PHOTO');
            
            if (photo) mainPhotoUrl = getFileUrl(photo.url);
        }

        if (mainPhotoUrl) {
            const photoBase64 = await getBase64FromUrl(mainPhotoUrl);
            if (photoBase64) {
                try {
                    const formatMatch = photoBase64.match(/^data:image\/(\w+);base64,/);
                    const format = formatMatch ? formatMatch[1].toUpperCase() : 'JPEG';
                    // Draw image in sidebar
                    const imgSize = 50;
                    const xPos = (sidebarWidth - imgSize) / 2;
                    doc.addImage(photoBase64, format, xPos, yPos, imgSize, imgSize);
                    yPos += imgSize + 15;
                } catch (err) {
                    console.warn('Error adding image:', err);
                }
            }
        } else {
            yPos += 20; // Space if no image
        }

        // Helper for Sidebar Text
        const drawSidebarText = (label, value, y) => {
            doc.setFontSize(8);
            doc.setTextColor(200, 200, 200); // Light grey for label
            doc.setFont('helvetica', 'normal');
            doc.text(label.toUpperCase(), 10, y);
            
            doc.setFontSize(10);
            doc.setTextColor(...sidebarTextColor); // White for value
            doc.setFont('helvetica', 'bold');
            // Handle multi-line values
            const splitValue = doc.splitTextToSize(value || '-', sidebarWidth - 20);
            doc.text(splitValue, 10, y + 5);
            
            return y + 5 + (splitValue.length * 5) + 8; // Return new Y position
        };

        // B. General Info
        doc.setFontSize(14);
        doc.setTextColor(...sidebarTextColor);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORMATIONS', 10, yPos);
        doc.setLineWidth(0.5);
        doc.setDrawColor(255, 255, 255);
        doc.line(10, yPos + 2, sidebarWidth - 10, yPos + 2);
        yPos += 10;

        yPos = drawSidebarText('Type', property.type, yPos);
        yPos = drawSidebarText('Transaction', property.transaction, yPos);
        const price = property.transaction === 'VENTE' ? property.prixVente : property.prixLocation;
        yPos = drawSidebarText('Prix', formatPrice(price), yPos);
        yPos = drawSidebarText('Date d\'ajout', formatDate(property.dateCreation), yPos);
        yPos = drawSidebarText('Statut', property.statut, yPos);

        // REMOVED: Localisation and Suivi sections from sidebar as requested

        // --- 3. Main Content (Right) ---
        
        let mainY = 20;
        const mainX = sidebarWidth + margin;
        const mainContentWidth = contentWidth - (margin * 2);

        // A. Title
        doc.setTextColor(...accentColor);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        const title = doc.splitTextToSize(property.titre, mainContentWidth);
        doc.text(title, mainX, mainY);
        mainY += (title.length * 10) + 10;

        // Separator
        doc.setDrawColor(...accentColor);
        doc.setLineWidth(1);
        doc.line(mainX, mainY, pageWidth - margin, mainY);
        mainY += 10;

        // B. Description
        if (property.description) {
            doc.setFontSize(12);
            doc.setTextColor(...accentColor);
            doc.setFont('helvetica', 'bold');
            doc.text('DESCRIPTION', mainX, mainY);
            mainY += 7;

            doc.setFontSize(10);
            doc.setTextColor(...mainTextColor);
            doc.setFont('helvetica', 'normal');
            const desc = doc.splitTextToSize(property.description, mainContentWidth);
            doc.text(desc, mainX, mainY);
            mainY += (desc.length * 5) + 10;
        }

        // C. Specific Details (Grid)
        let detailsObj = null;
        let detailsTitle = '';
        if (property.type === 'APPARTEMENT') { detailsObj = property.detailAppartement; detailsTitle = 'DÉTAILS APPARTEMENT'; }
        else if (property.type === 'VILLA') { detailsObj = property.detailVilla; detailsTitle = 'DÉTAILS VILLA'; }
        else if (property.type === 'TERRAIN') { detailsObj = property.detailTerrain; detailsTitle = 'DÉTAILS TERRAIN'; }
        else if (property.type === 'LOCAL') { detailsObj = property.detailLocal; detailsTitle = 'DÉTAILS LOCAL'; }
        else if (property.type === 'IMMEUBLE') { detailsObj = property.detailImmeuble; detailsTitle = 'DÉTAILS IMMEUBLE'; }

        if (detailsObj) {
            doc.setFontSize(12);
            doc.setTextColor(...accentColor);
            doc.setFont('helvetica', 'bold');
            doc.text(detailsTitle, mainX, mainY);
            mainY += 7;

            // Prepare details list
            const detailsList = Object.entries(detailsObj)
                .filter(([key]) => !['id', 'bienId'].includes(key) && detailsObj[key] !== null && detailsObj[key] !== '')
                .map(([key, value]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').trim();
                    const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);
                    const formattedValue = typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : value;
                    const suffix = key.toLowerCase().includes('surface') ? ' m²' : '';
                    return { label: formattedLabel, value: `${formattedValue}${suffix}` };
                });

            // Draw Grid (2 Columns)
            const colWidth = mainContentWidth / 2;
            doc.setFontSize(10);
            
            detailsList.forEach((item, idx) => {
                const col = idx % 2; // 0 or 1
                const row = Math.floor(idx / 2);
                
                const x = mainX + (col * colWidth);
                const y = mainY + (row * 8);

                // Check page break
                if (y > pageHeight - 20) {
                    doc.addPage();
                    mainY = 20;
                    // Redraw sidebar background for new page
                    doc.setFillColor(...sidebarColor);
                    doc.rect(0, 0, sidebarWidth, pageHeight, 'F');
                }

                doc.setFont('helvetica', 'bold');
                doc.setTextColor(100, 100, 100);
                doc.text(`${item.label}:`, x, y);
                
                // Separate value from detail: Add fixed spacing
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...mainTextColor);
                // Calculate width of label to position value after it with some padding
                // Or use a fixed offset if labels are generally short, but dynamic is safer.
                // User asked to "separate a little bit the value from each detail"
                const labelWidth = doc.getTextWidth(`${item.label}:`);
                const valueX = x + labelWidth + 5; // Add 5mm spacing
                
                doc.text(item.value.toString(), valueX, y);
            });

            mainY += (Math.ceil(detailsList.length / 2) * 8) + 10;
        }

        // D. Documents Juridiques (List) - Filtered for Available only
        const availableDocs = property.papiers ? property.papiers.filter(p => p.statut === 'DISPONIBLE') : [];
        
        if (availableDocs.length > 0) {
            // Check page break
            if (mainY > pageHeight - 40) {
                doc.addPage();
                mainY = 20;
                doc.setFillColor(...sidebarColor);
                doc.rect(0, 0, sidebarWidth, pageHeight, 'F');
            }

            doc.setFontSize(12);
            doc.setTextColor(...accentColor);
            doc.setFont('helvetica', 'bold');
            doc.text('DOCUMENTS JURIDIQUES DISPONIBLES', mainX, mainY);
            mainY += 7;

            doc.setFontSize(10);
            doc.setTextColor(...mainTextColor);
            doc.setFont('helvetica', 'normal');
            
            // List them comma separated or bullet points? User said "add doc juridiques not the docs theme selves just the ones available"
            // Let's do a clean list
            const docNames = availableDocs.map(d => d.nom).join(', ');
            const splitDocs = doc.splitTextToSize(docNames, mainContentWidth);
            doc.text(splitDocs, mainX, mainY);
            
            mainY += (splitDocs.length * 5) + 10;
        }

        // E. Photos Gallery (All Publiable Photos)
        const galleryPhotos = property.piecesJointes 
            ? property.piecesJointes.filter(pj => pj.type === 'PHOTO' && pj.visibilite === 'PUBLIABLE')
            : [];

        if (galleryPhotos.length > 0) {
            // Check page break
            if (mainY > pageHeight - 60) {
                doc.addPage();
                mainY = 20;
                doc.setFillColor(...sidebarColor);
                doc.rect(0, 0, sidebarWidth, pageHeight, 'F');
            }

            doc.setFontSize(12);
            doc.setTextColor(...accentColor);
            doc.setFont('helvetica', 'bold');
            doc.text('PHOTOS', mainX, mainY);
            mainY += 10;

            // Grid layout for photos (e.g., 2 columns in the main content area)
            const photoSize = (mainContentWidth - 10) / 2; // 2 photos per row with 10mm gap
            let currentX = mainX;
            
            for (let pIndex = 0; pIndex < galleryPhotos.length; pIndex++) {
                const photo = galleryPhotos[pIndex];
                const photoUrl = getFileUrl(photo.url);
                const photoBase64 = await getBase64FromUrl(photoUrl);

                if (photoBase64) {
                    try {
                        // Check if we need a new page
                        if (mainY + photoSize > pageHeight - 10) {
                            doc.addPage();
                            mainY = 20;
                            doc.setFillColor(...sidebarColor);
                            doc.rect(0, 0, sidebarWidth, pageHeight, 'F');
                            currentX = mainX; // Reset X
                        }

                        const formatMatch = photoBase64.match(/^data:image\/(\w+);base64,/);
                        const format = formatMatch ? formatMatch[1].toUpperCase() : 'JPEG';
                        
                        doc.addImage(photoBase64, format, currentX, mainY, photoSize, photoSize);
                        
                        // Draw border
                        doc.setDrawColor(200, 200, 200);
                        doc.rect(currentX, mainY, photoSize, photoSize);

                        // Move position
                        if (currentX === mainX) {
                            currentX += photoSize + 10; // Move to second column
                        } else {
                            currentX = mainX; // Reset to first column
                            mainY += photoSize + 10; // Move to next row
                        }

                    } catch (err) {
                        console.warn('Error adding gallery image:', err);
                    }
                }
            }
        }
    }

    doc.save(`fiche_bien_${Date.now()}.pdf`);
};
