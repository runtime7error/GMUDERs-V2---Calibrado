const fs = require('fs');

const source = `(function(){
  if(window.__GMUDERS_INITIALIZED__){
    var b = document.getElementById('gmuders-modal-backdrop');
    if(b){
      b.style.display = 'flex';
      var i = document.getElementById('gmuders-json-input');
      if(i) i.focus();
      return;
    }
  }
  window.__GMUDERS_INITIALIZED__ = true;

  var css = "#gmuders-modal-backdrop{position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(15,23,42,0.75);backdrop-filter:blur(4px);z-index:2147483647;display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,\\"Segoe UI\\",Roboto,sans-serif;}#gmuders-panel{width:94%;max-width:760px;background:#fff;border-radius:12px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.35);overflow:hidden;display:flex;flex-direction:column;color:#1e293b;}.gm-head{background:linear-gradient(135deg,#003366 0%,#0284c7 100%);color:#fff;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;}.gm-title{font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;}.gm-badge{background:rgba(255,255,255,0.25);font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600;}.gm-close{background:none;border:none;color:#fff;font-size:22px;cursor:pointer;}.gm-body{padding:16px 20px;display:flex;flex-direction:column;gap:12px;max-height:75vh;overflow-y:auto;}.gm-actions{display:flex;gap:8px;flex-wrap:wrap;}.gm-btn-sm{background:#f1f5f9;border:1px solid #cbd5e1;color:#334155;padding:6px 12px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;}.gm-btn-sm:hover{background:#e2e8f0;}#gmuders-json-input{width:100%;height:180px;padding:10px;border-radius:6px;border:1px solid #cbd5e1;font-family:Consolas,monospace;font-size:12px;box-sizing:border-box;background:#f8fafc;}#gmuders-status{padding:12px 14px;border-radius:6px;font-size:13px;display:none;line-height:1.5;max-height:260px;overflow-y:auto;white-space:pre-wrap;}.gm-foot{padding:12px 20px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;justify-content:flex-end;gap:10px;}.gm-btn-primary{background:#005bb7;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-weight:600;font-size:14px;cursor:pointer;}.gm-btn-primary:hover{background:#00468c;}.gm-btn-sec{background:#fff;color:#64748b;border:1px solid #cbd5e1;padding:10px 14px;border-radius:6px;font-size:14px;cursor:pointer;}";
  var s = document.createElement('style');
  s.textContent = css;
  document.head.appendChild(s);

  var RULES = [
    {
      key: 'descricao_mudanca',
      labelName: 'Breve descrição *',
      aliases: ['descricaomudanca', 'brevedescricao', 'descricao', 'resumo', 'titulo', 'brevedescri'],
      match: ['breve descrição', 'breve descricao', 'breve descri', 'descricao da mudanca', 'descrição da mudança', 'resumo', 'título', 'titulo']
    },
    {
      key: 'escopo_tecnico',
      labelName: 'Escopo Técnico Aplicado *',
      aliases: ['escopotecnico', 'escopotecnicoaplicado', 'escopo'],
      match: ['escopo técnico aplicado', 'escopo tecnico aplicado', 'escopo técnico', 'escopo tecnico', 'escopo']
    },
    {
      key: 'plano_implementacao',
      labelName: 'Plano de Implementação *',
      aliases: ['planoimplementacao', 'planodeimplementacao', 'implementacao'],
      match: ['plano de implementação', 'plano de implementacao', 'plano de ação', 'plano de acao', 'implementação']
    },
    {
      key: 'plano_rollback',
      labelName: 'Plano de Roolback *',
      aliases: ['planorollback', 'planoroolback', 'planoderollback', 'planoderoolback', 'rollback', 'roolback'],
      match: ['plano de roolback', 'roolback', 'plano de rollback', 'rollback', 'plano de retorno', 'retorno']
    },
    {
      key: 'data_implementacao',
      labelName: 'Data/hora Implantação (Data e Hora)',
      aliases: ['dataimplementacao', 'dataimplantacao', 'datahora', 'datahoraimplantacao', 'datahoraimplementacao', 'data'],
      match: ['data/hora implantação', 'data/hora implantacao', 'data/hora', 'data da implantação', 'data da implantacao', 'data de implementação', 'data de implementacao', 'data prevista']
    }
  ];

  var bd = document.createElement('div');
  bd.id = 'gmuders-modal-backdrop';
  bd.innerHTML = '<div id="gmuders-panel"><div class="gm-head"><div class="gm-title"><span>🪄 GMUDERs v2</span> <span class="gm-badge">Elis TOPdesk</span></div><button class="gm-close" id="gm-btn-close">&times;</button></div><div class="gm-body"><div class="gm-actions"><button class="gm-btn-sm" id="gm-paste">📋 Colar do Clipboard</button><button class="gm-btn-sm" id="gm-scan">🔍 Diagnóstico / Escanear Tela</button><button class="gm-btn-sm" id="gm-clear">🧹 Limpar</button></div><div><label style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;">Cole o JSON da IA aqui:</label><textarea id="gmuders-json-input" placeholder="Cole o JSON da IA aqui..."></textarea></div><div id="gmuders-status"></div></div><div class="gm-foot"><button class="gm-btn-sec" id="gm-cancel">Fechar</button><button class="gm-btn-primary" id="gm-fill">🚀 Preencher no TOPdesk</button></div></div>';
  document.body.appendChild(bd);

  var inp = document.getElementById('gmuders-json-input');
  var st = document.getElementById('gmuders-status');

  function cls(){
    bd.remove();
    window.__GMUDERS_INITIALIZED__ = false;
  }
  document.getElementById('gm-btn-close').onclick = cls;
  document.getElementById('gm-cancel').onclick = cls;
  bd.onclick = function(e){ if(e.target === bd) cls(); };

  document.getElementById('gm-clear').onclick = function(){
    inp.value = '';
    st.style.display = 'none';
  };

  document.getElementById('gm-paste').onclick = async function(){
    try {
      var t = await navigator.clipboard.readText();
      inp.value = t;
      showSt('JSON colado com sucesso!', '#ecfdf5', '#065f46');
    } catch(e){
      showSt('Pressione Ctrl+V diretamente na caixa de texto.', '#eff6ff', '#1e40af');
    }
  };

  function getContexts(){
    var list = [{ name: 'Documento Principal', doc: document }];
    try {
      var iframes = document.querySelectorAll('iframe');
      for(var i = 0; i < iframes.length; i++){
        try {
          var fDoc = iframes[i].contentDocument || iframes[i].contentWindow.document;
          if(fDoc) list.push({ name: 'IFrame ' + (iframes[i].id || iframes[i].name || i), doc: fDoc });
        } catch(err){}
      }
    } catch(e){}
    return list;
  }

  function isVisible(el){
    if(!el) return false;
    if(el.type === 'hidden') return false;
    var style = window.getComputedStyle ? window.getComputedStyle(el) : null;
    if(style && (style.display === 'none' || style.visibility === 'hidden')) return false;
    return true;
  }

  function findNearestLabel(el){
    var cur = el.parentElement;
    for(var d = 0; d < 4 && cur && cur !== cur.ownerDocument.body; d++){
      var lbl = cur.querySelector('label, .field-label, .ssdnav-label, [class*="label"], [class*="title"], [class*="question"], p, span');
      if(lbl && lbl !== el){
        var txt = (lbl.innerText || lbl.textContent || '').trim().replace(/\\s+/g, ' ');
        if(txt && txt.length > 2 && txt.length < 80) return txt;
      }
      cur = cur.parentElement;
    }
    return '';
  }

  function getOptionText(el, doc){
    var text = '';
    if(el.id){
      var l = doc.querySelector('label[for="' + el.id + '"]');
      if(l) text = (l.innerText || l.textContent || '').toLowerCase();
    }
    if(!text && el.parentElement){
      text = (el.parentElement.innerText || el.parentElement.textContent || '').toLowerCase();
    }
    if(!text && el.nextElementSibling){
      text = (el.nextElementSibling.innerText || el.nextElementSibling.textContent || '').toLowerCase();
    }
    return text.trim();
  }

  function activateOption(el, doc){
    el.focus();
    var d = doc || el.ownerDocument;

    if(!el.checked){
      // Tenta clicar no label se existir
      var lbl = el.id ? d.querySelector('label[for="' + el.id + '"]') : null;
      if(lbl){
        lbl.click();
      } else {
        el.click();
      }

      // Se ainda não marcou, tenta clicar diretamente no input
      if(!el.checked){
        el.click();
      }

      // Se ainda assim não marcou, força o atributo e dispara eventos
      if(!el.checked){
        el.checked = true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    try {
      var $ = d.defaultView.$ || d.defaultView.jQuery;
      if($) $(el).trigger('change');
    } catch(err){}

    el.style.outline = '2px solid #10b981';
    setTimeout(function(){ el.style.outline = ''; }, 2000);
  }

  function selectRadioTipoGmud(targetType){
    var typeLower = (targetType || 'normal').toLowerCase().trim();
    var isEmerg = typeLower.indexOf('emerg') !== -1;
    var contexts = getContexts();

    for(var c = 0; c < contexts.length; c++){
      var doc = contexts[c].doc;

      // 1. Busca direta pelo ID exato do TOPdesk Elis
      var targetId = isEmerg
        ? 'ssdform35242390080846779fee97db46d8fea5_checkbox1_checkbox_checkbox'
        : 'ssdform35242390080846779fee97db46d8fea5_checkbox2_checkbox_checkbox';
      var directEl = doc.getElementById(targetId);
      if(directEl){
        var unselectId = isEmerg
          ? 'ssdform35242390080846779fee97db46d8fea5_checkbox2_checkbox_checkbox'
          : 'ssdform35242390080846779fee97db46d8fea5_checkbox1_checkbox_checkbox';
        var otherEl = doc.getElementById(unselectId);
        if(otherEl && otherEl.checked){
          otherEl.click();
          if(otherEl.checked){
            otherEl.checked = false;
            otherEl.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }

        activateOption(directEl, doc);
        return isEmerg ? 'Emergencial' : 'Normal';
      }

      // 2. Busca por elementos do grupo UUID do TOPdesk Elis
      var groupEls = doc.querySelectorAll('[id*="35242390080846779fee97db46d8fea5"]');
      if(groupEls.length > 0){
        for(var g = 0; g < groupEls.length; g++){
          var gel = groupEls[g];
          if(gel.tagName === 'INPUT' && (gel.type === 'checkbox' || gel.type === 'radio')){
            var gText = getOptionText(gel, doc);
            if(isEmerg && (gText.indexOf('emerg') !== -1 || gel.id.indexOf('checkbox1') !== -1)){
              activateOption(gel, doc);
              return 'Emergencial';
            } else if(!isEmerg && (gText.indexOf('normal') !== -1 || gel.id.indexOf('checkbox2') !== -1)){
              activateOption(gel, doc);
              return 'Normal';
            }
          }
        }
      }

      // 3. Busca por sufixo _checkbox2_ ou _checkbox1_
      var suffixSelector = isEmerg ? '[id*="_checkbox1_checkbox"]' : '[id*="_checkbox2_checkbox"]';
      var suffixEl = doc.querySelector(suffixSelector);
      if(suffixEl){
        activateOption(suffixEl, doc);
        return isEmerg ? 'Emergencial' : 'Normal';
      }

      // 4. Busca em todos os radios e checkboxes próximos a rótulos com "normal" ou "emergencial"
      var allOptions = doc.querySelectorAll('input[type="radio"], input[type="checkbox"]');
      for(var i = 0; i < allOptions.length; i++){
        var opt = allOptions[i];
        var optText = getOptionText(opt, doc);
        var optMeta = ((opt.id || '') + ' ' + (opt.name || '') + ' ' + (opt.value || '')).toLowerCase();

        var parentSection = opt.closest ? opt.closest('[class*="question"], [class*="field"], .ssdnav-item, tr, div') : opt.parentElement;
        var sectionText = parentSection ? (parentSection.innerText || parentSection.textContent || '').toLowerCase() : '';
        var isTypeGmud = sectionText.indexOf('tipo de gmud') !== -1 || optMeta.indexOf('tipo') !== -1;

        if(isEmerg){
          if((optText.indexOf('emerg') !== -1 || optMeta.indexOf('emerg') !== -1) && (isTypeGmud || optText.length < 30)){
            activateOption(opt, doc);
            return 'Emergencial';
          }
        } else {
          if((optText.indexOf('normal') !== -1 || optMeta.indexOf('normal') !== -1) && (isTypeGmud || optText.length < 30)){
            activateOption(opt, doc);
            return 'Normal';
          }
        }
      }
    }
    return null;
  }

  function selectSearchlist(selectId, optionId, textValue){
    var contexts = getContexts();
    var suffixSel = selectId.replace(/^ssdform[a-f0-9]+/, '');
    var suffixOpt = optionId.replace(/^ssdform[a-f0-9]+/, '');

    for(var c = 0; c < contexts.length; c++){
      var doc = contexts[c].doc;
      var sel = doc.getElementById(selectId) || doc.querySelector('[id$="' + suffixSel + '"]');
      var opt = doc.getElementById(optionId) || doc.querySelector('[id$="' + suffixOpt + '"]');

      // Se for select nativo e option nativo
      if(sel && sel.tagName === 'SELECT'){
        if(opt && opt.tagName === 'OPTION'){
          opt.selected = true;
          sel.value = opt.value;
          sel.dispatchEvent(new Event('change', { bubbles: true }));
          sel.dispatchEvent(new Event('input', { bubbles: true }));
          sel.style.outline = '2px solid #10b981';
          return true;
        }
        for(var o = 0; o < sel.options.length; o++){
          var oEl = sel.options[o];
          if((oEl.text || '').toLowerCase().indexOf(textValue.toLowerCase()) !== -1 || (oEl.value || '').toLowerCase().indexOf(textValue.toLowerCase()) !== -1){
            oEl.selected = true;
            sel.value = oEl.value;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
            sel.dispatchEvent(new Event('input', { bubbles: true }));
            sel.style.outline = '2px solid #10b981';
            return true;
          }
        }
      }

      // Se for searchlist customizada do TOPdesk
      // Caso 1: A opção já está no DOM
      if(opt){
        opt.click();
        opt.dispatchEvent(new Event('change', { bubbles: true }));
        opt.dispatchEvent(new Event('input', { bubbles: true }));
        opt.style.outline = '2px solid #10b981';
        return true;
      }

      // Caso 2: Clica no campo acionador para carregar/exibir o dropdown
      if(sel){
        sel.focus();
        sel.click();

        var optAfter = doc.getElementById(optionId) || doc.querySelector('[id$="' + suffixOpt + '"]');
        if(optAfter){
          optAfter.click();
          optAfter.dispatchEvent(new Event('change', { bubbles: true }));
          optAfter.dispatchEvent(new Event('input', { bubbles: true }));
          optAfter.style.outline = '2px solid #10b981';
          return true;
        }

        if(sel.tagName === 'INPUT'){
          sel.value = textValue;
          sel.dispatchEvent(new Event('input', { bubbles: true }));
          sel.dispatchEvent(new Event('change', { bubbles: true }));
          sel.dispatchEvent(new Event('blur', { bubbles: true }));
          sel.style.outline = '2px solid #10b981';
          return true;
        }
      }
    }
    return false;
  }

  function setComboOrOption(labelKeyword, targetValue){
    var contexts = getContexts();
    var targetLower = targetValue.toLowerCase().trim();
    var keyLower = labelKeyword.toLowerCase().trim();

    for(var c = 0; c < contexts.length; c++){
      var doc = contexts[c].doc;

      // 1. Select nativo
      var selects = doc.querySelectorAll('select');
      for(var i = 0; i < selects.length; i++){
        var sel = selects[i];
        var sLabel = findNearestLabel(sel).toLowerCase();
        var sNameId = ((sel.name || '') + ' ' + (sel.id || '')).toLowerCase();

        if(sLabel.indexOf(keyLower) !== -1 || sNameId.indexOf(keyLower) !== -1){
          for(var o = 0; o < sel.options.length; o++){
            var opt = sel.options[o];
            var oText = (opt.text || opt.innerText || '').toLowerCase().trim();
            var oVal = (opt.value || '').toLowerCase().trim();
            if(oText.indexOf(targetLower) !== -1 || oVal.indexOf(targetLower) !== -1 || targetLower.indexOf(oText) !== -1){
              opt.selected = true;
              sel.value = opt.value;
              sel.dispatchEvent(new Event('change', { bubbles: true }));
              sel.dispatchEvent(new Event('input', { bubbles: true }));
              sel.style.outline = '2px solid #10b981';
              return true;
            }
          }
        }
      }

      // 2. Checkboxes (multi-seleção)
      var checkboxes = doc.querySelectorAll('input[type="checkbox"]');
      for(var k = 0; k < checkboxes.length; k++){
        var cb = checkboxes[k];
        var cbLabel = findNearestLabel(cb).toLowerCase();
        var cbVal = (cb.value || '').toLowerCase();
        if(cbLabel.indexOf(targetLower) !== -1 || cbVal.indexOf(targetLower) !== -1){
          if(!cb.checked){
            cb.checked = true;
            cb.click();
            cb.dispatchEvent(new Event('change', { bubbles: true }));
          }
          return true;
        }
      }

      // 3. Inputs de busca/searchlist/combobox personalizado
      var textInputs = doc.querySelectorAll('input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]):not([type="button"]):not([type="submit"])');
      for(var t = 0; t < textInputs.length; t++){
        var inpEl = textInputs[t];
        var inpLabel = findNearestLabel(inpEl).toLowerCase();
        var inpMeta = ((inpEl.id || '') + ' ' + (inpEl.name || '') + ' ' + (inpEl.placeholder || '')).toLowerCase();

        if(inpLabel.indexOf(keyLower) !== -1 || inpMeta.indexOf(keyLower) !== -1){
          inpEl.focus();
          inpEl.value = targetValue;
          inpEl.dispatchEvent(new Event('input', { bubbles: true }));
          inpEl.dispatchEvent(new Event('change', { bubbles: true }));
          inpEl.dispatchEvent(new Event('blur', { bubbles: true }));
          inpEl.style.outline = '2px solid #10b981';
          return true;
        }
      }
    }
    return false;
  }

  // Preenche campos duplos de Data e Hora
  function fillDualDateTime(txtEl, rawDateVal, timeOverride, usedEls){
    var raw = String(rawDateVal || '').trim();
    var dateVal = raw;
    var timeVal = timeOverride ? String(timeOverride).trim() : '22:00';

    if(raw.indexOf('T') !== -1){
      var p = raw.split('T');
      dateVal = p[0].trim();
      if(!timeOverride && p[1]) timeVal = p[1].trim().substring(0, 5);
    } else if(raw.indexOf(' ') !== -1){
      var p2 = raw.split(' ');
      dateVal = p2[0].trim();
      if(!timeOverride && p2[1]) timeVal = p2[1].trim().substring(0, 5);
    }

    var isoDate = dateVal;
    var brDate = dateVal;
    if(/^\\d{4}-\\d{2}-\\d{2}$/.test(dateVal)){
      var s = dateVal.split('-');
      brDate = s[2] + '/' + s[1] + '/' + s[0];
    } else if(/^\\d{2}\\/\\d{2}\\/\\d{4}$/.test(dateVal)){
      var s2 = dateVal.split('/');
      isoDate = s2[2] + '-' + s2[1] + '-' + s2[0];
    }

    var doc = txtEl.ownerDocument;
    var inpDate = null;
    var inpTime = null;

    // Estratégia 1: 'for' attribute no label
    var fid = txtEl.getAttribute('for');
    if(fid){
      var directEl = doc.getElementById(fid);
      if(directEl && isVisible(directEl)){
        var pEl = directEl.parentElement;
        for(var d = 0; d < 4 && pEl && pEl !== doc.body; d++){
          var sibs = pEl.querySelectorAll('input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]):not([type="button"]):not([type="submit"])');
          if(sibs.length >= 2){
            inpDate = sibs[0];
            inpTime = sibs[1];
            break;
          }
          pEl = pEl.parentElement;
        }
      }
    }

    // Estratégia 2: Subir na árvore do txtEl até achar container com 2 inputs
    if(!inpDate || !inpTime){
      var cur = txtEl.parentElement;
      for(var depth = 0; depth < 5 && cur && cur !== doc.body; depth++){
        var inps = cur.querySelectorAll('input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]):not([type="button"]):not([type="submit"])');
        var candidates = [];
        for(var i = 0; i < inps.length; i++){
          if(isVisible(inps[i]) && usedEls.indexOf(inps[i]) === -1){
            candidates.push(inps[i]);
          }
        }

        if(candidates.length === 2){
          inpDate = candidates[0];
          inpTime = candidates[1];
          break;
        } else if(candidates.length > 2){
          var following = candidates.filter(function(el){
            return (txtEl.compareDocumentPosition(el) & 4);
          });
          if(following.length >= 2){
            inpDate = following[0];
            inpTime = following[1];
            break;
          }
        }

        if(cur.nextElementSibling){
          var nextInps = cur.nextElementSibling.querySelectorAll('input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]):not([type="button"]):not([type="submit"])');
          var nextCandidates = [];
          for(var n = 0; n < nextInps.length; n++){
            if(isVisible(nextInps[n]) && usedEls.indexOf(nextInps[n]) === -1){
              nextCandidates.push(nextInps[n]);
            }
          }
          if(nextCandidates.length >= 2){
            inpDate = nextCandidates[0];
            inpTime = nextCandidates[1];
            break;
          }
        }
        cur = cur.parentElement;
      }
    }

    if(inpDate && inpTime){
      // 1. Preenche a data
      inpDate.focus();
      inpDate.value = (inpDate.type === 'date') ? isoDate : brDate;
      inpDate.dispatchEvent(new Event('input', { bubbles: true }));
      inpDate.dispatchEvent(new Event('change', { bubbles: true }));
      inpDate.dispatchEvent(new Event('blur', { bubbles: true }));
      inpDate.style.outline = '2px solid #10b981';
      usedEls.push(inpDate);

      // 2. Preenche a hora
      inpTime.focus();
      inpTime.value = timeVal;
      inpTime.dispatchEvent(new Event('input', { bubbles: true }));
      inpTime.dispatchEvent(new Event('change', { bubbles: true }));
      inpTime.dispatchEvent(new Event('blur', { bubbles: true }));
      inpTime.style.outline = '2px solid #10b981';
      usedEls.push(inpTime);

      try {
        var $1 = inpDate.ownerDocument.defaultView.$ || inpDate.ownerDocument.defaultView.jQuery;
        if($1){
          $1(inpDate).trigger('change');
          $1(inpTime).trigger('change');
        }
      } catch(err){}

      return true;
    }
    return false;
  }

  function findFieldForText(txtEl, usedEls){
    var doc = txtEl.ownerDocument;
    var fid = txtEl.getAttribute('for');
    if(fid){
      var byId = doc.getElementById(fid);
      if(byId && isVisible(byId) && usedEls.indexOf(byId) === -1 && byId.type !== 'radio' && byId.type !== 'checkbox') return byId;
    }

    var cur = txtEl;
    for(var depth = 0; depth < 6 && cur && cur !== doc.body; depth++){
      var candidates = cur.querySelectorAll('input:not([type="hidden"]), textarea, select, [contenteditable="true"]');
      for(var i = 0; i < candidates.length; i++){
        var cand = candidates[i];
        if(cand !== txtEl && isVisible(cand) && usedEls.indexOf(cand) === -1 && cand.type !== 'radio' && cand.type !== 'checkbox'){
          return cand;
        }
      }
      if(cur.nextElementSibling){
        var sibCandidates = cur.nextElementSibling.querySelectorAll('input:not([type="hidden"]), textarea, select, [contenteditable="true"]');
        for(var j = 0; j < sibCandidates.length; j++){
          var sCand = sibCandidates[j];
          if(isVisible(sCand) && usedEls.indexOf(sCand) === -1 && sCand.type !== 'radio' && sCand.type !== 'checkbox'){
            return sCand;
          }
        }
        if(cur.nextElementSibling.matches && cur.nextElementSibling.matches('input:not([type="hidden"]), textarea, select') && isVisible(cur.nextElementSibling) && usedEls.indexOf(cur.nextElementSibling) === -1 && cur.nextElementSibling.type !== 'radio' && cur.nextElementSibling.type !== 'checkbox'){
          return cur.nextElementSibling;
        }
      }
      cur = cur.parentElement;
    }
    return null;
  }

  function findEl(rule, usedEls){
    var contexts = getContexts();
    for(var c = 0; c < contexts.length; c++){
      var doc = contexts[c].doc;

      var textHolders = doc.querySelectorAll('label, .field-label, .ssdnav-label, [class*="label"], [class*="title"], [class*="question"], p, span, div, h3, h4, th, td');
      for(var j = 0; j < textHolders.length; j++){
        var txtEl = textHolders[j];
        if(txtEl.children.length > 3) continue;
        var txt = (txtEl.innerText || txtEl.textContent || '').toLowerCase().trim();
        if(txt.length > 1 && txt.length < 120 && rule.match.some(function(m){ return txt.indexOf(m) !== -1; })){
          if(rule.key === 'data_implementacao'){
            return { special: 'datetime', txtEl: txtEl };
          }
          var found = findFieldForText(txtEl, usedEls);
          if(found) return found;
        }
      }

      var inputs = doc.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]), textarea, select, [contenteditable="true"]');
      for(var k = 0; k < inputs.length; k++){
        var inpEl = inputs[k];
        if(!isVisible(inpEl) || usedEls.indexOf(inpEl) !== -1) continue;
        var meta = ((inpEl.id || '') + ' ' + (inpEl.name || '') + ' ' + (inpEl.placeholder || '') + ' ' + (inpEl.getAttribute('aria-label') || '')).toLowerCase();
        if(rule.match.some(function(m){ return meta.indexOf(m) !== -1; })) return inpEl;
      }
    }
    return null;
  }

  function setVal(el, val, key){
    if(!el) return false;
    var strVal = String(val);

    if(el.isContentEditable || el.getAttribute('contenteditable') === 'true'){
      el.focus();
      el.innerHTML = strVal.replace(/\\n/g, '<br>');
      el.dispatchEvent(new Event('input', {bubbles:true}));
      el.dispatchEvent(new Event('change', {bubbles:true}));
      return true;
    }

    el.focus();
    el.value = strVal;
    el.dispatchEvent(new Event('input', {bubbles:true}));
    el.dispatchEvent(new Event('change', {bubbles:true}));
    el.dispatchEvent(new Event('blur', {bubbles:true}));
    el.style.outline = '2px solid #10b981';
    setTimeout(function(){ el.style.outline = ''; }, 1500);
    return true;
  }

  document.getElementById('gm-scan').onclick = function(){
    var contexts = getContexts();
    var report = ['Diagnóstico TOPdesk: (' + contexts.length + ' contexto(s) verificado(s))'];

    contexts.forEach(function(ctx){
      var inputs = ctx.doc.querySelectorAll('input:not([type="hidden"]), textarea, select, [contenteditable="true"]');
      if(inputs.length === 0) return;
      report.push('\\n📍 ' + ctx.name + ' (' + inputs.length + ' campos):');
      
      inputs.forEach(function(inp, idx){
        var lbl = findNearestLabel(inp);
        var tag = inp.tagName.toLowerCase();
        var type = inp.type ? ' (' + inp.type + ')' : '';
        report.push((idx + 1) + '. ' + (lbl || '[Sem rótulo]') + ' [' + tag + type + ']');
      });
    });

    showSt(report.join('\\n'), '#eff6ff', '#1e40af');
  };

  function showSt(msg, bg, col){
    st.style.display = 'block';
    st.style.background = bg;
    st.style.color = col;
    st.innerText = msg;
  }

  document.getElementById('gm-fill').onclick = function(){
    try {
      var raw = inp.value.trim();
      raw = raw.replace(/^\\x60{3}json\\s*/i, '').replace(/^\\x60{3}\\s*/, '').replace(/\\x60{3}$/, '').trim();
      var data = JSON.parse(raw);
      var norm = {};
      Object.keys(data).forEach(function(k){ norm[k.toLowerCase().replace(/[\\s-_]/g, '')] = data[k]; });

      var count = 0;
      var filledLabels = [];
      var usedEls = [];

      // 1. Radial "Normal" (ou Emergencial)
      var targetTipo = norm['tipomudanca'] || norm['tipo'] || 'Normal';
      var radioResult = selectRadioTipoGmud(targetTipo);
      if(radioResult){
        count++;
        filledLabels.push('Tipo de GMUD: ' + radioResult + ' (radial)');
      }

      // 2. Combo Pais -> "Brasil"
      var targetPais = norm['pais'] || 'Brasil';
      var paisSelId = 'ssdform35242390080846779fee97db46d8fea5_searchlist1_searchlist_searchlist';
      var paisOptId = 'ssdform35242390080846779fee97db46d8fea5_searchlist1_searchlist_searchlist_option0';
      if(selectSearchlist(paisSelId, paisOptId, targetPais) || setComboOrOption('pais', targetPais)){
        count++;
        filledLabels.push('Pais: ' + targetPais + ' (selecionado)');
      }

      // 3. Combo Dominio -> "Desenvolvimento"
      var targetDom = norm['dominio'] || 'Desenvolvimento';
      var domSelId = 'ssdform35242390080846779fee97db46d8fea5_searchlist2_searchlist_searchlist';
      var domOptId = 'ssdform35242390080846779fee97db46d8fea5_searchlist2_searchlist_searchlist_option0';
      if(selectSearchlist(domSelId, domOptId, targetDom) || setComboOrOption('dominio', targetDom)){
        count++;
        filledLabels.push('Dominio: ' + targetDom + ' (selecionado)');
      }

      // 4. Card do Jira (openquestion6)
      var jiraVal = norm['cardsjira'] || norm['cardjira'] || norm['jira'] || norm['idinterna'] || norm['chavejira'] || norm['card'] || '';
      if(jiraVal){
        var jiraId = 'ssdform35242390080846779fee97db46d8fea5_openquestion6_openquestion_openquestion';
        var jiraFilled = false;
        var jcontexts = getContexts();
        for(var jc = 0; jc < jcontexts.length; jc++){
          var jDoc = jcontexts[jc].doc;
          var jEl = jDoc.getElementById(jiraId) || jDoc.querySelector('[id$="_openquestion6_openquestion_openquestion"]');
          if(jEl && setVal(jEl, jiraVal, 'cards_jira')){
            count++;
            filledLabels.push('Card do Jira: ' + jiraVal);
            usedEls.push(jEl);
            jiraFilled = true;
            break;
          }
        }
        if(!jiraFilled){
          var jRule = {
            key: 'cards_jira',
            labelName: 'Card do Jira',
            match: ['cards jira', 'card jira', 'card do jira', 'jira', 'chave do jira', 'openquestion6']
          };
          var jTarget = findEl(jRule, usedEls);
          if(jTarget && setVal(jTarget, jiraVal, 'cards_jira')){
            count++;
            filledLabels.push('Card do Jira: ' + jiraVal);
            usedEls.push(jTarget);
          }
        }
      }

      // 4. Campos de texto e Data/Hora duplos
      var timeOverride = norm['horaimplementacao'] || norm['horaimplantacao'] || norm['hora'];

      RULES.forEach(function(r){
        var val = undefined;
        if(r.aliases){
          for(var a = 0; a < r.aliases.length; a++){
            if(norm[r.aliases[a]] !== undefined && norm[r.aliases[a]] !== null && norm[r.aliases[a]] !== ''){
              val = norm[r.aliases[a]];
              break;
            }
          }
        }
        if(val === undefined){
          var cleanKey = r.key.replace(/[\\s-_]/g, '');
          val = norm[cleanKey];
        }

        if(val !== undefined && val !== null && val !== ''){
          var target = findEl(r, usedEls);
          if(target && target.special === 'datetime'){
            if(fillDualDateTime(target.txtEl, val, timeOverride, usedEls)){
              count += 2;
              filledLabels.push(r.labelName);
            }
          } else if(target && setVal(target, val, r.key)){
            count++;
            filledLabels.push(r.labelName);
            usedEls.push(target);
          }
        }
      });

      if(count > 0){
        showSt('✅ Sucesso! ' + count + ' campos preenchidos:\\n' + filledLabels.join('\\n'), '#ecfdf5', '#065f46');
      } else {
        showSt('⚠️ Nenhum dos campos foi localizado.\\nAbra a tela "BR - Solicitação de GMUD" e tente novamente.', '#fef2f2', '#991b1b');
      }
    } catch(e){
      showSt('JSON inválido! Erro: ' + e.message, '#fef2f2', '#991b1b');
    }
  };
})();`;

// 1. Remove comentários de linha única
const noComments = source.replace(/\/\/[^\n\r]*/g, '');
const singleLine = 'javascript:' + noComments.replace(/\n\s*/g, ' ').trim();

// 2. Valida sintaxe
new Function(singleLine.replace(/^javascript:/, ''));
console.log('>>> 100% VALID JAVASCRIPT! <<<');

fs.writeFileSync('bookmarklet.js', singleLine, 'utf8');

// 3. Atualiza instalar_favorito.html
const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Instalador GMUDERs v2 - Elis TOPdesk</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      box-sizing: border-box;
      margin: 0;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      max-width: 680px;
      width: 100%;
      padding: 36px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
    h1 {
      font-size: 24px;
      margin-bottom: 12px;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    p {
      color: #94a3b8;
      line-height: 1.6;
      font-size: 14px;
      margin-bottom: 24px;
    }
    .step-box {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .step-badge {
      display: inline-block;
      background: #0284c7;
      color: #fff;
      font-size: 11px;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 4px;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    .step-title {
      font-size: 15px;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 8px;
    }
    .kbd {
      background: #334155;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      color: #38bdf8;
      border: 1px solid #475569;
    }
    .btn-action {
      background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
      color: #ffffff;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 15px rgba(37, 99, 255, 0.4);
      transition: all 0.2s;
    }
    .btn-action:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(37, 99, 255, 0.6);
    }
    .code-preview {
      margin-top: 12px;
      background: #090d16;
      border: 1px solid #1e293b;
      padding: 10px;
      border-radius: 6px;
      font-family: Consolas, monospace;
      font-size: 11px;
      color: #64748b;
      max-height: 70px;
      overflow: hidden;
      word-break: break-all;
      user-select: all;
    }
    .alert-success {
      background: #064e3b;
      color: #6ee7b7;
      border: 1px solid #059669;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      margin-top: 12px;
      display: none;
    }
    .field-pill {
      display: inline-block;
      background: rgba(56, 189, 248, 0.1);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin: 3px 2px;
    }
  </style>
</head>
<body>

  <div class="card">
    <h1>🪄 GMUDERs v2 - Calibrado</h1>
    <p>
      Todos os campos essenciais configurados com suporte inteligente:
      <br>
      <span class="field-pill">📅 Data Implantação (DD/MM/AAAA)</span>
      <span class="field-pill">⏰ Hora Implantação (22:00)</span>
      <span class="field-pill">🌎 Pais * = Brasil</span>
      <span class="field-pill">💻 Dominio * = Desenvolvimento</span>
      <span class="field-pill">🔘 Tipo de GMUD = Normal</span>
      <span class="field-pill">Breve descrição *</span>
      <span class="field-pill">Escopo Técnico Aplicado *</span>
      <span class="field-pill">Plano de Implementação *</span>
      <span class="field-pill">Plano de Roolback *</span>
    </p>

    <!-- PASSO 1 -->
    <div class="step-box">
      <span class="step-badge">Passo 1</span>
      <div class="step-title">Copie o novo código calibrado</div>
      <div style="margin-top: 12px;">
        <button class="btn-action" id="btnCopy">
          📋 Copiar Código Calibrado
        </button>
        <div id="copyAlert" class="alert-success">
          ✅ Código calibrado copiado com sucesso para a área de transferência!
        </div>
      </div>
      <div class="code-preview" id="codePreview"></div>
    </div>

    <!-- PASSO 2 -->
    <div class="step-box">
      <span class="step-badge">Passo 2</span>
      <div class="step-title">Atualize a URL do Favorito no Chrome</div>
      <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
        1. Na barra de favoritos do Chrome, clique com o <strong>botão direito</strong> no favorito <strong>🪄 GMUDERs v2</strong>;<br>
        2. Clique em <strong>"Editar..."</strong>;<br>
        3. No campo <strong>URL</strong>, apague tudo e <strong>cole o código copiado (<span class="kbd">Ctrl + V</span>)</strong>;<br>
        4. Clique em <strong>Salvar</strong>!
      </div>
    </div>
  </div>

  <script>
    const BOOKMARKLET_CODE = ` + JSON.stringify(singleLine) + `;

    document.getElementById('codePreview').innerText = BOOKMARKLET_CODE.substring(0, 150) + '...';

    document.getElementById('btnCopy').addEventListener('click', function() {
      navigator.clipboard.writeText(BOOKMARKLET_CODE).then(function() {
        const alert = document.getElementById('copyAlert');
        alert.style.display = 'block';
        setTimeout(function() { alert.style.display = 'none'; }, 4000);
      }).catch(function() {
        const temp = document.createElement('textarea');
        temp.value = BOOKMARKLET_CODE;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        const alert = document.getElementById('copyAlert');
        alert.style.display = 'block';
        setTimeout(function() { alert.style.display = 'none'; }, 4000);
      });
    });
  </script>
</body>
</html>
`;

fs.writeFileSync('instalar_favorito.html', htmlContent, 'utf8');
console.log('Build completed successfully!');
