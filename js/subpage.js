window.addEventListener('load', () => {
    document.body.classList.add('ani-open');
    setTimeout(() => {
        const cover = document.getElementById('pageCover');
        if (cover) {
            cover.style.opacity = 0;
            setTimeout(() => cover.remove(), 600);
        }
    }, 300);
});



window.addEventListener('scroll', () => {
    if (typeof updateVideo === 'function' && !ticking) {
        window.requestAnimationFrame(updateVideo);
        ticking = true;
    }
});

// 视差文字
(function() {
    const text = document.getElementById('parallaxText');
    const img = document.getElementById('appImage');

    // 关键：不存在直接跳过整个代码
    if (!text || !img) {
        return;
    }

    const parent = text.parentElement;
    const slowFactor = 0.6;

    function rafLoop() {
        const winHeight = window.innerHeight;
        const parentRect = parent.getBoundingClientRect();
        const imgHeight = img.offsetHeight;
        const textHeight = text.offsetHeight;
        const scrollProgress = Math.min(1, Math.max(0, (-parentRect.top) / (parent.offsetHeight - winHeight)));
        const maxMove = imgHeight - textHeight;
        const y = scrollProgress * maxMove * slowFactor;
        text.style.transform = `translate3d(0, ${y}px, 0)`;
        requestAnimationFrame(rafLoop);
    }
    rafLoop();
})();

// 图片缩放
const images = document.querySelectorAll('.scroll-scale-img');
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const scrollPercent = Math.min(1, scrollTop / (docHeight - windowHeight));
    const scale = 1 + scrollPercent * 0.1;
    images.forEach(img => {
        img.style.transform = `scale(${scale})`;
    });
});

// 图片从上往下展开动画
document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('.image-container');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, {threshold: 0.15});
    containers.forEach(el => observer.observe(el));
});

// 返回顶部
const backToTopBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
});
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
});

document.addEventListener('DOMContentLoaded', function () {
    const elements = document.querySelectorAll('.hover-letter-animate');

    elements.forEach(el => {
        const text = el.textContent;
        let newHTML = '';

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === ' ') {
                newHTML += ' ';
            } else {
                newHTML += `<span>${char}</span>`;
            }
        }

        el.innerHTML = newHTML;
    });
});


gsap.registerPlugin(ScrollTrigger);

gsap.to(".gaobi-img", {
    scale: 1.08,
    ease: "none",
    scrollTrigger: {
        trigger: ".gaobi",
        start: "top 50%",
        end: "bottom top",
        scrub: true
    }
});
