// ==UserScript==
// @name         GMUDERs v2 - TOPdesk AI Form Filler (Userscript)
// @namespace    https://github.com/gmuders/topdesk-ai
// @version      2.0.0
// @description  Preenche automaticamente formulários de GMUD e chamados no TOPdesk com JSON gerado por IA
// @author       GMUDERs
// @match        *://*.topdesk.net/*
// @match        *://*/tas/*
// @match        *://*/*topdesk*/*
// @match        file:///*test_page.html*
// @grant        GM_setClipboard
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  if (window.__GMUDERS_INITIALIZED__) return;
  window.__GMUDERS_INITIALIZED__ = true;

  // Injeta estilos CSS diretamente
  const styles = `
    #gmuders-launcher {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483640;
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: 600;
      padding: 12px 18px;
      border-radius: 50px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 18px rgba(30, 60, 114, 0.4);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
    }
    #gmuders-launcher:hover {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 6px 24px rgba(30, 60, 114, 0.55);
    }
    #gmuders-modal-backdrop {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(4px);
      z-index: 2147483645;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none; transition: opacity 0.2s ease;
    }
    #gmuders-modal-backdrop.gmuders-active {
      opacity: 1; pointer-events: auto;
    }
    #gmuders-panel {
      width: 90%; max-width: 640px; max-height: 85vh;
      background: #ffffff; border-radius: 14px;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
      display: flex; flex-direction: column; overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
    }
    .gmuders-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: #ffffff;
    }
    .gmuders-header-title {
      display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 700;
    }
    .gmuders-badge {
      background: rgba(255, 255, 255, 0.2); font-size: 11px; padding: 2px 8px; border-radius: 12px;
    }
    .gmuders-btn-close {
      background: transparent; border: none; color: #ffffff; font-size: 22px; cursor: pointer;
    }
    .gmuders-body {
      padding: 18px 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px;
    }
    .gmuders-quick-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .gmuders-btn-sm {
      background: #f1f5f9; border: 1px solid #cbd5e1; color: #334155;
      padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;
    }
    .gmuders-btn-sm:hover { background: #e2e8f0; }
    .gmuders-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; }
    #gmuders-json-input {
      width: 100%; height: 200px; padding: 12px; border-radius: 8px;
      border: 1px solid #cbd5e1; font-family: monospace; font-size: 12px;
      background: #f8fafc; box-sizing: border-box;
    }
    #gmuders-status { padding: 10px 14px; border-radius: 8px; font-size: 13px; display: none; }
    #gmuders-status.gmuders-status-success { display: block; background: #ecfdf5; color: #065f46; }
    #gmuders-status.gmuders-status-error { display: block; background: #fef2f2; color: #991b1b; }
    #gmuders-status.gmuders-status-info { display: block; background: #eff6ff; color: #1e40af; }
    .gmuders-footer {
      padding: 14px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0;
      display: flex; justify-content: flex-end; gap: 10px;
    }
    .gmuders-btn-primary {
      background: #2563eb; color: #ffffff; border: none; padding: 10px 20px;
      border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
    }
    .gmuders-btn-primary:hover { background: #1d4ed8; }
    .gmuders-btn-secondary {
      background: transparent; color: #64748b; border: 1px solid #cbd5e1;
      padding: 10px 16px; border-radius: 8px; font-size: 14px; cursor: pointer;
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  const SAMPLE_GMUD_JSON = {
    "id_interna": "PROJ-1042",
    "data_documentacao": "2026-09-21",
    "descricao_mudanca": "Atualização de Patch de Segurança no Cluster PostgreSQL",
    "solicitante": "Lucas Nascimento",
    "responsavel_documento": "Lucas Nascimento",
    "responsavel_tecnico": "Lucas Nascimento",
    "responsavel_aplicacao": "Lucas Nascimento",
    "cards_jira": "PROJ-1042",
    "pr": "https://github.com/empresa/repo/pull/412",
    "versao_anterior": "16.2",
    "versao_atualizada": "16.4",
    "tipo_mudanca": "Normal",
    "classificacao_riscos": "Médio",
    "interdependencia_merges": "Nenhuma",
    "objetivo_alteracao": "Aplicação de patches de segurança CVE-2026-1029.",
    "sistemas_servidores": "Cluster Banco de Dados PostgreSQL",
    "impactos_previstos": "Breve failover de 2 minutos",
    "tempo_indisponibilidade": "2 minutos",
    "escopo_tecnico": "Upgrade das instâncias primária e secundária.",
    "regras_aplicadas": "Nenhuma alteração de regra de negócio.",
    "alteracoes_estruturas": "Nenhum script DDL necessário.",
    "plano_implementacao": "1. Notificar equipes às 22h.\n2. Executar snapshot e backup.\n3. Aplicar patch na réplica.\n4. Realizar chaveamento planejado.\n5. Validar conexões das aplicações.",
    "plano_rollback": "1. Reverter o chaveamento do nó primário.\n2. Restaurar snapshot point-in-time das 21:55 caso necessário.",
    "validacao_pos_mudanca": "1. Testar conectividade de escrita e leitura.\n2. Monitorar logs no Grafana.",
    "email": "lucas.nascimento@elis.com.br",
    "data_implementacao": "2026-09-23",
    "departamento": "Tecnologia / Desenvolvimento"
  };

  const FIELD_RULES = [
    { key: 'descricao_mudanca', aliases: ['descricao_mudanca', 'titulo', 'resumo', 'briefdescription', 'title', 'summary', 'nome_mudanca'], labelMatch: ['título', 'titulo', 'resumo', 'descrição da mudança', 'descricao da mudanca', 'brief description', 'assunto'], selectors: ['#briefDescription', 'input[name="briefDescription"]', 'input[name="title"]', '#title'] },
    { key: 'solicitante', aliases: ['solicitante', 'autor', 'caller', 'requester', 'usuario', 'nome do solicitante'], labelMatch: ['solicitante', 'autor', 'caller', 'requester', 'aberto por', 'nome do solicitante'], selectors: ['#caller', 'input[name="caller"]', 'input[name="callerLookup"]', '#requester'] },
    { key: 'email', aliases: ['email', 'e-mail'], labelMatch: ['e-mail', 'email', 'correio eletrônico'], selectors: ['input[type="email"]', '#email', 'input[name="email"]'] },
    { key: 'departamento', aliases: ['departamento', 'area', 'área', 'setor'], labelMatch: ['departamento', 'área', 'area', 'setor'], selectors: ['#department', 'input[name="department"]', 'select[name="department"]'] },
    { key: 'tipo_mudanca', aliases: ['tipo_mudanca', 'tipo', 'categoria', 'category', 'change_type'], labelMatch: ['tipo de mudança', 'tipo da mudança', 'tipo', 'categoria'], selectors: ['#changeType', 'select[name="changeType"]', '#category', 'select[name="category"]'] },
    { key: 'classificacao_riscos', aliases: ['classificacao_riscos', 'classificacao_de_risco', 'risco', 'risk'], labelMatch: ['classificação de risco', 'classificacao de riscos', 'risco', 'avaliação de risco', 'risk'], selectors: ['#risk', 'select[name="risk"]'] },
    { key: 'objetivo_alteracao', aliases: ['objetivo_alteracao', 'motivo', 'justificativa', 'reason', 'justification'], labelMatch: ['objetivo da alteração', 'objetivo da alteracao', 'motivo', 'justificativa', 'por que', 'reason'], selectors: ['#reason', 'textarea[name="reason"]', 'input[name="reason"]'] },
    { key: 'escopo_tecnico', aliases: ['escopo_tecnico', 'descricao', 'descrição', 'description', 'request', 'detalhes', 'escopo'], labelMatch: ['escopo técnico', 'escopo tecnico', 'descrição', 'descricao', 'solicitação', 'detalhes', 'description', 'escopo'], selectors: ['#request', 'textarea[name="request"]', '#description', 'textarea[name="description"]'] },
    { key: 'sistemas_servidores', aliases: ['sistemas_servidores', 'sistemas', 'servidores', 'ci', 'itens_configuracao'], labelMatch: ['sistemas e servidores', 'sistemas', 'servidores', 'itens de configuração', 'ci'], selectors: ['#sistemas', 'textarea[name="sistemas"]', '#ci'] },
    { key: 'impactos_previstos', aliases: ['impactos_previstos', 'impacto', 'impact'], labelMatch: ['impactos previstos', 'impacto', 'impact'], selectors: ['#impact', 'select[name="impact"]', 'textarea[name="impact"]'] },
    { key: 'tempo_indisponibilidade', aliases: ['tempo_indisponibilidade', 'indisponibilidade', 'downtime'], labelMatch: ['tempo de indisponibilidade', 'indisponibilidade', 'downtime'], selectors: ['#downtime', 'input[name="downtime"]'] },
    { key: 'plano_implementacao', aliases: ['plano_implementacao', 'plano_acao', 'plano_de_acao', 'action_plan', 'implementation_plan', 'acoes'], labelMatch: ['plano de implementação', 'plano de implementacao', 'plano de ação', 'plano de acao', 'implementação', 'action plan'], selectors: ['#actionPlan', 'textarea[name="actionPlan"]', '#implementationPlan'] },
    { key: 'plano_rollback', aliases: ['plano_rollback', 'plano_retorno', 'plano_de_retorno', 'rollback', 'backout_plan', 'rollback_plan'], labelMatch: ['plano de rollback', 'plano de retorno', 'retorno', 'rollback', 'backout plan'], selectors: ['#rollbackPlan', 'textarea[name="rollbackPlan"]', '#backoutPlan'] },
    { key: 'validacao_pos_mudanca', aliases: ['validacao_pos_mudanca', 'testes', 'plano_testes', 'test_plan', 'validacao'], labelMatch: ['validação pós-mudança', 'validacao pos-mudanca', 'testes', 'plano de testes', 'validação'], selectors: ['#testPlan', 'textarea[name="testPlan"]', '#validation'] },
    { key: 'regras_aplicadas', aliases: ['regras_aplicadas', 'regras_negocio'], labelMatch: ['regras aplicadas', 'regras de negócio', 'regras de negocio'], selectors: ['#regras', 'textarea[name="regras"]'] },
    { key: 'alteracoes_estruturas', aliases: ['alteracoes_estruturas', 'scripts', 'banco_dados'], labelMatch: ['alterações de estrutura', 'alteracoes de estrutura', 'scripts', 'banco de dados'], selectors: ['#alteracoesEstruturais', 'textarea[name="alteracoesEstruturais"]'] },
    { key: 'cards_jira', aliases: ['cards_jira', 'jira', 'card_jira'], labelMatch: ['cards jira', 'jira', 'card', 'ticket jira'], selectors: ['#jira', 'input[name="jira"]'] },
    { key: 'pr', aliases: ['pr', 'pull_request', 'url_pr'], labelMatch: ['pull request', 'pr', 'url do pr', 'link do pr'], selectors: ['#pr', 'input[name="pr"]'] },
    { key: 'versao_anterior', aliases: ['versao_anterior'], labelMatch: ['versão anterior', 'versao anterior'], selectors: ['#versaoAnterior', 'input[name="versaoAnterior"]'] },
    { key: 'versao_atualizada', aliases: ['versao_atualizada', 'fix_version'], labelMatch: ['versão atualizada', 'versao atualizada', 'fix version'], selectors: ['#versaoAtualizada', 'input[name="versaoAtualizada"]'] },
    { key: 'data_implementacao', aliases: ['data_implementacao', 'data_inicio', 'data_de_inicio', 'inicio_previsto', 'start_date'], labelMatch: ['data de implementação', 'data de implementacao', 'data da mudança', 'data de início', 'início previsto', 'data início', 'start date'], selectors: ['#startDate', 'input[name="startDate"]', '#plannedStart', 'input[type="date"]'] },
    { key: 'responsavel_tecnico', aliases: ['responsavel_tecnico', 'desenvolvedor', 'assignee'], labelMatch: ['responsável técnico', 'responsavel tecnico', 'desenvolvedor', 'assignee'], selectors: ['#responsavelTecnico', 'input[name="responsavelTecnico"]'] }
  ];

  function injectWidgetUI() {
    const launcher = document.createElement('button');
    launcher.id = 'gmuders-launcher';
    launcher.innerHTML = `<span>🪄</span> <span>GMUDERs v2</span>`;
    document.body.appendChild(launcher);

    const modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'gmuders-modal-backdrop';
    modalBackdrop.innerHTML = `
      <div id="gmuders-panel">
        <div class="gmuders-header">
          <div class="gmuders-header-title">
            <span>🪄 GMUDERs v2</span>
            <span class="gmuders-badge">TOPdesk AI Filler</span>
          </div>
          <button class="gmuders-btn-close" id="gmuders-btn-close" title="Fechar">&times;</button>
        </div>
        
        <div class="gmuders-body">
          <div class="gmuders-quick-actions">
            <button class="gmuders-btn-sm" id="gmuders-btn-paste">📋 Colar do Clipboard</button>
            <button class="gmuders-btn-sm" id="gmuders-btn-sample">⚡ Carregar Exemplo</button>
            <button class="gmuders-btn-sm" id="gmuders-btn-clear">🧹 Limpar</button>
          </div>

          <div>
            <label class="gmuders-label" for="gmuders-json-input">JSON Gerado pelo Agente de IA</label>
            <textarea id="gmuders-json-input" placeholder='Cole aqui o JSON gerado pela sua IA'></textarea>
          </div>

          <div id="gmuders-status"></div>
        </div>

        <div class="gmuders-footer">
          <button class="gmuders-btn-secondary" id="gmuders-btn-cancel">Fechar</button>
          <button class="gmuders-btn-primary" id="gmuders-btn-fill">🚀 Preencher no TOPdesk</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalBackdrop);

    const btnClose = document.getElementById('gmuders-btn-close');
    const btnCancel = document.getElementById('gmuders-btn-cancel');
    const btnFill = document.getElementById('gmuders-btn-fill');
    const btnPaste = document.getElementById('gmuders-btn-paste');
    const btnSample = document.getElementById('gmuders-btn-sample');
    const btnClear = document.getElementById('gmuders-btn-clear');
    const jsonInput = document.getElementById('gmuders-json-input');
    const statusEl = document.getElementById('gmuders-status');

    const openModal = () => { modalBackdrop.classList.add('gmuders-active'); jsonInput.focus(); };
    const closeModal = () => { modalBackdrop.classList.remove('gmuders-active'); };

    launcher.addEventListener('click', openModal);
    btnClose.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', (e) => { if (e.target === modalBackdrop) closeModal(); });

    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        jsonInput.value = text;
        statusEl.className = 'gmuders-status-success';
        statusEl.innerText = 'JSON colado com sucesso!';
      } catch (e) {
        statusEl.className = 'gmuders-status-error';
        statusEl.innerText = 'Erro ao ler clipboard. Cole manualmente no campo.';
      }
    });

    btnSample.addEventListener('click', () => {
      jsonInput.value = JSON.stringify(SAMPLE_GMUD_JSON, null, 2);
      statusEl.className = 'gmuders-status-info';
      statusEl.innerText = 'Exemplo carregado!';
    });

    btnClear.addEventListener('click', () => {
      jsonInput.value = '';
      statusEl.style.display = 'none';
    });

    btnFill.addEventListener('click', () => {
      try {
        const data = JSON.parse(jsonInput.value.trim());
        const count = fillTopdeskForm(data);
        if (count > 0) {
          statusEl.className = 'gmuders-status-success';
          statusEl.innerText = `Sucesso! ${count} campos preenchidos!`;
          setTimeout(closeModal, 1200);
        } else {
          statusEl.className = 'gmuders-status-error';
          statusEl.innerText = 'Nenhum campo compatível encontrado.';
        }
      } catch (err) {
        statusEl.className = 'gmuders-status-error';
        statusEl.innerText = 'JSON inválido.';
      }
    });
  }

  function findFieldElement(rule) {
    for (const sel of rule.selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    const labels = Array.from(document.querySelectorAll('label, .field-label, th'));
    for (const label of labels) {
      const labelText = (label.innerText || '').toLowerCase();
      if (rule.labelMatch.some(m => labelText.includes(m))) {
        const forId = label.getAttribute('for');
        if (forId) {
          const target = document.getElementById(forId);
          if (target) return target;
        }
        const parent = label.closest('tr, .form-group, .field, div');
        if (parent) {
          const inParent = parent.querySelector('input, textarea, select, [contenteditable="true"]');
          if (inParent && inParent !== label) return inParent;
        }
      }
    }
    return null;
  }

  function setElementValue(element, value) {
    if (!element) return false;
    if (element.tagName === 'SELECT') {
      const strVal = String(value).toLowerCase();
      for (let i = 0; i < element.options.length; i++) {
        if (element.options[i].text.toLowerCase().includes(strVal) || element.options[i].value.toLowerCase().includes(strVal)) {
          element.value = element.options[i].value;
          element.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
      }
      return false;
    }
    if (element.isContentEditable || element.getAttribute('contenteditable') === 'true') {
      element.focus();
      element.innerHTML = String(value).replace(/\n/g, '<br>');
      element.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }
    element.focus();
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
    return true;
  }

  function fillTopdeskForm(data) {
    let filledCount = 0;
    const normalizedData = {};
    Object.keys(data).forEach(k => {
      normalizedData[k.toLowerCase().replace(/[\s-_]/g, '')] = data[k];
    });

    FIELD_RULES.forEach(rule => {
      let valueToFill = undefined;
      for (const alias of rule.aliases) {
        const clean = alias.toLowerCase().replace(/[\s-_]/g, '');
        if (normalizedData[clean] !== undefined) {
          valueToFill = normalizedData[clean];
          break;
        }
      }
      if (valueToFill !== undefined) {
        const el = findFieldElement(rule);
        if (el && setElementValue(el, valueToFill)) filledCount++;
      }
    });
    return filledCount;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectWidgetUI);
  } else {
    injectWidgetUI();
  }
})();
