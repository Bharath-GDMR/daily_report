document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.tree li a').forEach(function(nodeLink) {
        // Check if the node has children (i.e., if it has a toggle button)
        const toggleBtn = nodeLink.querySelector('.toggle-btn');
        if (toggleBtn) {
            nodeLink.addEventListener('click', function(event) {
                event.preventDefault();
                // No stopPropagation needed here, as the click is on the main link

                const targetId = toggleBtn.dataset.target;
                const targetUl = document.querySelector(targetId);

                if (targetUl) {
                    targetUl.classList.toggle('hidden');
                    if (targetUl.classList.contains('hidden')) {
                        toggleBtn.textContent = '+';
                    } else {
                        toggleBtn.textContent = '-';
                    }
                }
            });
        }
    });
});