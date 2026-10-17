(function(){
  var $ = function(id){ return document.getElementById(id); };
  var toArr = function(x){ return Array.prototype.slice.call(x); };

  /* ---------- Content (wording from the patient information guide v1.11) ---------- */
  var SKIN = [
    {id:'spray', n:1, short:'Spray', kind:'Antiseptic spray', name:'Hypochlorous spray', note:'Spray your face. This always goes on first.', where:'Face', icon:'i-face', when:'Twice a day', img:'img/hypochlorous.jpg', alt:'Hypochlorous antiseptic spray bottle'},
    {id:'hc', n:2, short:'Hydrocortisone', kind:'Steroid cream · face', name:'Hydrocortisone cream', note:'On your face, after the spray.', where:'Face', icon:'i-face', when:'Twice a day', img:'img/hydrocortisone.jpg', alt:'Hydrocortisone cream 2.5% box'},
    {id:'tri', n:3, short:'Triamcinolone', kind:'Steroid cream · body', name:'Triamcinolone cream', note:'On your body and trunk.', where:'Body and trunk', icon:'i-body', when:'Twice a day', img:'img/triamcinolone.jpg', alt:'Triamcinolone acetonide cream box'},
    {id:'moist', n:4, short:'Moisturizer', kind:'Moisturizer', name:'Fragrance-free moisturizer', note:'Face, body and trunk, over the creams.', where:'Face and body', icon:'i-body', when:'Twice a day', img:'img/moisturizer.jpg', alt:'Fragrance-free moisturizing cream tub'},
    {id:'spf', n:5, short:'Sunscreen', kind:'Sunscreen', name:'Sunscreen SPF 30+', note:'At least 30 minutes before you go outside. Avoid direct sun.', where:'Sun-exposed skin', icon:'i-sun', when:'Every morning', img:'img/sunscreen.jpg', alt:'Sunscreen SPF 30 tube', amOnly:true}
  ];
  function skin(s){ return SKIN.filter(function(x){ return s === 'am' || !x.amOnly; }); }
  function items(s){ return [{id:s+'-pill', lbl:'Antibiotic pill'}].concat(skin(s).map(function(x){ return {id:s+'-'+x.id, lbl:x.short}; })); }

  /* Morning or evening, by time of day; the Today screen can switch it. */
  var seg = new Date().getHours() < 15 ? 'am' : 'pm';

  /* ---------- Checklist state: this browser only, clears each day ---------- */
  var KEY = 'rasonque-today-v3', done = {};
  function dayKey(){ var d = new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
  function load(){ try{ var raw = localStorage.getItem(KEY); if(!raw) return; var data = JSON.parse(raw); if(data && data.day === dayKey() && data.done) done = data.done; }catch(e){} }
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify({day: dayKey(), done: done})); }catch(e){} }
  function countFor(s){ var its = items(s); return {n: its.filter(function(it){ return done[it.id]; }).length, t: its.length}; }

  /* ---------- Home ---------- */
  var chips = toArr(document.querySelectorAll('#homeChips .chip'));
  function paintHome(){
    var list = skin(seg);
    var n = list.filter(function(x){ return done[seg+'-'+x.id]; }).length;
    var firstOpen = null;
    list.forEach(function(x){ if(!firstOpen && !done[seg+'-'+x.id]) firstOpen = x.id; });
    $('homeWhen').textContent = seg === 'am' ? 'This morning' : 'This evening';
    $('homeCount').textContent = n + ' of ' + list.length;
    chips.forEach(function(c){
      var id = c.getAttribute('data-step');
      c.hidden = !list.some(function(x){ return x.id === id; });
      c.classList.toggle('next', id === firstOpen);
    });
  }

  /* ---------- Today ---------- */
  var listEl = $('checkList');
  ['am','pm'].forEach(function(s){
    items(s).forEach(function(it){
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-id', it.id);
      b.setAttribute('data-seg', s);
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = '<span class="box"><svg class="ic"><use href="#i-check"/></svg></span><span class="lbl"></span>';
      b.querySelector('.lbl').textContent = it.lbl;
      listEl.appendChild(b);
    });
  });
  listEl.addEventListener('click', function(e){
    var b = e.target.closest('button[data-id]'); if(!b) return;
    var id = b.getAttribute('data-id');
    done[id] = !done[id];
    save(); paintToday(); paintHome();
  });
  var C = 2 * Math.PI * 41;
  function paintToday(){
    $('segLabel').textContent = seg === 'am' ? 'Morning' : 'Evening';
    var first = true;
    toArr(listEl.children).forEach(function(b){
      var on = b.getAttribute('data-seg') === seg;
      b.hidden = !on;
      b.setAttribute('aria-pressed', String(!!done[b.getAttribute('data-id')]));
      b.classList.toggle('first', on && first);
      if(on) first = false;
    });
    var c = countFor(seg), left = c.t - c.n;
    $('ringN').textContent = c.n + '/' + c.t;
    $('ringP').style.strokeDasharray = (C * c.n / c.t).toFixed(1) + ' ' + C.toFixed(1);
    $('segSummary').textContent = left === 0 ? 'All done.' : left + (left === 1 ? ' step left' : ' steps left');
    var other = seg === 'am' ? 'pm' : 'am', oc = countFor(other);
    $('otherName').textContent = other === 'am' ? 'Morning' : 'Evening';
    $('otherStatus').textContent = oc.n === 0 ? 'Not started' : (oc.n === oc.t ? 'All done' : oc.n + ' of ' + oc.t + ' done');
  }
  $('segSwap').addEventListener('click', function(){ seg = seg === 'am' ? 'pm' : 'am'; paintToday(); paintHome(); });

  /* ---------- Routine step flow (marks each step done in Today) ---------- */
  var steps = [], si = 0, dotsEl = $('dots');
  function enterRoutine(){
    steps = skin(seg);
    dotsEl.innerHTML = steps.map(function(){ return '<i></i>'; }).join('');
    var start = 0;
    for(var k = 0; k < steps.length; k++){ if(!done[seg+'-'+steps[k].id]){ start = k; break; } }
    setStep(start);
  }
  function setStep(i){
    si = Math.max(0, Math.min(i, steps.length));
    var fin = si >= steps.length;
    $('stepView').hidden = fin; $('doneView').hidden = !fin;
    $('stepCount').textContent = fin ? 'Routine complete' : 'Step ' + (si+1) + ' of ' + steps.length;
    toArr(dotsEl.children).forEach(function(d, k){ d.className = k <= si ? 'on' : ''; });
    if(!fin){
      var s = steps[si];
      $('stepImg').src = s.img; $('stepImg').alt = s.alt;
      $('stepNum').textContent = s.n; $('stepKind').textContent = s.kind;
      $('stepName').textContent = s.name; $('stepNote').textContent = s.note;
      $('stepWhere').textContent = s.where; $('stepWhen').textContent = s.when;
      $('whereIcon').setAttribute('href', '#' + s.icon);
      $('nextBtn').textContent = si === steps.length - 1 ? 'Finish routine' : 'Done, next step';
      $('backBtn').hidden = si === 0;
    } else {
      $('doneNote').textContent = (seg === 'am' ? 'Again this evening.' : 'Again tomorrow morning.') + ' Using it every day prevents flares.';
    }
    window.scrollTo(0, 0);
  }
  $('nextBtn').addEventListener('click', function(){
    var s = steps[si];
    if(s){ done[seg+'-'+s.id] = true; save(); }
    setStep(si + 1);
  });
  $('backBtn').addEventListener('click', function(){ setStep(si - 1); });
  $('restartBtn').addEventListener('click', function(){ setStep(0); });

  /* ---------- Language note ---------- */
  var langNote = $('langNote');
  ['langBtn','langBtn2'].forEach(function(id){
    var b = $(id);
    b.addEventListener('click', function(){
      langNote.hidden = !langNote.hidden;
      b.setAttribute('aria-expanded', String(!langNote.hidden));
    });
  });

  /* ---------- Welcome / access code (prototype: any code works, nothing stored or sent) ---------- */
  var GATE = false; /* false on the public site; true in the study build, where codes will be real */
  var entered = !GATE;
  try{ if(GATE) entered = sessionStorage.getItem('rasonque-entered') === '1'; }catch(e){}
  var pendingHash = null;
  $('codeForm').addEventListener('submit', function(e){
    e.preventDefault();
    var v = $('codeIn').value.trim();
    if(!v){ $('codeErr').hidden = false; $('codeIn').focus(); return; }
    $('codeErr').hidden = true;
    $('codeIn').value = '';
    entered = true;
    try{ sessionStorage.setItem('rasonque-entered', '1'); }catch(err){}
    var target = pendingHash && pendingHash !== '#welcome' ? pendingHash : '#home';
    pendingHash = null;
    if(location.hash === target) route(); else location.hash = target;
  });

  /* ---------- Routing ---------- */
  var pages = toArr(document.querySelectorAll('[data-page]'));
  var tabs = $('tabs'), tabLinks = toArr(tabs.querySelectorAll('a'));
  var titles = {welcome:'Welcome', home:'Rasonque Supportive Care', routine:'Skin routine', today:'Today', mouth:'Mouth sores', nausea:'Nausea', diarrhea:'Diarrhea', call:'Call your care team', caregivers:'For caregivers'};
  var current = null;
  function route(){
    var id = (location.hash || '#home').slice(1);
    if(!$('page-' + id)) id = 'home';
    if(!entered && id !== 'welcome'){ pendingHash = '#' + id; id = 'welcome'; }
    if(entered && id === 'welcome') id = 'home';
    pages.forEach(function(p){ p.hidden = p.id !== 'page-' + id; });
    tabs.hidden = (id === 'routine' || id === 'call' || id === 'welcome');
    document.body.classList.toggle('on-dark', id === 'call');
    tabLinks.forEach(function(a){ if(a.getAttribute('data-tab') === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    document.title = id === 'home' ? titles.home : titles[id] + ' · Rasonque Supportive Care';
    if(id === 'routine' && current !== 'routine') enterRoutine();
    if(id === 'today') paintToday();
    if(id === 'home') paintHome();
    current = id;
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  load(); paintHome(); paintToday(); route();
})();
