// 다크/라이트 모드 토글 기능

(function () {
  'use strict';

  const THEME_KEY = 'blog-theme';
  const THEME_ATTRIBUTE = 'data-theme';

  // 시스템 설정 감지
  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  // 저장된 테마 또는 시스템 설정 가져오기
  function getStoredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    return getSystemTheme();
  }

  // 테마 적용
  function applyTheme(theme) {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  // 테마 토글
  function toggleTheme() {
    const currentTheme = getStoredTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  }

  // 초기화
  function initTheme() {
    const theme = getStoredTheme();
    applyTheme(theme);

    // 테마 토글 버튼 이벤트 리스너
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    // 시스템 테마 변경 감지
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        // 저장된 테마가 없을 때만 시스템 설정 따르기
        if (!localStorage.getItem(THEME_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
  }

  // DOM 로드 완료 시 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
})();

