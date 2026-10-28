(()=>{
'use strict';
const $=id=>document.getElementById(id);
const form=$('campaignLeadForm');if(!form)return;
const api='https://ladflytczreurjaicgdt.supabase.co/functions/v1/migdalor-leads';
const params=new URLSearchParams(location.search);
const queryIntent=params.get('intent'), alias={moving:'חיבור חדש',new:'חיבור חדש',switch:'מעבר ספק',fault:'תקלה בבית',business:'אינטרנט לעסק',building:'אינטרנט לבניין'};
if(queryIntent){const val=alias[queryIntent]||queryIntent;if([...$('intent').options].some(x=>x.value===val))$('intent').value=val;}
$('intent').addEventListener('change',()=>{
  if($('intent').value==='חיבור חדש'&&!$('provider').value)$('provider').value='לא מחובר לאף חברה';
});
function phoneNumber(s){
 const n=(s||'').replace(/[^\d+]/g,'');
 if(n.startsWith('+972'))return '0'+n.slice(4);
 if(n.startsWith('972'))return '0'+n.slice(3);
 return n;
}
function error(text){
 const el=$('formError');el.textContent=text;el.classList.remove('hidden');el.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function clearError(){$('formError').textContent='';$('formError').classList.add('hidden');}
function valid(){
 clearError();
 if(!$('intent').value)return error('בחרו מה תרצו לבדוק.'),false;
 if($('fullName').value.trim().length<2)return error('איך קוראים לכם?'),false;
 if(!/^05\d{8}$/.test(phoneNumber($('phone').value)))return error('הזינו מספר WhatsApp ישראלי תקין בן 10 ספרות.'),false;
 if($('city').value.trim().length<2)return error('מלאו עיר או יישוב.'),false;
 if(!$('provider').value)return error('בחרו את חברת האינטרנט הנוכחית או ״לא מחובר לאף חברה״.'),false;
 if(!$('consent').checked)return error('כדי לשלוח את הפנייה יש לאשר שמירת פרטים ויצירת קשר ב־WhatsApp.'),false;
 return true;
}
const src=(params.get('utm_source')||'landing_page').slice(0,150);
const med=(params.get('utm_medium')||'website').slice(0,150);
const campaign=(params.get('utm_campaign')||'migdalor_short_form_2026').slice(0,150);
function customerWA(number){return 'https://wa.me/972'+number.slice(1);}
async function sendAdminEmail(body){
 // Mail goes to the operator only. We never collect the customer's email or request an autoresponse.
 const fields={
   _subject:'[מגדלור] ליד חדש | '+body.intent+' | '+body.city,
   _template:'table',_honey:'',
   name:body.fullName,
   phone:body.phone,
   whatsapp_link:customerWA(body.phone),
   city:body.city,
   current_provider:body.provider,
   internet_need:body.intent,
   customer_type:body.customerType,
   contact_via:'WhatsApp בלבד - אין מייל לקוח',
   opt_in_to_partner:body.referralOptIn?'כן':'לא',
   source:body.utmSource,medium:body.utmMedium,campaign:body.utmCampaign,
   notes:body.notes||'לא נמסרו',
   message:'הודעת ליד חדשה ממגדלור. לשיחה מיידית עם הלקוח יש ללחוץ על whatsapp_link.'
 };
 const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),9500);
 try{
  const resp=await fetch('https://formsubmit.co/ajax/hendayan1990@gmail.com',{
   method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
   body:JSON.stringify(fields),signal:ac.signal
  });
  const reply=await resp.json().catch(()=>({}));
  return resp.ok&&(reply.success===true||reply.success==='true');
 }finally{clearTimeout(timer)}
}
form.addEventListener('submit',async event=>{
 event.preventDefault();
 if(!valid())return;
 const btn=$('submitBtn');btn.disabled=true;btn.textContent='שולחים את הפנייה...';
 const phone=phoneNumber($('phone').value);
 const intent=$('intent').value;
 const customerType=intent==='אינטרנט לעסק'?'עסק':intent==='אינטרנט לבניין'?'ועד בית':'דירה';
 const body={
  fullName:$('fullName').value.trim(),phone,city:$('city').value.trim(),
  intent,provider:$('provider').value,customerType,
  timing:'בהמשך',contactMethod:'וואטסאפ',email:'',
  street:'',houseNumber:'',requestedProvider:'',budget:'',notes:($('notes')?.value||'').trim(),
  consent:$('consent').checked,referralOptIn:$('referralOptIn').checked,
  utmSource:src,utmMedium:med,utmCampaign:campaign,website:$('website').value||''
 };
 try{
  const r=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const data=await r.json().catch(()=>({}));
  if(!r.ok||data.ok!==true)throw Error(data.error||'שמירת הפנייה נכשלה.');
  let mail=false;
  try{mail=await sendAdminEmail(body)}catch(err){console.warn('Migdalor notification request was not confirmed. Lead remains saved.');}
  window.__migdalorLastMailStatus=mail?'sent':'not_confirmed';
  form.classList.add('hidden');$('success').classList.remove('hidden');
  const message='שלום מגדלור, השארתי בקשה באתר. שמי '+body.fullName+', מהעיר '+body.city+'. נושא: '+body.intent+'. ספק נוכחי: '+body.provider+'.';
  $('successWA').href='https://wa.me/972559344185?text='+encodeURIComponent(message);
  $('success').scrollIntoView({behavior:'smooth',block:'center'});
 }catch(err){error(err?.message||'לא הצלחנו לשמור את הפנייה. אפשר לפנות ישירות ב־WhatsApp.');}
 finally{btn.disabled=false;btn.textContent='שליחה וקבלת אפשרויות לבדיקה ←';}
});
})();
