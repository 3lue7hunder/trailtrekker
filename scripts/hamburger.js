// Hamburger Menu Management
class HamburgerMenu {
    constructor() {
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('navMenu');
        this.navOverlay = document.getElementById('navOverlay');
        this.navLinks = document.querySelectorAll('.nav-menu a');
        
        this.init();
    }

    init() {
        if (!this.hamburger || !this.navMenu || !this.navOverlay) {
            console.warn('Hamburger menu elements not found');
            return;
        }

        // Toggle menu on hamburger click
        this.hamburger.addEventListener('click', () => {
            this.toggleMenu();
        });

        // Close menu on overlay click
        this.navOverlay.addEventListener('click', () => {
            this.closeMenu();
        });

        // Close menu on navigation link click
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMenu();
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen()) {
                this.closeMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isMenuOpen()) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        const isOpen = this.isMenuOpen();
        
        if (isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.hamburger.classList.add('active');
        this.navMenu.classList.add('active');
        this.navOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    closeMenu() {
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
        this.navOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    isMenuOpen() {
        return this.navMenu.classList.contains('active');
    }
}

// Initialize hamburger menu when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.hamburgerMenu = new HamburgerMenu();
});