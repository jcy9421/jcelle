const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const infoText = document.getElementById('infoText');
const indicatorWrap = document.getElementById('indicatorWrap');
const lerp = (a,b,t)=>a+(b-a)*t;

const w = window.innerWidth;
const h = 600;
canvas.width = w;
canvas.height = h;

const cardW = 420;
const cardH = 680;
const gap = 20;
const step = cardW + gap;

// 图片数组
const cardList = [
    { img: "./images/jd-car2.jpg", text: "JDP 国际官网", link:'jdp.html' },
    { img: "./images/jd-car4.png", text: "8020 Trade", link:'trade.html' },
    { img: "./images/jd-car5.png", text: "Toyo tries", link:'toyo.html' },
    { img: "./images/jd-car1.png", text: "国网无人机巡检", link:'gaobi.html' },
    { img: "./images/jd-car3.png", text: "青春序", link:'jdp.html' },
    { img: "./images/jd-car7.png", text: "Other Design", link:'jdp.html' }
];

// 自动生成指示器
indicatorWrap.innerHTML = '';
cardList.forEach(() => {
    const span = document.createElement('span');
    span.className = "w-12 h-[2px] bg-gray-300 indicator-line";
    indicatorWrap.appendChild(span);
});
const indicators = document.querySelectorAll('.indicator-line');

// 预加载
const imgs = [];
let loaded = 0;
let allLoaded = false;
cardList.forEach((item,i)=>{
    const img = new Image();
    img.src = item.img;
    img.onload = ()=>{
        imgs[i] = img;
        loaded++;
        if(loaded === cardList.length) allLoaded = true;
    };
});

const totalWidth = step * cardList.length;
let scroll = 0, targetScroll = 0;
let isDrag = false, startX = 0;
let mouseX = 0, mouseY = 0;
let hoverIndex = -1;
let hasMoved = false;
let activeDot = 0;

// 鼠标位置
canvas.addEventListener('mousemove',e=>{
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});
canvas.addEventListener('mouseleave',()=>{
    hoverIndex = -1;
    infoText.classList.remove('show');
});

// 拖拽滑动
canvas.addEventListener('mousedown',e=>{
    isDrag = true;
    startX = e.clientX;
    hasMoved = false;
});
canvas.addEventListener('mousemove',e=>{
    if(!isDrag) return;
    const dx = e.clientX - startX;
    if(Math.abs(dx) > 3) hasMoved = true;

    targetScroll -= dx;
    startX = e.clientX;
});
canvas.addEventListener('mouseup',()=>isDrag=false);
canvas.addEventListener('mouseleave',()=>isDrag=false);

// 移动端触摸支持
canvas.addEventListener('touchstart',e=>{
    isDrag = true;
    startX = e.touches[0].clientX;
    hasMoved = false;
});
canvas.addEventListener('touchmove',e=>{
    if(!isDrag) return;
    const dx = e.touches[0].clientX - startX;
    targetScroll -= dx;
    startX = e.touches[0].clientX;
});
canvas.addEventListener('touchend',()=>isDrag=false);

// ==============================================
// 鼠标滚轮控制滑动
// ==============================================
canvas.addEventListener('wheel', (e) => {
    e.preventDefault(); // 禁止页面滚动
    // 滚轮速度，可自行调整大小
    const speed = e.deltaY * 1.2;
    targetScroll += speed;
});

// 点击跳转
canvas.addEventListener('click', () => {
    if (!hasMoved && hoverIndex >= 0) {
        window.location.href = cardList[hoverIndex].link;
    }
});

// 悬浮检测
function checkHover(){
    let s = scroll % totalWidth;
    if(s < 0) s += totalWidth;
    const baseY = (h - cardH) / 2;
    let currentHover = -1;

    for(let o=-1;o<=1;o++){
        for(let i=0;i<cardList.length;i++){
            const x = i * step - s + o * totalWidth;
            if(
                mouseX >= x && mouseX <= x + cardW &&
                mouseY >= baseY && mouseY <= baseY + cardH
            ){
                currentHover = i;
            }
        }
    }

    if(currentHover !== hoverIndex){
        hoverIndex = currentHover;
        if(hoverIndex >= 0){
            infoText.innerText = cardList[hoverIndex].text;
            infoText.classList.add('show');
        }else{
            infoText.classList.remove('show');
        }
    }
}

// 指示器更新
function updateIndicator() {
    let centerX = w / 2;
    let minDis = Infinity;
    let nearIdx = 0;
    let s = scroll % totalWidth;
    if(s < 0) s += totalWidth;

    for(let i=0; i<cardList.length; i++){
        let x = i * step - s;
        let cardCenterX = x + cardW/2;
        let dis = Math.abs(cardCenterX - centerX);
        if(dis < minDis){
            minDis = dis;
            nearIdx = i;
        }
    }

    if(nearIdx === activeDot) return;
    activeDot = nearIdx;

    indicators.forEach(el => {
        el.className = "w-12 h-[2px] bg-gray-300 indicator-line";
    });
    if(indicators[activeDot]){
        indicators[activeDot].className = "w-24 h-[2px] bg-black indicator-line";
    }
}

// 绘制主函数
function draw(){
    ctx.clearRect(0,0,w,h);

    // 平滑滚动
    scroll = lerp(scroll, targetScroll, 0.1);

    // 只在加载完成后绘制
    if(!allLoaded) {
        requestAnimationFrame(draw);
        return;
    }

    checkHover();
    updateIndicator();

    let s = scroll % totalWidth;
    if(s < 0) s += totalWidth;
    const baseY = (h - cardH) / 2;

    // 绘制循环卡片
    for(let o=-1;o<=1;o++){
        for(let i=0;i<cardList.length;i++){
            const x = i*step - s + o*totalWidth;

            // 性能优化：跳过屏幕外的卡片
            if(x + cardW < 0 || x > w) continue;

            // 弯曲拖拽动画
            const segments=30;
            const segH=cardH/segments;

            for(let j=0;j<segments;j++){
                const t = j/(segments-1);
                const curve = Math.sin(t*Math.PI) * (targetScroll - scroll) * 0.12;

                ctx.drawImage(
                    imgs[i],
                    0, j*segH, cardW, segH,
                    x+curve, baseY+j*segH, cardW, segH+1
                );
            }
        }
    }
    requestAnimationFrame(draw);
}
draw();

// 👇 这一行是关键！保证 DOM 加载完再执行所有代码
document.addEventListener('DOMContentLoaded', function() {

    // ========================
    // 把你所有代码粘贴在这里
    // ========================

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

    // 视频滚动控制
    const video = document.getElementById('scrollVideo');
    if(video) {
        video.pause();
        video.currentTime = 0;
    }
    let ticking = false;

    function updateVideo() {
        if(!video) return;
        const rect = video.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const videoHeight = video.offsetHeight;
        const start = windowHeight;
        const end = -videoHeight;
        const distance = start - end;
        const offset = start - rect.top;

        if (offset > 0 && offset < distance) {
            const progress = offset / distance;
            if (video.duration) {
                video.currentTime = video.duration * progress;
            }
        }
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateVideo);
            ticking = true;
        }
    });

    // 视差文字
    const text = document.getElementById('parallaxText');
    const img = document.getElementById('appImage');
    let parent;
    if(text) parent = text.parentElement;
    const slowFactor = 0.6;

    function rafLoop() {
        if(!text || !parent || !img) {
            requestAnimationFrame(rafLoop);
            return;
        }
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
    const containers = document.querySelectorAll('.image-container');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, {threshold: 0.15});
    containers.forEach(el => observer.observe(el));

    // 返回顶部
    const backToTopBtn = document.getElementById('backToTop');
    if(backToTopBtn) {
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
    }

    // 文字hover动画
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
// 👆 结束 DOMContentLoaded 包裹

