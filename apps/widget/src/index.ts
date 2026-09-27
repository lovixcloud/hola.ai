(function () {
  let apiBaseUrl = (window as any).HOLA_API_URL || 'http://localhost:3000';
  let embedId = (window as any).HOLA_EMBED_ID || '';

  const scriptTag = document.currentScript as HTMLScriptElement;
  if (scriptTag) {
    const srcUrl = scriptTag.src;
    if (srcUrl) {
      try {
        const parsed = new URL(srcUrl);
        apiBaseUrl = parsed.origin;
      } catch (e) {}
    }
    const dataEmbedId = scriptTag.getAttribute('data-embed-id');
    if (dataEmbedId) embedId = dataEmbedId;
  }

  if (!embedId) {
    console.warn('hola.ai Widget: Missing data-embed-id attribute on script tag.');
    return;
  }

  let visitorId = localStorage.getItem('hola_visitor_id');
  if (!visitorId) {
    visitorId = 'v_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    localStorage.setItem('hola_visitor_id', visitorId);
  }

  let conversationId = '';
  let isOpen = false;
  let config: any = null;
  let messages: Array<{ sender: string; content: string; citations?: any[]; isFallback?: boolean }> = [];

  const container = document.createElement('div');
  container.id = 'hola-widget-root';
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.zIndex = '999999';
  container.style.fontFamily = 'Inter, system-ui, sans-serif';

  const triggerButton = document.createElement('button');
  triggerButton.id = 'hola-widget-trigger';
  triggerButton.style.width = '60px';
  triggerButton.style.height = '60px';
  triggerButton.style.borderRadius = '30px';
  triggerButton.style.backgroundColor = '#2563eb';
  triggerButton.style.color = '#ffffff';
  triggerButton.style.border = 'none';
  triggerButton.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.2)';
  triggerButton.style.cursor = 'pointer';
  triggerButton.style.display = 'flex';
  triggerButton.style.alignItems = 'center';
  triggerButton.style.justifyContent = 'center';
  triggerButton.style.fontSize = '24px';
  triggerButton.innerHTML = '💬';

  const chatBox = document.createElement('div');
  chatBox.id = 'hola-widget-chatbox';
  chatBox.style.width = '380px';
  chatBox.style.height = '580px';
  chatBox.style.maxHeight = '80vh';
  chatBox.style.backgroundColor = '#ffffff';
  chatBox.style.borderRadius = '16px';
  chatBox.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
  chatBox.style.display = 'none';
  chatBox.style.flexDirection = 'column';
  chatBox.style.overflow = 'hidden';
  chatBox.style.marginBottom = '16px';
  chatBox.style.border = '1px solid #e2e8f0';

  container.appendChild(chatBox);
  container.appendChild(triggerButton);
  document.body.appendChild(container);

  fetch(`${apiBaseUrl}/api/v1/public/chatbots/${embedId}/config`)
    .then(res => res.json())
    .then(data => {
      config = data;
      if (config.widgetConfig) {
        triggerButton.style.backgroundColor = config.widgetConfig.primaryColor || '#2563eb';
        renderChatHeader();
        renderMessages();
      }
    })
    .catch(err => {
      console.error('hola.ai Widget: Failed to load config', err);
    });

  function renderChatHeader() {
    const primaryColor = config?.widgetConfig?.primaryColor || '#2563eb';
    const title = config?.widgetConfig?.headerTitle || 'Chat Support';

    chatBox.innerHTML = `
      <div style="background-color: ${primaryColor}; color: #ffffff; padding: 16px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 10px; height: 10px; border-radius: 5px; background-color: #22c55e;"></div>
          <span style="font-weight: 600; font-size: 16px;">${title}</span>
        </div>
        <button id="hola-close-btn" style="background: none; border: none; color: #ffffff; font-size: 20px; cursor: pointer;">✕</button>
      </div>

      <div id="hola-messages-list" style="flex: 1; padding: 16px; overflow-y: auto; background-color: #f8fafc; display: flex; flex-direction: column; gap: 12px;"></div>

      <div id="hola-starters-box" style="padding: 8px 16px; display: flex; flex-wrap: wrap; gap: 6px; background-color: #f8fafc;"></div>

      <div style="padding: 12px; background-color: #ffffff; border-top: 1px solid #e2e8f0; display: flex; gap: 8px;">
        <input id="hola-input" type="text" placeholder="${config?.widgetConfig?.inputPlaceholder || 'Type your message...'}" style="flex: 1; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 20px; font-size: 14px; outline: none;" />
        <button id="hola-send-btn" style="background-color: ${primaryColor}; color: #ffffff; border: none; border-radius: 20px; padding: 10px 18px; font-weight: 600; cursor: pointer;">Send</button>
      </div>
      <div style="font-size: 10px; text-align: center; color: #94a3b8; padding: 4px; background-color: #ffffff;">Powered by <b>hola.ai</b></div>
    `;

    document.getElementById('hola-close-btn')?.addEventListener('click', toggleChat);
    document.getElementById('hola-send-btn')?.addEventListener('click', handleSend);
    document.getElementById('hola-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });

    if (config?.widgetConfig?.welcomeMessage && messages.length === 0) {
      messages.push({
        sender: 'bot',
        content: config.widgetConfig.welcomeMessage,
      });
    }

    renderStarters();
    renderMessages();
  }

  function renderStarters() {
    const startersBox = document.getElementById('hola-starters-box');
    if (!startersBox || !config?.widgetConfig?.conversationStarters) return;
    startersBox.innerHTML = '';
    config.widgetConfig.conversationStarters.forEach((text: string) => {
      const btn = document.createElement('button');
      btn.style.cssText = 'background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 6px 12px; font-size: 12px; color: #334155; cursor: pointer; text-align: left;';
      btn.innerText = text;
      btn.addEventListener('click', () => {
        sendMessage(text);
      });
      startersBox.appendChild(btn);
    });
  }

  function renderMessages() {
    const list = document.getElementById('hola-messages-list');
    if (!list) return;
    list.innerHTML = '';

    messages.forEach(msg => {
      const isUser = msg.sender === 'visitor';
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.justifyContent = isUser ? 'flex-end' : 'flex-start';

      const bubble = document.createElement('div');
      bubble.style.maxWidth = '80%';
      bubble.style.padding = '10px 14px';
      bubble.style.borderRadius = isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px';
      bubble.style.backgroundColor = isUser ? (config?.widgetConfig?.primaryColor || '#2563eb') : '#ffffff';
      bubble.style.color = isUser ? '#ffffff' : '#1e293b';
      bubble.style.boxShadow = isUser ? 'none' : '0 1px 3px 0 rgba(0,0,0,0.1)';
      bubble.style.fontSize = '14px';
      bubble.style.lineHeight = '1.4';
      bubble.innerText = msg.content;

      if (!isUser && msg.citations && msg.citations.length > 0) {
        const citeBox = document.createElement('div');
        citeBox.style.cssText = 'margin-top: 6px; font-size: 11px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 4px;';
        citeBox.innerHTML = `📌 <i>Source: ${msg.citations[0].title}</i>`;
        bubble.appendChild(citeBox);
      }

      wrapper.appendChild(bubble);
      list.appendChild(wrapper);
    });

    list.scrollTop = list.scrollHeight;
  }

  function handleSend() {
    const input = document.getElementById('hola-input') as HTMLInputElement;
    if (!input || !input.value.trim()) return;
    const text = input.value.trim();
    input.value = '';
    sendMessage(text);
  }

  function sendMessage(text: string) {
    messages.push({ sender: 'visitor', content: text });
    renderMessages();

    const startersBox = document.getElementById('hola-starters-box');
    if (startersBox) startersBox.style.display = 'none';

    fetch(`${apiBaseUrl}/api/v1/public/chatbots/${embedId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        conversationId: conversationId || undefined,
        message: text,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.conversationId) conversationId = data.conversationId;
        messages.push({
          sender: 'bot',
          content: data.answer || 'No response received.',
          citations: data.citations,
          isFallback: data.isFallback,
        });
        renderMessages();
      })
      .catch(err => {
        console.error('hola.ai Widget Chat Error:', err);
        messages.push({
          sender: 'bot',
          content: 'Sorry, I encountered an error connecting to the server.',
        });
        renderMessages();
      });
  }

  function toggleChat() {
    isOpen = !isOpen;
    chatBox.style.display = isOpen ? 'flex' : 'none';
    triggerButton.innerHTML = isOpen ? '✕' : '💬';
  }

  triggerButton.addEventListener('click', toggleChat);
})();
