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
form.classList.add('hidden');$('success').classList.remove('hidden');
const wa='שלום מגדלור, השארתי פנייה באתר. שם: '+body.fullName+' | צורך: '+body.intent+' | חברת אינטרנט נוכחית: '+body.provider+' | יישוב: '+body.city;
$('successWA').href='https://wa.me/972559344185?text='+encodeURIComponent(wa);
$('success').scrollIntoView({behavior:'smooth',block:'center'});
}catch(err){showError(err?.message||'לא הצלחנו לשמור את הפנייה כרגע. אפשר לפנות אלינו גם ב־WhatsApp.');}
finally{button.disabled=false;button.textContent='שלחו לי אפשרויות לבדיקה ←';}});
})();
