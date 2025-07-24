/**
 * NFS Logistics - Simple Track-Trace Integration
 * Uses track-trace.com for freight tracking
 */

class SimpleTrackingSystem {
    constructor() {
        // API Configuration - Update this with your Render URL when deploying
        this.API_BASE_URL = window.location.origin.includes('localhost') 
            ? 'http://localhost:3000' // Use explicit localhost URL for local development
            : 'https://your-app-name.onrender.com'; // UPDATE THIS with your Render URL!
        
        this.initializeEventListeners();
        
        // Test API connection on startup
        this.testApiConnection();
    }

    async testApiConnection() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/api/health`);
            if (response.ok) {
                const data = await response.json();
                console.log('✅ API connection test successful:', data);
            } else {
                console.warn('⚠️ API health check failed:', response.status);
            }
        } catch (error) {
            console.error('❌ API connection test failed:', error.message);
            console.log('🔍 Current API URL:', `${this.API_BASE_URL}/api/health`);
        }
    }

    initializeEventListeners() {
        const trackingForm = document.getElementById('tracking-form');
        const showCustomerInfoLink = document.getElementById('show-customer-info');
        const customerInfoDiv = document.querySelector('.customer-info');

        // Show/hide customer info section
        if (showCustomerInfoLink && customerInfoDiv) {
            showCustomerInfoLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (customerInfoDiv.style.display === 'none') {
                    customerInfoDiv.style.display = 'block';
                    showCustomerInfoLink.textContent = 'Hide customer details';
                } else {
                    customerInfoDiv.style.display = 'none';
                    showCustomerInfoLink.textContent = 'Add your details for tracking history';
                }
            });
        }

        // Handle form submission
        if (trackingForm) {
            trackingForm.addEventListener('submit', (e) => {
                this.handleTrackingSubmit(e);
            });
        }

        // Auto-detect carrier from AWB number
        const orderInput = document.getElementById('order-number');
        if (orderInput) {
            orderInput.addEventListener('input', (e) => {
                this.updateCarrierFromAWB(e.target.value);
            });
        }
    }

    // Detect carrier from AWB number and update form
    updateCarrierFromAWB(awbNumber) {
        const cleanAWB = awbNumber.replace(/[-\s]/g, '');
        const shipperInput = document.querySelector('input[name="shipper"]');
        
        if (!shipperInput || cleanAWB.length < 3) return;

        // AWB number patterns for major freight carriers
        let carrier = 'aircargo'; // Default
        
        if (cleanAWB.startsWith('176')) {
            carrier = 'aircargo'; // Emirates
        } else if (cleanAWB.startsWith('020')) {
            carrier = 'aircargo'; // Lufthansa Cargo
        } else if (cleanAWB.startsWith('157')) {
            carrier = 'aircargo'; // Qatar Airways Cargo
        } else if (cleanAWB.startsWith('125')) {
            carrier = 'aircargo'; // British Airways
        } else if (cleanAWB.startsWith('074')) {
            carrier = 'aircargo'; // KLM Cargo
        } else if (cleanAWB.startsWith('180')) {
            carrier = 'aircargo'; // Korean Air Cargo
        }
        
        shipperInput.value = carrier;
        
        // Show a small indicator of detected carrier
        this.showCarrierDetected(cleanAWB);
    }

    showCarrierDetected(awb) {
        const formText = document.querySelector('.form-text');
        if (formText && awb.length >= 8) {
            let carrierName = 'Air Cargo';
            
            if (awb.startsWith('176')) carrierName = 'Emirates SkyCargo';
            else if (awb.startsWith('020')) carrierName = 'Lufthansa Cargo';
            else if (awb.startsWith('157')) carrierName = 'Qatar Airways Cargo';
            else if (awb.startsWith('125')) carrierName = 'British Airways World Cargo';
            else if (awb.startsWith('074')) carrierName = 'KLM Cargo';
            else if (awb.startsWith('180')) carrierName = 'Korean Air Cargo';
            
            formText.innerHTML = `Detected carrier: <strong>${carrierName}</strong> | AWB format appears correct`;
            formText.style.color = '#28a745';
        }
    }

    async handleTrackingSubmit(e) {
        e.preventDefault(); // Prevent form from submitting normally
        
        const trackingNumber = document.getElementById('order-number').value.trim();
        const customerName = document.getElementById('customer-name')?.value.trim();
        const customerEmail = document.getElementById('customer-email')?.value.trim();

        if (!trackingNumber) {
            alert('Please enter a tracking number');
            return;
        }

        // Show loading state
        this.showLoading(true);
        
        try {
            console.log('🚀 Getting tracking redirect URL for:', trackingNumber);
            console.log('🔗 API URL:', `${this.API_BASE_URL}/api/track-scrape`);
            
            // Call our backend redirect endpoint (works locally and remotely)
            const response = await fetch(`${this.API_BASE_URL}/api/track-scrape`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trackingNumber,
                    customerName,
                    customerEmail
                })
            });

            const result = await response.json();
            
            this.showLoading(false);
            
            if (result.success && result.redirect) {
                // Immediately redirect to carrier tracking page
                console.log('🎯 Redirecting to carrier:', result.directTrackingUrl);
                window.location.href = result.directTrackingUrl;
            } else {
                this.displayError(result.error || 'Unable to process tracking request', result.directTrackingUrl);
            }
            
        } catch (error) {
            this.showLoading(false);
            console.error('Tracking error:', error);
            
            // Provide more specific error information
            let errorMessage = 'Network error occurred while tracking';
            let debugInfo = '';
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'Unable to connect to tracking API';
                debugInfo = `API URL: ${this.API_BASE_URL}/api/track-scrape`;
            } else if (error.name === 'SyntaxError') {
                errorMessage = 'Invalid response from tracking API';
            }
            
            console.log('🔍 Debug info:', {
                apiUrl: `${this.API_BASE_URL}/api/track-scrape`,
                error: error.message,
                errorType: error.name,
                isLocalhost: window.location.origin.includes('localhost')
            });
            
            this.displayError(`${errorMessage}${debugInfo ? `<br><small>Debug: ${debugInfo}</small>` : ''}`, `https://www.track-trace.com/aircargo?awb=${trackingNumber}`);
        }
    }

    showRedirectMessage(data) {
        const resultsContainer = document.getElementById('results-container');
        const orderDetails = document.getElementById('order-details');
        const statusInfo = document.getElementById('status-info');
        
        if (!resultsContainer) {
            console.error('Results container not found');
            return;
        }

        // Show the results container
        resultsContainer.style.display = 'block';
        
        // Update order details
        if (orderDetails) {
            orderDetails.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <h4>Tracking Request Processed</h4>
                    <span class="badge bg-success">Ready</span>
                </div>
                <p><strong>AWB Number:</strong> ${data.awbNumber}</p>
                <p><strong>Carrier:</strong> ${data.carrier}</p>
                <p><strong>Processing Method:</strong> ${data.method === 'direct' ? 'Direct Carrier Access' : 'Track-Trace Integration'}</p>
            `;
        }

        // Update status info with redirect message
        if (statusInfo) {
            statusInfo.innerHTML = `
                <div class="alert alert-success">
                    <div class="d-flex align-items-center mb-3">
                        <div class="spinner-border spinner-border-sm text-success me-3" role="status"></div>
                        <div>
                            <h5 class="mb-1">${data.message}</h5>
                            <p class="mb-0">You will be redirected to ${data.carrier} tracking page in 2 seconds...</p>
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <p class="mb-2"><strong>Processed at:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
                        <a href="${data.directTrackingUrl}" target="_blank" class="btn btn-primary">
                            <i class="fas fa-external-link-alt me-2"></i>
                            Track Now on ${data.carrier}
                        </a>
                    </div>
                </div>
            `;
        }
    }

    displayTrackingResults(data) {
        const resultsContainer = document.getElementById('results-container');
        const orderDetails = document.getElementById('order-details');
        const statusInfo = document.getElementById('status-info');
        
        if (!resultsContainer || !orderDetails || !statusInfo) {
            console.error('Results containers not found');
            return;
        }

        // Show results container
        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth' });

        // Display order information
        orderDetails.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="detail-item">
                        <span class="detail-label">AWB Number:</span>
                        <span class="detail-value">${data.awbNumber}</span>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="detail-item">
                        <span class="detail-label">Carrier:</span>
                        <span class="detail-value">${data.carrier}</span>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="detail-item">
                        <span class="detail-label">Current Status:</span>
                        <span class="detail-value status-${this.getStatusClass(data.currentStatus)}">${data.currentStatus}</span>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="detail-item">
                        <span class="detail-label">Last Update:</span>
                        <span class="detail-value">${new Date(data.lastUpdate).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `;

        // Display status information
        statusInfo.innerHTML = `
            <div class="status-summary">
                <div class="status-icon">
                    <i class="icon-${this.getStatusIcon(data.currentStatus)}"></i>
                </div>
                <div class="status-content">
                    <h4>${data.currentStatus}</h4>
                    <p>Total tracking events: ${data.events.length}</p>
                    ${data.directTrackingUrl ? `
                        <a href="${data.directTrackingUrl}" target="_blank" class="btn btn-primary btn-sm mt-2">
                            <i class="icon-external-link"></i> View Full Details
                        </a>
                    ` : ''}
                </div>
            </div>
        `;

        // Display tracking timeline
        this.displayTrackingTimeline(data.events);
    }

    displayTrackingTimeline(events) {
        const timelineContainer = document.getElementById('tracking-timeline');
        if (!timelineContainer) return;

        if (!events || events.length === 0) {
            timelineContainer.innerHTML = `
                <div class="timeline-item">
                    <div class="timeline-content">
                        <h5>No tracking events found</h5>
                        <p>Please check with your carrier for detailed tracking information.</p>
                    </div>
                </div>
            `;
            return;
        }

        let timelineHTML = '';
        events.forEach((event, index) => {
            timelineHTML += `
                <div class="timeline-item ${index === 0 ? 'active' : ''}">
                    <div class="timeline-marker">
                        <i class="icon-${this.getEventIcon(event.status)}"></i>
                    </div>
                    <div class="timeline-content">
                        <h5>${event.status}</h5>
                        ${event.location && event.location !== 'See details' ? `<p class="location"><i class="icon-location"></i> ${event.location}</p>` : ''}
                        ${event.date && event.date !== 'Recent' ? `<p class="date"><i class="icon-clock"></i> ${event.date}</p>` : ''}
                        ${event.description && event.description !== event.status ? `<p class="description">${event.description}</p>` : ''}
                        ${event.source ? `<small class="text-muted">Source: ${event.source}</small>` : ''}
                    </div>
                </div>
            `;
        });

        timelineContainer.innerHTML = timelineHTML;
    }

    displayError(errorMessage, fallbackUrl) {
        const resultsContainer = document.getElementById('results-container');
        const orderDetails = document.getElementById('order-details');
        
        if (!resultsContainer || !orderDetails) return;

        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth' });

        orderDetails.innerHTML = `
            <div class="alert alert-warning">
                <h5><i class="icon-warning"></i> Unable to retrieve tracking data automatically</h5>
                <p>${errorMessage}</p>
                ${fallbackUrl ? `
                    <a href="${fallbackUrl}" target="_blank" class="btn btn-primary mt-2">
                        <i class="icon-external-link"></i> Track on Carrier Website
                    </a>
                ` : ''}
            </div>
        `;

        // Clear other sections
        const statusInfo = document.getElementById('status-info');
        const timelineContainer = document.getElementById('tracking-timeline');
        
        if (statusInfo) statusInfo.innerHTML = '';
        if (timelineContainer) timelineContainer.innerHTML = '';
    }

    getStatusClass(status) {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('delivered') || statusLower.includes('complete')) return 'success';
        if (statusLower.includes('transit') || statusLower.includes('progress')) return 'info';
        if (statusLower.includes('delay') || statusLower.includes('hold')) return 'warning';
        if (statusLower.includes('error') || statusLower.includes('problem')) return 'danger';
        return 'secondary';
    }

    getStatusIcon(status) {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('delivered')) return 'check-circle';
        if (statusLower.includes('transit')) return 'truck';
        if (statusLower.includes('delay')) return 'clock';
        if (statusLower.includes('hold')) return 'pause';
        return 'info-circle';
    }

    getEventIcon(eventStatus) {
        const statusLower = eventStatus.toLowerCase();
        if (statusLower.includes('delivered') || statusLower.includes('complete')) return 'check';
        if (statusLower.includes('departed') || statusLower.includes('left')) return 'plane';
        if (statusLower.includes('arrived') || statusLower.includes('received')) return 'map-marker';
        if (statusLower.includes('customs') || statusLower.includes('clearance')) return 'shield';
        if (statusLower.includes('delay') || statusLower.includes('hold')) return 'clock';
        return 'circle';
    }

    showTrackingSuccess(data) {
        const resultsContainer = document.getElementById('results-container');
        const orderDetails = document.getElementById('order-details');
        const statusInfo = document.getElementById('status-info');
        
        if (!resultsContainer) return;

        resultsContainer.style.display = 'block';
        
        if (orderDetails) {
            orderDetails.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <h4>Tracking Opened Successfully</h4>
                    <span class="badge bg-success">✓ Opened</span>
                </div>
                <p><strong>AWB Number:</strong> ${data.awbNumber}</p>
                <p><strong>Carrier:</strong> ${data.carrier}</p>
            `;
        }

        if (statusInfo) {
            statusInfo.innerHTML = `
                <div class="alert alert-success">
                    <div class="d-flex align-items-center mb-3">
                        <i class="fas fa-external-link-alt text-success me-3"></i>
                        <div>
                            <h5 class="mb-1">Tracking opened in new tab</h5>
                            <p class="mb-0">Your ${data.carrier} tracking page should open in a new tab with full access to their tracking system.</p>
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <p class="mb-2"><strong>If the tab didn't open:</strong></p>
                        <a href="${data.directTrackingUrl}" target="_blank" class="btn btn-primary">
                            <i class="fas fa-external-link-alt me-2"></i>
                            Open ${data.carrier} Tracking
                        </a>
                    </div>
                </div>
            `;
        }
    }

    showLoading(show, message = 'Processing tracking request...') {
        const btnText = document.querySelector('.btn-text');
        const btnLoader = document.querySelector('.btn-loader');
        const trackBtn = document.getElementById('track-btn');

        if (show) {
            if (btnText) {
                btnText.textContent = message;
                btnText.style.display = 'none';
            }
            if (btnLoader) btnLoader.style.display = 'inline-block';
            if (trackBtn) trackBtn.disabled = true;
        } else {
            if (btnText) {
                btnText.textContent = 'Track Shipment';
                btnText.style.display = 'inline-block';
            }
            if (btnLoader) btnLoader.style.display = 'none';
            if (trackBtn) trackBtn.disabled = false;
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SimpleTrackingSystem();
    
    console.log('🚀 NFS Logistics Web Scraping Tracking System loaded');
    console.log('📦 Ready to scrape freight tracking data and display on your page');
});
