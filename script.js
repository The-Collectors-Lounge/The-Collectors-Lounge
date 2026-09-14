const toggle=document.querySelector('.menu');
const nav=document.querySelector('#nav');
toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false');}));

const contactForm=document.querySelector('#contact-form');
const formStatus=document.querySelector('#form-status');
contactForm?.addEventListener('submit',async(event)=>{
  event.preventDefault();
  const submit=contactForm.querySelector('.form-submit');
  const lang=window.TCL_LANG?.lang||document.documentElement.lang||'en';
  const messages={
    en:{sending:'Sending…',success:'Thank you. Your enquiry has been sent.',error:'Unable to send your enquiry. Please try again.'},
    fr:{sending:'Envoi…',success:'Merci. Votre demande a bien été envoyée.',error:'Impossible d’envoyer votre demande. Veuillez réessayer.'},
    es:{sending:'Enviando…',success:'Gracias. Tu solicitud ha sido enviada.',error:'No ha sido posible enviar tu solicitud. Inténtalo de nuevo.'}
  }[lang]||{sending:'Sending…',success:'Thank you. Your enquiry has been sent.',error:'Unable to send your enquiry. Please try again.'};
  formStatus.textContent=messages.sending;
  formStatus.classList.remove('is-error');
  submit.disabled=true;
  try{
    const data=Object.fromEntries(new FormData(contactForm).entries());
    const response=await fetch(contactForm.action,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)});
    const result=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(result.error||messages.error);
    contactForm.reset();
    formStatus.textContent=messages.success;
  }catch(error){
    formStatus.textContent=error.message||messages.error;
    formStatus.classList.add('is-error');
  }finally{submit.disabled=false;}
});
