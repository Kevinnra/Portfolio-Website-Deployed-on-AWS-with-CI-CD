/* V3 */

function getProjectId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

function loadProject() {
  const projectId = getProjectId();

  if (!projectId || !projectsData[projectId]) {
    document.body.innerHTML = `
      <div style="text-align:center;padding:100px 20px;color:var(--text-color);">
        <h1 style="font-family:var(--Kanit);margin-bottom:1rem;">Project Not Found</h1>
        <p>The requested project does not exist.</p>
        <a href="/index.html#projects" class="btn btn-primary" style="display:inline-block;margin-top:20px;">Back to Projects</a>
      </div>
    `;
    return;
  }

  const project = projectsData[projectId];

  // ── Meta & nav ────────────────────────────────────────────
  document.title = `${project.title} - Kevinn Ramirez`;
  document.getElementById('page-title').textContent = `${project.title} - Kevinn Ramirez`;
  document.getElementById('breadcrumb-title').textContent = project.title;

  // ── Hero ──────────────────────────────────────────────────
  document.getElementById('project-title').textContent = project.title;
  document.getElementById('project-tagline').textContent = project.tagline;

  document.getElementById('project-badges').innerHTML = project.badges
    .map(badge => `<span class="tech-badge">${badge}</span>`)
    .join('');

  if (project.links.github) {
    const el = document.getElementById('github-link');
    const elBottom = document.getElementById('github-link-bottom');
    el.href = project.links.github;
    el.style.display = 'inline-flex';
    elBottom.href = project.links.github;
    elBottom.style.display = 'inline-block';
  }

  if (project.links.demo) {
    const el = document.getElementById('demo-link');
    el.href = project.links.demo;
    el.style.display = 'inline-flex';
  }

  // ── Architecture (same targets as before) ─────────────────
  const archImage = document.getElementById('architecture-image');
  archImage.src = project.architecture.image;
  archImage.alt = `${project.title} Architecture`;
  document.getElementById('architecture-description').textContent = project.architecture.description;
  setupLightbox(archImage);

  // ── Metrics (card style, unchanged) ───────────────────────
  document.getElementById('metrics-grid').innerHTML = project.metrics
    .map(metric => `
      <div class="metric-card">
        <div class="metric-number">${metric.value}</div>
        <div class="metric-label">${metric.label}</div>
      </div>
    `)
    .join('');

  // ── Build blog-style article HTML ─────────────────────────
  let html = '';

  // Overview
  html += `
    <section id="overview">
      <h2>Overview</h2>
      <p>${project.overview.problem}</p>
      <p>${project.overview.solution}</p>
      <ul>
        ${project.overview.results.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </section>
  `;

  // Technical Details (optional)
  if (project.technicalDetails && project.technicalDetails.length > 0) {
    html += `
      <section id="technical-details">
        <h2>Technical Details</h2>
        ${project.technicalDetails.map(tech => `
          <h3>${tech.service}</h3>
          <p>${tech.details}</p>
        `).join('')}
      </section>
    `;
  }

  // Features (optional)
  if (project.features && project.features.length > 0) {
    html += `
      <section id="features">
        <h2>Features</h2>
        ${project.features.map(f => `
          <h3>${f.title}</h3>
          <p>${f.description}</p>
        `).join('')}
      </section>
    `;
  }

  // Challenges
  if (project.challenges && project.challenges.length > 0) {
    html += `
      <section id="challenges">
        <h2>Problems I Ran Into</h2>
        ${project.challenges.map((challenge, i) => {
          let c = `
            <p class="challenge-label">Challenge ${i + 1}</p>
            <h3>${challenge.title}</h3>
            <div class="challenge-problem">
              <p><strong>Problem:</strong> ${challenge.problem}</p>
            </div>
            <div class="challenge-solution">
              <p><strong>Solution:</strong> ${challenge.solution}</p>
            </div>
          `;
          if (challenge.code) {
            c += `
              <div class="code-block">
                <span class="code-lang">${challenge.code.language}</span>
                <button class="copy-btn">copy</button>
                <pre><code class="language-${challenge.code.language}">${escapeHtml(challenge.code.content)}</code></pre>
              </div>
            `;
          }
          if (challenge.benefits && challenge.benefits.length > 0) {
            c += `<ul>${challenge.benefits.map(b => `<li>${b}</li>`).join('')}</ul>`;
          }
          return c;
        }).join('')}
      </section>
    `;
  }

  // Code Deep Dive (optional)
  if (project.codeBlocks && project.codeBlocks.length > 0) {
    html += `
      <section id="code-deep-dive">
        <h2>Code Deep Dive</h2>
        ${project.codeBlocks.map(block => `
          <h3>${block.title}</h3>
          <div class="code-block">
            <span class="code-lang">${block.language}</span>
            <button class="copy-btn">copy</button>
            <pre><code class="language-${block.language}">${escapeHtml(block.code)}</code></pre>
          </div>
        `).join('')}
      </section>
    `;
  }

  // Cost Breakdown (optional)
  if (project.costBreakdown) {
    const cb = project.costBreakdown;
    html += `
      <section id="cost-breakdown">
        <h2>Cost Breakdown</h2>
        <p class="cost-intro">${cb.intro}</p>
        <div class="cost-table-wrap">
          <table class="cost-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Est. Monthly Cost</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              ${cb.items.map(item => `
                <tr>
                  <td class="cost-service">${item.service}</td>
                  <td class="cost-value">${item.cost}</td>
                  <td class="cost-note">${item.note}</td>
                </tr>
              `).join('')}
              <tr class="cost-total-row">
                <td><strong>Total</strong></td>
                <td><strong>${cb.total}</strong></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        ${(cb.footer || cb.note) ? `<p class="cost-footer">${cb.footer || cb.note}</p>` : ''}
      </section>
    `;
  }

  // Lessons Learned
  if (project.lessons && project.lessons.length > 0) {
    html += `
      <section id="lessons">
        <h2>What I Learned</h2>
        <ol class="lessons-list">
          ${project.lessons.map((l, i) => `
            <li class="lesson-item">
              <span class="lesson-num">${String(i + 1).padStart(2, '0')}</span>
              <p>${l}</p>
            </li>
          `).join('')}
        </ol>
      </section>
    `;
  }

  document.getElementById('article-content').innerHTML = html;

  if (typeof Prism !== 'undefined') Prism.highlightAll();

  buildTOC();
  initIntersectionObserver();
  initCopyButtons();
  initMobileTOC();
}

// ── Scroll with sticky-nav offset ────────────────────────────
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const nav = document.querySelector('.sticky-nav-bread');
  const mobileBar = document.querySelector('.mobile-author-bar');

  let offset = nav ? nav.offsetHeight : 0;

  // On mobile the author bar is also sticky, add its height too
  if (mobileBar && getComputedStyle(mobileBar).display !== 'none') {
    offset += mobileBar.offsetHeight;
  }

  const top = el.getBoundingClientRect().top + window.scrollY - offset - 12;
  window.scrollTo({ top, behavior: 'smooth' });
}

// ── TOC ───────────────────────────────────────────────────────
function buildTOC() {
  const article = document.getElementById('article-content');
  const tocList = document.getElementById('toc-list');
  const drawerList = document.getElementById('toc-drawer-list');
  if (!article || !tocList) return;

  const headings = article.querySelectorAll('h2');
  const items = [];

  // Prepend Architecture section (lives outside the article)
  const archHeading = document.getElementById('architecture-heading');
  if (archHeading) {
    items.push({ id: 'architecture-heading', text: 'Architecture' });
  }

  headings.forEach(h2 => {
    if (!h2.id) {
      h2.id = h2.textContent.trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    }
    items.push({ id: h2.id, text: h2.textContent });
  });

  const buildItems = (list) => {
    list.innerHTML = items
      .map(item => `<li><a href="#${item.id}" class="toc-item" data-target="${item.id}">${item.text}</a></li>`)
      .join('');

    list.querySelectorAll('.toc-item').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        scrollToSection(link.dataset.target);
      });
    });
  };

  buildItems(tocList);
  if (drawerList) buildItems(drawerList);
}

// ── IntersectionObserver — active TOC item ────────────────────
function initIntersectionObserver() {
  // Watch article h2s + the architecture heading outside the article
  const headings = [
    ...document.querySelectorAll('#article-content h2'),
    document.getElementById('architecture-heading'),
  ].filter(Boolean);
  if (!headings.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.toc-item').forEach(link => {
          link.classList.toggle('active', link.dataset.target === entry.target.id);
        });
      }
    });
  }, { threshold: 0.2 });

  headings.forEach(h => observer.observe(h));
}

// ── Copy buttons ──────────────────────────────────────────────
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pre = btn.parentElement.querySelector('pre');
      if (!pre) return;
      navigator.clipboard.writeText(pre.textContent).then(() => {
        btn.textContent = 'copied!';
        setTimeout(() => { btn.textContent = 'copy'; }, 2000);
      });
    });
  });
}

// ── Mobile TOC drawer ─────────────────────────────────────────
function initMobileTOC() {
  const floatBtn = document.getElementById('toc-float-btn');
  const drawer   = document.getElementById('toc-drawer');
  const overlay  = document.getElementById('toc-drawer-overlay');
  const closeBtn = document.getElementById('toc-drawer-close');
  if (!floatBtn || !drawer) return;

  const open  = () => { drawer.classList.add('open'); overlay.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = () => { drawer.classList.remove('open'); overlay.classList.remove('open'); document.body.style.overflow = ''; };

  floatBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);
  drawer.querySelectorAll('.toc-item').forEach(l => l.addEventListener('click', close));
}

// ── Lightbox ──────────────────────────────────────────────────
function setupLightbox(imageElement) {
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lightbox-image');
  const lbCaption = document.getElementById('lightbox-caption');
  const closeBtn  = document.querySelector('.lightbox-close');

  imageElement.onclick = function () {
    lightbox.style.display = 'block';
    lbImg.src = this.src;
    lbCaption.textContent = this.alt;
  };

  closeBtn.onclick = () => { lightbox.style.display = 'none'; };

  lightbox.onclick = e => {
    if (e.target === lightbox) lightbox.style.display = 'none';
  };

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.style.display === 'block') {
      lightbox.style.display = 'none';
    }
  });
}

// ── HTML escape for code blocks ───────────────────────────────
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', loadProject);
