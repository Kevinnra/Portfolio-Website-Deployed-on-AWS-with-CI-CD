// Add any future interactivity here
console.log("Portfolio loaded.");

const openButton = document.getElementById('open-sidebar-button')
const navbar = document.getElementById('navbar')

const media = window.matchMedia("(width < 809px)")


media.addEventListener('change', (e) => updateNavbar(e))

function updateNavbar(e){
  const isMobile = e.matches
  console.log(isMobile)
  if(isMobile){
    navbar.setAttribute('inert', '')
  }
  else{
    // desktop device
    navbar.removeAttribute('inert')
  }
}

function toggleSidebar(){
    navbar.classList.contains('show') ? closeSidebar() : openSidebar()
}

function openSidebar(){
    navbar.classList.add('show')
    openButton.classList.add('open')
    openButton.setAttribute('aria-expanded', 'true')
    navbar.removeAttribute('inert')
}

function closeSidebar(){
    navbar.classList.remove('show')
    openButton.classList.remove('open')
    openButton.setAttribute('aria-expanded', 'false')
    navbar.setAttribute('inert')
}

const navLinks = document.querySelectorAll('nav a')
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    closeSidebar()
  })
})
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    // Ignore links that don't point to actual IDs
    const targetId = this.getAttribute('href').substring(1);
    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("scroll-animate");
      } else {
        entry.target.classList.remove("scroll-animate");
      }
    });
  }, {
    threshold: 1
  });

  const socialsContainer = document.querySelector(".socials-container");
  if (socialsContainer) {
    observer.observe(socialsContainer);
  }
});


updateNavbar(media)

const projectsSection = document.querySelector('#projects');
const viewProjectsBtn = document.querySelector('#view-projects-btn');

if (projectsSection && viewProjectsBtn) {
  const projectsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      viewProjectsBtn.classList.toggle('visible', !entry.isIntersecting);
    });
  }, { threshold: 0.1 });

  projectsObserver.observe(projectsSection);
}