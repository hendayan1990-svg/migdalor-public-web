(()=>{
'use strict';
const form=document.getElementById('campaignLeadForm');if(!form)return;
const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);
const api='https://ladflytczreurjaicgdt.supabase.co/functions/v1/migdalor-leads';
const intentMap={moving:'חיבור חדש',new:'חיבור חדש',switch:'מעבר ספק',fault:'תקלה בבית',business:'אינטרנט לעסק',building:'אינטרנט לבניין'};
const queryIntent=params.get('intent');if(queryIntent){const val=intentMap[queryIntent]||queryIntent;if([...$('intent').options].some(o=>o.value===val))$('intent').value=val;}
$('intent').addEventListener('change',()=>{if($('intent').value==='חיבור חדש'&& !$('provider').value)$('provider').value='לא מחובר לאף חברה';if($('intent').value==='אינטרנט לעסק')$('customerType').value='עסק';if($('intent').value==='אינטרנט לבניין')$('customerType').value='ועד בית';});
$('contactMethod').addEventListener('change',()=>{$('emailWrap').classList.toggle('hidden',$('contactMethod').value!=='מייל');$('email').required=$('contactMethod').value==='מייל';});
function showError(message){const node=$('formError');node.textContent=message;node.classList.remove('hidden');node.scrollIntoView({behavior:'smooth',block:'nearest'});}
function clearError(){$('formError').textContent='';$('formError').classList.add('hidden');}
function isValid(){
clearError();
if(!$('intent').value)return showError('בחרו קודם מה תרצו לבדוק.'),false;
if(!$('provider').value)return showError('בחרו חברת אינטרנט נוכחית, או "לא מחובר לאף חברה".'),false;
if($('fullName').value.trim().length<2)return showError('מלאו שם מלא.'),false;
if(!/^0[0-9]{9}$/.test($('phone').value.replace(/\D/g,'')))return showError('הזינו מספר סלולרי ישראלי בן 10 ספרות.'),false;
if($('city').value.trim().length<2)return showError('מלאו עיר או יישוב.'),false;
if($('contactMethod').value==='מייל' && !$('email').checkValidity())return showError('הזינו כתובת מייל תקינה לחזרה.'),false;
if(!$('consent').checked)return showError('כדי לשלוח את הפנייה נדרשת הסכמה לשמירת הפרטים וליצירת קשר.'),false;
return true;}
const landingSource=(params.get('utm_source')||'campaign_video').slice(0,150);
const landingMedium=(params.get('utm_medium')||'website').slice(0,150);
const landingCampaign=(params.get('utm_campaign')||'migdalor_danit_landing_2026').slice(0,150);
form.addEventListener('submit',async(e)=>{
e.preventDefault();if(!isValid())return;
const button=$('submitBtn');button.disabled=true;button.textContent='שומרים את הפנייה…';
const body={
fullName:$('fullName').value.trim(),phone:$('phone').value.replace(/\D/g,''),city:$('city').value.trim(),
street:'',houseNumber:'',customerType:$('customerType').value,intent:$('intent').value,provider:$('provider').value,
requestedProvider:'',timing:$('timing').value,budget:'',notes:$('notes').value.trim(),
contactMethod:$('contactMethod').value,email:$('email').value.trim(),consent:$('consent').checked,
referralOptIn:$('referralOptIn').checked,utmSource:landingSource,utmMedium:landingMedium,utmCampaign:landingCampaign,
website:$('website').value};
try{
const r=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const result=await r.json().catch(()=>({}));
if(!r.ok||result.ok!==true)throw Error(result.error||'שמירת הבקשה נכשלה. נסו שוב.');
// Email notification uses FormSubmit.co in the user's browser after durable Supabase storage.
// FormSubmit does not receive data unless the user checked the service-processing consent.
let mailSent=false;
try{
 const mailRequest={
   _subject:'[מגדלור] פנייה חדשה | '+body.intent+' | '+body.city,
   _template:'table',
   _honey:'',
   name:body.fullName,
   phone:body.phone,
   city:body.city,
   current_provider:body.provider,
   intent:body.intent,
   customer_type:body.customerType,
   timing:body.timing,
   contact_method:body.contactMethod,
   consent_to_referral:body.referralOptIn?'כן':'לא',
   campaign_source:body.utmSource,
   campaign_medium:body.utmMedium,
   campaign_name:body.utmCampaign,
   message:'בקשה חדשה ממגדלור. הערות: '+(body.notes||'אין הערות')
 };
 if(body.email)mailRequest.email=body.email;
 const ac=new AbortController();const timer=setTimeout(()=>ac.abort(),8000);
 try{
   const m=await fetch('https://formsubmit.co/ajax/hendayan1990@gmail.com',{
     method:'POST',
     headers:{'Content-Type':'application/json','Accept':'application/json'},
     body:JSON.stringify(mailRequest),
     signal:ac.signal
   });
   const reply=await m.json().catch(()=>({}));
   // FormSubmit's success flag may be the string "true"; string "false" MUST NOT pass.
   mailSent=m.ok&&(reply.success===true||reply.success==='true');
 }finally{clearTimeout(timer);}
}catch(error){console.warn('Migdalor: lead saved; mail notification not confirmed');}
window.__migdalorLastMailStatus=mailSent?'sent':'not_confirmed';
form.classList.add('hidden');$('success').classList.remove('hidden');
const wa='שלום מגדלור, השארתי פנייה באתר. שם: '+body.fullName+' | צורך: '+body.intent+' | חברת אינטרנט נוכחית: '+body.provider+' | יישוב: '+body.city;
$('successWA').href='https://wa.me/972559344185?text='+encodeURIComponent(wa);
$('success').scrollIntoView({behavior:'smooth',block:'center'});
}catch(err){showError(err?.message||'לא הצלחנו לשמור את הפנייה כרגע. אפשר לפנות אלינו גם ב־WhatsApp.');}
finally{button.disabled=false;button.textContent='שלחו לי אפשרויות לבדיקה ←';}});
})();
