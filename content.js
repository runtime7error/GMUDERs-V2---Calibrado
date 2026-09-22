/**
 * GMUDERs v2 - TOPdesk AI Form Filler
 * Preenchimento inteligente de GMUD e chamados no TOPdesk via JSON.
 */

(function () {
  'use strict';

  // Evita injeção duplicada
  if (window.__GMUDERS_INITIALIZED__) return;
  window.__GMUDERS_INITIALIZED__ = true;

  console.log('[GMUDERs v2] Inicializado com sucesso.');

  // Exemplo de JSON de GMUD Elis para testes rápidos
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

  // Mapeamento de sinonimos e regras de preenchimento para TOPdesk ServiceFlow (Elis)
  const FIELD_RULES = [
    {
      key: 'descricao_mudanca',
      aliases: ['descricao_mudanca', 'titulo', 'resumo', 'briefdescription', 'title', 'summary', 'nome_mudanca'],
      labelMatch: ['título', 'titulo', 'resumo', 'descrição da mudança', 'descricao da mudanca', 'brief description', 'assunto'],
      selectors: ['#briefDescription', 'input[name="briefDescription"]', 'input[name="title"]', '#title']
    },
    {
      key: 'solicitante',
      aliases: ['solicitante', 'autor', 'caller', 'requester', 'usuario', 'nome do solicitante'],
      labelMatch: ['solicitante', 'autor', 'caller', 'requester', 'aberto por', 'nome do solicitante'],
      selectors: ['#caller', 'input[name="caller"]', 'input[name="callerLookup"]', '#requester']
    },
    {
      key: 'email',
      aliases: ['email', 'e-mail'],
      labelMatch: ['e-mail', 'email', 'correio eletrônico'],
      selectors: ['input[type="email"]', '#email', 'input[name="email"]']
    },
    {
      key: 'departamento',
      aliases: ['departamento', 'area', 'área', 'setor'],
      labelMatch: ['departamento', 'área', 'area', 'setor'],
      selectors: ['#department', 'input[name="department"]', 'select[name="department"]']
    },
    {
      key: 'tipo_mudanca',
      aliases: ['tipo_mudanca', 'tipo', 'categoria', 'category', 'change_type'],
      labelMatch: ['tipo de mudança', 'tipo da mudança', 'tipo', 'categoria'],
      selectors: ['#changeType', 'select[name="changeType"]', '#category', 'select[name="category"]']
    },
    {
      key: 'classificacao_riscos',
      aliases: ['classificacao_riscos', 'classificacao_de_risco', 'risco', 'risk'],
      labelMatch: ['classificação de risco', 'classificacao de riscos', 'risco', 'avaliação de risco', 'risk'],
      selectors: ['#risk', 'select[name="risk"]']
    },
    {
      key: 'objetivo_alteracao',
      aliases: ['objetivo_alteracao', 'motivo', 'justificativa', 'reason', 'justification'],
      labelMatch: ['objetivo da alteração', 'objetivo da alteracao', 'motivo', 'justificativa', 'por que', 'reason'],
      selectors: ['#reason', 'textarea[name="reason"]', 'input[name="reason"]']
    },
    {
      key: 'escopo_tecnico',
      aliases: ['escopo_tecnico', 'descricao', 'descrição', 'description', 'request', 'detalhes', 'escopo'],
      labelMatch: ['escopo técnico', 'escopo tecnico', 'descrição', 'descricao', 'solicitação', 'detalhes', 'description', 'escopo'],
      selectors: ['#request', 'textarea[name="request"]', '#description', 'textarea[name="description"]']
    },
    {
      key: 'sistemas_servidores',
      aliases: ['sistemas_servidores', 'sistemas', 'servidores', 'ci', 'itens_configuracao'],
      labelMatch: ['sistemas e servidores', 'sistemas', 'servidores', 'itens de configuração', 'ci'],
      selectors: ['#sistemas', 'textarea[name="sistemas"]', '#ci']
    },
    {
      key: 'impactos_previstos',
      aliases: ['impactos_previstos', 'impacto', 'impact'],
      labelMatch: ['impactos previstos', 'impacto', 'impact'],
      selectors: ['#impact', 'select[name="impact"]', 'textarea[name="impact"]']
    },
    {
      key: 'tempo_indisponibilidade',
      aliases: ['tempo_indisponibilidade', 'indisponibilidade', 'downtime'],
      labelMatch: ['tempo de indisponibilidade', 'indisponibilidade', 'downtime'],
      selectors: ['#downtime', 'input[name="downtime"]']
    },
    {
      key: 'plano_implementacao',
      aliases: ['plano_implementacao', 'plano_acao', 'plano_de_acao', 'action_plan', 'implementation_plan', 'acoes'],
      labelMatch: ['plano de implementação', 'plano de implementacao', 'plano de ação', 'plano de acao', 'implementação', 'action plan'],
      selectors: ['#actionPlan', 'textarea[name="actionPlan"]', '#implementationPlan']
    },
    {
      key: 'plano_rollback',
      aliases: ['plano_rollback', 'plano_retorno', 'plano_de_retorno', 'rollback', 'backout_plan', 'rollback_plan'],
      labelMatch: ['plano de rollback', 'plano de retorno', 'retorno', 'rollback', 'backout plan'],
      selectors: ['#rollbackPlan', 'textarea[name="rollbackPlan"]', '#backoutPlan']
    },
    {
      key: 'validacao_pos_mudanca',
      aliases: ['validacao_pos_mudanca', 'testes', 'plano_testes', 'test_plan', 'validacao'],
      labelMatch: ['validação pós-mudança', 'validacao pos-mudanca', 'testes', 'plano de testes', 'validação'],
      selectors: ['#testPlan', 'textarea[name="testPlan"]', '#validation']
    },
    {
      key: 'regras_aplicadas',
      aliases: ['regras_aplicadas', 'regras_negocio'],
      labelMatch: ['regras aplicadas', 'regras de negócio', 'regras de negocio'],
      selectors: ['#regras', 'textarea[name="regras"]']
    },
    {
      key: 'alteracoes_estruturas',
      aliases: ['alteracoes_estruturas', 'scripts', 'banco_dados'],
      labelMatch: ['alterações de estrutura', 'alteracoes de estrutura', 'scripts', 'banco de dados'],
      selectors: ['#alteracoesEstruturais', 'textarea[name="alteracoesEstruturais"]']
    },
    {
      key: 'cards_jira',
      aliases: ['cards_jira', 'jira', 'card_jira'],
      labelMatch: ['cards jira', 'jira', 'card', 'ticket jira'],
      selectors: ['#jira', 'input[name="jira"]']
    },
    {
      key: 'pr',
      aliases: ['pr', 'pull_request', 'url_pr'],
      labelMatch: ['pull request', 'pr', 'url do pr', 'link do pr'],
      selectors: ['#pr', 'input[name="pr"]']
    },
    {
      key: 'versao_anterior',
      aliases: ['versao_anterior'],
      labelMatch: ['versão anterior', 'versao anterior'],
      selectors: ['#versaoAnterior', 'input[name="versaoAnterior"]']
    },
    {
      key: 'versao_atualizada',
      aliases: ['versao_atualizada', 'fix_version'],
      labelMatch: ['versão atualizada', 'versao atualizada', 'fix version'],
      selectors: ['#versaoAtualizada', 'input[name="versaoAtualizada"]']
    },
    {
      key: 'data_implementacao',
      aliases: ['data_implementacao', 'data_inicio', 'data_de_inicio', 'inicio_previsto', 'start_date'],
      labelMatch: ['data de implementação', 'data de implementacao', 'data da mudança', 'data de início', 'início previsto', 'data início', 'start date'],
      selectors: ['#startDate', 'input[name="startDate"]', '#plannedStart', 'input[type="date"]']
    },
    {
      key: 'responsavel_tecnico',
      aliases: ['responsavel_tecnico', 'desenvolvedor', 'assignee'],
      labelMatch: ['responsável técnico', 'responsavel tecnico', 'desenvolvedor', 'assignee'],
      selectors: ['#responsavelTecnico', 'input[name="responsavelTecnico"]']
    }
  ];

  // Injeta HTML do Widget Flutuante
  function injectWidgetUI() {
    // 1. Launcher flutuante
    const launcher = document.createElement('button');
    launcher.id = 'gmuders-launcher';
    launcher.innerHTML = `<span class="gmuders-icon">🪄</span> <span>GMUDERs v2</span>`;
    document.body.appendChild(launcher);

    // 2. Backdrop e Painel Modal
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
            <button class="gmuders-btn-sm" id="gmuders-btn-paste">
              📋 Colar do Clipboard
            </button>
            <button class="gmuders-btn-sm" id="gmuders-btn-sample">
              ⚡ Carregar Exemplo de GMUD
            </button>
            <button class="gmuders-btn-sm" id="gmuders-btn-clear">
              🧹 Limpar
            </button>
          </div>

          <div class="gmuders-textarea-container">
            <label class="gmuders-label" for="gmuders-json-input">JSON Gerado pelo Agente de IA</label>
            <textarea id="gmuders-json-input" placeholder='Cole aqui o JSON gerado pela sua IA, ex: \n{\n  "titulo": "Manutenção...",\n  "plano_acao": "..."\n}'></textarea>
          </div>

          <div id="gmuders-status"></div>
        </div>

        <div class="gmuders-footer">
          <button class="gmuders-btn-secondary" id="gmuders-btn-cancel">Fechar</button>
          <button class="gmuders-btn-primary" id="gmuders-btn-fill">
            🚀 Preencher no TOPdesk
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modalBackdrop);

    setupEventListeners(launcher, modalBackdrop);
  }

  // Configuração dos eventos da interface
  function setupEventListeners(launcher, modalBackdrop) {
    const btnClose = document.getElementById('gmuders-btn-close');
    const btnCancel = document.getElementById('gmuders-btn-cancel');
    const btnFill = document.getElementById('gmuders-btn-fill');
    const btnPaste = document.getElementById('gmuders-btn-paste');
    const btnSample = document.getElementById('gmuders-btn-sample');
    const btnClear = document.getElementById('gmuders-btn-clear');
    const jsonInput = document.getElementById('gmuders-json-input');

    const openModal = () => {
      modalBackdrop.classList.add('gmuders-active');
      jsonInput.focus();
    };

    const closeModal = () => {
      modalBackdrop.classList.remove('gmuders-active');
    };

    launcher.addEventListener('click', openModal);
    btnClose.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);

    // Fecha ao clicar fora do painel
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });

    // Colar da Área de Transferência
    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (!text || !text.trim()) {
          showStatus('Área de transferência vazia.', 'info');
          return;
        }
        jsonInput.value = formatJsonString(text);
        showStatus('JSON colado com sucesso da área de transferência!', 'success');
      } catch (err) {
        showStatus('Não foi possível ler o clipboard automaticamente. Cole manualmente no campo abaixo.', 'error');
      }
    });

    // Carregar Exemplo
    btnSample.addEventListener('click', () => {
      jsonInput.value = JSON.stringify(SAMPLE_GMUD_JSON, null, 2);
      showStatus('Exemplo de GMUD carregado!', 'info');
    });

    // Limpar
    btnClear.addEventListener('click', () => {
      jsonInput.value = '';
      hideStatus();
    });

    // Preencher Formulário
    btnFill.addEventListener('click', () => {
      const rawText = jsonInput.value.trim();
      if (!rawText) {
        showStatus('Por favor, cole ou digite um JSON antes de prosseguir.', 'error');
        return;
      }

      let data;
      try {
        data = JSON.parse(rawText);
      } catch (err) {
        showStatus('JSON inválido! Verifique a sintaxe (aspas, vírgulas, etc.).', 'error');
        return;
      }

      const results = fillTopdeskForm(data);

      if (results.filledCount > 0) {
        showStatus(`Sucesso! ${results.filledCount} campos foram preenchidos no formulário.`, 'success');
        setTimeout(() => {
          closeModal();
        }, 1200);
      } else {
        showStatus('Nenhum campo correspondente foi encontrado na tela. Verifique se o formulário está aberto.', 'error');
      }
    });
  }

  function showStatus(message, type) {
    const el = document.getElementById('gmuders-status');
    el.className = `gmuders-status-${type}`;
    el.innerText = message;
  }

  function hideStatus() {
    const el = document.getElementById('gmuders-status');
    el.style.display = 'none';
  }

  function formatJsonString(str) {
    try {
      const obj = JSON.parse(str);
      return JSON.stringify(obj, null, 2);
    } catch {
      return str;
    }
  }

  // Localiza elemento do DOM baseado em seletores ou em texto de label próximo
  function findFieldElement(rule) {
    // 1. Tenta por seletores diretos
    for (const sel of rule.selectors) {
      const el = document.querySelector(sel);
      if (el && isElementVisible(el)) return el;
    }

    // 2. Tenta encontrar por texto de <label>
    const labels = Array.from(document.querySelectorAll('label, .field-label, th, [data-label]'));
    for (const label of labels) {
      const labelText = (label.innerText || label.textContent || '').toLowerCase().trim();
      const matches = rule.labelMatch.some(m => labelText.includes(m));

      if (matches) {
        // Se a label tem atributo "for"
        const forId = label.getAttribute('for');
        if (forId) {
          const target = document.getElementById(forId);
          if (target && isElementVisible(target)) return target;
        }

        // Procura input/textarea/select adjacente ou dentro da label
        const inside = label.querySelector('input, textarea, select, [contenteditable="true"]');
        if (inside && isElementVisible(inside)) return inside;

        // Procura no container pai (comum em layouts de formulários do TOPdesk)
        const parentContainer = label.closest('tr, .form-group, .field, .input-group, .form-row, div');
        if (parentContainer) {
          const inParent = parentContainer.querySelector('input, textarea, select, [contenteditable="true"]');
          if (inParent && inParent !== label && isElementVisible(inParent)) {
            return inParent;
          }
        }
      }
    }

    return null;
  }

  function isElementVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  // Preenche valores em campos normais, selects e editores ricos
  function setElementValue(element, value) {
    if (!element) return false;

    // 1. Selects / Dropdowns
    if (element.tagName === 'SELECT') {
      const strVal = String(value).toLowerCase().trim();
      let matchedOption = null;

      for (let i = 0; i < element.options.length; i++) {
        const opt = element.options[i];
        const optText = opt.text.toLowerCase().trim();
        const optVal = opt.value.toLowerCase().trim();

        if (optText === strVal || optVal === strVal || optText.includes(strVal)) {
          matchedOption = opt;
          break;
        }
      }

      if (matchedOption) {
        element.value = matchedOption.value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    }

    // 2. Editores ricos (contenteditable / Quill / CKEditor)
    if (element.isContentEditable || element.getAttribute('contenteditable') === 'true') {
      element.focus();
      element.innerHTML = String(value).replace(/\n/g, '<br>');
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.dispatchEvent(new Event('blur', { bubbles: true }));
      return true;
    }

    // 3. Inputs comuns e Textareas
    element.focus();
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));

    // Animação visual sutil de campo preenchido
    const originalBorder = element.style.borderColor;
    element.style.borderColor = '#10b981';
    element.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.25)';
    setTimeout(() => {
      element.style.borderColor = originalBorder;
      element.style.boxShadow = '';
    }, 1500);

    return true;
  }

  // Motor principal de preenchimento
  function fillTopdeskForm(data) {
    let filledCount = 0;
    const normalizedData = {};

    // Normaliza as chaves do JSON para minúsculas
    Object.keys(data).forEach(k => {
      normalizedData[k.toLowerCase().replace(/[\s-_]/g, '')] = data[k];
    });

    FIELD_RULES.forEach(rule => {
      // Procura se o JSON contém alguma variação desta chave
      let valueToFill = undefined;
      for (const alias of rule.aliases) {
        const cleanAlias = alias.toLowerCase().replace(/[\s-_]/g, '');
        if (normalizedData[cleanAlias] !== undefined) {
          valueToFill = normalizedData[cleanAlias];
          break;
        }
      }

      if (valueToFill !== undefined && valueToFill !== null && valueToFill !== '') {
        const element = findFieldElement(rule);
        if (element) {
          const success = setElementValue(element, valueToFill);
          if (success) filledCount++;
        }
      }
    });

    return { filledCount };
  }

  // Inicializa quando a página carregar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectWidgetUI);
  } else {
    injectWidgetUI();
  }
})();
