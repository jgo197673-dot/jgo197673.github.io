// 게시글 상세 페이지 로더

(function () {
  'use strict';

  // URL에서 파일명 가져오기
  function getPostFile() {
    const params = new URLSearchParams(window.location.search);
    return params.get('file');
  }

  // Front Matter 파싱
  function parseFrontMatter(content) {
    // UTF-8 BOM 제거 (Windows 호환)
    if (content.charCodeAt(0) === 0xfeff) {
      content = content.slice(1);
    }

    // Front Matter 파싱 (Windows 줄바꿈 지원)
    const frontMatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    let metadata = {};
    let postContent = content;

    if (frontMatterMatch) {
      const frontMatter = frontMatterMatch[1];
      postContent = frontMatterMatch[2];

      // Front Matter 라인 파싱 (Windows 줄바꿈 지원)
      const lines = frontMatter.split(/\r?\n/);
      lines.forEach((line) => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          let value = line.substring(colonIndex + 1).trim();

          // 따옴표 제거
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }

          // 배열 파싱 (tags)
          if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
            try {
              value = JSON.parse(value);
            } catch {
              value = value
                .slice(1, -1)
                .split(',')
                .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ''));
            }
          }

          metadata[key] = value;
        }
      });
    }

    return { metadata, content: postContent };
  }

  // 마크다운을 HTML로 변환
  function renderMarkdown(content) {
    if (typeof marked === 'undefined') {
      return '<p>마크다운 파서를 불러올 수 없습니다.</p>';
    }

    // marked.js 설정
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    return marked.parse(content);
  }

  // 코드 하이라이팅 적용
  function highlightCode() {
    if (typeof Prism !== 'undefined') {
      Prism.highlightAll();
    }
  }

  // Giscus 댓글 시스템 로드
  function loadGiscus() {
    const commentsContainer = document.getElementById('comments-container');
    if (!commentsContainer) {
      return;
    }

    // 이미 로드된 경우 스킵
    if (document.querySelector('script[src*="giscus"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'jgo197673/jgo197673.github.io');
    script.setAttribute('data-repo-id', 'YOUR_REPO_ID'); // giscus.app에서 가져온 값으로 변경 필요
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'YOUR_CATEGORY_ID'); // giscus.app에서 가져온 값으로 변경 필요
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '1');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'preferred_color_scheme');
    script.setAttribute('data-lang', 'ko');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    commentsContainer.appendChild(script);
  }

  // 게시글 렌더링
  function renderPost(metadata, htmlContent) {
    const postContent = document.getElementById('post-content');
    if (!postContent) {
      return;
    }

    const date = metadata.date
      ? new Date(metadata.date).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '';

    const tagsHtml = Array.isArray(metadata.tags)
      ? metadata.tags
          .map(
            (tag) =>
              `<a href="index.html" class="post-tag">${tag}</a>`
          )
          .join('')
      : '';

    postContent.innerHTML = `
      <div class="post-header">
        <h1>${metadata.title || '제목 없음'}</h1>
        <div class="post-meta">
          ${date ? `<span>${date}</span>` : ''}
          ${metadata.category ? `<span>${metadata.category}</span>` : ''}
        </div>
        ${tagsHtml ? `<div class="post-tags">${tagsHtml}</div>` : ''}
      </div>
      <div class="post-content">
        ${htmlContent}
      </div>
    `;

    // 페이지 제목 업데이트
    document.title = `${metadata.title || '게시글'} - 블로그`;

    // 코드 하이라이팅 적용
    highlightCode();

    // Giscus 로드
    loadGiscus();
  }

  // 게시글 로드
  async function loadPost() {
    const file = getPostFile();
    if (!file) {
      const postContent = document.getElementById('post-content');
      if (postContent) {
        postContent.innerHTML = `
          <div class="empty-state">
            <p>게시글 파일이 지정되지 않았습니다.</p>
          </div>
        `;
      }
      return;
    }

    try {
      const response = await fetch(`pages/${file}`);
      if (!response.ok) {
        throw new Error('게시글을 불러올 수 없습니다.');
      }

      const content = await response.text();
      const { metadata, content: postContent } = parseFrontMatter(content);
      const htmlContent = renderMarkdown(postContent);

      renderPost(metadata, htmlContent);
    } catch (error) {
      console.error('게시글 로드 실패:', error);
      const postContent = document.getElementById('post-content');
      if (postContent) {
        postContent.innerHTML = `
          <div class="empty-state">
            <p>게시글을 불러오는 중 오류가 발생했습니다.</p>
            <p style="margin-top: 0.5rem; font-size: 0.875rem;">${error.message}</p>
          </div>
        `;
      }
    }
  }

  // 초기화
  function init() {
    loadPost();
  }

  // DOM 로드 완료 시 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

