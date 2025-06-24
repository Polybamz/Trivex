"use client"


import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

// --- INTERFACES ---

interface Project {
  title: string;
  desc: string;
  tech: string;
}

interface Article {
  category: string;
  title: string;
  desc: string;
}

interface NodeData {
  id: string;
  x: string;
  y: string;
}

interface IndustryNodeData extends NodeData {
  connects: string[];
}

interface Line {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// --- STYLES (Will be injected into the head) ---
const globalStyles = `
  body {
    background-color: #030712;
    color: #FFFFFF;
    font-family: 'Space Grotesk', sans-serif;
  }
  .deep-tech-blue { background-color: #0A2A6C; }
  .accent-cyan { color: #00FFFF; }
  .border-accent { border-color: rgba(0, 255, 255, 0.2); }
  .bg-blur-backdrop {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    background-color: rgba(10, 42, 108, 0.1);
  }
  .hero-text-container {
    transform-style: preserve-3d;
  }
  .hero-text {
    transform: translateZ(20px) scale(0.9);
    opacity: 0;
    transition: transform 1s cubic-bezier(0.19, 1, 0.22, 1), opacity 1s cubic-bezier(0.19, 1, 0.22, 1);
  }
  .hero-text.visible {
    transform: translateZ(0) scale(1);
    opacity: 1;
  }
  .scroll-reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
  }
  .scroll-reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .synergy-map-line {
    stroke: rgba(0, 255, 255, 0.3);
    stroke-width: 1;
    transition: stroke 0.3s ease;
  }
  .synergy-map-node:hover ~ .synergy-map-line,
  .synergy-map-line:hover {
    stroke: #00FFFF;
    stroke-width: 2;
  }
  .project-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .project-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 25px -5px rgba(0, 255, 255, 0.1), 0 10px 10px -5px rgba(0, 255, 255, 0.04);
  }
  #loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #030712;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    transition: opacity 0.5s ease-out;
  }
  .loader-logo {
    font-size: 2rem;
    font-weight: 700;
    color: #FFFFFF;
    position: relative;
  }
  .loader-logo::after {
    content: '_';
    animation: blink 1s infinite;
    position: absolute;
  }
  @keyframes blink {
    50% { opacity: 0; }
  }
`;

// --- Reusable Hooks ---

/**
 * Custom hook for scroll-reveal animations.
 * Applies the 'visible' class to elements with 'scroll-reveal' as they enter the viewport.
 */
const useScrollReveal = (): void => {
  useEffect(() => {
    // Create a new IntersectionObserver instance
    const scrollObserver = new IntersectionObserver((entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach((entry: IntersectionObserverEntry) => {
        if (entry.isIntersecting) {
          // Add 'visible' class when element is intersecting
          entry.target.classList.add('visible');
          // Stop observing the element after it becomes visible
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 }); // Trigger when 10% of the element is visible

    // Select all elements with the 'scroll-reveal' class
    const elements: Element[] = Array.from(document.querySelectorAll('.scroll-reveal'));
    // Observe each element
    elements.forEach((el: Element) => scrollObserver.observe(el));

    // Cleanup function: unobserve all elements when the component unmounts
    return () => {
      elements.forEach((el: Element) => {
        if (el) scrollObserver.unobserve(el);
      });
    };
  }, []); // Empty dependency array means this effect runs once on mount
};


// --- COMPONENTS ---

/**
 * Loader component displayed on initial page load.
 * Fades out and hides after the window has fully loaded.
 */
const Loader: React.FC = () => {
  // State to control loader visibility
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    /**
     * Handles the window load event.
     * Fades out the loader and then sets its visibility to false.
     */
    const handleLoad = (): void => {
      setTimeout(() => {
        const loaderEl = document.getElementById('loader');
        if (loaderEl) {
          loaderEl.style.opacity = '0'; // Start fade out
          setTimeout(() => setVisible(false), 500); // Hide after transition
        }
      }, 100); // Small delay before starting fade-out
    };

    // Check if the document is already loaded
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      // If not, add event listener for 'load' event
      window.addEventListener('load', handleLoad);
      // Cleanup: remove event listener on component unmount
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []); // Empty dependency array ensures this runs once on mount

  // Do not render if not visible
  if (!visible) return null;

  return (
    <div id="loader">
      <div className="loader-logo">TRIVEX</div>
    </div>
  );
};

/**
 * Header component with navigation and responsive menu.
 */
const Header: React.FC = () => {
  // State for mobile menu open/close
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  // State for header background on scroll
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    /**
     * Handles scroll event to change header background.
     */
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 50);
    };
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    // Cleanup: remove event listener on component unmount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Empty dependency array means this effect runs once on mount

  /**
   * Closes the mobile menu.
   */
  const closeMenu = (): void => setIsMenuOpen(false);

  return (
    <>
      {/* Fixed header with conditional background on scroll */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-gray-900/80 backdrop-blur-sm' : ''}`}>
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <a href="#" className="text-2xl font-bold text-white">TRIVEX</a>
          {/* Desktop navigation links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#portfolio" className="hover:text-cyan-400 transition-colors">Portfolio</a>
            <a href="#about" className="hover:text-cyan-400 transition-colors">About</a>
            <a href="#synergy" className="hover:text-cyan-400 transition-colors">Synergy</a>
            <a href="#insights" className="hover:text-cyan-400 transition-colors">Insights</a>
            <a href="#contact" className="bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-2 px-4 rounded-lg transition-all">Partner With Us</a>
          </div>
          {/* Mobile menu button */}
          <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 p-8">
          <div className="flex justify-end">
            <button onClick={closeMenu}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-full space-y-8 text-2xl">
            <a href="#portfolio" onClick={closeMenu} className="hover:text-cyan-400 transition-colors">Portfolio</a>
            <a href="#about" onClick={closeMenu} className="hover:text-cyan-400 transition-colors">About</a>
            <a href="#synergy" onClick={closeMenu} className="hover:text-cyan-400 transition-colors">Synergy</a>
            <a href="#insights" onClick={closeMenu} className="hover:text-cyan-400 transition-colors">Insights</a>
            <a href="#contact" onClick={closeMenu} className="bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-3 px-6 rounded-lg transition-all">Partner With Us</a>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Hero section with a 3D particle background animation using Three.js.
 */
const HeroSection: React.FC = () => {
  // Ref for the DOM element where Three.js canvas will be mounted
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate hero text visibility
    const heroTexts: NodeListOf<Element> = document.querySelectorAll('.hero-text');
    const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
      heroTexts.forEach((text: Element, index: number) => {
        setTimeout(() => {
          text.classList.add('visible'); // Make text visible with a staggered effect
        }, index * 200);
      });
    }, 500); // Initial delay before text animation starts

    const mount = mountRef.current;
    if (!mount) return; // Exit if mount ref is not available

    // Declare Three.js variables
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let particles: THREE.Points;
    let animationFrameId: number; // To store requestAnimationFrame ID

    let mouseX: number = 0; // Mouse X position for camera movement
    let mouseY: number = 0; // Mouse Y position for camera movement

    /**
     * Initializes the Three.js scene, camera, renderer, and particles.
     */
    const init = (): void => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
      camera.position.z = 5; // Position camera back

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); // Alpha true for transparent background
      renderer.setSize(mount.clientWidth, mount.clientHeight); // Set renderer size to container
      renderer.setPixelRatio(window.devicePixelRatio); // Use device pixel ratio for sharp rendering
      mount.appendChild(renderer.domElement); // Add canvas to DOM

      // Create particles
      const particleCount: number = 5000;
      const particlesGeometry = new THREE.BufferGeometry();
      const posArray = new Float32Array(particleCount * 3); // XYZ coordinates for each particle

      // Randomly position particles within a cube
      for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const particleMaterial = new THREE.PointsMaterial({ size: 0.005, color: 0x00FFFF }); // Small cyan particles
      particles = new THREE.Points(particlesGeometry, particleMaterial);
      scene.add(particles); // Add particles to scene
    };

    /**
     * Animation loop for Three.js.
     * Updates particle rotation and camera position based on mouse.
     */
    const animate = (): void => {
      animationFrameId = requestAnimationFrame(animate); // Loop animation
      if (particles) { // Ensure particles object exists
        particles.rotation.y += 0.0001; // Rotate particles slowly
        particles.rotation.x += 0.0001;
      }
      if (camera && scene && renderer) { // Ensure Three.js objects are initialized
        camera.position.x += (mouseX * 0.00005 - camera.position.x) * 0.05; // Smooth camera movement X
        camera.position.y += (-mouseY * 0.00005 - camera.position.y) * 0.05; // Smooth camera movement Y
        camera.lookAt(scene.position); // Always look at the center of the scene
        renderer.render(scene, camera); // Render the scene
      }
    };

    /**
     * Updates mouseX and mouseY based on cursor position for camera movement.
     * @param event - The mouse event.
     */
    const onMouseMove = (event: MouseEvent): void => {
      mouseX = event.clientX - window.innerWidth / 2;
      mouseY = event.clientY - window.innerHeight / 2;
    };

    /**
     * Handles window resize event to update camera aspect ratio and renderer size.
     */
    const onWindowResize = (): void => {
      if (!renderer || !camera || !mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight; // Update aspect ratio
      camera.updateProjectionMatrix(); // Update camera projection matrix
      renderer.setSize(mount.clientWidth, mount.clientHeight); // Resize renderer
    };

    // Initialize and start animation
    init();
    animate();

    // Add event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);

    // Cleanup function:
    // Cancel animation frame, remove event listeners, and remove canvas from DOM
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onWindowResize);
      document.removeEventListener('mousemove', onMouseMove);
      clearTimeout(timer); // Clear the text animation timer
      if (mount && renderer && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []); // Empty dependency array ensures this effect runs once on mount

  return (
    <section id="hero" className="h-screen flex items-center justify-center relative overflow-hidden">
      {/* Three.js canvas container */}
      <div ref={mountRef} className="absolute top-0 left-0 w-full h-full"></div>
      {/* Hero text content */}
      <div className="text-center z-10 px-4 hero-text-container">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4">
          <span className="hero-text block">From Silicon to Software—</span>
          <span className="hero-text block mt-2 md:mt-4 accent-cyan">We Engineer Synergy.</span>
        </h1>
        <p className="hero-text max-w-3xl mx-auto text-lg md:text-xl text-gray-300 mt-8">
          Trivex develops futuristic platforms that fuse hardware and software into unified ecosystems, driving innovation and empowering human potential.
        </p>
        <div className="hero-text mt-12">
          <a href="#portfolio" className="bg-transparent border border-cyan-400 text-cyan-400 font-bold py-3 px-8 rounded-lg hover:bg-cyan-400 hover:text-gray-900 transition-all text-lg">
            Explore Our Ecosystem
          </a>
        </div>
      </div>
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-8 h-8 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>
  );
};

/**
 * Portfolio section displaying various projects.
 */
const PortfolioSection: React.FC = () => {
  // Array of project data
  const projects: Project[] = [
    { title: 'CoreOS', desc: 'The secure, real-time operating system for mission-critical embedded systems.', tech: 'Rust, Yocto, MQTT, WebRTC' },
    { title: 'NeuronEdge', desc: 'A decentralized AI computing framework for neural processing at the edge.', tech: 'TensorFlow Lite, Flutter, gRPC' },
    { title: 'Starlinker', desc: 'Low-latency mesh network protocol for resilient space-to-ground communications.', tech: 'SDR, Blockchain, Custom RF' },
    { title: 'Pulse', desc: 'Biometric authentication and health monitoring platform for next-gen wearables.', tech: 'TinyML, BLE, Secure Enclave' },
    { title: 'Tamonjo', desc: 'An IoT platform unifying device management, data pipelines, and digital twins.', tech: 'Kafka, K8s, Grafana, Digital Twin' }
  ];

  return (
    <section id="portfolio" className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="text-4xl md:text-5xl font-bold">Innovation Portfolio</h2>
          <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">Our core platforms, designed to create seamless interaction between the digital and physical worlds.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((p: Project, i: number) => (
            <div key={p.title} className="project-card bg-gray-900 border border-accent rounded-xl p-8 scroll-reveal" style={{ transitionDelay: `${i * 100}ms` }}>
              <h3 className="text-2xl font-bold accent-cyan">{p.title}</h3>
              <p className="text-gray-400 mt-2 mb-4">{p.desc}</p>
              <p className="text-sm font-mono text-gray-500">Tech: {p.tech}</p>
            </div>
          ))}
          {/* Call to action card */}
          <div className="project-card bg-gray-900 border border-accent rounded-xl p-8 scroll-reveal" style={{ transitionDelay: '500ms' }}>
            <h3 className="text-2xl font-bold">And more...</h3>
            <p className="text-gray-400 mt-2 mb-4">Explore our R&D labs for early-stage concepts in advanced materials and quantum computing.</p>
            <a href="#insights" className="text-cyan-400 font-bold hover:underline">Visit Trivex Labs</a>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Component for visualizing the tech stack with a rotating display of technologies.
 */
const TechStackVisualization: React.FC = () => {
  // Array of technologies
  const techStack: string[] = ['Rust', 'Flutter', 'TensorFlow', 'WebRTC', 'MQTT', 'Blockchain', 'Yocto', 'SDR', 'TinyML', 'Kubernetes'];
  // State to track the currently displayed technology
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    // Set up an interval to rotate through the tech stack
    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      setCurrentIndex((prevIndex: number) => (prevIndex + 1) % techStack.length);
    }, 3000); // Change technology every 3 seconds
    // Cleanup: clear the interval on component unmount
    return () => clearInterval(interval);
  }, [techStack.length]); // Re-run effect if techStack length changes

  return (
    <div className="w-full h-full border border-accent rounded-xl bg-gray-900 p-4 flex items-center justify-center">
      <p className="text-center text-cyan-400 text-2xl md:text-4xl font-mono transition-opacity duration-500">
        {techStack[currentIndex]}
      </p>
    </div>
  );
};

/**
 * About section detailing Trivex's philosophy and approach.
 */
const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 md:py-32 bg-gray-900/50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">We build the backbone of tomorrow's technology.</h2>
            <p className="text-lg text-gray-300 mb-8">Trivex was founded on the principle that the most profound innovations emerge from the seamless integration of hardware and software. We are a collective of engineers, scientists, and designers dedicated to solving complex, multi-disciplinary challenges.</p>
            <div className="space-y-6">
              {/* Feature: Synergy Engineering */}
              <div className="flex items-start">
                <svg className="w-6 h-6 text-cyan-400 mr-4 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3"></path></svg>
                <div>
                  <h4 className="font-bold text-xl">Synergy Engineering</h4>
                  <p className="text-gray-400">Our design philosophy centers on creating systems where the whole is greater than the sum of its parts.</p>
                </div>
              </div>
              {/* Feature: Human-Centered Systems */}
              <div className="flex items-start">
                <svg className="w-6 h-6 text-cyan-400 mr-4 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                <div>
                  <h4 className="font-bold text-xl">Human-Centered Systems</h4>
                  <p className="text-gray-400">Technology should be an extension of human capability, designed with intent, ethics, and usability at its core.</p>
                </div>
              </div>
            </div>
          </div>
          {/* Tech stack visualization */}
          <div className="h-96 lg:h-auto scroll-reveal" style={{ transitionDelay: '200ms' }}>
            <TechStackVisualization />
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Synergy Map section illustrating the interconnection of Trivex's platforms and industries.
 */
const SynergyMapSection: React.FC = () => {
  // Ref to store references to all dynamic nodes (tech and industry)
  const nodesRef = useRef<Record<string, HTMLElement | null>>({});
  // Ref for the container div to get its dimensions
  const containerRef = useRef<HTMLDivElement>(null);
  // State to store the calculated line coordinates for the SVG
  const [lines, setLines] = useState<Line[]>([]);

  // Data for technology nodes
  const techNodes: NodeData[] = [
    { id: 'CoreOS', x: '20%', y: '20%' },
    { id: 'NeuronEdge', x: '80%', y: '20%' },
    { id: 'Starlinker', x: '10%', y: '50%' },
    { id: 'Pulse', x: '90%', y: '50%' },
    { id: 'Tamonjo', x: '50%', y: '80%' },
  ];

  // Data for industry nodes and their connections to tech nodes
  const industryNodes: IndustryNodeData[] = [
    { id: 'Space', connects: ['Starlinker', 'CoreOS'], x: '50%', y: '5%' },
    { id: 'Wearables', connects: ['Pulse', 'NeuronEdge'], x: '95%', y: '80%' },
    { id: 'Safety', connects: ['CoreOS', 'Pulse', 'Tamonjo'], x: '5%', y: '80%' },
    { id: 'Logistics', connects: ['Tamonjo', 'CoreOS', 'Starlinker'], x: '30%', y: '50%' },
    { id: 'Accessibility', connects: ['NeuronEdge', 'Pulse'], x: '70%', y: '50%' },
  ];

  /**
   * Calculates the SVG line coordinates based on the current position of the DOM nodes.
   * Uses useCallback to memoize the function and prevent unnecessary re-renders.
   */
  const calculateLines = useCallback((): void => {
    const newLines: Line[] = [];
    const container = containerRef.current;
    if (!container) return;

    // Helper function to get the center coordinates of a node relative to its container
    const getNodeCenter = (id: string): { x: number; y: number; } | null => {
      const node = nodesRef.current[id];
      if (!node) return null;
      const rect = node.getBoundingClientRect(); // Get absolute position
      const containerRect = container.getBoundingClientRect(); // Get container absolute position

      // Calculate center relative to the container
      return {
        x: (rect.left + rect.width / 2) - containerRect.left,
        y: (rect.top + rect.height / 2) - containerRect.top,
      };
    };

    // Iterate through industry nodes and their connections to calculate lines
    industryNodes.forEach((industryNode: IndustryNodeData) => {
      const industryPos = getNodeCenter(industryNode.id);
      if (!industryPos) return;

      industryNode.connects.forEach((techId: string) => {
        const techPos = getNodeCenter(techId);
        if (techPos) {
          newLines.push({
            key: `${industryNode.id}-${techId}`, // Unique key for React list rendering
            x1: industryPos.x, y1: industryPos.y,
            x2: techPos.x, y2: techPos.y
          });
        }
      });
    });
    setLines(newLines); // Update lines state
  }, [industryNodes]); // Recalculate if industryNodes data changes

  useEffect(() => {
    // A small timeout to ensure refs are populated after initial render before calculating lines
    const timer: ReturnType<typeof setTimeout> = setTimeout(calculateLines, 100);
    // Add resize event listener to recalculate lines when window size changes
    window.addEventListener('resize', calculateLines);
    // Cleanup: clear timeout and remove event listener on component unmount
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateLines);
    };
  }, [calculateLines]); // Recalculate if calculateLines function changes (due to useCallback dependencies)

  return (
    <section id="synergy" className="py-20 md:py-32">
      <div className="container mx-auto px-6 text-center">
        <div className="scroll-reveal">
          <h2 className="text-4xl md:text-5xl font-bold">The Trivex Synergy Map</h2>
          <p className="text-lg text-gray-400 mt-4 max-w-3xl mx-auto">Our platforms are not isolated products. They are designed to interconnect, creating novel solutions across diverse industries.</p>
        </div>
        {/* Container for the synergy map with relative positioning */}
        <div ref={containerRef} className="mt-16 relative h-[600px] w-full max-w-4xl mx-auto scroll-reveal">
          {/* SVG for drawing lines */}
          <svg className="absolute inset-0 w-full h-full">
            {lines.map((line: Line) => (
              <line key={line.key} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} className="synergy-map-line" />
            ))}
          </svg>

          {/* Render technology nodes */}
          {techNodes.map((node: NodeData) => (
            <div key={node.id}
              ref={el => { nodesRef.current[node.id] = el; }} // Assign ref to the DOM element
              style={{ position: 'absolute', left: node.x, top: node.y, transform: 'translate(-50%, -50%)' }}
              className='synergy-map-node bg-gray-800 text-white text-sm md:text-base border border-accent rounded-lg p-3 md:p-4 shadow-lg cursor-pointer transition-all hover:bg-gray-700 hover:scale-105'>
              {node.id}
            </div>
          ))}

          {/* Render industry nodes */}
          {industryNodes.map((node: NodeData) => (
            <div key={node.id}
              ref={el => { nodesRef.current[node.id] = el; }} // Assign ref to the DOM element
              style={{ position: 'absolute', left: node.x, top: node.y, transform: 'translate(-50%, -50%)' }}
              className='synergy-map-node text-cyan-400 font-bold text-lg md:text-xl p-2 cursor-pointer'>
              {node.id}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Insights section displaying articles and thought leadership content.
 */
const InsightsSection: React.FC = () => {
  // Array of article data
  const articles: Article[] = [
    { category: 'DEEP DIVE', title: 'The Future is Embedded: Why Rust is Our Choice for CoreOS', desc: 'An in-depth look at the memory safety and performance benefits that make Rust the ideal language for mission-critical systems.' },
    { category: 'TRIVEX LABS', title: 'Concept: Liquid Crystal Neural Networks', desc: 'Exploring the potential of novel materials for ultra-low-power, analog computing hardware.' },
    { category: 'PERSPECTIVE', title: 'Beyond The Hype: Real-World Blockchain for Secure Comms', desc: 'How Starlinker leverages a lightweight distributed ledger for immutable, auditable message verification.' },
  ];
  return (
    <section id="insights" className="py-20 md:py-32 bg-gray-900/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="text-4xl md:text-5xl font-bold">Thought Hub & Insights</h2>
          <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">Exploring the frontiers of technology, from our engineers and researchers to you.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((a: Article, i: number) => (
            <a key={a.title} href="#" className="block bg-gray-900 p-8 rounded-xl border border-transparent hover:border-accent transition-all duration-300 scroll-reveal" style={{ transitionDelay: `${i * 150}ms` }}>
              <p className="text-sm text-gray-500 mb-2">{a.category}</p>
              <h4 className="font-bold text-xl mb-4">{a.title}</h4>
              <p className="text-gray-400">{a.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Contact section with a form for inquiries.
 * Replaces `alert()` with a console log as `alert()` is not recommended in production.
 */
const ContactSection: React.FC = () => {
  /**
   * Handles the form submission.
   * @param e - The form event.
   */
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    // In a real app, you would handle form submission here (e.g., API call)
    // Using a custom modal/alert would be better than window.alert in production
    console.log('Form submitted!'); // Replaced alert() with console.log
    // Potentially add a state to show a custom success message here
  };

  return (
    <section id="contact" className="py-20 md:py-32">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="scroll-reveal bg-gray-900/70 border border-accent rounded-2xl p-8 md:p-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold">Let's Engineer the Future Together.</h2>
          <p className="text-lg text-gray-400 mt-4 mb-10">Have a groundbreaking idea or a complex challenge? We thrive on the impossible. Partner with us.</p>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <input type="text" placeholder="Your Name" required className="bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all w-full" />
              <input type="email" placeholder="Your Email" required className="bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all w-full" />
            </div>
            <div className="mb-6">
              <select required className="bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all w-full appearance-none">
                <option value="">I'm interested in... (Select a Category)</option>
                <option>Investing in Trivex</option>
                <option>Partnering as a Startup</option>
                <option>Enterprise Collaboration</option>
                <option>R&D and Academia</option>
                <option>Joining the Team</option>
              </select>
            </div>
            <div className="mb-8">
              <textarea placeholder="Tell us about your project or inquiry..." rows={5} required className="bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition-all w-full"></textarea>
            </div>
            <button type="submit" className="bg-cyan-500 text-gray-900 font-bold py-4 px-10 rounded-lg hover:bg-cyan-400 transition-all text-lg w-full md:w-auto">Submit Inquiry</button>
          </form>
        </div>
      </div>
    </section>
  );
};

/**
 * Footer component with copyright and social links.
 */
const Footer: React.FC = () => (
  <footer className="py-12 border-t border-accent">
    <div className="container mx-auto px-6 text-center text-gray-500">
      <p>&copy; {new Date().getFullYear()} Trivex Inc. All rights reserved.</p>
      <p className="mt-2">From Silicon to Software—We Engineer Synergy.</p>
      <div className="flex justify-center space-x-6 mt-6">
        <a href="#" className="hover:text-white">Twitter</a>
        <a href="#" className="hover:text-white">LinkedIn</a>
        <a href="#" className="hover:text-white">GitHub</a>
      </div>
    </div>
  </footer>
);

/**
 * Layout component that wraps the main content, handles global styles, and meta tags.
 */
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Set document title
    document.title = "Trivex | From Silicon to Software—We Engineer Synergy.";

    // Inject global styles
    const styleTag: HTMLStyleElement = document.createElement('style');
    styleTag.innerHTML = globalStyles;
    document.head.appendChild(styleTag);

    // Add meta viewport if not already present
    let metaViewport: HTMLMetaElement | null = document.querySelector('meta[name="viewport"]');
    if (!metaViewport) {
      metaViewport = document.createElement('meta');
      metaViewport.name = "viewport";
      metaViewport.content = "width=device-width, initial-scale=1.0";
      document.head.appendChild(metaViewport);
    }

    // Add Google Fonts
    const fontLink1: HTMLLinkElement = document.createElement('link');
    fontLink1.rel = 'preconnect';
    fontLink1.href = 'https://fonts.googleapis.com';

    const fontLink2: HTMLLinkElement = document.createElement('link');
    fontLink2.rel = 'preconnect';
    fontLink2.href = 'https://fonts.gstatic.com';
    fontLink2.crossOrigin = 'true';

    const fontLink3: HTMLLinkElement = document.createElement('link');
    fontLink3.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap';
    fontLink3.rel = 'stylesheet';

    document.head.appendChild(fontLink1);
    document.head.appendChild(fontLink2);
    document.head.appendChild(fontLink3);

    // Cleanup function: remove injected style tag on unmount
    return () => {
      if (document.head.contains(styleTag)) {
        document.head.removeChild(styleTag);
      }
      // Note: For simplicity, font links and viewport are not removed on unmount,
      // as they are typically global assets.
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div className="antialiased">
      {/* Loader component */}
      <Loader />
      {/* Header component */}
      <Header />
      {/* Main content area */}
      <main>{children}</main>
      {/* Footer component */}
      <Footer />
    </div>
  );
};

/**
 * The main App component, orchestrating all sections of the Trivex website.
 */
export default function HomePage(): React.ReactElement {
  // This hook sets up the scroll animations for the whole page
  useScrollReveal();

  return (
    // Layout wraps all main sections to apply global styles and header/footer
    <Layout>
      <HeroSection />
      <PortfolioSection />
      <AboutSection />
      <SynergyMapSection />
      <InsightsSection />
      <ContactSection />
    </Layout>
  );
}
