/* 主题初始化：在页面渲染前同步执行，避免主题闪烁 */
try {
    document.documentElement.dataset.theme = localStorage.getItem('ake-theme') || 'dark';
} catch (e) {
    document.documentElement.dataset.theme = 'dark';
}
