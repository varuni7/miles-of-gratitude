function showTab(name) {
  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.remove('active');
  });

  document.querySelectorAll('.nav-link').forEach(el => {
    el.classList.remove('active');
  });

  const tab = document.getElementById('tab-' + name);
  if (tab) tab.classList.add('active');

  const navLinks = document.querySelectorAll('.nav-link');
  const tabIndex = { home: 0, find: 1, write: 2 };
  const idx = tabIndex[name];
  if (navLinks[idx] !== undefined) navLinks[idx].classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── RUNS FROM GOOGLE SHEET ──────────────────────────────────
// Paste your published CSV URL here after setup (see instructions below)
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQhcsVdrhWlDV1hsGqnkpSkomdOGMF63_vdGH5tJ48ATpPqV7Ukvgib16adaA0dPO8zhMB8y5YzhwM0/pub?output=csv';

async function loadRuns() {
  const container = document.getElementById('runs-container');
  if (!container) return;

  if (!SHEET_CSV_URL) {
    container.innerHTML = fallbackRunCard();
    return;
  }

  try {
    const res = await fetch(SHEET_CSV_URL);
    const text = await res.text();
    const rows = parseCSV(text);
    const active = rows.filter(r => r.active && r.active.toLowerCase() === 'yes');

    if (active.length === 0) {
      container.innerHTML = '<p style="color:#888;font-style:italic;">No upcoming runs at the moment. Check back soon.</p>';
      return;
    }

    container.innerHTML = active.map(run => `
      <div class="run-card">
        <h3>${run.city}${run.neighborhood ? ' – ' + run.neighborhood : ''}</h3>
        <div class="run-meta">
          <span>📅 ${run.date}</span>
          <span>⏰ ${run.time}${run.timezone ? ' ' + run.timezone : ''}</span>
          <span>📍 ${run.location}</span>
          <span>~${run.distance}</span>
        </div>
        <p>${run.description || 'This run will move through nearby streets and pause at sanitation worker assembly points to offer chocolates and sweets.'}</p>
        ${run.whatsapp
          ? `<a class="btn" href="${run.whatsapp}" target="_blank" rel="noopener">Join WhatsApp Group</a>`
          : `<button class="btn" onclick="showTab('write')">Join This Run</button>`
        }
      </div>
    `).join('');

  } catch (err) {
    container.innerHTML = fallbackRunCard();
  }
}

function fallbackRunCard() {
  return `
    <div class="run-card">
      <h3>Bangalore – BTM Layout</h3>
      <div class="run-meta">
        <span>📅 March 8</span>
        <span>⏰ 6:00 AM</span>
        <span>📍 Udupi Garden Park</span>
        <span>~7 km</span>
      </div>
      <p>This run will move through nearby streets and pause at sanitation worker assembly points to offer chocolates and sweets.</p>
      <button class="btn" onclick="showTab('write')">Join This Run</button>
    </div>`;

}

function parseCSV(text) {
  const [headerLine, ...lines] = text.trim().split('\n');
  const headers = headerLine.split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, ''));
  return lines
    .filter(l => l.trim())
    .map(line => {
      const vals = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|^(?=,)|(?<=,)$)/g) || [];
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = (vals[i] || '').replace(/^"|"$/g, '').trim();
      });
      return obj;
    });
}

document.addEventListener('DOMContentLoaded', loadRuns);
