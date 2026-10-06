const titles = {
  inicio: ["Buenos días, Administrador 👋", "Aquí tienes un resumen de tu negocio de préstamos."],
  clientes: ["Clientes", "Gestiona tus clientes y su historial."],
  prestamos: ["Préstamos", "Crea y controla préstamos y cronogramas."],
  cobrar: ["Cobrar", "Registra cuotas completas o parciales."],
  pagos: ["Pagos", "Consulta el historial de pagos."],
  calendario: ["Calendario", "Visualiza vencimientos y cobros."],
  atrasados: ["Atrasados", "Controla las cuotas vencidas."],
  caja: ["Caja", "Controla ingresos, gastos y saldo."],
  reportes: ["Reportes", "Analiza el rendimiento de tus préstamos."],
  ia: ["Asistente IA", "Consulta la información de tu negocio."],
  configuracion: ["Configuración", "Configura las reglas del sistema."]
};

function showModule(name){
  document.querySelectorAll(".module").forEach(m => m.classList.remove("active"));
  const target = document.getElementById(`module-${name}`);
  if(target) target.classList.add("active");

  document.querySelectorAll(".nav-item").forEach(n => n.classList.toggle("active", n.dataset.module === name));
  document.getElementById("pageTitle").textContent = titles[name][0];
  document.getElementById("pageSubtitle").textContent = titles[name][1];
  document.getElementById("sidebar").classList.remove("open");
  window.scrollTo({top:0, behavior:"smooth"});
}

document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => showModule(btn.dataset.module));
});

document.querySelectorAll("[data-module-link]").forEach(btn => {
  btn.addEventListener("click", e => {
    e.preventDefault();
    showModule(btn.dataset.moduleLink);
  });
});

document.getElementById("mobileMenu").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

const CLIENT_KEY="mi_prestamos_clientes_v1";
const defaultClients=[
{id:"c1",name:"Juan Pérez",dni:"12345678",phone:"987654321",address:"Av. Principal 123",reference:"Pedro Pérez",notes:"Cliente activo",loans:2,borrowed:2000,paid:1400,pending:600,status:"activo"},
{id:"c2",name:"María López",dni:"87654321",phone:"912345678",address:"Jr. Lima 456",reference:"Ana López",notes:"",loans:1,borrowed:500,paid:300,pending:200,status:"activo"},
{id:"c3",name:"Carlos Ruiz",dni:"11223344",phone:"998776554",address:"Calle Central 88",reference:"Luis Ruiz",notes:"Revisar atraso",loans:3,borrowed:2400,paid:1800,pending:600,status:"atrasado"}];
function getClients(){try{const x=JSON.parse(localStorage.getItem(CLIENT_KEY));return Array.isArray(x)?x:defaultClients}catch{return defaultClients}}
function saveClients(x){localStorage.setItem(CLIENT_KEY,JSON.stringify(x))}
function money(v){return "S/ "+Number(v||0).toLocaleString("es-PE",{minimumFractionDigits:2,maximumFractionDigits:2})}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function renderClients(){
 const list=getClients(),q=(clientSearch?.value||"").toLowerCase().trim(),s=clientStatusFilter?.value||"todos";
 const filtered=list.filter(c=>(!q||[c.name,c.dni,c.phone].some(x=>String(x||"").toLowerCase().includes(q)))&&(s==="todos"||c.status===s));
 clientTotal.textContent=list.length;clientActive.textContent=list.filter(c=>c.status==="activo").length;clientLate.textContent=list.filter(c=>c.status==="atrasado").length;
 clientsTable.innerHTML=filtered.map(c=>`<tr><td><b>${esc(c.name)}</b></td><td>${esc(c.dni||"—")}</td><td>${esc(c.phone||"—")}</td><td>${c.loans||0}</td><td>${money(c.pending)}</td><td><i class="status-pill ${c.status==="atrasado"?"status-late":"status-active"}">${c.status==="atrasado"?"Atrasado":"Activo"}</i></td><td><button class="client-action" data-view="${c.id}">Ver</button><button class="client-action" data-edit="${c.id}">Editar</button></td></tr>`).join("");
 emptyClients.hidden=filtered.length!==0;
 document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>openProfile(b.dataset.view));
 document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>openClientForm(b.dataset.edit));
}
function openClientForm(id=null){
 clientForm.reset();clientId.value=id||"";clientModalTitle.textContent=id?"Editar cliente":"Nuevo cliente";
 if(id){const c=getClients().find(x=>x.id===id);if(c){clientName.value=c.name;clientDni.value=c.dni||"";clientPhone.value=c.phone||"";clientAddress.value=c.address||"";clientReference.value=c.reference||"";clientNotes.value=c.notes||""}}
 clientModal.hidden=false;clientName.focus();
}
function openProfile(id){
 const c=getClients().find(x=>x.id===id);if(!c)return;
 profileName.textContent=c.name;profileContact.textContent=`DNI: ${c.dni||"—"} · Tel: ${c.phone||"—"}`;
 profileLoans.textContent=c.loans||0;profileBorrowed.textContent=money(c.borrowed);profilePaid.textContent=money(c.paid);profilePending.textContent=money(c.pending);
 profileDetails.innerHTML=`<div class="detail-item"><small>Dirección</small><b>${esc(c.address||"No registrada")}</b></div><div class="detail-item"><small>Referencia</small><b>${esc(c.reference||"No registrada")}</b></div><div class="detail-item" style="grid-column:1/-1"><small>Observaciones</small><b>${esc(c.notes||"Sin observaciones")}</b></div>`;
 profileModal.hidden=false;
}
newClientBtn?.addEventListener("click",()=>openClientForm());
closeClientModal?.addEventListener("click",()=>clientModal.hidden=true);
cancelClient?.addEventListener("click",()=>clientModal.hidden=true);
closeProfileModal?.addEventListener("click",()=>profileModal.hidden=true);
clientSearch?.addEventListener("input",renderClients);clientStatusFilter?.addEventListener("change",renderClients);
clientForm?.addEventListener("submit",e=>{
 e.preventDefault();const list=getClients(),id=clientId.value,data={name:clientName.value.trim(),dni:clientDni.value.trim(),phone:clientPhone.value.trim(),address:clientAddress.value.trim(),reference:clientReference.value.trim(),notes:clientNotes.value.trim()};
 if(!data.name)return;
 if(id){const i=list.findIndex(c=>c.id===id);if(i>=0)list[i]={...list[i],...data}}else list.push({id:"c_"+Date.now(),...data,loans:0,borrowed:0,paid:0,pending:0,status:"activo"});
 saveClients(list);clientModal.hidden=true;renderClients();
});
document.addEventListener("DOMContentLoaded",renderClients);


const LOAN_KEY="mi_prestamos_prestamos_v1";
function getLoans(){try{const x=JSON.parse(localStorage.getItem(LOAN_KEY));return Array.isArray(x)?x:[]}catch{return []}}
function saveLoans(x){localStorage.setItem(LOAN_KEY,JSON.stringify(x))}
function localDateValue(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function parseDate(v){const [y,m,d]=String(v).split("-").map(Number);return new Date(y,m-1,d)}
function addPeriod(date,f){const d=new Date(date);if(f==="diario")d.setDate(d.getDate()+1);else if(f==="semanal")d.setDate(d.getDate()+7);else if(f==="quincenal")d.setDate(d.getDate()+14);else if(f==="mensual")d.setMonth(d.getMonth()+1);else if(f==="anual")d.setFullYear(d.getFullYear()+1);return d}
function frequencyLabel(v){return ({diario:"Diario",semanal:"Semanal",quincenal:"Quincenal",mensual:"Mensual",anual:"Anual"}[v]||v)}
function makeSchedule(first,count,amount,f){let d=parseDate(first),a=[];for(let i=1;i<=count;i++){a.push({number:i,dueDate:localDateValue(d),amount:Number(amount.toFixed(2)),paid:0,status:"pendiente"});d=addPeriod(d,f)}return a}
function clientNameById(id){return getClients().find(c=>c.id===id)?.name||"Cliente eliminado"}
function renderLoanClients(){if(!loanClient)return;const cur=loanClient.value,cs=getClients();loanClient.innerHTML=`<option value="">Selecciona un cliente</option>`+cs.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}${c.dni?` · ${esc(c.dni)}`:""}</option>`).join("");if(cs.some(c=>c.id===cur))loanClient.value=cur}
function renderLoans(){const list=getLoans(),q=(loanSearch?.value||"").toLowerCase().trim(),st=loanStatusFilter?.value||"todos",filtered=list.filter(l=>(!q||clientNameById(l.clientId).toLowerCase().includes(q)||String(l.code).toLowerCase().includes(q))&&(st==="todos"||l.status===st));loanTotalBorrowed.textContent=money(list.reduce((a,l)=>a+Number(l.amount||0),0));loanTotalReceivable.textContent=money(list.reduce((a,l)=>a+Math.max(0,Number(l.total||0)-Number(l.paidTotal||0)),0));loanActiveCount.textContent=list.filter(l=>l.status==="activo").length;loansTable.innerHTML=filtered.map(l=>`<tr><td><b>${esc(l.code)}</b></td><td>${esc(clientNameById(l.clientId))}</td><td>${money(l.amount)}</td><td>${l.installments}</td><td>${money(l.installmentValue)}</td><td>${money(l.total)}</td><td><i class="status-pill status-active">${l.status==="terminado"?"Terminado":"Activo"}</i></td><td><button class="client-action" data-loan-view="${esc(l.id)}">Ver</button></td></tr>`).join("");emptyLoans.hidden=filtered.length!==0;document.querySelectorAll("[data-loan-view]").forEach(b=>b.onclick=()=>openLoanDetail(b.dataset.loanView))}
function refreshLoanCalc(){const amount=Number(loanAmount?.value||0),count=Math.max(0,Number(loanInstallments?.value||0)),inst=Number(loanInstallmentValue?.value||0),total=inst*count;calcPrincipal.textContent=money(amount);calcTotal.textContent=money(total);calcProfit.textContent=money(total-amount);calcInstallment.textContent=money(inst);const first=loanFirstDueDate?.value;if(first&&count&&inst){const rows=makeSchedule(first,count,inst,loanFrequency.value);scheduleCount.textContent=`${rows.length} ${rows.length===1?"cuota":"cuotas"}`;schedulePreview.innerHTML=rows.map(r=>`<tr><td>${r.number}</td><td>${new Intl.DateTimeFormat("es-PE").format(parseDate(r.dueDate))}</td><td>${money(r.amount)}</td><td><i class="status-pill status-active">Pendiente</i></td></tr>`).join("")}else{scheduleCount.textContent="0 cuotas";schedulePreview.innerHTML=`<tr><td colspan="4" class="empty-history">Completa los datos para ver el cronograma.</td></tr>`}}
function openLoanForm(){renderLoanClients();loanForm.reset();loanInstallments.value=14;loanFrequency.value="semanal";const t=new Date(),f=new Date(t);f.setDate(f.getDate()+7);loanStartDate.value=localDateValue(t);loanFirstDueDate.value=localDateValue(f);refreshLoanCalc();loanModal.hidden=false;loanClient.focus()}
function syncClientAfterLoan(id){const cs=getClients(),ls=getLoans().filter(l=>l.clientId===id),i=cs.findIndex(c=>c.id===id);if(i<0)return;const borrowed=ls.reduce((a,l)=>a+Number(l.amount||0),0),paid=ls.reduce((a,l)=>a+Number(l.paidTotal||0),0),pending=Math.max(0,ls.reduce((a,l)=>a+Number(l.total||0),0)-paid);cs[i]={...cs[i],loans:ls.length,borrowed,paid,pending,status:"activo"};saveClients(cs);renderClients()}
function openLoanDetail(id){const l=getLoans().find(x=>x.id===id);if(!l)return;loanDetailTitle.textContent=`${l.code} · ${clientNameById(l.clientId)}`;loanDetailSubtitle.textContent=`${frequencyLabel(l.frequency)} · ${l.installments} cuotas · Inicio ${new Intl.DateTimeFormat("es-PE").format(parseDate(l.startDate))}`;detailPrincipal.textContent=money(l.amount);detailTotal.textContent=money(l.total);detailProfit.textContent=money(l.total-l.amount);detailInstallment.textContent=money(l.installmentValue);loanDetailSchedule.innerHTML=l.schedule.map(r=>`<tr><td>${r.number}</td><td>${new Intl.DateTimeFormat("es-PE").format(parseDate(r.dueDate))}</td><td>${money(r.amount)}</td><td>${money(r.paid)}</td><td>${money(Math.max(0,r.amount-r.paid))}</td><td><i class="status-pill ${r.status==="pagado"?"status-active":"status-late"}">${r.status==="pagado"?"Pagada":"Pendiente"}</i></td></tr>`).join("");loanDetailModal.hidden=false}
newLoanBtn?.addEventListener("click",openLoanForm);closeLoanModal?.addEventListener("click",()=>loanModal.hidden=true);cancelLoan?.addEventListener("click",()=>loanModal.hidden=true);closeLoanDetail?.addEventListener("click",()=>loanDetailModal.hidden=true);
[loanAmount,loanInstallments,loanInstallmentValue,loanFrequency,loanFirstDueDate].forEach(el=>el?.addEventListener("input",refreshLoanCalc));loanSearch?.addEventListener("input",renderLoans);loanStatusFilter?.addEventListener("change",renderLoans);
loanForm?.addEventListener("submit",e=>{e.preventDefault();const amount=Number(loanAmount.value),count=Number(loanInstallments.value),inst=Number(loanInstallmentValue.value);if(!loanClient.value||amount<=0||count<1||inst<=0||!loanFirstDueDate.value)return;const ls=getLoans(),id="l_"+Date.now(),code="PRE-"+String(ls.length+1).padStart(4,"0"),total=Number((inst*count).toFixed(2));const loan={id,code,clientId:loanClient.value,amount,installments:count,frequency:loanFrequency.value,installmentValue:inst,total,paidTotal:0,status:"activo",startDate:loanStartDate.value,firstDueDate:loanFirstDueDate.value,notes:loanNotes.value.trim(),schedule:makeSchedule(loanFirstDueDate.value,count,inst,loanFrequency.value),createdAt:new Date().toISOString()};ls.push(loan);saveLoans(ls);syncClientAfterLoan(loan.clientId);loanModal.hidden=true;renderLoans()});
document.addEventListener("DOMContentLoaded",()=>{renderLoanClients();renderLoans()});


const PAYMENT_KEY="mi_prestamos_pagos_v1";
function getPayments(){try{const x=JSON.parse(localStorage.getItem(PAYMENT_KEY));return Array.isArray(x)?x:[]}catch{return []}}
function savePayments(x){localStorage.setItem(PAYMENT_KEY,JSON.stringify(x))}
function paymentMethodLabel(v){return ({efectivo:"Efectivo",yape:"Yape",plin:"Plin",transferencia:"Transferencia",otro:"Otro"}[v]||v)}
function loanById(id){return getLoans().find(l=>l.id===id)}
function paymentDateLabel(v){if(!v)return "—";return new Intl.DateTimeFormat("es-PE").format(parseDate(v))}
function renderPaymentClients(){if(!paymentClient)return;const cur=paymentClient.value,cs=getClients().filter(c=>getLoans().some(l=>l.clientId===c.id&&l.status!=="terminado"));paymentClient.innerHTML=`<option value="">Selecciona un cliente</option>`+cs.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}${c.dni?` · ${esc(c.dni)}`:""}</option>`).join("");if(cs.some(c=>c.id===cur))paymentClient.value=cur}
function renderPaymentLoans(){if(!paymentLoan)return;const cur=paymentLoan.value,ls=getLoans().filter(l=>l.clientId===paymentClient.value&&l.status!=="terminado"&&l.schedule.some(r=>Number(r.amount||0)>Number(r.paid||0)));paymentLoan.innerHTML=`<option value="">Selecciona un préstamo</option>`+ls.map(l=>`<option value="${esc(l.id)}">${esc(l.code)} · ${money(l.amount)} · Pendiente ${money(Math.max(0,l.total-(l.paidTotal||0)))}</option>`).join("");if(ls.some(l=>l.id===cur))paymentLoan.value=cur;renderPaymentInstallments()}
function renderPaymentInstallments(){if(!paymentInstallment)return;const cur=paymentInstallment.value,l=loanById(paymentLoan.value);const rows=(l?.schedule||[]).filter(r=>Number(r.amount||0)>Number(r.paid||0));paymentInstallment.innerHTML=`<option value="">Selecciona una cuota</option>`+rows.map(r=>`<option value="${r.number}">Cuota ${r.number} · Vence ${paymentDateLabel(r.dueDate)} · Saldo ${money(Math.max(0,r.amount-r.paid))}</option>`).join("");if(rows.some(r=>String(r.number)===cur))paymentInstallment.value=cur;refreshPaymentCalc()}
function refreshPaymentCalc(){const l=loanById(paymentLoan?.value),r=l?.schedule?.find(x=>String(x.number)===String(paymentInstallment?.value));const due=Number(r?.amount||0),paid=Number(r?.paid||0),balance=Math.max(0,due-paid),amount=Number(paymentAmount?.value||0);paymentDueAmount.textContent=money(due);paymentAlreadyPaid.textContent=money(paid);paymentCurrentBalance.textContent=money(balance);paymentAfterBalance.textContent=money(Math.max(0,balance-amount));if(paymentWarning){const over=amount>balance+0.001;paymentWarning.hidden=!over;paymentWarning.textContent=over?`El monto supera el saldo de esta cuota (${money(balance)}). Reduce el monto para continuar.`:""}}
function renderPayments(){const list=getPayments(),q=(paymentSearch?.value||"").toLowerCase().trim(),method=paymentMethodFilter?.value||"todos",filtered=list.filter(p=>{const l=loanById(p.loanId),cn=clientNameById(p.clientId);return(!q||[cn,l?.code,`cuota ${p.installment}`].some(x=>String(x||"").toLowerCase().includes(q)))&&(method==="todos"||p.method===method)}).sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.createdAt).localeCompare(String(a.createdAt)));paymentTotalCollected.textContent=money(list.reduce((a,p)=>a+Number(p.amount||0),0));paymentCount.textContent=list.length;paymentPendingCount.textContent=getLoans().reduce((a,l)=>a+l.schedule.filter(r=>Number(r.amount||0)>Number(r.paid||0)).length,0);paymentsTable.innerHTML=filtered.map(p=>{const l=loanById(p.loanId);return `<tr><td>${paymentDateLabel(p.date)}</td><td><b>${esc(clientNameById(p.clientId))}</b></td><td>${esc(l?.code||"—")}</td><td>Cuota ${p.installment}</td><td>${money(p.amount)}</td><td>${paymentMethodLabel(p.method)}</td><td><button class="client-action" data-payment-view="${esc(p.id)}">Ver</button></td></tr>`}).join("");emptyPayments.hidden=filtered.length!==0;document.querySelectorAll("[data-payment-view]").forEach(b=>b.onclick=()=>openPaymentDetail(b.dataset.paymentView))}
function openPaymentForm(){renderPaymentClients();paymentForm.reset();paymentDate.value=localDateValue(new Date());paymentMethod.value="efectivo";paymentClient.value="";renderPaymentLoans();paymentModal.hidden=false;paymentClient.focus()}
function syncClientAfterPayment(id){const cs=getClients(),ls=getLoans().filter(l=>l.clientId===id),i=cs.findIndex(c=>c.id===id);if(i<0)return;const borrowed=ls.reduce((a,l)=>a+Number(l.amount||0),0),paid=ls.reduce((a,l)=>a+Number(l.paidTotal||0),0),pending=Math.max(0,ls.reduce((a,l)=>a+Number(l.total||0),0)-paid),hasLate=ls.some(l=>l.schedule?.some(r=>Number(r.amount||0)>Number(r.paid||0)&&r.dueDate<localDateValue(new Date())));cs[i]={...cs[i],loans:ls.length,borrowed,paid,pending,status:hasLate?"atrasado":"activo"};saveClients(cs);renderClients()}
function applyPayment(){const l=loanById(paymentLoan.value),r=l?.schedule?.find(x=>String(x.number)===String(paymentInstallment.value)),amount=Number(paymentAmount.value);if(!l||!r||amount<=0)return false;const balance=Math.max(0,Number(r.amount||0)-Number(r.paid||0));if(amount>balance+0.001)return false;r.paid=Number((Number(r.paid||0)+amount).toFixed(2));r.status=r.paid>=Number(r.amount)-0.001?"pagado":"parcial";l.paidTotal=Number((l.schedule.reduce((a,x)=>a+Number(x.paid||0),0)).toFixed(2));l.status=l.schedule.every(x=>Number(x.paid||0)>=Number(x.amount||0)-0.001)?"terminado":"activo";const payments=getPayments();payments.push({id:"p_"+Date.now(),clientId:l.clientId,loanId:l.id,installment:r.number,date:paymentDate.value,amount,method:paymentMethod.value,notes:paymentNotes.value.trim(),createdAt:new Date().toISOString()});savePayments(payments);const ls=getLoans(),idx=ls.findIndex(x=>x.id===l.id);if(idx>=0)ls[idx]=l;saveLoans(ls);syncClientAfterPayment(l.clientId);return true}
function openPaymentDetail(id){const p=getPayments().find(x=>x.id===id);if(!p)return;const l=loanById(p.loanId);detailPaymentClient.textContent=clientNameById(p.clientId);detailPaymentAmount.textContent=money(p.amount);detailPaymentMethod.textContent=paymentMethodLabel(p.method);paymentDetailSubtitle.textContent=`${l?.code||"Préstamo"} · Cuota ${p.installment} · ${paymentDateLabel(p.date)}`;detailPaymentInfo.innerHTML=`<div class="detail-item"><small>Fecha</small><b>${paymentDateLabel(p.date)}</b></div><div class="detail-item"><small>Método</small><b>${esc(paymentMethodLabel(p.method))}</b></div><div class="detail-item"><small>Préstamo</small><b>${esc(l?.code||"—")}</b></div><div class="detail-item"><small>Cuota</small><b>Cuota ${p.installment}</b></div><div class="detail-item" style="grid-column:1/-1"><small>Observación</small><b>${esc(p.notes||"Sin observación")}</b></div>`;paymentDetailModal.hidden=false}
newPaymentBtn?.addEventListener("click",openPaymentForm);closePaymentModal?.addEventListener("click",()=>paymentModal.hidden=true);cancelPayment?.addEventListener("click",()=>paymentModal.hidden=true);closePaymentDetail?.addEventListener("click",()=>paymentDetailModal.hidden=true);paymentClient?.addEventListener("change",()=>{renderPaymentLoans();paymentLoan.value="";renderPaymentInstallments()});paymentLoan?.addEventListener("change",renderPaymentInstallments);paymentInstallment?.addEventListener("change",refreshPaymentCalc);paymentAmount?.addEventListener("input",refreshPaymentCalc);paymentSearch?.addEventListener("input",renderPayments);paymentMethodFilter?.addEventListener("change",renderPayments);paymentForm?.addEventListener("submit",e=>{e.preventDefault();if(!paymentClient.value||!paymentLoan.value||!paymentInstallment.value||!paymentDate.value||!paymentAmount.value)return;if(applyPayment()){paymentModal.hidden=true;renderPayments();renderLoans();renderClients();refreshPaymentCalc()}else{paymentWarning.hidden=false;paymentWarning.textContent="No se pudo registrar el pago. Verifica que el monto no supere el saldo de la cuota."}});document.addEventListener("DOMContentLoaded",()=>{renderPaymentClients();renderPayments()});
