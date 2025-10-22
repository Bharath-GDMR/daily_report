const headline = document.querySelector(".headline");
headline.classList.add("animation-in-progress");
setTimeout(() => headline.classList.remove("animation-in-progress"), 1000);
