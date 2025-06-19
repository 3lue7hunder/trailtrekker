// reviews.js - Review Management System
class ReviewManager {
    constructor() {
        this.reviews = this.loadReviews();
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Event delegation for review forms
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'reviewForm') {
                e.preventDefault();
                const trailId = parseInt(e.target.getAttribute('data-trail-id'));
                this.submitReview(e, trailId);
            }
        });
    }

loadReviews() {
    // For Claude artifacts, use in-memory storage with default data
    if (!this.reviews) {
        this.reviews = {
            1: [
                {
                    id: 1,
                    author: "Sarah M.",
                    rating: 5,
                    comment: "Absolutely stunning! The lake was crystal clear and the views were breathtaking. Definitely recommend going early morning.",
                    date: "2025-05-15",
                    helpful: 12
                },
                {
                    id: 2,
                    author: "Mike R.",
                    rating: 4,
                    comment: "Great trail, but it gets pretty crowded on weekends. The elevation gain is moderate but manageable.",
                    date: "2025-05-10",
                    helpful: 8
                }
            ],
            2: [
                {
                    id: 3,
                    author: "Family Explorer",
                    rating: 5,
                    comment: "Perfect for kids! The waterfall is spectacular and the trail is well-maintained. Saw some wildlife too!",
                    date: "2025-05-20",
                    helpful: 15
                }
            ],
            3: [
                {
                    id: 4,
                    author: "Mountain Goat",
                    rating: 4,
                    comment: "Challenging but rewarding. The views from the ridge are incredible. Bring lots of water!",
                    date: "2025-05-12",
                    helpful: 20
                }
            ]
        };
    }
    return this.reviews;w
}

saveReviews() {
    console.log('Reviews saved to memory');
}

    submitReview(event, trailId) {
        event.preventDefault();
        
        const form = event.target;
        const reviewData = {
            id: Date.now(),
            author: form.reviewerName.value,
            rating: parseInt(form.reviewRating.value),
            comment: form.reviewComment.value,
            date: new Date().toISOString().split('T')[0],
            helpful: 0
        };

        // Add review to the trail
        if (!this.reviews[trailId]) {
            this.reviews[trailId] = [];
        }
        this.reviews[trailId].unshift(reviewData);

        // Save reviews
        this.saveReviews();

        // Clear form
        form.reset();

        // Re-render reviews
        this.renderReviews(trailId);

        // Show success message
        this.showSuccessMessage('Review submitted successfully!');
    }

    renderReviews(trailId) {
        const reviewsList = document.getElementById('reviewsList');
        if (!reviewsList) return;

        const trailReviews = this.reviews[trailId] || [];
        
        if (trailReviews.length === 0) {
            reviewsList.innerHTML = '<p>No reviews yet. Be the first to share your experience!</p>';
            return;
        }

        reviewsList.innerHTML = trailReviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-author">${review.author}</div>
                    <div class="review-rating">
                        ${'⭐'.repeat(review.rating)}
                    </div>
                </div>
                <div class="review-date">${this.formatDate(review.date)}</div>
                <div class="review-comment">${review.comment}</div>
                <div class="review-actions">
                    <button class="btn-helpful" onclick="reviewManager.markHelpful(${review.id}, ${trailId})">
                        👍 Helpful (${review.helpful})
                    </button>
                </div>
            </div>
        `).join('');
    }

    markHelpful(reviewId, trailId) {
        const review = this.reviews[trailId]?.find(r => r.id === reviewId);
        if (review) {
            review.helpful += 1;
            this.saveReviews();
            this.renderReviews(trailId);
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    showSuccessMessage(message) {
        // Create and show success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4A7C59;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    getAverageRating(trailId) {
        const trailReviews = this.reviews[trailId] || [];
        if (trailReviews.length === 0) return 0;

        const totalRating = trailReviews.reduce((sum, review) => sum + review.rating, 0);
        return (totalRating / trailReviews.length).toFixed(1);
    }

    getReviewCount(trailId) {
        return this.reviews[trailId]?.length || 0;
    }

    getRecentReviews(limit = 5) {
        const allReviews = [];
        
        Object.keys(this.reviews).forEach(trailId => {
            this.reviews[trailId].forEach(review => {
                allReviews.push({
                    ...review,
                    trailId: parseInt(trailId)
                });
            });
        });

        return allReviews
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    filterReviewsByRating(trailId, minRating = 1) {
        const trailReviews = this.reviews[trailId] || [];
        return trailReviews.filter(review => review.rating >= minRating);
    }
}

// Initialize review manager
const reviewManager = new ReviewManager();

// Add CSS for success notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .btn-helpful {
        background: #f0f0f0;
        border: 1px solid #ddd;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s ease;
    }
    
    .btn-helpful:hover {
        background: gray;
        border-color: #4A7C59;
    }
    
    .review-actions {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
    }
`;
document.head.appendChild(style);

// Initialize review manager and make it globally accessible
document.addEventListener('DOMContentLoaded', () => {
    window.reviewManager = new ReviewManager();
});

// Also make it available immediately if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.reviewManager = new ReviewManager();
    });
} else {
    window.reviewManager = new ReviewManager();
}