(() => {
  'use strict';
  const samples = {
    preco: {number:'004', customer:'Oi! Quanto custa?', response:'Oi, [nome]! [Produto] custa [valor]. Para conferir se atende ao que você precisa: você pretende usar para [uso]?', note:'Informe o preço diretamente quando ele já estiver confirmado.'},
    objecao: {number:'041', customer:'Achei um pouco caro…', response:'Entendo. O que ficou mais distante do que você esperava: o valor total ou a forma de pagamento? Assim vejo se existe uma opção adequada.', note:'Entenda o impedimento antes de oferecer desconto ou alterar o escopo.'},
    retorno: {number:'051', customer:'Vou avaliar a proposta e te aviso.', response:'Oi, [nome]! Sobre a proposta de [serviço], ficou alguma dúvida que eu possa esclarecer para você?', note:'Retome na data combinada e apenas quando o acompanhamento foi autorizado.'}
  };
  const tabs = [...document.querySelectorAll('[data-sample]')];
  function selectSample(button) {
    const sample = samples[button.dataset.sample];
    tabs.forEach(tab => { const selected=tab===button; tab.setAttribute('aria-selected',String(selected)); tab.tabIndex=selected?0:-1; });
    document.getElementById('sample-panel').setAttribute('aria-labelledby',button.id);
    document.getElementById('customer-message').textContent=sample.customer;
    document.getElementById('response-message').textContent=sample.response;
    document.getElementById('sample-number').textContent=sample.number;
    document.getElementById('sample-note').textContent=sample.note;
    document.getElementById('copy-status').textContent='';
  }
  tabs.forEach((button,i) => {
    button.addEventListener('click',()=>selectSample(button));
    button.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight') next=(i+1)%tabs.length;
      if(event.key==='ArrowLeft') next=(i-1+tabs.length)%tabs.length;
      if(event.key==='Home') next=0;
      if(event.key==='End') next=tabs.length-1;
      if(next!==undefined){event.preventDefault();selectSample(tabs[next]);tabs[next].focus();}
    });
  });
  const microTemplates = {
    preco: (name, offer) => `Oi, ${name}! O ${offer} custa [valor]. Para eu confirmar se essa é a melhor opção, você pretende usar para [objetivo]?`,
    caro: (name, offer) => `Entendo, ${name}. O que ficou mais distante do que você esperava: o valor total ou a forma de pagamento? Posso conferir uma opção de ${offer} com escopo diferente, se fizer sentido.`,
    sumiu: (name, offer) => `Oi, ${name}! Sobre a proposta de ${offer}, ficou alguma dúvida que eu possa esclarecer? Se não for o momento, tudo bem - posso encerrar por aqui.`,
    prazo: (name, offer) => `Oi, ${name}! Vou conferir a capacidade para entregar ${offer} até [data] antes de prometer. Qual parte é indispensável para esse prazo?`,
    pos: (name, offer) => `Oi, ${name}! Como foi sua experiência com ${offer}? Quero confirmar se ficou tudo certo e saber o que podemos melhorar.`
  };
  const generateButton = document.getElementById('generate-message');
  const generatedMessage = document.getElementById('generated-message');
  const generatedStatus = document.getElementById('generated-status');
  function generateMicroMessage() {
    const name = document.getElementById('micro-name').value.trim() || '[nome]';
    const offer = document.getElementById('micro-offer').value.trim() || '[seu serviço]';
    const type = document.getElementById('micro-situation').value;
    generatedMessage.textContent = microTemplates[type](name, offer);
    generatedStatus.textContent = 'Resposta gerada. Revise os campos entre colchetes antes de enviar.';
  }
  generateButton.addEventListener('click', generateMicroMessage);
  document.getElementById('copy-generated').addEventListener('click', async () => {
    const text = generatedMessage.textContent;
    if (text === 'Preencha os campos e clique em gerar.') { generateMicroMessage(); }
    try { await navigator.clipboard.writeText(generatedMessage.textContent); generatedStatus.textContent = 'Resposta copiada. Adapte os campos antes de enviar.'; }
    catch { generatedStatus.textContent = 'Selecione o texto e use a opção Copiar do seu dispositivo.'; }
  });
  document.getElementById('copy-message').addEventListener('click',async()=>{
    const text=document.getElementById('response-message').textContent;
    const status=document.getElementById('copy-status');
    try { await navigator.clipboard.writeText(text); status.textContent='Mensagem copiada. Adapte os campos antes de enviar.'; }
    catch { const selection=window.getSelection();const range=document.createRange();range.selectNodeContents(document.getElementById('response-message'));selection.removeAllRanges();selection.addRange(range);status.textContent='Selecionei o texto. Use a opção Copiar do seu dispositivo.'; }
  });
  const safeCheckout=()=>{
    try { const value=window.SALES_CONFIG?.checkoutUrl;if(!value)return null;const url=new URL(value);const allowed=['pay.kiwify.com.br','pay.hotmart.com','go.hotmart.com'];return url.protocol==='https:'&&allowed.includes(url.hostname)?url:null; } catch {return null;}
  };
  const trackingKeys=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','src','sck'];
  document.querySelectorAll('[data-checkout]').forEach(button=>button.addEventListener('click',()=>{
    const url=safeCheckout();
    if(!url){document.getElementById('checkout-dialog').showModal();return;}
    const params=new URLSearchParams(location.search);trackingKeys.forEach(key=>{const value=params.get(key);if(value&&!url.searchParams.has(key))url.searchParams.set(key,value);});
    location.assign(url.href);
  }));
  if(safeCheckout())document.querySelectorAll('[data-checkout-state]').forEach(el=>el.textContent='Confira o acesso e as condições no checkout antes de pagar.');
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  document.querySelector('[data-open="privacy"]').addEventListener('click',()=>document.getElementById('privacy-dialog').showModal());
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}}));
  document.getElementById('year').textContent=String(new Date().getFullYear());
})();
