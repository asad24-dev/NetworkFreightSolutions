/**
 * NFS Logistics - Simple Track-Trace Integration (Render Deployment Version)
 * Uses remote API server deployed on Render for freight tracking
 */

class SimpleTrackingSystem {
    constructor() {
        // API Configuration - Update this with your Render URL
        this.API_BASE_URL = 'https://your-app-name.onrender.com'; // UPDATE THIS!
        this.initializeEventListeners();
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

        // Carrier detection based on AWB prefix
        const carriers = {
            '176': 'Emirates SkyCargo',
            '020': 'Lufthansa Cargo', 
            '157': 'Qatar Airways Cargo',
            '607': 'Etihad Cargo',
            '217': 'Thai Airways Cargo',
            '125': 'British Airways Cargo',
            '180': 'KLM Cargo',
            '057': 'Air France Cargo'
        };

        const prefix = cleanAWB.substring(0, 3);
        const carrier = carriers[prefix];
        
        if (carrier) {
            shipperInput.value = carrier;
            console.log(`🎯 Auto-detected carrier: ${carrier} (AWB prefix: ${prefix})`);
        }
    }

    async handleTrackingSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const trackingNumber = formData.get('order-number')?.trim();
        const customerName = formData.get('customer-name')?.trim();
        const customerEmail = formData.get('customer-email')?.trim();

        if (!trackingNumber) {
            alert('Please enter a tracking number');
            return;
        }

        // Show loading state
        this.showLoading(true);
        
        try {
            console.log('🚀 Getting tracking redirect URL for:', trackingNumber);
            
            // Call our remote API server on Render
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
            this.displayError('Network error occurred while tracking', `https://www.track-trace.com/aircargo?awb=${trackingNumber}`);
        }
    }

    displayError(message, fallbackUrl) {
        const resultsContainer = document.getElementById('results-container');
        
        if (resultsContainer) {
            resultsContainer.style.display = 'block';
            resultsContainer.innerHTML = `
                <div class="alert alert-warning">
                    <h5>⚠️ Tracking Issue</h5>
                    <p>${message}</p>
                    ${fallbackUrl ? `
                        <div class="mt-3">
                            <a href="${fallbackUrl}" target="_blank" class="btn btn-primary">
                                <i class="fas fa-external-link-alt me-2"></i>
                                Try Direct Tracking
                            </a>
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            alert(`Error: ${message}`);
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
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleTrackingSystem;
}
