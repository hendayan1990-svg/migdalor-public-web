(()=>{
 const $=id=>document.getElementById(id),form=$('leadForm');if(!form)return;
 let step=0,intent='';const stepNodes=[...document.querySelectorAll('.form-step')];const next=$('nextBtn'),prev=$('prevBtn'),alert=$('formAlert');
 const params=new URLSearchParams(location.search);
 const choose=(value)=>{intent=value;document.querySelectorAll('#intentPicker button').forEach(b=>{const active=b.dataset.val===value;b.classList.toggle('chosen',active);b.setAttribute('aria-pressed',String(active))});if(value==='אינטרנט לעסק')$('customerType').value='עסק';if(value==='אינטרנט לבניין')$('customerType').value='ועד בית';};
 document.querySelectorAll('#intentPicker button').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.val)));
 document.querySelectorAll('.service-card[data-intent]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();choose(a.dataset.intent);document.getElementById('start').scrollIntoView({behavior:'smooth'})}));
 const map={new:'חיבור חדש',switch:'מעבר ספק',business:'אינטרנט לעסק',building:'אינטרנט לבניין',fault:'תקלה בבית',cancel:'ניתוק והכוונה'};
 const queryIntent=params.get('intent');if(queryIntent&&[...Object.values(map)].includes(queryIntent))choose(queryIntent);else if(map[queryIntent])choose(map[queryIntent]);
 $('contactMethod').addEventListener('change',()=>{$('emailField').classList.toggle('hidden',$('contactMethod').value!=='מייל');$('email').required=$('contactMethod').value==='מייל'});
 function warn(msg){alert.textContent=msg;alert.classList.remove('hidden');alert.scrollIntoView({block:'nearest',behavior:'smooth'})}
 function clear(){alert.textContent='';alert.classList.add('hidden')}
 function valid(){clear();if(step===0){if(!intent)return warn('בחרו מה אתם צריכים כדי שנדע לכוון את הפנייה.'),false;if(!$('customerType').value)return warn('בחרו סוג לקוח.'),false;}
 if(step===1){if($('fullName').value.trim().length<2)return warn('אנא כתבו שם מלא.'),false;if(!/^0[0-9]{9}$/.test($('phone').value.replace(/[^0-9]/g,'')))return warn('אנא כתבו מספר נייד ישראלי בן 10 ספרות.'),false;if($('city').value.trim().length<2)return warn('בחרו עיר או יישוב.'),false;}
 if(step===2){if($('contactMethod').value==='מייל'&&!$('email').checkValidity())return warn('נדרשת כתובת מייל תקינה.'),false;if(!$('consent').checked)return warn('נדרש אישור לשמירת הבקשה ויצירת קשר בנושא הפנייה.'),false;}return true;}
 function showStep(){stepNodes.forEach((n,i)=>n.classList.toggle('active',step===i));$('progressbar').style.width=`${(step+1)*100/3}%`;prev.classList.toggle('hidden',!step);next.innerHTML=step===2?'שולחים בקשה בחינם <span>←</span>':'ממשיכים לשלב הבא <span>←</span>';clear()}
 prev.addEventListener('click',()=>{if(step>0){step--;showStep()}});
 next.addEventListener('click',async()=>{if(!valid())return;if(step<2){step++;showStep();return}
 next.disabled=true;next.textContent='שומרים את הפנייה...';const body={fullName:$('fullName').value.trim(),phone:$('phone').value.replace(/[^0-9]/g,''),city:$('city').value.trim(),street:$('street').value.trim(),houseNumber:$('houseNumber').value.trim(),customerType:$('customerType').value,intent,provider:$('provider').value,requestedProvider:$('requestedProvider').value,timing:$('timing').value,budget:$('budget').value,notes:$('notes').value,contactMethod:$('contactMethod').value,email:$('email').value.trim(),consent:$('consent').checked,referralOptIn:$('referralOptIn').checked,utmSource:params.get('utm_source')||'',utmMedium:params.get('utm_medium')||'',utmCampaign:params.get('utm_campaign')||'',website:$('website').value};
 try{const r=await fetch(window.MIGDALOR_LEAD_API || '/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw new Error(data.error||'שמירת הבקשה נכשלה');form.classList.add('hidden');$('formSuccess').classList.remove('hidden');$('waAfter').href='https://wa.me/972559344185?text='+encodeURIComponent('שלום מגדלור, הגשתי בקשה בנושא '+intent+' ביישוב '+body.city+'. אשמח להמשיך בבדיקה.');}
 catch(e){warn(e?.message||'לא ניתן לשמור את הפנייה. נסו שוב מאוחר יותר.')}finally{next.disabled=false;next.innerHTML='שולחים בקשה בחינם <span>←</span>'}
 });
 $('resetBtn').addEventListener('click',()=>{form.reset();choose('');step=0;form.classList.remove('hidden');$('formSuccess').classList.add('hidden');$('emailField').classList.add('hidden');showStep()});
 showStep();
 if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');observer.unobserve(e.target)}})},{threshold:.13});document.querySelectorAll('.service-card,.process-grid>div,.guides-grid>a').forEach(e=>{e.classList.add('reveal');observer.observe(e)})}
})();
