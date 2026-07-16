export const bindDrawer = ({
  root,
  actuator,
  drawer,
  activeClass = 'active',
  closeOnOutsideClick = true,
  closeOnEscape = true,
}) => {
  if (!(root instanceof HTMLElement)) {
    return () => {};
  }

  if (!(actuator instanceof HTMLElement) || !(drawer instanceof HTMLElement)) {
    return () => {};
  }

  const isOpen = () => drawer.classList.contains(activeClass);

  const setOpen = (open) => {
    drawer.classList.toggle(activeClass, open);
    actuator.setAttribute('aria-expanded', String(open));
  };

  const close = () => setOpen(false);

  const toggle = (event) => {
    event.preventDefault();
    setOpen(!isOpen());
  };

  const onDocumentClick = (event) => {
    if (!isOpen()) {
      return;
    }

    if (!(event.target instanceof Node)) {
      return;
    }

    if (root.contains(event.target)) {
      return;
    }

    close();
  };

  const onDocumentKeydown = (event) => {
    if (!isOpen() || event.key !== 'Escape') {
      return;
    }

    close();
    actuator.focus();
  };

  actuator.addEventListener('click', toggle);

  if (closeOnOutsideClick) {
    document.addEventListener('click', onDocumentClick);
  }

  if (closeOnEscape) {
    document.addEventListener('keydown', onDocumentKeydown);
  }

  setOpen(isOpen());

  return () => {
    actuator.removeEventListener('click', toggle);

    if (closeOnOutsideClick) {
      document.removeEventListener('click', onDocumentClick);
    }

    if (closeOnEscape) {
      document.removeEventListener('keydown', onDocumentKeydown);
    }
  };
};