// 검색 기능

(function () {
  'use strict';

  let searchPosts = []; // 검색용 게시글 데이터
  let allTags = new Set(); // 모든 태그 집합

  // 검색어로 게시글 필터링
  function filterPosts(query) {
    if (!query || query.trim() === '') {
      return searchPosts;
    }

    const lowerQuery = query.toLowerCase().trim();
    return searchPosts.filter((post) => {
      const titleMatch = post.title.toLowerCase().includes(lowerQuery);
      const excerptMatch = post.excerpt.toLowerCase().includes(lowerQuery);
      const tagMatch = post.tags.some((tag) =>
        tag.toLowerCase().includes(lowerQuery)
      );
      return titleMatch || excerptMatch || tagMatch;
    });
  }

  // 검색 결과 하이라이팅
  function highlightText(text, query) {
    if (!query || query.trim() === '') {
      return text;
    }

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // 검색 실행
  function performSearch(query) {
    const filtered = filterPosts(query);
    const event = new CustomEvent('searchResults', {
      detail: { posts: filtered, query: query },
    });
    document.dispatchEvent(event);
  }

  // 검색 입력 이벤트 리스너
  function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) {
      return;
    }

    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch(e.target.value);
      }, 300); // 디바운싱
    });

    // Enter 키로 즉시 검색
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        clearTimeout(searchTimeout);
        performSearch(e.target.value);
      }
    });
  }

  // 게시글 데이터 설정 (app.js에서 호출)
  function setPosts(posts) {
    searchPosts = posts;
    allTags.clear();
    posts.forEach((post) => {
      post.tags.forEach((tag) => allTags.add(tag));
    });
  }

  // 태그 목록 가져오기
  function getTags() {
    return Array.from(allTags).sort();
  }

  // 전역 함수로 노출
  window.searchModule = {
    setPosts: setPosts,
    getTags: getTags,
    filterPosts: filterPosts,
    highlightText: highlightText,
  };

  // 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();

