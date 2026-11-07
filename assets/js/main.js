/* 页面交互：主题切换、自定义光标、卡片聚光、时钟、数字键跳转、占位提示 */
const cardEls = [...document.querySelectorAll('.card')];

/* 白天 / 夜间模式 */
const rootEl = document.documentElement;
const themeBtn = document.getElementById('themeToggle');
const syncThemeBtn = () => {
    themeBtn.setAttribute('aria-pressed', String(rootEl.dataset.theme === 'light'));
};
syncThemeBtn();
themeBtn.addEventListener('click', () => {
    const next = rootEl.dataset.theme === 'light' ? 'dark' : 'light';
    rootEl.dataset.theme = next;
    try {
        localStorage.setItem('ake-theme', next);
    } catch (e) {}
    syncThemeBtn();
});

/* 光标 */
const cursor = document.querySelector('.cursor');
if (window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('pointermove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    cardEls.forEach((card) => {
        card.addEventListener('pointerenter', () => cursor.classList.add('is-hot'));
        card.addEventListener('pointerleave', () => cursor.classList.remove('is-hot'));
    });
}

/* 卡片内的鼠标聚光 */
cardEls.forEach((card) => {
    card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
});

/* 时钟 */
const clock = document.getElementById('clock');
const tick = () => {
    clock.textContent = new Date().toLocaleTimeString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        hour12: false,
    });
};
tick();
setInterval(tick, 1000);

document.getElementById('year').textContent = new Date().getFullYear();

/* 运行时长：固定起点 2024-05-01 00:00（UTC+8），按“年 / 月 / 天”显示，跨设备一致 */
const UPTIME_START = Date.UTC(2024, 3, 30, 16, 0, 0); // = 2024-05-01T00:00:00+08:00
const uptimeEl = document.getElementById('uptime');

/* 取北京时间的年月日，避免访客所在时区影响结果 */
const shanghaiYMD = (date) => {
    const s = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
    return s.split('-').map(Number); // [年, 月, 日]
};
const START_YMD = shanghaiYMD(new Date(UPTIME_START));
const daysInMonth = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate(); // m 月（1-12）的天数

const tickUptime = () => {
    const [ny, nm, nd] = shanghaiYMD(new Date());
    let years = ny - START_YMD[0];
    let months = nm - START_YMD[1];
    let days = nd - START_YMD[2];

    /* 日不足时向前借一个月，月不足时向前借一年 */
    if (days < 0) {
        months -= 1;
        const prevY = nm === 1 ? ny - 1 : ny;
        const prevM = nm === 1 ? 12 : nm - 1;
        days += daysInMonth(prevY, prevM);
    }
    if (months < 0) {
        years -= 1;
        months += 12;
    }
    if (years < 0) {
        years = 0;
        months = 0;
        days = 0;
    }

    const parts = [];
    if (years) parts.push(years + '年');
    if (months) parts.push(months + '月');
    if (days || !parts.length) parts.push(days + '天');

    uptimeEl.textContent = parts.join('');
    uptimeEl.title = `自 2024-05-01 起持续在线 · ${years} 年 ${months} 个月 ${days} 天`;
};
tickUptime();
setInterval(tickUptime, 60000);

/* 提示 */
let toastTimer;
const toast = document.getElementById('toast');
const showToast = () => {
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2200);
};

/* 数字键 1—6 跳转 */
document.addEventListener('keydown', (e) => {
    const i = Number(e.key);
    if (!Number.isInteger(i) || i < 1 || i > 6) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const card = cardEls[i - 1];
    if (!card) return;
    const href = card.getAttribute('href');
    if (href && href !== '#') window.open(href, '_blank');
    else showToast();
});

/* 未配置地址时的占位提示 */
cardEls.forEach((card) => {
    card.addEventListener('click', (e) => {
        if (card.getAttribute('href') === '#') {
            e.preventDefault();
            showToast();
        }
    });
});
