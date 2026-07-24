function normalizeFieldErrors(value) {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return value;
}

function clearFieldErrors(form) {
  form.querySelectorAll('.mailchimp-block__field-error').forEach((node) => node.remove());
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
  error.className = 'mailchimp-block__field-error';
  error.textContent = String(message || 'Invalid field value.');
  fieldWrap.appendChild(error);
}

async function handleSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const submitEndpoint = form.dataset.submitEndpoint || '';
  const messageNode = form.querySelector('.mailchimp-block__message');
  const submitButton = form.querySelector('[data-submit-button]');

  clearFieldErrors(form);

  if (messageNode) {
    messageNode.textContent = '';
    messageNode.classList.remove('is-error', 'is-success');
  }

  if (!submitEndpoint) {
    if (messageNode) {
      messageNode.textContent = 'Mailchimp endpoint is not configured.';
      messageNode.classList.add('is-error');
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
        messageNode.textContent = formError;
        messageNode.classList.add('is-error');
      }

      Object.entries(fieldErrors).forEach(([name, errorMessage]) => {
        setFieldError(form, name, String(errorMessage || 'Invalid value.'));
      });

      return;
    }

    if (messageNode) {
      messageNode.textContent = String(payload.message || 'Success, you have been signed up.');
      messageNode.classList.add('is-success');
    }

    form.reset();
  } catch (_error) {
    if (messageNode) {
      messageNode.textContent = 'Unable to submit form right now.';
      messageNode.classList.add('is-error');
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
    }
  }
}

document
  .querySelectorAll('[data-mailchimp-form]')
  .forEach((form) => {
    if (form.dataset.mailchimpBound === '1') {
      return;
    }

    form.dataset.mailchimpBound = '1';
    form.addEventListener('submit', handleSubmit);
  });
