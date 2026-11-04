// Event Listing and Registration Module - behaviour
// ---------- Demo data (simulated service) ----------
var EVENTS = [
  {id:1,title:"Web Dev Sprint",category:"Hackathon",date:"2026-12-05",status:"Open",desc:"A 24-hour sprint to build a small web app from a given problem statement.",rules:["Teams of 1 to 4 members","Any web stack allowed","Project must be shown in a short demo"]},
  {id:2,title:"AI Ideathon",category:"Competition",date:"2026-12-12",status:"Open",desc:"Pitch an idea that uses AI to solve an everyday problem.",rules:["Individual or team entry","5-minute pitch","Judged on idea, impact and feasibility"]},
  {id:3,title:"UI Design Challenge",category:"Competition",date:"2027-01-09",status:"Upcoming",desc:"Redesign the screens of a given app with a focus on usability.",rules:["Individual entry","Submit design files before the deadline","Mobile and desktop screens required"]},
  {id:4,title:"Open Source Weekend",category:"Collaboration",date:"2026-11-20",status:"Closed",desc:"Contribute to beginner-friendly open source issues with mentor support.",rules:["Basic Git knowledge needed","Work in pairs","Pull requests will be reviewed"]},
  {id:5,title:"Data Dash",category:"Hackathon",date:"2027-01-23",status:"Upcoming",desc:"Analyse a public dataset and present insights through a dashboard.",rules:["Teams of 2 to 3","Any tool allowed","Short report is required"]},
  {id:6,title:"Code Collab Camp",category:"Collaboration",date:"2026-12-19",status:"Open",desc:"Find teammates, form a group and plan a project together over two days.",rules:["Open to all branches","Group formation on day one","Plan shared at the end"]}
];
var EXTRA={1:{icon:"💻",mode:"Online",team:"1–4",prize:"₹25,000",seats:100,left:34,deadline:"2026-12-01",sched:["Day 1, 10:00 – Kick-off and problem statements","Day 1, 11:00 – Building starts","Day 2, 11:00 – Submissions close","Day 2, 14:00 – Demos and results"]},
2:{icon:"🤖",mode:"Online",team:"1–3",prize:"₹15,000",seats:80,left:52,deadline:"2026-12-08",sched:["10:00 – Briefing","11:00 – Idea development","15:00 – Pitches","17:00 – Results"]},
3:{icon:"🎨",mode:"Online",team:"1",prize:"₹10,000",seats:60,left:60,deadline:"2027-01-05",sched:["Brief released on the start date","One week for design work","Submission and judging"]},
4:{icon:"🌐",mode:"Hybrid",team:"2",prize:"Certificates",seats:40,left:0,deadline:"2026-11-15",sched:["Day 1 – Orientation and issue selection","Day 2 – Pull requests and review"]},
5:{icon:"📊",mode:"Online",team:"2–3",prize:"₹20,000",seats:90,left:71,deadline:"2027-01-18",sched:["Dataset release","48 hours of analysis","Dashboard presentations"]},
6:{icon:"🤝",mode:"Online",team:"Any",prize:"Certificates",seats:120,left:88,deadline:"2026-12-15",sched:["Day 1 – Meet and form teams","Day 2 – Plan the project","Closing – Share plans"]}};
function getEvents(fail){
  return new Promise(function(res,rej){setTimeout(function(){fail?rej(new Error("fail")):res(EVENTS.map(function(e){return Object.assign({},e,EXTRA[e.id])}))},700)});
}

// ---------- State ----------
var state={events:[],loading:true,error:null,query:"",category:"all",status:"all",registered:{}};
var $=function(id){return document.getElementById(id)};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}

// ---------- Logic (same as report listings 4.2 and 4.4) ----------
function filterEvents(events,query,category,status){
  var q=query.trim().toLowerCase();
  return events.filter(function(e){
    var t=e.title.toLowerCase().indexOf(q)!==-1||e.desc.toLowerCase().indexOf(q)!==-1;
    return t&&(category==="all"||e.category===category)&&(status==="all"||e.status===status);
  });
}
function validate(v){
  var er={};
  if(!v.name.trim())er.name="Name is required";
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))er.email="Enter a valid email address";
  if(!/^[0-9]{10}$/.test(v.phone))er.phone="Enter a 10-digit phone number";
  if(!v.college.trim())er.college="College or organisation is required";
  if(!v.terms)er.terms="Please accept the event rules";
  return er;
}

// ---------- Rendering ----------
function seatBar(e){var used=Math.round((e.seats-e.left)/e.seats*100);return '<div><div class="bar" aria-hidden="true"><i style="width:'+used+'%"></i></div><div class="seat">'+(e.left?e.left+' of '+e.seats+' seats left':'No seats left')+'</div></div>'}
function fmt(d){return new Date(d+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
function renderList(){
  var box=$("results"),count=$("count");
  if(state.loading){count.textContent="";box.innerHTML='<div class="state" role="status"><div class="spin"></div>Loading events…</div>';return}
  if(state.error){count.textContent="";box.innerHTML='<div class="state" role="alert">'+esc(state.error)+'<br><br><button class="btn" id="retry">Retry</button></div>';$("retry").onclick=load;return}
  var list=filterEvents(state.events,state.query,state.category,state.status);
  var so=$("sort").value;list.sort(function(a,b){return so==="date"?a.date.localeCompare(b.date):so==="seats"?b.left-a.left:a.title.localeCompare(b.title)});updateStats();
  count.textContent=list.length+" of "+state.events.length+" events shown";
  if(!list.length){box.innerHTML='<div class="state">No events match your search or filters.<br>Try a different keyword or reset the filters.</div>';return}
  box.innerHTML='<div class="grid">'+list.map(function(e){
    return '<article class="card s-'+e.status+'"><div class="ctop"><span class="ico">'+e.icon+'</span><span class="tag '+e.status+'">'+e.status+'</span></div><h3>'+esc(e.title)+'</h3>'+
      '<div class="meta">'+esc(e.category)+' · '+fmt(e.date)+'</div><p class="meta" style="margin:0">'+esc(e.desc)+'</p><div class="chips"><span>'+e.mode+'</span><span>👥 '+e.team+'</span><span>🏆 '+e.prize+'</span></div>'+seatBar(e)+
      (state.registered[e.id]?'<span class="tag Open">Registered</span>':'')+
      '<button class="btn" data-id="'+e.id+'">View details</button></article>';
  }).join("")+'</div>';
  Array.prototype.forEach.call(box.querySelectorAll("button[data-id]"),function(b){b.onclick=function(){openDetail(+b.dataset.id)}});
}
function openDetail(id){
  var e=state.events.filter(function(x){return x.id===id})[0];
  var open=e.status==="Open",done=state.registered[id];
  $("listView").hidden=true;
  var v=$("detailView");v.hidden=false;
  v.innerHTML='<button class="btn ghost" id="back">← Back to events</button><div class="detail"><span class="tag '+e.status+'">'+e.status+'</span>'+
    '<h2>'+e.icon+' '+esc(e.title)+'</h2><div class="meta">'+esc(e.category)+' · '+fmt(e.date)+'</div><p>'+esc(e.desc)+'</p><div class="info"><div><b>Mode</b>'+e.mode+'</div><div><b>Team size</b>'+e.team+'</div><div><b>Prize pool</b>'+e.prize+'</div><div><b>Register by</b>'+fmt(e.deadline)+'</div></div>'+seatBar(e)+'<p></p><strong>Schedule</strong><ol class="tl">'+e.sched.map(function(s){return '<li>'+esc(s)+'</li>'}).join('')+'</ol><strong>Rules</strong><ul>'+
    e.rules.map(function(r){return "<li>"+esc(r)+"</li>"}).join("")+'</ul></div>'+
    '<div class="detail"><h2 style="font-size:1.2rem">Register</h2>'+
    (done?'<div class="msg ok">You are registered for this event.</div>':
     !open?'<div class="msg bad">Registration is not open for this event ('+e.status.toLowerCase()+').</div>':
     '<form id="reg" novalidate><div class="cols"><div>'+
     '<div class="field"><label for="name">Full name</label><input id="name" type="text" autocomplete="name"><div class="err" id="e-name"></div></div>'+
     '<div class="field"><label for="email">Email</label><input id="email" type="email" autocomplete="email"><div class="err" id="e-email"></div></div>'+
     '<div class="field"><label for="college">College / organisation</label><input id="college" type="text" autocomplete="organization"><div class="err" id="e-college"></div></div></div><div>'+
     '<div class="field"><label for="phone">Phone (10 digits)</label><input id="phone" type="tel" inputmode="numeric" autocomplete="tel"><div class="err" id="e-phone"></div></div>'+
     '<div class="field"><label for="role">Participating as</label><select id="role"><option>Individual</option><option>Team leader</option><option>Team member</option></select></div><label class="chk"><input type="checkbox" id="terms"> I agree to the event rules</label><div class="err" id="e-terms"></div><button class="btn" type="submit" id="sub" style="margin-top:8px">Submit registration</button></div></div><div id="fb" role="status" aria-live="polite"></div></form>')+'</div>';
  $("back").onclick=function(){v.hidden=true;$("listView").hidden=false;renderList();window.scrollTo(0,0)};
  var f=$("reg");if(f)f.onsubmit=function(ev){ev.preventDefault();submit(id)};
  window.scrollTo(0,0);
}
function submit(id){
  var vals={name:$("name").value,email:$("email").value,phone:$("phone").value,college:$("college").value,role:$("role").value,terms:$("terms").checked};
  var er=validate(vals);
  ["name","email","college","phone","terms"].forEach(function(k){$("e-"+k).textContent=er[k]||"";$(k).classList.toggle("bad",!!er[k]);$(k).setAttribute("aria-invalid",!!er[k])});
  var fb=$("fb");fb.innerHTML="";
  if(Object.keys(er).length){var first=["name","email","college","phone","terms"].filter(function(k){return er[k]})[0];$(first).focus();return}
  var btn=$("sub");btn.disabled=true;btn.textContent="Submitting…";
  setTimeout(function(){ // simulated POST request
    if($("simErr")&&$("simErr").checked){fb.innerHTML='<div class="msg bad">Registration failed. Please try again.</div>';btn.disabled=false;btn.textContent="Submit registration";return}
    state.registered[id]=vals;
    var ref="ZG-"+id+"-"+Math.random().toString(36).slice(2,7).toUpperCase();fb.innerHTML='<div class="msg ok"><strong>Registration successful 🎉</strong><br>Reference ID: <b>'+ref+'</b><br>A confirmation will be sent to '+esc(vals.email)+'.</div>';vals.ref=ref;updateStats();toast('You\u2019re registered \ud83c\udf89 Check \u201cYour registrations\u201d below.');
    btn.textContent="Registered";
  },700);
}

// ---------- Setup ----------
function fillSelect(sel,label,values){sel.innerHTML='<option value="all">All '+label+'</option>'+values.map(function(v){return '<option>'+v+'</option>'}).join("")}
function load(){
  state.loading=true;state.error=null;renderList();
  getEvents($("simErr").checked).then(function(ev){state.events=ev;state.loading=false;renderList()})
   .catch(function(){state.loading=false;state.error="Could not load events. Please try again.";renderList()});
}
function toast(m){var t=$("toast");t.textContent=m;t.classList.add("on");setTimeout(function(){t.classList.remove("on")},3200)}
function renderMine(){
  var ids=Object.keys(state.registered);$("mine").hidden=!ids.length;
  $("mineList").innerHTML=ids.map(function(id){
    var e=state.events.filter(function(x){return x.id==id})[0],r=state.registered[id];
    return '<li><span class="av">'+esc(r.name.trim().charAt(0).toUpperCase())+'</span><div><b>'+esc(e.title)+'</b><div class="meta">'+fmt(e.date)+' \u00b7 '+esc(r.role)+' \u00b7 Ref '+esc(r.ref||"")+'</div></div></li>';
  }).join("");
}
function updateStats(){var ev=state.events,c=function(s){return ev.filter(function(e){return e.status===s}).length};$("stats").innerHTML=[["Total events",ev.length],["Open now",c("Open")],["Upcoming",c("Upcoming")],["Your registrations",Object.keys(state.registered).length]].map(function(x){return '<div><b>'+x[1]+'</b><span>'+x[0]+'</span></div>'}).join('');renderMine()}
$("theme").onclick=function(){var r=document.documentElement,d=r.dataset.theme==="dark"||(r.dataset.theme!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches);r.dataset.theme=d?"light":"dark"};
$("reset").onclick=function(){$("q").value="";$("cat").value="all";$("st").value="all";$("sort").value="date";state.query="";state.category="all";state.status="all";renderList()};
$("sort").onchange=renderList;
fillSelect($("cat"),"categories",["Hackathon","Competition","Collaboration"]);
fillSelect($("st"),"statuses",["Open","Upcoming","Closed"]);
$("q").oninput=function(){state.query=this.value;renderList()};
$("cat").onchange=function(){state.category=this.value;renderList()};
$("st").onchange=function(){state.status=this.value;renderList()};
$("simErr").onchange=function(){if(this.checked||state.error||!state.events.length)load()};
load();