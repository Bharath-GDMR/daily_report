gsap.registerPlugin(ScrollTrigger);
    
    const sections = gsap.utils.toArray("section");
    const loader = document.querySelector(".loader--text");
    
    // Function to update the loader text
    const updateProgress = (instance) => {
      loader.textContent = `${Math.round(instance.progressedCount * 100 / images.length)}%`;
    };
   
    // Function to set up the animations after images are loaded
    const setupAnimations = () => {
      // Hide the loader
      gsap.to(".loader", { autoAlpha: 0 });
    
      // Enable scrolling on the body
      document.body.style.overflow = "auto";
    
      // Create a timeline for each section
     sections.forEach((section, index) => {
        const w = section.querySelector(".wrapper");
        const [x, xEnd] = (index % 2)
          ? ["100%", (w.scrollWidth - section.offsetWidth) * -1] // For odd sections
          : [w.scrollWidth * -1, 0]; // For even sections
   
        // Create a GSAP timeline for each section
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            pin: section,
            scrub: 0.5,
            end: () => `+=${w.scrollWidth - section.offsetWidth}`
          }
        });
   
        // Animate the wrapper
        tl.fromTo(w, { x }, { x: xEnd });
      });
    };
   
    // Use imagesLoaded to detect when all images are loaded
    const images = gsap.utils.toArray("img");
    imagesLoaded(images).on("progress", updateProgress).on("always", setupAnimations);