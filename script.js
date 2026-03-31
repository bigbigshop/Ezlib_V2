// --- Theme Toggle Logic ---
const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn, .mobile-theme-btn');

function updateThemeIcon(isDark) {
    themeToggleBtns.forEach(btn => {
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
    });
}

function applyTheme(isDark) {
    if (isDark) {
        document.documentElement.classList.remove('light-mode');
    } else {
        document.documentElement.classList.add('light-mode');
    }
    updateThemeIcon(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme === 'dark');

// Add click handlers to all theme toggle buttons
themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const currentTheme = localStorage.getItem('theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme === 'dark');
    });
});

// --- Navigation and Scroll Logic ---
const navLinks = document.querySelectorAll('.nav-link');
const scrollArea = document.getElementById('scroll-area');
const sections = document.querySelectorAll('section, h2[id]');
const backToTopButton = document.getElementById('back-to-top');
const sidebar = document.querySelector('.sidebar');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');

// Smooth scroll to section when clicking nav links
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
            
            // Scroll to target
            scrollArea.scrollTo({
                top: targetElement.offsetTop - 40,
                behavior: 'smooth'
            });
            
            // Close mobile sidebar after clicking
            if (window.innerWidth <= 600) {
                sidebar.classList.remove('show');
            }
        }
    });
});

// Highlight active nav link on scroll
scrollArea.addEventListener('scroll', function() {
    const scrollPosition = scrollArea.scrollTop + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionId = section.getAttribute('id');
        
        if (sectionTop <= scrollPosition && sectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') && link.getAttribute('href').substring(1) === sectionId) {
                    link.classList.add('active');
                }
            });
        }
    });
    
    // Show/hide back to top button
    if (scrollArea.scrollTop > 300) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

// Back to top functionality
backToTopButton.addEventListener('click', function() {
    scrollArea.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- Mobile Menu Toggle ---
if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        sidebar.classList.toggle('show');
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 600) {
            const isClickInsideSidebar = sidebar.contains(e.target);
            const isClickOnMenuBtn = mobileMenuBtn.contains(e.target);
            
            if (!isClickInsideSidebar && !isClickOnMenuBtn && sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
            }
        }
    });
}

// --- Code Copy Functionality ---
function addCopyButtons() {
    document.querySelectorAll('.code-block-wrapper').forEach(wrapper => {
        const header = wrapper.querySelector('.code-header');
        const codeBlock = wrapper.querySelector('.code-block');
        
        if (header && codeBlock) {
            const copyButton = document.createElement('button');
            copyButton.className = 'code-copy-btn';
            copyButton.textContent = '複製代碼';
            header.appendChild(copyButton);
            
            copyButton.addEventListener('click', function() {
                navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                    copyButton.textContent = '已複製!';
                    copyButton.classList.add('copied');
                    setTimeout(() => {
                        copyButton.textContent = '複製代碼';
                        copyButton.classList.remove('copied');
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy:', err);
                });
            });
        }
    });
}

// Initialize copy buttons when page loads
window.addEventListener('load', () => {
    addCopyButtons();
    // Trigger initial scroll event for highlighting
    scrollArea.dispatchEvent(new Event('scroll'));
});