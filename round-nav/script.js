console.clear();
const btnNav = document.getElementById("btn-nav-toggle");
const nav = btnNav.closest("nav");

btnNav.addEventListener("click", () => {
	const isExpanded = btnNav.getAttribute("aria-expanded") === "true";
	// Toggle hidden state
	if (isExpanded) {
		btnNav.setAttribute("aria-expanded", "false");
		nav.setAttribute("aria-label", "Main navigation (collapsed)");
	} else {
		btnNav.setAttribute("aria-expanded", "true");
		nav.setAttribute("aria-label", "Main navigation (expanded)");
	}
});
