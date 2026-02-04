// 메인 애플리케이션 로직

(function () {
  'use strict';

  let allPosts = []; // 게시글 목록
  let filteredPosts = []; // 필터링된 게시글 목록
  let activeTag = null; // 현재 선택된 태그

  // posts.json 로드
  async function loadPosts() {
    try {
      const response = await fetch('posts.json');
      if (!response.ok) {
        throw new Error('posts.json을 불러올 수 없습니다.');
      }
      const posts = await response.json();
      allPosts = posts;
      filteredPosts = posts;

      // 검색 모듈에 게시글 데이터 전달
      if (window.searchModule) {
        window.searchModule.setPosts(posts);
      }

      renderPosts();
      renderTagFilter();
    } catch (error) {
      console.error('게시글 로드 실패:', error);
      renderError();
    }
  }

  // 게시글 목록 렌더링
  function renderPosts() {
    const postsList = document.getElementById('posts-list');
    if (!postsList) {
      return;
    }

    if (filteredPosts.length === 0) {
      postsList.innerHTML = `
        <li class="empty-state">
          <p>게시글이 없습니다.</p>
        </li>
      `;
      return;
    }

    postsList.innerHTML = filteredPosts
      .map((post) => {
        const date = new Date(post.date).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        const tagsHtml = post.tags
          .map(
            (tag) =>
              `<a href="#" class="post-tag" data-tag="${tag}">${tag}</a>`
          )
          .join('');

        return `
        <li class="post-item">
          <h2><a href="post.html?file=${encodeURIComponent(post.file)}">${post.title}</a></h2>
          <div class="post-meta">
            <span>${date}</span>
            ${post.category ? `<span>${post.category}</span>` : ''}
          </div>
          ${tagsHtml ? `<div class="post-tags">${tagsHtml}</div>` : ''}
          <p class="post-excerpt">${post.excerpt}</p>
        </li>
      `;
      })
      .join('');

    // 태그 클릭 이벤트 리스너
    postsList.querySelectorAll('.post-tag').forEach((tagLink) => {
      tagLink.addEventListener('click', (e) => {
        e.preventDefault();
        const tag = tagLink.getAttribute('data-tag');
        filterByTag(tag);
      });
    });
  }

  // 태그 필터 렌더링
  function renderTagFilter() {
    const tagFilter = document.getElementById('tag-filter');
    if (!tagFilter || !window.searchModule) {
      return;
    }

    const tags = window.searchModule.getTags();
    if (tags.length === 0) {
      tagFilter.innerHTML = '';
      return;
    }

    tagFilter.innerHTML = `
      <button class="tag-btn ${activeTag === null ? 'active' : ''}" data-tag="">
        전체
      </button>
      ${tags
        .map(
          (tag) =>
            `<button class="tag-btn ${
              activeTag === tag ? 'active' : ''
            }" data-tag="${tag}">${tag}</button>`
        )
        .join('')}
    `;

    // 태그 버튼 클릭 이벤트
    tagFilter.querySelectorAll('.tag-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tag = btn.getAttribute('data-tag');
        filterByTag(tag || null);
      });
    });
  }

  // 태그로 필터링
  function filterByTag(tag) {
    activeTag = tag;
    if (tag === null || tag === '') {
      filteredPosts = allPosts;
    } else {
      filteredPosts = allPosts.filter((post) => post.tags.includes(tag));
    }
    renderPosts();
    renderTagFilter();
  }

  // 검색 결과 처리
  function handleSearchResults(event) {
    const { posts, query } = event.detail;
    filteredPosts = posts;
    activeTag = null; // 검색 시 태그 필터 초기화
    renderPosts();
    renderTagFilter();
  }

  // 에러 렌더링
  function renderError() {
    const postsList = document.getElementById('posts-list');
    if (postsList) {
      postsList.innerHTML = `
        <li class="empty-state">
          <p>게시글을 불러오는 중 오류가 발생했습니다.</p>
        </li>
      `;
    }
  }

  // 초기화
  function init() {
    loadPosts();

    // 검색 결과 이벤트 리스너
    document.addEventListener('searchResults', handleSearchResults);
  }

  // DOM 로드 완료 시 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

