/* Camada de anotação para páginas de copy (balões). Injetada inline por motor/copy/anotar.mjs.
   Com o servidor (anotar.mjs servir) salva em <pasta>/anotacoes/<pagina>.json; sem ele, no localStorage + exportar. */
(() => {
  const pagina = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
  const chave = 'anot:' + location.pathname;
  let notas = [], servidor = false;
  const css = `.an-mark{background:#fff3a3;border-bottom:2px solid #e0b400}.an-bal{background:#fff8c4;border:1px solid #e0c200;border-radius:8px;padding:8px 10px;margin:6px 0 10px 18px;font:14px/1.4 -apple-system,Helvetica,sans-serif;color:#3a3200;position:relative;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.an-bal:before{content:"";position:absolute;left:-7px;top:12px;border:7px solid transparent;border-right-color:#e0c200;border-left:0}.an-bal q{display:block;font-style:italic;color:#6b5d00;margin-bottom:4px}
.an-bal .x{position:absolute;right:6px;top:4px;border:0;background:none;cursor:pointer;color:#8a7a00;font-size:16px}.an-bal small{color:#8a7a00}
.an-add{float:right;border:1px dashed #b9a000;background:#fffbe0;color:#6b5d00;border-radius:6px;font-size:12px;padding:1px 7px;cursor:pointer;opacity:0;transition:opacity .15s}.b:hover .an-add{opacity:1}
#an-sel{position:absolute;display:none;z-index:9;background:#0D0D0D;color:#fff;border:0;border-radius:6px;padding:5px 10px;font:13px -apple-system,sans-serif;cursor:pointer}
#an-bar{position:fixed;right:14px;bottom:14px;z-index:9;display:flex;gap:6px;font:13px -apple-system,sans-serif}#an-bar button{border:0;border-radius:8px;padding:7px 11px;cursor:pointer;background:#0D0D0D;color:#fff}#an-bar .st{background:#e9e9e9;color:#333;cursor:default}
#an-form{position:fixed;inset:0;background:rgba(0,0,0,.35);display:none;align-items:center;justify-content:center;z-index:10}#an-form div{background:#fff;border-radius:10px;padding:14px;width:min(520px,92vw)}#an-form textarea{width:100%;min-height:110px;font:15px -apple-system,sans-serif;box-sizing:border-box;margin:8px 0}`;
  document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);
  document.body.insertAdjacentHTML('beforeend', `<button id="an-sel">Anotar trecho</button><div id="an-bar"><span class="st" id="an-st"></span><button id="an-exp">Exportar</button></div><div id="an-form"><div><b>Anotação</b><q id="an-q" style="display:block;color:#666;margin-top:6px"></q><textarea id="an-t" placeholder="Sua nota sobre este trecho…"></textarea><button id="an-ok">Salvar</button> <button id="an-cn">Cancelar</button></div></div>`);
  const $ = (id) => document.getElementById(id);
  const blocos = () => [...document.querySelectorAll('.b')];
  const textoBloco = (el) => (el.firstChild && el.firstChild.nodeType === 3 ? '' : '') + el.innerText;

  async function carregar() {
    try { const r = await fetch('/__anotacoes?pagina=' + encodeURIComponent(pagina)); if (r.ok) { notas = await r.json(); servidor = true; } } catch {}
    if (!servidor) try { notas = JSON.parse(localStorage.getItem(chave) || '[]'); } catch { notas = []; }
    desenhar();
  }
  async function salvar() {
    if (servidor) { try { await fetch('/__anotacoes?pagina=' + encodeURIComponent(pagina), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(notas) }); } catch { servidor = false; } }
    if (!servidor) try { localStorage.setItem(chave, JSON.stringify(notas)); } catch {}
    desenhar();
  }
  function desenhar() {
    document.querySelectorAll('.an-bal').forEach((e) => e.remove());
    document.querySelectorAll('mark.an-mark').forEach((m) => m.replaceWith(...m.childNodes));
    const bs = blocos();
    bs.forEach((b, i) => { if (!b.querySelector('.an-add')) { const a = document.createElement('button'); a.className = 'an-add'; a.textContent = '+ nota'; a.onclick = (e) => { e.stopPropagation(); abrir(i, ''); }; b.prepend(a); } });
    notas.forEach((n, k) => {
      const b = bs[n.bloco] || bs.find((x) => n.trecho && x.innerText.includes(n.trecho)); if (!b) return;
      if (n.trecho) marcar(b, n.trecho);
      const d = document.createElement('div'); d.className = 'an-bal';
      d.innerHTML = (n.trecho ? `<q></q>` : '') + `<div class="tx"></div><small>${new Date(n.data).toLocaleString('pt-BR')}</small><button class="x" title="apagar">×</button>`;
      if (n.trecho) d.querySelector('q').textContent = n.trecho; d.querySelector('.tx').textContent = n.nota;
      d.querySelector('.x').onclick = () => { if (confirm('Apagar esta anotação?')) { notas.splice(k, 1); salvar(); } };
      b.after(d);
    });
    $('an-st').textContent = `${notas.length} anotação(ões) · ${servidor ? 'salvando no motor' : 'salvo só neste navegador'}`;
  }
  function marcar(el, t) {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { const i = n.data.indexOf(t); if (i >= 0 && !n.parentElement.closest('.an-add')) { const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + t.length); const m = document.createElement('mark'); m.className = 'an-mark'; r.surroundContents(m); return; } }
  }
  let alvo = null;
  function abrir(bloco, trecho) { alvo = { bloco, trecho }; $('an-q').textContent = trecho ? `“${trecho}”` : 'Bloco inteiro'; $('an-t').value = ''; $('an-form').style.display = 'flex'; $('an-t').focus(); }
  $('an-cn').onclick = () => { $('an-form').style.display = 'none'; };
  $('an-ok').onclick = () => { const t = $('an-t').value.trim(); if (!t) return; notas.push({ ...alvo, nota: t, data: new Date().toISOString(), pagina }); $('an-form').style.display = 'none'; salvar(); };
  document.addEventListener('mouseup', (e) => {
    if (e.target.closest('#an-sel,#an-form')) return;
    const s = getSelection(), t = s.toString().trim(), b = s.anchorNode && s.anchorNode.parentElement && s.anchorNode.parentElement.closest('.b');
    const btn = $('an-sel');
    if (t && b) { const r = s.getRangeAt(0).getBoundingClientRect(); btn.style.left = `${scrollX + r.left}px`; btn.style.top = `${scrollY + r.bottom + 6}px`; btn.style.display = 'block'; btn.onclick = () => { btn.style.display = 'none'; abrir(blocos().indexOf(b), t); }; }
    else btn.style.display = 'none';
  });
  $('an-exp').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(notas, null, 1)], { type: 'application/json' })); a.download = pagina.replace(/\.html$/, '') + '.anotacoes.json'; a.click(); };
  carregar();
})();
