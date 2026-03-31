const API_BASE = 'http://localhost:8080/api';
const WHATSAPP_NUMBER = '573017505646';
document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initNavbar();
    initScrollAnimations();
    initCounters();
    initForm();
});

function initLoader() {
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => loader.classList.add('hidden'), 800);
    });
    setTimeout(() => loader.classList.add('hidden'), 3000);
}


function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = navLinks.querySelector(`a[href="#${id}"]`);
            if (link) {
                link.classList.toggle('active', scrollY >= top && scrollY < top + height);
            }
        });
    });
}
function initScrollAnimations() {
    const elements = document.querySelectorAll(
        '.service-card, .console-item, .process-step, .testimonial-card, .info-card'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(el => observer.observe(el));
}
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 2000;
    const start = performance.now();

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = target;
        }
    }

    requestAnimationFrame(update);
}
function initForm() {
    const form = document.getElementById('repairForm');
    const message = document.getElementById('formMessage');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
        btn.disabled = true;

        const formData = {
            nombre: form.nombre.value.trim(),
            telefono: form.telefono.value.trim(),
            email: form.email.value.trim(),
            consola: form.consola.value,
            problema: form.problema.value.trim()
        };
        const mensajeWA = encodeURIComponent(
`Hola, quiero solicitar una reparación:

👤 Nombre: ${formData.nombre}
📱 Teléfono: ${formData.telefono}
📧 Correo: ${formData.email}
🎮 Servicio: ${formData.consola}
🛠️ Problema: ${formData.problema}`
        );

        const whatsappURL = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${mensajeWA}`;

        try {
            const response = await fetch(`${API_BASE}/reparaciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Backend no disponible');
            }

            const data = await response.json();

            message.className = 'form-message success';
            message.textContent = `¡Solicitud enviada! Código: ${data.codigo}`;

            form.reset();


            window.open(whatsappURL, '_blank');

        } catch (error) {
            message.className = 'form-message success';
            message.textContent = 'Redirigiendo a WhatsApp...';

            form.reset();

            setTimeout(() => {
                window.open(whatsappURL, '_blank');
            }, 800);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;

            setTimeout(() => {
                message.className = 'form-message';
            }, 6000);
        }
    });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
