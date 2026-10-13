/* FAKE BACKEND (localStorage). Same interface as backend.js, so switching to the real one later
   is just: set MODE:"supabase" in config.js. Nothing here is secure: it all lives in the visitor's browser. */
(function(){"use strict";
var C=window.NG_CONFIG||{};if(C.MODE==="supabase")return;
var KEY="ng-mock-db",B=window.NGB={enabled:true,mock:true,user:null,profile:null,mine:{},subs:[]};

/* Fake admin account. These credentials are visible to anyone who opens the code: remove with this file. */
var ADMIN={email:"admin@nanogram.app",username:"Nanogram Admin",password:"Asterix.1234"};

var uid=function(){return crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random().toString(36).slice(2)};
var hash=function(s){var h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return String(h)};
var hue=function(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%360;return h};
var today=function(){return new Date().toISOString().slice(0,10)};
var DEFAULT_BANNERS={};["sw","cz","ob","hw","ny","sp","sr","ar"].forEach(function(k){DEFAULT_BANNERS[k]="img/jams/"+k+".svg"});
var want=new URLSearchParams(location.search).get("jam");
var db=read();

function seed(){
  var d={users:[{id:"admin",email:ADMIN.email,username:ADMIN.username,pw:hash(ADMIN.password),discord:null,is_admin:true}],jams:[],games:[],members:[],session:null};
  DEMO_J.forEach(function(j){d.jams.push({id:j.id,name:j.n,description:j.d,hue:j.h,starts:j.a,ends:j.z,tags:j.tags,rules:j.rules,banner_url:null,ppl_base:parseInt(j.ppl.replace(/,/g,""),10)||0})});
  DEMO_G.forEach(function(g,i){var jam=DEMO_J.filter(function(j){return j.g.indexOf(i)>-1})[0];
    d.games.push({id:"g"+i,owner:null,owner_name:g[3],title:g[0],genre:g[1],description:g[4],play_url:"https://nanogram.app",banner_url:null,jam_id:jam?jam.id:null,created_at:DEMO_G.length-i})});
  try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}
  return d;
}
function read(){try{var d=JSON.parse(localStorage.getItem(KEY));if(d&&d.users)return d}catch(e){}return seed()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){throw new Error("Browser storage is full. Try a smaller banner.")}}
function sync(){var u=db.users.filter(function(x){return x.id===db.session})[0]||null;
  B.user=u?{id:u.id,email:u.email}:null;B.profile=u?{id:u.id,username:u.username,discord:u.discord,is_admin:u.is_admin}:null;return u}
function emit(){B.subs.forEach(function(f){f()})}
function me(){return sync()}
function uniq(n){var b=n.slice(0,24),x=b,i=1;while(db.users.some(function(u){return u.username.toLowerCase()===x.toLowerCase()}))x=b.slice(0,20)+"-"+(i++);return x}
function done(){window.NG.refresh();if(want){if(J.some(function(j){return j.id===want}))window.NG.navigate(want,false);want=null}}

B.isAdmin=function(){return !!(B.profile&&B.profile.is_admin)};
B.onChange=function(f){B.subs.push(f)};
B.init=async function(){await B.load();emit()};
B.reset=function(){localStorage.removeItem(KEY);location.reload()};

B.load=async function(){
  sync();var counts={};B.mine={};
  db.members.forEach(function(m){counts[m.jam_id]=(counts[m.jam_id]||0)+1;if(B.user&&m.user_id===B.user.id)B.mine[m.jam_id]=true});
  var jams=db.jams.map(function(j){return{id:j.id,n:j.name,h:j.hue,l:j.name.charAt(0).toUpperCase(),d:j.description,a:j.starts,z:j.ends,
    ppl:String((j.ppl_base||0)+(counts[j.id]||0)),g:[],tags:j.tags||[],rules:j.rules||[],banner:(j.banner_url||"").indexOf("data:image/")===0?j.banner_url:(DEFAULT_BANNERS[j.id]||""),featured:false}});
  var games=db.games.slice().sort(function(a,b){return b.created_at-a.created_at}).map(function(g){
    var o=db.users.filter(function(u){return u.id===g.owner})[0];
    return[g.title,g.genre,hue(g.title),o?o.username:(g.owner_name||"unknown"),g.description,(g.banner_url||"").indexOf("data:image/")===0?g.banner_url:"",g.play_url,g.id,g.owner||"",g.jam_id]});
  games.forEach(function(g,i){jams.forEach(function(j){if(j.id===g[9])j.g.push(i)})});
  J.length=0;jams.forEach(function(x){J.push(x)});G.length=0;games.forEach(function(x){G.push(x)});done();
};

B.signUp=async function(email,pw,username){
  email=email.trim().toLowerCase();username=username.trim();
  if(db.users.some(function(u){return u.email===email}))throw new Error("That email already has an account.");
  if(db.users.some(function(u){return u.username.toLowerCase()===username.toLowerCase()}))throw new Error("That username is taken.");
  var u={id:uid(),email:email,username:username,pw:hash(pw),discord:null,is_admin:false};db.users.push(u);db.session=u.id;save();await B.load();emit();return{session:{}};
};
B.signIn=async function(id,pw){
  var k=id.trim().toLowerCase(),u=db.users.filter(function(x){return x.email===k||x.username.toLowerCase()===k})[0];
  if(!u||u.pw!==hash(pw))throw new Error("Wrong username/email or password.");
  db.session=u.id;save();await B.load();emit();
};
B.signOut=async function(){db.session=null;save();await B.load();emit()};
B.discord=async function(link){
  var name=(prompt("Fake Discord (testing only). Enter a Discord username:")||"").trim();if(!name)return;
  if(link){var u=me();if(!u)throw new Error("Sign in first.");u.discord=name}
  else{var d=db.users.filter(function(x){return x.discord===name})[0];if(!d){d={id:uid(),email:"",username:uniq(name),pw:"",discord:name,is_admin:false};db.users.push(d)}db.session=d.id}
  save();await B.load();emit();
};
B.upload=function(file){return new Promise(function(res,rej){
  if(["image/png","image/jpeg","image/webp","image/gif"].indexOf(file.type)<0)return rej(new Error("Banner must be a PNG, JPG, WebP or GIF."));
  if(file.size>10485760)return rej(new Error("Banner must be under 10 MB."));
  var url=URL.createObjectURL(file),img=new Image();
  img.onload=function(){var s=Math.min(1,1600/Math.max(img.width,img.height)),c=document.createElement("canvas"),x;c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);res(c.toDataURL("image/jpeg",.85))};
  img.onerror=function(){rej(new Error("Could not read that image."))};img.src=url})};
B.insert=async function(t,row){
  if(!me())throw new Error("Sign in first.");
  if(t==="jams"){if(!B.isAdmin())throw new Error("Only admins can create jams.");db.jams.push(Object.assign({ppl_base:0},row,{id:uid()}))}
  if(t==="games"){
    if(row.jam_id){var j=db.jams.filter(function(x){return x.id===row.jam_id})[0];
      if(!j||today()<j.starts||today()>j.ends||!db.members.some(function(m){return m.jam_id===j.id&&m.user_id===B.user.id}))throw new Error("Join the jam first, and submit while it is live.")}
    db.games.push(Object.assign({},row,{id:uid(),created_at:Date.now(),owner:B.user.id}))}
  save();
};
B.update=async function(t,id,patch){
  var u=me();if(!u)throw new Error("Sign in first.");
  if(t==="jams"){
    if(!u.is_admin)throw new Error("Only admins can edit jams.");
    var jm=db.jams.filter(function(x){return x.id===id})[0];if(!jm)throw new Error("That jam no longer exists.");
    if((patch.ends||jm.ends)<(patch.starts||jm.starts))throw new Error("The end date must be after the start date.");
    ["name","description","starts","ends","hue","tags","rules","banner_url"].forEach(function(k){if(k in patch)jm[k]=patch[k]});save();return;
  }
  if(t!=="games")throw new Error("Not supported.");
  var g=db.games.filter(function(x){return x.id===id})[0];if(!g||(g.owner!==u.id&&!u.is_admin))throw new Error("You can only edit your own games.");
  if(patch.play_url&&!/^https:\/\//i.test(patch.play_url))throw new Error("The game link must start with https://");
  if(patch.jam_id&&patch.jam_id!==g.jam_id&&!u.is_admin){var j=db.jams.filter(function(x){return x.id===patch.jam_id})[0];
    if(!j||today()<j.starts||today()>j.ends||!db.members.some(function(mm){return mm.jam_id===j.id&&mm.user_id===u.id}))throw new Error("Join the jam first, and submit while it is live.")}
  ["title","genre","description","play_url","banner_url","jam_id"].forEach(function(k){if(k in patch)g[k]=patch[k]});save();
};
B.remove=async function(t,id,opts){
  if(!me())throw new Error("Sign in first.");
  if(t==="jams"){if(!B.isAdmin())throw new Error("Only admins can delete jams.");
    db.jams=db.jams.filter(function(j){return j.id!==id});db.members=db.members.filter(function(m){return m.jam_id!==id});if(opts&&opts.withGames)db.games=db.games.filter(function(g){return g.jam_id!==id});else db.games.forEach(function(g){if(g.jam_id===id)g.jam_id=null})}
  if(t==="games"){var g=db.games.filter(function(x){return x.id===id})[0];if(!g||(g.owner!==B.user.id&&!B.isAdmin()))throw new Error("You can only delete your own games.");db.games=db.games.filter(function(x){return x.id!==id})}
  save();
};
B.join=async function(id){if(!me())throw new Error("Sign in first.");if(!db.members.some(function(m){return m.jam_id===id&&m.user_id===B.user.id}))db.members.push({jam_id:id,user_id:B.user.id});save()};
B.leave=async function(id){if(!me())throw new Error("Sign in first.");db.members=db.members.filter(function(m){return !(m.jam_id===id&&m.user_id===B.user.id)});save()};
})();
