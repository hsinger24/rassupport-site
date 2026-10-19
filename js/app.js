(function(){
  var $ = function(id){ return document.getElementById(id); };
  var toArr = function(x){ return Array.prototype.slice.call(x); };
  var body = document.body;

  /* ---------- Content (wording from the patient information guide v1.11) ---------- */
  var STEPS = [
    {id:'pill', short:'Antibiotic pill', kind:'Antibiotic', name:'Antibiotic pill', note:'Doxycycline or minocycline, whichever you were prescribed.', where:'Swallow', icon:'i-pill', when:'Twice a day', img:'img/doxycycline.jpg', alt:'Doxycycline pill bottle'},
    {id:'spray', short:'Spray', kind:'Antiseptic spray', name:'Hypochlorous spray', note:'Spray your face. It always goes on before the creams.', where:'Face', icon:'i-face', when:'Twice a day', img:'img/hypochlorous.jpg', alt:'Hypochlorous antiseptic spray bottle'},
    {id:'hc', short:'Hydrocortisone', kind:'Steroid cream · face', name:'Hydrocortisone cream', note:'On your face, after the spray.', where:'Face', icon:'i-face', when:'Twice a day', img:'img/hydrocortisone.jpg', alt:'Hydrocortisone cream 2.5% box'},
    {id:'tri', short:'Triamcinolone', kind:'Steroid cream · body', name:'Triamcinolone cream', note:'On your body and trunk.', where:'Body and trunk', icon:'i-body', when:'Twice a day', img:'img/triamcinolone.jpg', alt:'Triamcinolone acetonide cream box'},
    {id:'moist', short:'Moisturizer', kind:'Moisturizer', name:'Fragrance-free moisturizer', note:'Face, body and trunk, over the creams.', where:'Face and body', icon:'i-body', when:'Twice a day', img:'img/moisturizer.jpg', alt:'Fragrance-free moisturizing cream tub'},
    {id:'spf', short:'Sunscreen', kind:'Sunscreen', name:'Sunscreen SPF 30+', note:'At least 30 minutes before you go outside. Avoid direct sun.', where:'Sun-exposed skin', icon:'i-sun', when:'Every morning', img:'img/sunscreen.jpg', alt:'Sunscreen SPF 30 tube', amOnly:true}
  ];
  /* Short labels for Home's "Next" line */
  var NEXT = {pill:['Antibiotic pill','Swallow'], spray:['Hypochlorous spray','Face'], hc:['Hydrocortisone cream','Face'], tri:['Triamcinolone cream','Body'], moist:['Moisturizer','Face and body'], spf:['Sunscreen','Sun-exposed skin']};
  function steps(s){ return STEPS.filter(function(x){ return s === 'am' || !x.amOnly; }); }
  function items(s){ return steps(s).map(function(x){ return {id:s+'-'+x.id, lbl:x.short}; }); }

  /* Morning or evening routine, by time of day. Home and Today can switch it; the sky follows it. */
  var seg = new Date().getHours() < 15 ? 'am' : 'pm';
  function setSeg(s){ seg = s; body.setAttribute('data-seg', s); }

  /* ---------- Checklist state: this browser only, clears each day ---------- */
  var KEY = 'rasonque-today-v3', done = {};
  function dayKey(){ var d = new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
  function load(){ try{ var raw = localStorage.getItem(KEY); if(!raw) return; var data = JSON.parse(raw); if(data && data.day === dayKey() && data.done) done = data.done; }catch(e){} }
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify({day: dayKey(), done: done})); }catch(e){} }
  function countFor(s){ var its = items(s); return {n: its.filter(function(it){ return done[it.id]; }).length, t: its.length}; }
  function dateLabel(){ return new Date().toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'}); }

  function paintDaycard(el, other, ico, nameEl, statusEl, context){
    var oc = countFor(other);
    el.classList.toggle('dusk', other === 'pm');
    el.classList.toggle('dawn', other === 'am');
    if(ico) ico.setAttribute('href', other === 'pm' ? '#i-moon' : '#i-sun');
    nameEl.textContent = (other === 'pm' ? 'Evening' : 'Morning') + (context === 'today' ? '' : ' routine');
    var status;
    if(!statusEl) return;
    if(other === 'pm') status = oc.n === 0 ? oc.t + ' steps · tonight' : (oc.n === oc.t ? 'All done' : oc.n + ' of ' + oc.t + ' done');
    else status = oc.n === 0 ? oc.t + ' steps · not started' : (oc.n === oc.t ? 'Done · all ' + oc.t + ' steps' : oc.n + ' of ' + oc.t + ' done');
    statusEl.textContent = status;
  }

  /* ---------- Home ---------- */
  var chips = toArr(document.querySelectorAll('#homeChips .chip'));
  function paintHome(){
    var list = steps(seg);
    var n = list.filter(function(x){ return done[seg+'-'+x.id]; }).length;
    var firstOpen = null;
    list.forEach(function(x){ if(!firstOpen && !done[seg+'-'+x.id]) firstOpen = x; });
    var h = new Date().getHours();
    $('homeGreet').textContent = h < 12 ? 'morning' : (h < 17 ? 'afternoon' : 'evening');
    $('homeWhen').textContent = seg === 'am' ? 'Morning routine' : 'Evening routine';
    $('homeCount').textContent = n === 0 ? list.length + ' steps' : (n === list.length ? 'All done' : n + ' of ' + list.length + ' done');
    $('homeBar').style.width = Math.round(100 * n / list.length) + '%';
    $('homeCta').textContent = n === 0 ? 'Start routine' : (n < list.length ? 'Continue routine' : 'Routine done');
    if(firstOpen){ $('nextName').textContent = NEXT[firstOpen.id][0]; $('nextWhere').textContent = ' · ' + NEXT[firstOpen.id][1]; }
    else { $('nextName').textContent = 'All done'; $('nextWhere').textContent = seg === 'am' ? ' · again this evening' : ' · again tomorrow morning'; }
    chips.forEach(function(c){
      var id = c.getAttribute('data-step');
      c.hidden = !list.some(function(x){ return x.id === id; });
      c.classList.toggle('next', !!firstOpen && id === firstOpen.id);
      c.classList.toggle('done', !!done[seg+'-'+id]);
    });
    paintDaycard($('homeOther'), seg === 'am' ? 'pm' : 'am', $('homeOtherIcon'), $('homeOtherName'), null, 'home');
  }
  $('homeOther').addEventListener('click', function(){ setSeg(seg === 'am' ? 'pm' : 'am'); paintHome(); paintToday(); });

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
  var C = 2 * Math.PI * 40;
  function paintToday(){
    $('todayDate').textContent = dateLabel();
    $('segLabel').textContent = seg === 'am' ? 'This morning' : 'This evening';
    var first = true, nextMarked = false;
    toArr(listEl.children).forEach(function(b){
      var on = b.getAttribute('data-seg') === seg;
      var isDone = !!done[b.getAttribute('data-id')];
      b.hidden = !on;
      b.setAttribute('aria-pressed', String(isDone));
      b.classList.toggle('first', on && first);
      b.classList.toggle('next', on && !isDone && !nextMarked);
      if(on && !isDone) nextMarked = true;
      if(on) first = false;
    });
    var c = countFor(seg), left = c.t - c.n;
    $('ringN').textContent = c.n + '/' + c.t;
    $('ringP').style.strokeDasharray = (C * c.n / c.t).toFixed(1) + ' ' + C.toFixed(1);
    $('ringP').style.opacity = c.n ? 1 : 0; /* a zero-length round cap would still draw a dot */
    $('segSummary').textContent = left === 0 ? 'All done.' : left + (left === 1 ? ' step left' : ' steps left');
    paintDaycard($('segSwap'), seg === 'am' ? 'pm' : 'am', $('otherIcon'), $('otherName'), $('otherStatus'), 'today');
  }
  $('segSwap').addEventListener('click', function(){ setSeg(seg === 'am' ? 'pm' : 'am'); paintToday(); paintHome(); });

  /* ---------- Routine step flow (marks each step done in Today) ---------- */
  var list = [], si = 0, dotsEl = $('dots');
  function enterRoutine(){
    list = steps(seg);
    dotsEl.innerHTML = list.map(function(){ return '<i></i>'; }).join('');
    var start = list.length;
    for(var k = 0; k < list.length; k++){ if(!done[seg+'-'+list[k].id]){ start = k; break; } }
    setStep(start);
  }
  function setStep(i){
    si = Math.max(0, Math.min(i, list.length));
    var fin = si >= list.length;
    $('stepView').hidden = fin; $('doneView').hidden = !fin;
    body.classList.toggle('done-view', fin);
    $('stepCount').textContent = fin ? 'Routine complete' : 'Step ' + (si+1) + ' of ' + list.length;
    toArr(dotsEl.children).forEach(function(d, k){ d.className = k <= si ? 'on' : ''; });
    if(fin){
      var bc = $('bigCheck'), dw = $('doneWrap');
      bc.classList.remove('go'); dw.classList.remove('go'); void bc.offsetWidth; bc.classList.add('go'); dw.classList.add('go');
      $('doneTitle').innerHTML = seg === 'am' ? 'Done for<br><i>this morning.</i>' : 'Done for<br><i>tonight.</i>';
      $('doneNote').textContent = (seg === 'am' ? 'Same routine this evening, without the sunscreen.' : 'Again tomorrow morning, with sunscreen.') + ' Using it every day prevents flares.';
      $('doneOther').hidden = seg !== 'am';
      var pc = countFor('pm');
      $('doneOtherStatus').textContent = pc.n === 0 ? pc.t + ' steps · tonight' : (pc.n === pc.t ? 'All done' : pc.n + ' of ' + pc.t + ' done');
    } else {
      $('stepWrap').className = 'step-wrap a' + (si + 1);
      var s = list[si];
      $('stepImg').src = s.img; $('stepImg').alt = s.alt;
      $('stepNum').textContent = si + 1; $('stepKind').textContent = s.kind;
      $('stepName').textContent = s.name; $('stepNote').textContent = s.note;
      $('stepWhere').textContent = s.where; $('stepWhen').textContent = s.when;
      $('whereIcon').setAttribute('href', '#' + s.icon);
      var last = si === list.length - 1;
      $('nextLbl').textContent = last ? 'Finish routine' : 'Done, next step';
      $('nextIcon').setAttribute('href', last ? '#i-check' : '#i-arrow');
      $('backBtn').hidden = si === 0;
    }
    window.scrollTo(0, 0);
  }
  $('nextBtn').addEventListener('click', function(){
    var s = list[si];
    if(s){ done[seg+'-'+s.id] = true; save(); }
    setStep(si + 1);
  });
  $('backBtn').addEventListener('click', function(){ setStep(si - 1); });
  $('restartBtn').addEventListener('click', function(){ setStep(0); });
  $('doneOther').addEventListener('click', function(){ setSeg('pm'); location.hash = '#home'; });

  /* ---------- First visit: Home introduces the site once, then greets ---------- */
  var SEEN = 'rasonque-seen-v1', firstVisit = true;
  try{ firstVisit = !localStorage.getItem(SEEN); localStorage.setItem(SEEN, '1'); }catch(e){}
  $('hWelcome').hidden = !firstVisit; $('hGreet').hidden = firstVisit;
  $('introFull').hidden = !firstVisit; $('introTag').hidden = firstVisit;

  /* ---------- Call: the care team's number, saved in this browser only ---------- */
  var TEAM = 'rasonque-careteam-v1';
  function digits(v){ return (v || '').replace(/[^0-9+]/g, ''); }
  function loadTeam(){ try{ var t = JSON.parse(localStorage.getItem(TEAM) || 'null'); return t && t.main ? t : null; }catch(e){ return null; } }
  function showTeam(mode){
    var t = loadTeam();
    if(!mode) mode = t ? 'saved' : 'empty';
    $('teamEmpty').hidden = mode !== 'empty'; $('teamForm').hidden = mode !== 'form'; $('teamSaved').hidden = mode !== 'saved';
    if(mode === 'saved' && t){
      $('teamNum').textContent = t.main; $('teamCall').setAttribute('href', 'tel:' + digits(t.main));
      $('teamAfterRow').hidden = !t.after;
      if(t.after){ $('teamAfter').textContent = t.after; $('teamAfter').setAttribute('href', 'tel:' + digits(t.after)); }
    }
    if(mode === 'form'){ $('telMain').value = t ? t.main : ''; $('telAfter').value = t && t.after ? t.after : ''; $('telErr').hidden = true; $('telMain').focus(); }
  }
  $('teamAdd').addEventListener('click', function(){ showTeam('form'); });
  $('teamChange').addEventListener('click', function(){ showTeam('form'); });
  $('teamCancel').addEventListener('click', function(){ showTeam(); });
  $('teamForm').addEventListener('submit', function(e){
    e.preventDefault();
    var main = $('telMain').value.trim(), after = $('telAfter').value.trim();
    if(digits(main).replace('+', '').length < 7){ $('telErr').hidden = false; $('telMain').focus(); return; }
    try{ localStorage.setItem(TEAM, JSON.stringify({main: main, after: after})); }catch(err){}
    showTeam(loadTeam() ? 'saved' : 'empty');
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
  var fab = $('fab');
  var titles = {welcome:'Welcome', home:'Rasonque Supportive Care', routine:'Routine', today:'Today', symptoms:'Symptoms', rash:'Rash', mouth:'Mouth sores', nausea:'Nausea', diarrhea:'Diarrhea', video:'How-to video', guide:'Patient guide', call:'Call your care team', caregivers:'For caregivers'};
  var current = null;
  function route(){
    var id = (location.hash || '#home').slice(1);
    if(!$('page-' + id)) id = 'home';
    if(!entered && id !== 'welcome'){ pendingHash = '#' + id; id = 'welcome'; }
    if(entered && id === 'welcome') id = 'home';
    pages.forEach(function(p){ p.hidden = p.id !== 'page-' + id; });
    fab.hidden = (id === 'routine' || id === 'call' || id === 'welcome');
    body.setAttribute('data-page', id);
    body.classList.toggle('on-dark', id === 'call');
    if(id !== 'routine') body.classList.remove('done-view');
    document.title = id === 'home' ? titles.home : titles[id] + ' · Rasonque Supportive Care';
    if(id === 'routine' && current !== 'routine') enterRoutine();
    if(id === 'today') paintToday();
    if(id === 'home') paintHome();
    if(id === 'call') showTeam();
    current = id;
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  setSeg(seg); load(); paintHome(); paintToday(); route();
})();
