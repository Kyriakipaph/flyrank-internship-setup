(function () {
  const V = window.SettingsValidators;

  const form = document.getElementById('settingsForm');
  const submitBtn = document.getElementById('submitBtn');
  const successBox = document.getElementById('success');

  const fields = ['fullName', 'email', 'notification', 'password', 'confirmPassword'];

  // Show an error only after submit attempt OR after the user has left (blurred) the field.
  const touched = {
    fullName: false,
    email: false,
    notification: false,
    password: false,
    confirmPassword: false,
  };
  let submitAttempted = false;

  function getValues() {
    return {
      fullName: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      notification: document.getElementById('notification').value,
      password: document.getElementById('password').value,
      confirmPassword: document.getElementById('confirmPassword').value,
    };
  }

  function render() {
    const values = getValues();
    const errors = V.validateAll(values);
    const valid = V.isFormValid(errors);

    fields.forEach((name) => {
      const wrapper = document.querySelector(`.field[data-field="${name}"]`);
      const msg = document.getElementById(`err-${name}`);
      const showError = (touched[name] || submitAttempted) && errors[name];
      if (showError) {
        wrapper.classList.add('invalid');
        msg.textContent = errors[name];
      } else {
        wrapper.classList.remove('invalid');
        msg.textContent = '';
      }
    });

    submitBtn.disabled = !valid;
    return { errors, valid };
  }

  fields.forEach((name) => {
    const el = document.getElementById(name);
    el.addEventListener('input', () => {
      successBox.hidden = true;
      render();
    });
    el.addEventListener('blur', () => {
      touched[name] = true;
      render();
    });
    if (el.tagName === 'SELECT') {
      el.addEventListener('change', () => {
        touched[name] = true;
        render();
      });
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitAttempted = true;
    const { valid } = render();
    if (!valid) return;

    successBox.hidden = false;
    form.reset();
    submitAttempted = false;
    fields.forEach((n) => (touched[n] = false));
    render();
  });

  render();
})();
