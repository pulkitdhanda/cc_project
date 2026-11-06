const $ = (id) => document.getElementById(id);
const today = () => new Date().toISOString().slice(0,10);
const initialStudents = [
  {id:1,name:"Aarav Mehta",roll:"BCA-001",course:"BCA · Semester 3",joined:"05 Aug 2026"},
  {id:2,name:"Aanya Sharma",roll:"BCA-002",course:"BCA · Semester 3",joined:"05 Aug 2026"},
  {id:3,name:"Aditya Kapoor",roll:"BCA-003",course:"BCA · Semester 3",joined:"06 Aug 2026"},
  {id:4,name:"Diya Verma",roll:"BCA-004",course:"BCA · Semester 3",joined:"06 Aug 2026"},
  {id:5,name:"Ishaan Gupta",roll:"BCA-005",course:"BCA · Semester 3",joined:"07 Aug 2026"},
  {id:6,name:"Kavya Singh",roll:"BCA-006",course:"BCA · Semester 3",joined:"07 Aug 2026"},
  {id:7,name:"Reyansh Patel",roll:"BCA-007",course:"BCA · Semester 3",joined:"08 Aug 2026"},
  {id:8,name:"Sara Kaur",roll:"BCA-008",course:"BCA · Semester 3",joined:"08 Aug 2026"}
];
let students = JSON.parse(localStorage.getItem("attendly_students") || "null") || initialStudents;
let records = JSON.parse(localStorage.getItem("attendly_records") || "{}");
let currentFilter = "all";
let currentUser = "";
function save(){localStorage.setItem("attendly_students",JSON.stringify(students));localStorage.setItem("attendly_records",JSON.stringify(records))}
function recordFor(date){if(!records[date])records[date]={};return records[date]}
function statusOf(id,date=today()){return recordFor(date)[id]||"unmarked"}
function initials(name){return name.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase()}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2400)}
function setLogin(user){currentUser=user;$("loginView").classList.add("hidden");$("appView").classList.remove("hidden");$("welcomeName").textContent=user.split(/[._\s-]/)[0]||"there";$("avatar").textContent=initials(user);$("todayLabel").textContent=new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"});$("bigDate").textContent=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});$("dayName").textContent=new Date().toLocaleDateString("en-IN",{weekday:"long"});$("attendanceDate").value=today();renderAll()}
$("loginForm").addEventListener("submit",e=>{e.preventDefault();const id=$("userId").value.trim(),pass=$("password").value;if(!id||!pass)return;sessionStorage.setItem("attendly_user",id);setLogin(id)});
$("togglePassword").addEventListener("click",()=>{const p=$("password");p.type=p.type==="password"?"text":"password";$("togglePassword").textContent=p.type==="password"?"Show":"Hide"});
$("logoutBtn").addEventListener("click",()=>{sessionStorage.removeItem("attendly_user");$("appView").classList.add("hidden");$("loginView").classList.remove("hidden");$("password").value="";$("sidebar").classList.remove("open")});
function showPage(page){document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));$(page+"Page").classList.remove("hidden");document.querySelectorAll(".nav-item[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));$("pageTitle").textContent=page==="overview"?"Overview":page==="attendance"?"Attendance":"Students";if(page==="attendance")renderAttendance();if(page==="students")renderStudents();$("sidebar").classList.remove("open")}
document.querySelectorAll(".nav-item[data-page], [data-goto]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page||b.dataset.goto)));
$("quickMarkBtn").addEventListener("click",()=>showPage("attendance"));$("menuBtn").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
function badge(status){return `<span class="status-pill status-${status}">${status==="present"?"● Present":status==="absent"?"● Absent":"○ Not marked"}</span>`}
function studentCell(s){return `<div class="student-cell"><span class="student-avatar">${initials(s.name)}</span>${escapeHtml(s.name)}</div>`}
function renderOverview(){
 const date=today(),vals=students.map(s=>statusOf(s.id,date)),present=vals.filter(x=>x==="present").length,absent=vals.filter(x=>x==="absent").length,unmarked=vals.filter(x=>x==="unmarked").length,total=students.length,rate=total?Math.round(present/total*100):0;
 $("totalStat").textContent=total;$("presentStat").textContent=present;$("absentStat").textContent=absent;$("rateStat").textContent=rate+"%";$("presentPercent").textContent=rate+"%";$("donutValue").textContent=rate+"%";$("legendPresent").textContent=present;$("legendAbsent").textContent=absent;$("legendUnmarked").textContent=unmarked;
 $("donut").style.background=`conic-gradient(var(--purple) ${total?present/total*360:0}deg, #f0a35b 0deg ${total?(present+absent)/total*360:0}deg, #e8e8ef 0deg)`;
 $("recentStudents").innerHTML=students.slice(0,5).map(s=>`<tr><td>${studentCell(s)}</td><td>${escapeHtml(s.roll)}</td><td>${escapeHtml(s.course)}</td><td>${badge(statusOf(s.id))}</td></tr>`).join("")||`<tr><td colspan="4">No students added yet.</td></tr>`;
}
function renderAttendance(){
 const date=$("attendanceDate").value||today(),search=($("attendanceSearch").value||"").toLowerCase(),filtered=students.filter(s=>(s.name+" "+s.roll).toLowerCase().includes(search)).filter(s=>currentFilter==="all"||statusOf(s.id,date)===currentFilter);
 $("attendanceRows").innerHTML=filtered.map(s=>{const st=statusOf(s.id,date);return `<tr><td>${studentCell(s)}</td><td>${escapeHtml(s.roll)}</td><td>${escapeHtml(s.course)}</td><td><div class="status-actions"><button class="status-btn ${st==="present"?"selected present":""}" data-status="present" data-id="${s.id}">✓ Present</button><button class="status-btn ${st==="absent"?"selected absent":""}" data-status="absent" data-id="${s.id}">✕ Absent</button></div></td></tr>`}).join("");
 $("attendanceEmpty").classList.toggle("hidden",filtered.length>0);
 const vals=students.map(s=>statusOf(s.id,date)),marked=vals.filter(x=>x!=="unmarked").length;$("markedCount").textContent=`${marked} of ${students.length} marked`;$("progressText").textContent=marked===students.length&&students.length?"Attendance is complete for this date.":"Mark each student as present or absent.";$("progressBar").style.width=(students.length?marked/students.length*100:0)+"%";
 $("attendanceRows").querySelectorAll("[data-status]").forEach(b=>b.addEventListener("click",()=>{recordFor(date)[b.dataset.id]=b.dataset.status;save();renderAttendance();renderOverview()}));
}
function renderStudents(){
 const search=($("studentSearch").value||"").toLowerCase(),list=students.filter(s=>(s.name+" "+s.roll+" "+s.course).toLowerCase().includes(search));$("directoryCount").textContent=students.length;
 $("studentRows").innerHTML=list.map(s=>`<tr><td>${studentCell(s)}</td><td>${escapeHtml(s.roll)}</td><td>${escapeHtml(s.course)}</td><td>${escapeHtml(s.joined)}</td><td><button class="delete-btn" title="Delete student" data-delete="${s.id}">×</button></td></tr>`).join("");$("studentsEmpty").classList.toggle("hidden",list.length>0);
 $("studentRows").querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>{const s=students.find(x=>x.id==b.dataset.delete);if(!confirm(`Remove ${s.name} from the class?`))return;students=students.filter(x=>x.id!=b.dataset.delete);Object.values(records).forEach(r=>delete r[b.dataset.delete]);save();renderAll();toast("Student removed")}));
}
function renderAll(){renderOverview();renderAttendance();renderStudents()}
$("attendanceDate").addEventListener("change",renderAttendance);$("attendanceSearch").addEventListener("input",renderAttendance);$("studentSearch").addEventListener("input",renderStudents);
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{currentFilter=b.dataset.filter;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));renderAttendance()}));
$("allPresentBtn").addEventListener("click",()=>{const date=$("attendanceDate").value||today();students.forEach(s=>recordFor(date)[s.id]="present");save();renderAttendance();renderOverview();toast("All students marked present")});
$("clearBtn").addEventListener("click",()=>{const date=$("attendanceDate").value||today();if(!confirm("Clear all attendance for this date?"))return;records[date]={};save();renderAttendance();renderOverview();toast("Attendance cleared")});
$("exportBtn").addEventListener("click",()=>{const date=$("attendanceDate").value||today(),rows=[["Date","Student Name","Roll Number","Course","Status"],...students.map(s=>[date,s.name,s.roll,s.course,statusOf(s.id,date)])];const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=`attendance-${date}.csv`;a.click();URL.revokeObjectURL(a.href);toast("Attendance CSV exported")});
const modal=$("studentModal");function closeModal(){modal.classList.add("hidden");$("studentForm").reset();$("course").value="BCA · Semester 3"}
$("addStudentBtn").addEventListener("click",()=>modal.classList.remove("hidden"));$("closeModal").addEventListener("click",closeModal);$("cancelModal").addEventListener("click",closeModal);modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});
$("studentForm").addEventListener("submit",e=>{e.preventDefault();const name=$("studentName").value.trim(),roll=$("rollNo").value.trim(),course=$("course").value.trim();if(students.some(s=>s.roll.toLowerCase()===roll.toLowerCase())){toast("That roll number already exists");return}students.push({id:Date.now(),name,roll,course,joined:new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})});save();closeModal();renderAll();toast("Student added successfully")});
const remembered=sessionStorage.getItem("attendly_user");if(remembered)setLogin(remembered);
