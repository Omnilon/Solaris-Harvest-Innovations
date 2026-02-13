(() => {
  const meta = document.querySelector('meta[name="telegram-endpoint"]');
  const ENDPOINT = window.TELEGRAM_ENDPOINT || (meta ? meta.content : '');
  const site = document.body.dataset.site || 'Website';
  const forms = document.querySelectorAll('.js-telegram-form');
  if (!forms.length) return;

  const collectFields = (form) => {
    const data = [];
    const elements = form.querySelectorAll('input, select, textarea');
    elements.forEach((el) => {
      const type = (el.getAttribute('type') || '').toLowerCase();
      if (type === 'submit' || type === 'button' || type === 'hidden') return;
      const label = el.getAttribute('name') || el.getAttribute('placeholder') || el.getAttribute('aria-label') || el.tagName.toLowerCase();
      const value = el.value ? el.value.trim() : '';
      if (!value) return;
      data.push(`${label}: ${value}`);
    });
    return data;
  };

  const sendPayload = async (payload) => {
    if (!ENDPOINT) throw new Error('Submission endpoint not configured.');
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to send.');
    }
    return res;
  };

  forms.forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      let status = form.querySelector('.form-status');
      if (!status) {
        status = document.createElement('div');
        status.className = 'form-status';
        status.style.marginTop = '12px';
        status.style.fontSize = '12px';
        status.style.letterSpacing = '0.08em';
        status.style.textTransform = 'uppercase';
        form.appendChild(status);
      }
      status.textContent = 'Sending...';
      try {
        const page = window.location.pathname.split('/').pop() || 'index.html';
        const formType = form.dataset.form || 'contact';
        const fields = collectFields(form);
        const lines = [
          'New form submission',
          `Site: ${site}`,
          `Page: ${page}`,
          `Form: ${formType}`,
          ...fields,
        ];
        await sendPayload({ text: lines.join('
') });
        status.textContent = 'Sent. We will be in touch shortly.';
        form.reset();
      } catch (err) {
        status.textContent = err.message || 'Submission failed.';
      }
    });
  });
})();
