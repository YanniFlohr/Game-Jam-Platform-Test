(function(){"use strict";
var B=window.NGB,NG=window.NG,$=function(i){return document.getElementById(i)};
var esc=function(v){return String(v).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]})};
/* Theme button: crisp icons + a tooltip, in the same spot */
var TI={system:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg>',
  light:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  dark:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'};
function fixTheme(){var i=$("themeIcon"),b=$("themeBtn");if(!i||!b||i.querySelector("svg"))return;
  var t=localStorage.getItem("nanogram-theme")||"system";i.innerHTML=TI[t]||TI.system;var mt=$("mobileTheme");if(mt)mt.innerHTML=TI[t]||TI.system;
  b.dataset.tip="Theme: "+({system:"System",light:"Light",dark:"Dark"}[t]||"System")+". Click to change"}
if($("mobileTheme"))$("mobileTheme").addEventListener("click",function(){$("themeBtn").click()});
if($("themeIcon")){new MutationObserver(fixTheme).observe($("themeIcon"),{childList:true});fixTheme()}
var nd=document.createElement("dialog");nd.id="nd";nd.className="ndlg";document.body.appendChild(nd);
var file=null,busy=false;

function show(html,cls){nd.className="ndlg"+(cls?" "+cls:"");nd.innerHTML='<button class="nd-x" data-nd="close" aria-label="Close">✕</button>'+html;if(!nd.open)nd.showModal()}
function msg(t,ok){var e=nd.querySelector(".nd-msg");if(e){e.textContent=t;e.className="nd-msg "+(ok?"ok":"bad")}}
function need(){if(!B.enabled){show('<h3>Accounts need setup</h3><p class="nd-sub">Add your Supabase keys in js/config.js to turn on sign in, uploads and admin tools.</p>');return false}return true}
function field(id,label,attrs,hint){return'<label class="field"><span>'+label+'</span><input id="'+id+'" '+attrs+'>'+(hint?'<small>'+hint+'</small>':'')+'</label>'}
var DROPTXT="Drag an image here, or click to choose",MAXMB=10,GENRES=["Casual","Arcade","Puzzle","Sim","Action","Obby","Other"],JL={live:"Live now",up:"Upcoming",end:"Ended"};
var editing=null,rmBanner=false;
function banner(portrait){return'<div class="field"><span class="fh">Banner image<button type="button" class="link" data-nd="rmbanner" hidden>Remove</button></span><label class="drop'+(portrait?" portrait":"")+'" id="drop"><input id="bn" type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden><b>'+DROPTXT+'</b><small>PNG, JPG, WebP or GIF, up to '+MAXMB+' MB. '+(portrait?"Portrait (9:16) works best.":"16:9 works best.")+'</small></label></div>'}
function paintDrop(url,name){var d=$("drop");if(!d)return;
  if(url){d.classList.add("has");d.style.backgroundImage='url("'+url.replace(/"/g,"%22")+'")';d.dataset.img=url;d.title=name||""}
  else{d.classList.remove("has");d.style.backgroundImage="";d.dataset.img="";d.title=""}
  var r=nd.querySelector('[data-nd="rmbanner"]');if(r)r.hidden=!url;pv();pvj()}
function pv(){
  var t=$("gt");if(!t||!$("pvN"))return;var ch=nd.querySelector(".chip[aria-pressed=true]");
  $("pvN").textContent=t.value.trim()||"Your game name";$("pvM").textContent=(ch?ch.dataset.v:"Casual")+" \u00b7 by "+(B.profile?B.profile.username:"you");
  var c=$("cc");if(c)c.textContent=$("gd").value.length+"/300"}
function upload(jamId,g){
  if(!B.user)return auth("login");
  file=null;rmBanner=false;editing=g?g[7]:null;
  var jams=B.isAdmin()?J.filter(function(j){return j.s!=="end"||(g&&j.id===g[9])}):J.filter(function(j){return(j.s==="live"&&B.mine[j.id])||(g&&j.id===g[9])});
  var sel=g?g[9]:jamId,cur=g?g[1]:"Casual";
  var opts='<label class="jopt"><input type="radio" name="gj" value=""'+(!sel?" checked":"")+'><span><b>Not for a jam</b><small>Appears in All games</small></span></label>'+
    jams.map(function(j){return'<label class="jopt"><input type="radio" name="gj" value="'+esc(j.id)+'"'+(j.id===sel?" checked":"")+'><span><b>'+esc(j.n)+'</b><small>'+JL[j.s]+'</small></span></label>'}).join("");
  show('<form id="gameForm" class="pubf"><div class="pub-head"><h3>'+(g?"Edit game":"Publish a game")+'</h3><p class="nd-sub">'+(g?"Update how your game looks in Nanogram Jams.":"Add a banner and a link so people can find and play it.")+'</p></div>'+
    '<div class="pub-scroll"><div class="pub"><div class="pv-col">'+banner(true)+'<div class="pv-meta"><strong id="pvN"></strong><small id="pvM"></small></div></div><div class="pub-fields">'+
    field("gt","Game name",'required maxlength="60" placeholder="What is it called?" value="'+esc(g?g[0]:"")+'"')+
    field("gu","Game link",'type="url" required placeholder="https://nanogram.app/..." value="'+esc(g?g[6]:"")+'"',"The link to your game on Nanogram. Must start with https://")+
    '<div class="field"><span>Genre</span><div class="chips">'+GENRES.map(function(x){return'<button type="button" class="chip" aria-pressed="'+(x===cur)+'" data-v="'+x+'">'+x+'</button>'}).join("")+'</div></div>'+
    '<label class="field"><span class="fh">Description<small id="cc">0/300</small></span><textarea id="gd" maxlength="300" rows="4" placeholder="Tell people what to expect.">'+esc(g?g[4]:"")+'</textarea></label>'+
    '<div class="field"><span>Enter into a jam</span><div class="jopts">'+opts+'</div>'+(jams.length?'':'<small>Join a live jam first to enter it.</small>')+'</div></div></div></div>'+
    '<div class="pub-actions">'+(g?'<button type="button" class="btn danger" data-act="delgame" data-id="'+esc(g[7])+'">Delete</button>':'')+'<span class="nd-msg"></span>'+
    '<button type="button" class="btn ghost" data-nd="close">Cancel</button><button class="btn dark" type="submit">'+(g?"Save changes":"Publish game")+'</button></div></form>',"wide");
  if(g&&g[5])paintDrop(g[5],g[0]);else pv()}
function auth(mode){
  if(!need())return;var up=mode==="signup";file=null;
  show('<h3>'+(up?"Create your account":"Welcome back")+'</h3><p class="nd-sub">'+(up?"Join jams, upload games and link your Discord.":"Sign in to join jams and upload games.")+'</p>'+
  '<button class="btn discordbtn" data-nd="discord" type="button">Continue with Discord</button><div class="or"><span>or</span></div>'+
  '<form id="authForm" data-mode="'+mode+'">'+(up?field("fu","Username",'required minlength="3" maxlength="24" pattern="[A-Za-z0-9 _.\\-]+" autocomplete="username"',"Shown on your games. Letters, numbers, spaces, . _ -"):"")+
  field("fe",up?"Email":"Email or username",(up?'type="email"':'type="text"')+' required autocomplete="'+(up?"email":"username")+'"')+field("fp","Password",'type="password" required minlength="8" autocomplete="'+(up?"new":"current")+'-password"',up?"At least 8 characters":"")+
  '<div class="nd-msg"></div><button class="btn dark wide" type="submit">'+(up?"Create account":"Sign in")+'</button></form>'+
  '<p class="nd-alt">'+(up?'Have an account? <a href="#" data-nd="login">Sign in</a>':'New here? <a href="#" data-nd="signup">Create an account</a>')+'</p>');
}
function account(){
  if(!B.user)return auth("login");var p=B.profile||{};
  show('<h3>'+esc(p.username||"Account")+(B.isAdmin()?' <span class="badge">Admin</span>':'')+'</h3><p class="nd-sub">'+esc(B.user.email||"")+'</p>'+
  '<div class="row-card"><div><strong>Discord</strong><small>'+(p.discord?"Linked as "+esc(p.discord):"Not linked")+'</small></div>'+(p.discord?'':'<button class="btn ghost small" data-nd="link">Link Discord</button>')+'</div>'+
  '<div class="stack"><button class="btn dark" data-nd="upload">Upload a game</button>'+(B.isAdmin()?'<button class="btn ghost" data-nd="newjam">Create a jam</button>':'')+'<button class="btn ghost" data-nd="logout">Sign out</button>'+(B.mock?'<button class="btn ghost" data-nd="reset">Reset demo data</button>':'')+'</div>');
}
var editingJam=null;
/* ---- date range picker ---- */
var DR={a:"",z:"",y:0,m:0},DAY=864e5,MN=["January","February","March","April","May","June","July","August","September","October","November","December"];
var iso=function(t){return new Date(t).toISOString().slice(0,10)},ms=function(s){return Date.parse(s+"T00:00:00Z")};
var nice=function(s){var d=new Date(ms(s));return MN[d.getUTCMonth()].slice(0,3)+" "+d.getUTCDate()+", "+d.getUTCFullYear()};
function drInit(a,z){var t=new Date(ms(a||iso(Date.now())));DR.a=a||"";DR.z=z||"";DR.y=t.getUTCFullYear();DR.m=t.getUTCMonth()}
function drCal(){
  var off=(new Date(Date.UTC(DR.y,DR.m,1)).getUTCDay()+6)%7,days=new Date(Date.UTC(DR.y,DR.m+1,0)).getUTCDate(),today=iso(Date.now());
  var h='<div class="cal-head"><button type="button" class="cal-nav" data-cal="prev" aria-label="Previous month">\u2039</button><strong>'+MN[DR.m]+" "+DR.y+'</strong><button type="button" class="cal-nav" data-cal="next" aria-label="Next month">\u203a</button></div><div class="cal-grid">'+
    ["Mo","Tu","We","Th","Fr","Sa","Su"].map(function(x){return'<span class="cal-w">'+x+"</span>"}).join("");
  for(var i=0;i<off;i++)h+="<span></span>";
  for(var d=1;d<=days;d++){var s=iso(Date.UTC(DR.y,DR.m,d)),c="cal-d";
    if(s===today)c+=" today";if(s===DR.a)c+=" edge";if(DR.z&&s===DR.z)c+=" edge";if(DR.a&&DR.z&&s>DR.a&&s<DR.z)c+=" in";
    h+='<button type="button" class="'+c+'" data-cal="day" data-d="'+s+'">'+d+"</button>"}
  return h+"</div>"}
function drPaint(){
  var n=DR.a&&DR.z?Math.round((ms(DR.z)-ms(DR.a))/DAY)+1:0;
  $("drSum").innerHTML='<div class="dr-box'+(DR.a?" on":"")+'"><small>Starts</small><b>'+(DR.a?nice(DR.a):"Pick a date")+'</b></div><div class="dr-box'+(DR.z?" on":"")+'"><small>Ends</small><b>'+(DR.z?nice(DR.z):(DR.a?"Pick an end date":"-"))+"</b></div>"+(n?'<span class="dr-len">'+n+" day"+(n>1?"s":"")+"</span>":"");
  $("cal").innerHTML=drCal();$("ja").value=DR.a;$("jz").value=DR.z;
  nd.querySelectorAll(".dr-presets .chip").forEach(function(c){c.setAttribute("aria-pressed",n===+c.dataset.n)});pvj()}
function pvj(){
  var n=$("jn");if(!n||!$("pvN"))return;var t=iso(Date.now()),st=DR.a&&DR.z?(t<DR.a?"Upcoming":t<=DR.z?"Live now":"Ended"):"";
  $("pvN").textContent=n.value.trim()||"Your jam name";
  $("pvM").textContent=DR.a?nice(DR.a)+(DR.z?" to "+nice(DR.z):"")+(st?" \u00b7 "+st:""):"Pick your dates";
  var c=$("jcc");if(c)c.textContent=$("jd").value.length+"/200";
  var d=$("drop");if(d&&!d.classList.contains("has"))d.style.backgroundColor="hsl("+$("jh").value+" 70% 88%)"}
function newjam(j){
  if(!B.isAdmin())return;file=null;rmBanner=false;editingJam=j?j.id:null;drInit(j&&j.a,j&&j.z);
  show('<form id="jamForm" class="pubf"><div class="pub-head"><h3>'+(j?"Edit jam":"Create a jam")+'</h3><p class="nd-sub">'+(j?"Update what people see on the jam page.":"Set the theme, dates and rules for a new jam.")+'</p></div>'+
  '<div class="pub-scroll"><div class="pub jampub"><div class="pv-col">'+banner()+'<div class="pv-meta"><strong id="pvN"></strong><small id="pvM"></small></div></div><div class="pub-fields">'+
  field("jn","Jam name",'required maxlength="60" placeholder="e.g. Small Worlds Jam" value="'+esc(j?j.n:"")+'"')+
  '<label class="field"><span class="fh">Description<small id="jcc">0/200</small></span><textarea id="jd" rows="3" maxlength="200" required placeholder="What should people make?">'+esc(j?j.d:"")+'</textarea></label>'+
  '<div class="field"><span>Dates</span><div class="dr"><input type="hidden" id="ja"><input type="hidden" id="jz"><div class="dr-sum" id="drSum"></div>'+
    '<div class="chips dr-presets">'+[[3,"3 days"],[7,"1 week"],[14,"2 weeks"],[30,"1 month"]].map(function(p){return'<button type="button" class="chip" aria-pressed="false" data-cal="preset" data-n="'+p[0]+'">'+p[1]+"</button>"}).join("")+'</div><div class="cal" id="cal"></div></div></div>'+
  field("jt","Tags",'placeholder="Cozy, Small, Fun" value="'+esc(j?(j.tags||[]).join(", "):"")+'"',"Separate with commas")+
  '<label class="field"><span>Rules</span><textarea id="jr" rows="5" placeholder="One rule per line">'+esc(j?(j.rules||[]).join("\n"):"")+'</textarea></label>'+
  '<label class="field"><span>Colour</span><input id="jh" class="hue" type="range" min="0" max="360" value="'+(j?j.h:Math.floor(Math.random()*360))+'"><small>Used for the jam tile when there is no banner.</small></label>'+
  '</div></div></div><div class="pub-actions">'+(j?'<button type="button" class="btn danger" data-act="deljam" data-id="'+esc(j.id)+'">Delete jam</button>':'')+'<span class="nd-msg"></span>'+
  '<button type="button" class="btn ghost" data-nd="close">Cancel</button><button class="btn dark" type="submit">'+(j?"Save changes":"Create jam")+'</button></div></form>',"wide");
  if(j&&j.banner)paintDrop(j.banner,j.n);drPaint();
}

/* ---------- account card ---------- */
function renderAcct(){tabs();
  var a=$("acct"),m=$("mobileAcct"),p=B.profile;
  if(!B.enabled){a.innerHTML='<div class="acct-note">Accounts are off. Add your Supabase keys in js/config.js.</div>';}
  else if(B.user){a.innerHTML='<button class="acct-me" data-nd="account"><span class="avatar">'+esc((p&&p.username||"?").charAt(0).toUpperCase())+'</span><span><strong>'+esc(p?p.username:"Account")+'</strong><small>'+(B.isAdmin()?"Admin":"Signed in")+'</small></span></button><button class="btn dark wide" data-nd="upload">Upload a game</button>';}
  else a.innerHTML='<div class="acct-out"><button class="btn dark" data-nd="login">Sign in</button><button class="btn ghost" data-nd="signup">Sign up</button></div>';
  m.innerHTML=B.user?'<span class="avatar sm">'+esc((p&&p.username||"?").charAt(0).toUpperCase())+'</span>':'☺';
  m.setAttribute("aria-label",B.user?"Account":"Sign in");
}

/* ---------- decorate pages rendered by app.js ---------- */
function bg(el,url){if(url){el.style.backgroundImage='url("'+url.replace(/"/g,"%22")+'")';el.classList.add("has-banner")}}
function decorate(){
  document.querySelectorAll("#pg .g[data-g]").forEach(function(b){var g=G[+b.dataset.g];if(g){var tl=b.querySelector(".tl");bg(tl,g[5]);if(B.isAdmin()&&!tl.querySelector(".card-del")){var x=document.createElement("span");x.className="card-del";x.dataset.id=g[7];x.title="Delete game";x.setAttribute("role","button");x.textContent="\u2715";tl.appendChild(x)}}});
  document.querySelectorAll("#pg .jam-card").forEach(function(c){var j=J.filter(function(x){return x.id===c.dataset.openJam})[0];if(j)bg(c.querySelector(".jam-cover"),j.banner)});
  var hb=document.querySelector("#pg .hero-card [data-open-jam]");
  if(hb){var hj=J.filter(function(x){return x.id===hb.dataset.openJam})[0];if(hj&&hj.banner){var hc=hb.closest(".hero-card");hc.style.setProperty("--banner",'url("'+hj.banner.replace(/"/g,"%22")+'")');hc.classList.add("has-hb")}}
  var cur=NG.cur(),j=J.filter(function(x){return x.id===cur})[0],acts=document.querySelector("#pg .acts");
  if(j){var big=document.querySelector("#pg .jam-big-cover");if(big)bg(big,j.banner)}
  if(j&&acts){var h="",inn=B.mine[j.id];
    if(j.s!=="end")h+=!B.user?'<button class="btn dark" data-act="join" data-id="'+j.id+'">Sign in to join</button>':inn?(j.s==="live"?'<button class="btn dark" data-act="submit" data-id="'+j.id+'">Submit a game</button>':'<span class="btn ghost">You\'re in</span>')+'<button class="btn ghost" data-act="leave" data-id="'+j.id+'">Leave</button>':'<button class="btn dark" data-act="join" data-id="'+j.id+'">Join this jam</button>';
    h+='<a class="btn ghost" href="https://nanogram.app" target="_blank" rel="noopener">Get Nanogram</a>';
    acts.innerHTML=h;
    var top=document.querySelector("#pg .jam-top");
    if(top&&!top.querySelector(".top-actions")){var ta=document.createElement("div");ta.className="top-actions";
      var sh=document.querySelector("#pg .share-btn"),fv=top.querySelector(".favourite");if(sh)ta.appendChild(sh);if(fv)ta.appendChild(fv);
      if(B.isAdmin())ta.insertAdjacentHTML("beforeend",'<button class="btn ghost small" data-act="editjam" data-id="'+j.id+'">Edit jam</button><button class="btn ghost small bad" data-act="deljam" data-id="'+j.id+'">Delete</button>');
      top.appendChild(ta)}}
  var jh=document.querySelector("#pg .section-heading"),gh=document.querySelector("#pg .games-heading");
  if(cur==="all"&&jh){
    if(!jh.querySelector(".head-right")){var hr=document.createElement("div");hr.className="head-right";var fr=jh.querySelector(".filter-row");if(fr)hr.appendChild(fr);
      if(B.isAdmin())hr.insertAdjacentHTML("beforeend",'<button class="btn dark small" data-nd="newjam">New jam</button>');jh.appendChild(hr)}
    if(gh&&B.user&&!gh.querySelector(".head-right")){var h2=document.createElement("div");h2.className="head-right";var cl=gh.querySelector(".count-label");if(cl)h2.appendChild(cl);
      h2.insertAdjacentHTML("beforeend",'<button class="btn dark small" data-nd="upload">Publish a game</button>');gh.appendChild(h2)}}
  tabs();
}
function tabs(){
  var tb=$("tabbar");if(!tb)return;tb.classList.remove("hide");
  tb.querySelector('[data-tab="home"]').setAttribute("aria-current",String(NG.cur()==="all"));
  tb.querySelector('[data-tab="me"] .tbl').textContent=B.user?"Account":"Sign in";
}
function decorateGame(){
  var t=document.querySelector("#dc h3"),c=document.querySelector("#dc .creator strong");if(!t)return;
  var g=G.filter(function(x){return x[0]===t.textContent&&x[3]===(c&&c.textContent)})[0];if(!g)return;
  var cov=document.querySelector("#dc .game-modal-cover");if(cov)bg(cov,g[5]);
  var row=document.querySelector("#dc .row");if(!row)return;
  var play=/^https:\/\//.test(g[6]||"")?esc(g[6]):"https://nanogram.app";
  row.innerHTML='<a class="btn dark" href="'+play+'" target="_blank" rel="noopener">Play on Nanogram</a>'+
    (B.user&&(B.user.id===g[8]||B.isAdmin())?'<button class="btn ghost" data-act="editgame" data-id="'+esc(g[7])+'">Edit</button><button class="btn danger" data-act="delgame" data-id="'+esc(g[7])+'">Delete</button>':'')+'<button class="btn ghost" data-close-dialog>Close</button>';
}
new MutationObserver(decorate).observe($("pg"),{childList:true});
new MutationObserver(decorateGame).observe($("dc"),{childList:true});
new MutationObserver(function(){document.body.classList.toggle("drawer-open",$("sidebar").classList.contains("mobile-open"))}).observe($("sidebar"),{attributes:true,attributeFilter:["class"]});
$("scrim").addEventListener("click",function(){$("sidebar").classList.remove("mobile-open")});

/* Escape closes the open dialog. Safari clears a search box on Esc and swallows the key, so catch it first. */
document.addEventListener("keydown",function(e){
  if(e.key!=="Escape")return;
  var d=["commandDialog","nd","dlg"].map($).filter(function(x){return x&&x.open})[0];
  if(d){e.preventDefault();e.stopPropagation();d.close()}
},true);

/* ---------- actions ---------- */
function delGame(id){if(!confirm("Delete this game?"))return;run(async function(){await B.remove("games",id);$("dlg").close();nd.close();await B.load()},"Game deleted")}
/* Admin delete button on game cards (capture phase so the card does not also open) */
$("pg").addEventListener("click",function(e){var d=e.target.closest(".card-del");if(!d)return;e.preventDefault();e.stopPropagation();delGame(d.dataset.id)},true);
async function run(fn,ok){if(busy)return;busy=true;try{await fn();if(ok)NG.toast(ok,"✓")}catch(e){msg(e.message||"Something went wrong")}busy=false}
document.addEventListener("click",function(e){
  var cl=e.target.closest("[data-cal]");
  if(cl){var ck=cl.dataset.cal;
    if(ck==="prev"){DR.m--;if(DR.m<0){DR.m=11;DR.y--}}
    else if(ck==="next"){DR.m++;if(DR.m>11){DR.m=0;DR.y++}}
    else if(ck==="day"){var dd=cl.dataset.d;if(!DR.a||DR.z){DR.a=dd;DR.z=""}else if(dd<DR.a)DR.a=dd;else DR.z=dd}
    else if(ck==="preset"){var st=DR.a||iso(Date.now());DR.a=st;DR.z=iso(ms(st)+(+cl.dataset.n-1)*DAY);var sd=new Date(ms(st));DR.y=sd.getUTCFullYear();DR.m=sd.getUTCMonth()}
    drPaint();return}
  var n=e.target.closest("[data-nd]"),a=e.target.closest("[data-act]"),chip=e.target.closest(".chip");
  if(chip&&!chip.dataset.cal){chip.parentNode.querySelectorAll(".chip").forEach(function(x){x.setAttribute("aria-pressed",x===chip)});pv()}
  if(n){e.preventDefault();var k=n.dataset.nd;
    if(k==="close")nd.close();else if(k==="rmbanner"){file=null;rmBanner=true;paintDrop("")}else if(k==="login"||k==="signup")auth(k);else if(k==="account")account();
    else if(k==="upload")upload();else if(k==="newjam")newjam();
    else if(k==="logout")run(async function(){await B.signOut();nd.close()},"Signed out");
    else if(k==="discord")run(async function(){await B.discord(false);if(B.user)nd.close()});else if(k==="link")run(async function(){await B.discord(true);account()});
    else if(k==="reset"&&confirm("Reset all fake accounts, jams and games in this browser?"))B.reset();
  }
  if(a){var id=a.dataset.id;
    if(a.dataset.act==="join"){if(!B.user)return auth("login");run(async function(){await B.join(id);await B.load()},"You joined the jam")}
    if(a.dataset.act==="leave")run(async function(){await B.leave(id);await B.load()},"You left the jam");
    if(a.dataset.act==="submit")upload(id);
    if(a.dataset.act==="deljam"){var dj=J.filter(function(x){return x.id===id})[0],n=dj?dj.g.length:0;
      if(confirm("Delete this jam?")){var wg=n>0&&confirm("This jam has "+n+" game"+(n>1?"s":"")+". Press OK to delete the games too, or Cancel to keep them on the site.");
        run(async function(){await B.remove("jams",id,{withGames:wg});nd.close();NG.navigate("all");await B.load()},"Jam deleted")}}
    if(a.dataset.act==="editgame"){var eg=G.filter(function(x){return x[7]===id})[0];if(eg){$("dlg").close();upload(undefined,eg)}}
    if(a.dataset.act==="delgame")delGame(id);
    if(a.dataset.act==="editjam"){var ej=J.filter(function(x){return x.id===id})[0];if(ej)newjam(ej)}
  }
});
$("mobileAcct").addEventListener("click",function(){B.user?account():auth("login")});
nd.addEventListener("click",function(e){if(e.target===nd)nd.close()});
function setBanner(f){
  if(!f||!$("drop"))return;
  if(f.type.indexOf("image/")!==0){msg("That file is not an image.");return}
  file=f;rmBanner=false;paintDrop(URL.createObjectURL(f),f.name);msg("");
}
nd.addEventListener("change",function(e){if(e.target.id==="bn")setBanner(e.target.files[0])});
nd.addEventListener("input",function(e){if(e.target.id==="gt"||e.target.id==="gd")pv();if(["jn","jd","jh"].indexOf(e.target.id)>-1)pvj()});
/* Drag and drop a banner anywhere on the form */
["dragenter","dragover"].forEach(function(t){nd.addEventListener(t,function(e){if(!$("drop"))return;e.preventDefault();$("drop").classList.add("over")})});
nd.addEventListener("dragleave",function(e){var d=$("drop");if(d&&!nd.contains(e.relatedTarget))d.classList.remove("over")});
nd.addEventListener("drop",function(e){var d=$("drop");if(!d)return;e.preventDefault();d.classList.remove("over");setBanner(e.dataTransfer&&e.dataTransfer.files[0])});
/* Stop the browser opening a file that is dropped just outside the popup */
["dragover","drop"].forEach(function(t){document.addEventListener(t,function(e){if(nd.open)e.preventDefault()})});
nd.addEventListener("submit",function(e){e.preventDefault();var f=e.target.id,v=function(i){return $(i).value.trim()};
  run(async function(){
    if(f==="authForm"){var up=e.target.dataset.mode==="signup";
      if(up){var r=await B.signUp(v("fe"),$("fp").value,v("fu"));if(!r.session){msg("Check your email to confirm your account, then sign in.",true);return}}
      else await B.signIn(v("fe"),$("fp").value);nd.close()}
    if(f==="gameForm"){var gu=v("gu");if(!/^https:\/\//i.test(gu))throw new Error("The game link must start with https://");
      var ch=nd.querySelector(".chip[aria-pressed=true]"),jr=nd.querySelector('input[name="gj"]:checked'),row={title:v("gt"),genre:ch?ch.dataset.v:"Casual",description:v("gd"),play_url:gu,jam_id:(jr&&jr.value)||null};
      if(file)row.banner_url=await B.upload(file);else if(rmBanner)row.banner_url=null;
      if(editing)await B.update("games",editing,row);
      else{row.owner=B.user.id;if(!("banner_url" in row))row.banner_url=null;await B.insert("games",row)}
      nd.close();await B.load()}
    if(f==="jamForm"){if(!v("ja")||!v("jz"))throw new Error("Pick a start and end date.");if(v("jz")<v("ja"))throw new Error("The end date must be after the start date.");
      var row={name:v("jn"),description:v("jd"),starts:v("ja"),ends:v("jz"),hue:+$("jh").value,
        tags:v("jt").split(",").map(function(x){return x.trim()}).filter(Boolean),rules:$("jr").value.split("\n").map(function(x){return x.trim()}).filter(Boolean)};
      if(file)row.banner_url=await B.upload(file);else if(rmBanner)row.banner_url=null;
      if(editingJam)await B.update("jams",editingJam,row);
      else{if(!("banner_url" in row))row.banner_url=null;row.created_by=B.user.id;await B.insert("jams",row)}
      nd.close();await B.load()}
  },f==="gameForm"?(editing?"Changes saved":"Game published"):f==="jamForm"?(editingJam?"Jam updated":"Jam created"):f==="authForm"?"Welcome!":"")});

/* ---------- Jams sheet: close button, swipe down to close ---------- */
(function(){
  var sh=$("sheetHead"),as=$("sidebar"),y0=null,dy=0;if(!sh)return;
  $("sheetX").addEventListener("click",function(){as.classList.remove("mobile-open")});
  sh.addEventListener("touchstart",function(e){y0=e.touches[0].clientY;dy=0;as.style.transition="none"},{passive:true});
  sh.addEventListener("touchmove",function(e){if(y0===null)return;dy=Math.max(0,e.touches[0].clientY-y0);as.style.transform="translateY("+dy+"px)"},{passive:true});
  sh.addEventListener("touchend",function(){if(y0===null)return;as.style.transition="";as.style.transform="";if(dy>90)as.classList.remove("mobile-open");y0=null;dy=0});
})();
/* ---------- tab bar hides while scrolling down, returns on scroll up ---------- */
(function(){
  var m=document.querySelector("main"),tb=$("tabbar"),last=0;if(!m||!tb)return;
  m.addEventListener("scroll",function(){var y=m.scrollTop,d=y-last;if(Math.abs(d)<10)return;tb.classList.toggle("hide",d>0&&y>90);last=y},{passive:true});
})();

/* ---------- phone tab bar ---------- */
$("tabbar").addEventListener("click",function(e){
  var b=e.target.closest("[data-tab]");if(!b)return;var k=b.dataset.tab;
  if(k==="jams")$("mobileMenu").click();
  else{$("sidebar").classList.remove("mobile-open");
    if(k==="home")NG.navigate("all");
    else if(k==="search")$("mobileSearch").click();
    else if(k==="add")B.user?upload():auth("login");
    else if(k==="me")B.user?account():auth("login")}
});

/* ---------- connection problems ---------- */
var nb=document.createElement("div");nb.id="netbar";nb.className="netbar";nb.setAttribute("role","status");
nb.textContent="You are offline. Some things may not work until you reconnect.";document.body.appendChild(nb);
function net(){nb.classList.toggle("show",!navigator.onLine)}
window.addEventListener("offline",net);
window.addEventListener("online",function(){net();NG.toast("Back online","\u2713");if(B.enabled&&!B.mock)B.load()});net();
NG.fail=function(){$("pg").innerHTML='<div class="err"><div class="err-tile">!</div><h2>Can\'t reach the server</h2><p>Check your connection, then try again.</p><button class="btn dark" id="retry" type="button">Try again</button></div>'};
$("pg").addEventListener("click",function(e){if(e.target.id==="retry"){e.target.textContent="Trying...";B.load()}});

B.onChange(renderAcct);renderAcct();B.init();
})();
