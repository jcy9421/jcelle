document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const infoText = document.getElementById('infoText');
    const indicatorWrap = document.getElementById('indicatorWrap');
    const lerp = (a, b, t) => a + (b - a) * t;

    const w = window.innerWidth;
    const h = 600;
    canvas.width = w;
    canvas.height = h;

    const cardW = 420;
    const cardH = 680;
    const gap = 20;
    const step = cardW + gap;

    // ✅ 路径修复
    const cardList = [
        {img: "images/jd-car2.webp", text: "JDP 国际官网", link: 'jdp.html'},
        {img: "images/jd-car4.webp", text: "8020 Trade", link: 'trade.html'},
        {img: "images/jd-car5.webp", text: "Toyo tries", link: 'toyo.html'},
        {img: "images/jd-car1.webp", text: "国网无人机巡检", link: 'sgcc.html'},
        {img: "images/jd-car3.webp", text: "青春序", link: 'young.html'},
        {img: "images/jd-car7.webp", text: "Other Designs", link: 'otherD.html'}
    ];

    // 生成指示器
    indicatorWrap.innerHTML = '';
    cardList.forEach(() => {
        const span = document.createElement('span');
        span.className = "w-12 h-[2px] bg-gray-300 indicator-line";
        indicatorWrap.appendChild(span);
    });
    const indicators = document.querySelectorAll('.indicator-line');

    // ✅ 图片预加载修复（关键！）
    const imgs = [];
    let loaded = 0;
    let allLoaded = false;

    cardList.forEach((item, i) => {
        const img = new Image();
        img.src = item.img;
        img.onload = function () {
            imgs[i] = this;  // ✅ 修复
            loaded++;
            if (loaded === cardList.length) allLoaded = true;
        };
        // 加个错误提示，方便你排查
        img.onerror = () => console.log("图片加载失败：", item.img);
    });

    const totalWidth = step * cardList.length;
    let scroll = 0, targetScroll = 0;
    let isDrag = false, startX = 0;
    let mouseX = 0, mouseY = 0;
    let hoverIndex = -1;
    let hasMoved = false;
    let activeDot = 0;

    // 鼠标
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', () => {
        hoverIndex = -1;
        infoText.classList.remove('show');
    });

    // 拖拽
    canvas.addEventListener('mousedown', e => {
        isDrag = true;
        startX = e.clientX;
        hasMoved = false;
    });
    canvas.addEventListener('mousemove', e => {
        if (!isDrag) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 3) hasMoved = true;
        targetScroll -= dx;
        startX = e.clientX;
    });
    canvas.addEventListener('mouseup', () => isDrag = false);
    canvas.addEventListener('mouseleave', () => isDrag = false);

    // 触摸
    canvas.addEventListener('touchstart', e => {
        isDrag = true;
        startX = e.touches[0].clientX;
        hasMoved = false;
    });
    canvas.addEventListener('touchmove', e => {
        if (!isDrag) return;
        const dx = e.touches[0].clientX - startX;
        targetScroll -= dx;
        startX = e.touches[0].clientX;
    });
    canvas.addEventListener('touchend', () => isDrag = false);

    // 滚轮
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const speed = e.deltaY * 1.2;
        targetScroll += speed;
    });

    // 点击
    canvas.addEventListener('click', () => {
        if (!hasMoved && hoverIndex >= 0) {
            window.location.href = cardList[hoverIndex].link;
        }
    });

    // 悬浮
    function checkHover() {
        let s = scroll % totalWidth;
        if (s < 0) s += totalWidth;
        const baseY = (h - cardH) / 2;
        let currentHover = -1;

        for (let o = -1; o <= 1; o++) {
            for (let i = 0; i < cardList.length; i++) {
                const x = i * step - s + o * totalWidth;
                if (
                    mouseX >= x && mouseX <= x + cardW &&
                    mouseY >= baseY && mouseY <= baseY + cardH
                ) {
                    currentHover = i;
                }
            }
        }

        if (currentHover !== hoverIndex) {
            hoverIndex = currentHover;
            if (hoverIndex >= 0) {
                infoText.innerText = cardList[hoverIndex].text;
                infoText.classList.add('show');
            } else {
                infoText.classList.remove('show');
            }
        }
    }

    // 指示器
    function updateIndicator() {
        const centerX = w / 2;
        let minDis = Infinity;
        let nearIdx = 0;

        let s = scroll % totalWidth;
        if (s < 0) s += totalWidth;

        for (let o = -1; o <= 1; o++) {
            for (let i = 0; i < cardList.length; i++) {

                // ✅ 加入 o * totalWidth
                const x = i * step - s + o * totalWidth;

                const cardCenterX = x + cardW / 2;
                const dis = Math.abs(cardCenterX - centerX);

                if (dis < minDis) {
                    minDis = dis;
                    nearIdx = i;
                }
            }
        }

        if (nearIdx === activeDot) return;

        activeDot = nearIdx;

        indicators.forEach(el => {
            el.className = "w-12 h-[2px] bg-gray-300 indicator-line";
        });

        if (indicators[activeDot]) {
            indicators[activeDot].className =
                "w-24 h-[2px] bg-black indicator-line";
        }
    }

    // 绘制
    function draw() {
        ctx.clearRect(0, 0, w, h);
        scroll = lerp(scroll, targetScroll, 0.1);

        if (!allLoaded) {
            ctx.fillText("加载中...", 20, 40);
            requestAnimationFrame(draw);
            return;
        }

        checkHover();
        updateIndicator();

        let s = scroll % totalWidth;
        if (s < 0) s += totalWidth;
        const baseY = (h - cardH) / 2;

        for (let o = -1; o <= 1; o++) {
            for (let i = 0; i < cardList.length; i++) {
                const x = i * step - s + o * totalWidth;
                if (x + cardW < 0 || x > w) continue;

                const segments = 30;
                const segH = cardH / segments;

                for (let j = 0; j < segments; j++) {
                    const t = j / (segments - 1);
                    const curve = Math.sin(t * Math.PI) * (targetScroll - scroll) * 0.12;

                    ctx.drawImage(
                        imgs[i],
                        0, j * segH, cardW, segH,
                        x + curve, baseY + j * segH, cardW, segH + 1
                    );
                }
            }
        }
        requestAnimationFrame(draw);
    }

    draw();
});

