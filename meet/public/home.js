// Home page functionality
document.addEventListener('DOMContentLoaded', function() {
    const createRoomBtn = document.getElementById('createRoomBtn');
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    const roomIdInput = document.getElementById('roomIdInput');
    const userNameInput = document.getElementById('userNameInput');
    const createRoomModal = document.getElementById('createRoomModal');
    const closeModal = document.getElementById('closeModal');

    // Create new room
    createRoomBtn.addEventListener('click', async function() {
        showModal();
        
        try {
            const response = await fetch('/create-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.roomId) {
                // Redirect to room with a slight delay for UX
                setTimeout(() => {
                    window.location.href = `/room/${data.roomId}`;
                }, 1000);
            } else {
                hideModal();
                showNotification('Failed to create room. Please try again.', 'error');
            }
        } catch (error) {
            hideModal();
            showNotification('Network error. Please check your connection.', 'error');
            console.error('Error creating room:', error);
        }
    });

    // Join existing room
    joinRoomBtn.addEventListener('click', function() {
        const roomId = roomIdInput.value.trim();
        const userName = userNameInput.value.trim();
        
        if (!roomId) {
            showNotification('Please enter a meeting ID', 'error');
            roomIdInput.focus();
            return;
        }
        
        if (!userName) {
            showNotification('Please enter your name', 'error');
            userNameInput.focus();
            return;
        }
        
        // Store user name in sessionStorage for the room
        sessionStorage.setItem('userName', userName);
        
        // Redirect to room
        window.location.href = `/room/${roomId}`;
    });

    // Handle Enter key in inputs
    roomIdInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            userNameInput.focus();
        }
    });

    userNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            joinRoomBtn.click();
        }
    });

    // Modal controls
    closeModal.addEventListener('click', hideModal);
    
    createRoomModal.addEventListener('click', function(e) {
        if (e.target === createRoomModal) {
            hideModal();
        }
    });

    // Utility functions
    function showModal() {
        createRoomModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        createRoomModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    function showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-info-circle"></i>
                    <span id="notificationText"></span>
                </div>
            `;
            document.body.appendChild(notification);
        }

        const notificationText = document.getElementById('notificationText');
        const icon = notification.querySelector('i');
        
        // Set message and type
        notificationText.textContent = message;
        notification.className = `notification ${type}`;
        
        // Set appropriate icon
        if (type === 'error') {
            icon.className = 'fas fa-exclamation-triangle';
        } else if (type === 'success') {
            icon.className = 'fas fa-check-circle';
        } else {
            icon.className = 'fas fa-info-circle';
        }
        
        // Show notification
        notification.classList.add('show');
        
        // Hide after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }

    // Add some interactive animations
    const videoTiles = document.querySelectorAll('.video-tile');
    
    // Animate video tiles
    setInterval(() => {
        videoTiles.forEach((tile, index) => {
            setTimeout(() => {
                tile.classList.toggle('active');
            }, index * 200);
        });
    }, 3000);

    // Add hover effects to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add typing effect to hero title
    const heroTitle = document.querySelector('.hero-title');
    const originalText = heroTitle.textContent;
    let currentText = '';
    let index = 0;

    function typeEffect() {
        if (index < originalText.length) {
            currentText += originalText.charAt(index);
            heroTitle.textContent = currentText;
            index++;
            setTimeout(typeEffect, 100);
        }
    }

    // Start typing effect after a short delay
    heroTitle.textContent = '';
    setTimeout(typeEffect, 500);

    // Add floating animation to features
    const features = document.querySelectorAll('.feature');
    features.forEach((feature, index) => {
        feature.style.animationDelay = `${index * 0.2}s`;
        feature.classList.add('fade-in');
    });

    // Smooth scroll for navigation (if you add navigation links)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add particle background effect
    function createParticle() {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            pointer-events: none;
            z-index: -1;
            left: ${Math.random() * 100}vw;
            top: ${Math.random() * 100}vh;
            animation: float ${5 + Math.random() * 10}s linear infinite;
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 15000);
    }

    // Add CSS for particle animation if not already present
    if (!document.querySelector('#particle-styles')) {
        const style = document.createElement('style');
        style.id = 'particle-styles';
        style.textContent = `
            @keyframes float {
                0% {
                    transform: translateY(100vh) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Create particles periodically
    setInterval(createParticle, 2000);
});