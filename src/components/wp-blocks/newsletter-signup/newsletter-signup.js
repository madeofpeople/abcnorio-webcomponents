const MESSAGE_DELAY_MS = 10000;
const messageTimers = new WeakMap();

function hideMessage(node) {
  clearTimeout(messageTimers.get(node));
  node.classList.remove('is-error', 'is-success');
}

function showMessage(node, text, state) {
  hideMessage(node);
  node.querySelector('.abcnorio-newsletter-signup__message-text').textContent = text;
  node.classList.add(state);
  messageTimers.set(node, setTimeout(() => hideMessage(node), MESSAGE_DELAY_MS));
}

function normalizeFieldErrors(value) {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return value;
}

function clearFieldErrors(form) {
  form.querySelectorAll('.abcnorio-newsletter-signup__field-error').forEach((node) => node.remove());
  form.querySelectorAll('[aria-invalid="true"]').forEach((node) => node.removeAttribute('aria-invalid'));
}

function setFieldError(form, fieldName, message) {
  const controls = Array.from(form.elements).filter((el) => el && el.name === fieldName);
  if (controls.length === 0) {
    return;
  }

  controls.forEach((control) => {
    control.setAttribute('aria-invalid', 'true');
  });

  const fieldWrap = controls[0].closest('[data-field]') || controls[0].parentElement;
  if (!fieldWrap) {
    return;
  }

  const error = document.createElement('div');
  error.className = 'abcnorio-newsletter-signup__field-error';
  error.textContent = String(message || 'Invalid field value.');
  fieldWrap.appendChild(error);
}

async function handleSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const submitEndpoint = form.dataset.submitEndpoint || '';
  const messageNode = form.querySelector('.abcnorio-newsletter-signup__message');
  const submitButton = form.querySelector('[data-submit-button]');

  clearFieldErrors(form);

  hideMessage(messageNode);

  if (!submitEndpoint) {
    if (messageNode) {
      showMessage(messageNode, 'Newsletter signup endpoint is not configured.', 'is-error');
    }
    return;
  }

  const formData = new FormData(form);

  if (submitButton) {
    submitButton.disabled = true;
  }

  try {
    const response = await fetch(submitEndpoint, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
    });

    const payload = await response.json().catch(() => ({}));
    const fieldErrors = normalizeFieldErrors(payload.field_errors);

    if (!response.ok || payload.success === false) {
      const formError = payload.form_error || 'Unable to submit form right now.';
      if (messageNode) {
        showMessage(messageNode, formError, 'is-error');
      }

      Object.entries(fieldErrors).forEach(([name, errorMessage]) => {
        setFieldError(form, name, String(errorMessage || 'Invalid value.'));
      });

      return;
    }

    if (messageNode) {
      showMessage(messageNode, String(payload.message || 'Success, you have been signed up.'), 'is-success');
    }

    form.reset();
  } catch (_error) {
    if (messageNode) {
      showMessage(messageNode, 'Unable to submit form right now.', 'is-error');
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
}

document
  .querySelectorAll('[data-newsletter-signup-form]')
  .forEach((form) => {
    if (form.dataset.newsletterSignupBound === '1') {
      return;
    }

    form.dataset.newsletterSignupBound = '1';
    form.addEventListener('submit', handleSubmit);
    const messageNode = form.querySelector('.abcnorio-newsletter-signup__message');
    form
      .querySelector('.abcnorio-newsletter-signup__message-close')
      .addEventListener('click', () => hideMessage(messageNode));
  });
