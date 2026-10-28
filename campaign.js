/* Preserve original campaign attribution while passing visitors to the verified lead form. */
(()=>{const source=new URLSearchParams(location.search);const keys=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid'];
const qs=document.querySelectorAll('a[href^="/?intent="]');
for(const link of qs){const u=new URL(link.getAttribute('href'),location.origin);
for(const key of keys){const val=source.get(key);if(val&&val.length<=150)u.searchParams.set(key,val);}
link.href=u.pathname+u.search+u.hash;}
})();