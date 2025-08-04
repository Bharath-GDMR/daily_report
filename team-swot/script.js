
        function toggleSWOT(button) {
            const content = button.nextElementSibling;
            const isOpen = content.classList.contains('open');
            
            // Add click animation
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
            
            if (isOpen) {
                content.classList.remove('open');
                button.textContent = 'View SWOT Analysis';
            } else {
                content.classList.add('open');
                button.textContent = 'Hide SWOT Analysis';
                
                // Animate SWOT items
                const swotItems = content.querySelectorAll('.swot-item');
                swotItems.forEach((item, index) => {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        item.style.transition = 'all 0.3s ease';
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }
        }

        // Add staggered animation on page load
        document.addEventListener('DOMContentLoaded', function() {
            const cards = document.querySelectorAll('.team-card');
            cards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
            });
        });

        // Add hover effects for better interactivity
        document.querySelectorAll('.team-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
