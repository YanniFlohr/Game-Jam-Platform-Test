(function(){"use strict";
var C=window.NG_CONFIG||{},sb=null;if(C.MODE!=="supabase")return;
var B=window.NGB={enabled:!!(C.SUPABASE_URL&&C.SUPABASE_ANON_KEY),user:null,profile:null,mine:{},subs:[]};
var BASE=(C.SUPABASE_URL||"")+"/storage/v1/object/public/banners/";
var okUrl=function(u){return B.enabled&&typeof u==="string"&&u.indexOf(BASE)===0?u:""};
var hue=function(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%360;return h};
var want=new URLSearchParams(location.search).get("jam");
function done(){window.NG.refresh();if(want){if(J.some(function(j){return j.id===want}))window.NG.navigate(want,false);want=null}}
var fill=function(a,b){a.length=0;b.forEach(function(x){a.push(x)})};
B.isAdmin=function(){return !!(B.profile&&B.profile.is_admin)};
B.onChange=function(f){B.subs.push(f)};
function err(r){if(r&&r.error){window.NG.toast(r.error.message,"!");throw r.error}return r}

B.load=async function(){
  if(!B.enabled){fill(J,DEMO_J);fill(G,DEMO_G);done();return}
  var r=await Promise.all([sb.from("jams").select("*"),sb.from("games").select("*,profiles(username)").order("created_at",{ascending:false}),sb.from("jam_members").select("jam_id,user_id")]);
  r.forEach(function(x){if(x.error)window.NG.toast("Could not load data","!")});
  var counts={},mine={};
  (r[2].data||[]).forEach(function(m){counts[m.jam_id]=(counts[m.jam_id]||0)+1;if(B.user&&m.user_id===B.user.id)mine[m.jam_id]=true});
  B.mine=mine;
  var jams=(r[0].data||[]).map(function(j){return{id:j.id,n:j.name,h:j.hue,l:j.name.charAt(0).toUpperCase(),d:j.description,a:j.starts,z:j.ends,
    ppl:String(counts[j.id]||0),g:[],tags:j.tags||[],rules:j.rules||[],banner:okUrl(j.banner_url),featured:false}});
  var games=(r[1].data||[]).map(function(g){return[g.title,g.genre,hue(g.title),(g.profiles&&g.profiles.username)||"unknown",g.description,okUrl(g.banner_url),g.play_url,g.id,g.owner,g.jam_id]});
  games.forEach(function(g,i){jams.forEach(function(j){if(j.id===g[9])j.g.push(i)})});
  fill(J,jams);fill(G,games);done();
};

B.session=async function(s){
  B.user=s?s.user:null;B.profile=null;
  if(B.user){
    var p=await sb.from("profiles").select("*").eq("id",B.user.id).single();B.profile=p.data;
    var d=(B.user.identities||[]).filter(function(i){return i.provider==="discord"})[0];
    if(d&&B.profile){var nm=(d.identity_data&&(d.identity_data.full_name||d.identity_data.name))||"";
      if(nm&&nm!==B.profile.discord){await sb.from("profiles").update({discord:nm}).eq("id",B.user.id);B.profile.discord=nm}}
  }
  await B.load();B.subs.forEach(function(f){f()});
};
B.init=async function(){
  if(B.enabled&&!window.supabase){await new Promise(function(ok,no){var s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";s.onload=ok;s.onerror=function(){no(new Error("Could not load the Supabase library."))};document.head.appendChild(s)}).catch(function(e){B.enabled=false;window.NG.toast(e.message,"!")})}
  if(!B.enabled){await B.load();B.subs.forEach(function(f){f()});return}
  sb=B.sb=window.supabase.createClient(C.SUPABASE_URL,C.SUPABASE_ANON_KEY);
  sb.auth.onAuthStateChange(function(ev,s){if(ev==="SIGNED_IN"||ev==="SIGNED_OUT"||ev==="USER_UPDATED")setTimeout(function(){B.session(s)},0)});
  await B.session((await sb.auth.getSession()).data.session);
};

B.signUp=async function(email,pw,username){var r=await sb.auth.signUp({email:email,password:pw,options:{data:{username:username},emailRedirectTo:location.origin+location.pathname}});if(r.error)throw r.error;return r.data};
B.signIn=async function(email,pw){if(email.indexOf("@")<0)throw new Error("Use your email address to sign in.");var r=await sb.auth.signInWithPassword({email:email,password:pw});if(r.error)throw r.error};
B.signOut=function(){return sb.auth.signOut()};
B.discord=async function(link){var o={provider:"discord",options:{redirectTo:location.origin+location.pathname}};var r=link?await sb.auth.linkIdentity(o):await sb.auth.signInWithOAuth(o);if(r.error)throw r.error};
B.upload=async function(file){
  var ext={"image/png":"png","image/jpeg":"jpg","image/webp":"webp","image/gif":"gif"}[file.type];
  if(!ext)throw new Error("Banner must be a PNG, JPG, WebP or GIF.");
  if(file.size>10485760)throw new Error("Banner must be under 10 MB.");
  var path=B.user.id+"/"+Date.now()+"-"+Math.random().toString(36).slice(2,8)+"."+ext;
  var r=await sb.storage.from("banners").upload(path,file,{contentType:file.type});if(r.error)throw r.error;
  return sb.storage.from("banners").getPublicUrl(path).data.publicUrl;
};
B.insert=async function(t,row){var r=await sb.from(t).insert(row);if(r.error)throw r.error};
B.update=async function(t,id,patch){var r=await sb.from(t).update(patch).eq("id",id);if(r.error)throw r.error};
B.remove=async function(t,id,opts){if(t==="jams"&&opts&&opts.withGames){var r0=await sb.from("games").delete().eq("jam_id",id);if(r0.error)throw r0.error}var r=await sb.from(t).delete().eq("id",id);if(r.error)throw r.error};
B.join=async function(id){var r=await sb.from("jam_members").insert({jam_id:id});if(r.error)throw r.error};
B.leave=async function(id){var r=await sb.from("jam_members").delete().eq("jam_id",id).eq("user_id",B.user.id);if(r.error)throw r.error};
})();
