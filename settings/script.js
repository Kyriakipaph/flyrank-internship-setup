(function () {
  "use strict";

  const form = document.getElementById("settings-form");
  const status = document.getElementById("form-status");

  const validators = {
    username(value) {
      if (!value) return "Username is required.";
      if (value.length < 3) return "Username must be at least 3 characters.";
      if (value.length > 20) return "Username must be 20 characters or fewer.";
      if (!/^[a-zA-Z0-9_]+$/.test(value)) {
        return "Only letters, numbers and underscores are allowed.";
      }
      return "";
    },

    email(value) {
      if (!value) return "Email is required.";
      // Simple pragmatic email check: something@something.something
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Please enter a valid email address.";
      }
      return "";
    },

    age(value) {
      if (value === "") return "Age is required.";
      const n = Number(value);
      if (!Number.isInteger(n)) return "Age must be a whole number.";
      if (n < 13) return "You must be at least 13.";
      if (n > 120) return "Please enter a realistic age.";
      return "";
    },

    password(value) {
      // Optional field — blank means "keep current password"
      if (!value) return "";
      if (value.length < 8) return "Password must be at least 8 characters.";
      if (!/[A-Za-z]/.test(value)) return "Password must contain a letter.";
      if (!/[0-9]/.test(value)) return "Password must contain a number.";
      return "";
    },

    confirmPassword(value, all) {
      if (!all.password) return "";
      if (value !== all.password) return "Passwords do not match.";
      return "";
    },

    theme(value) {
      if (!value) return "Please choose a theme.";
      return "";
    },
  };

  const fieldToInputId = {
    username: "username",
    email: "email",
    age: "age",
    password: "password",
    confirmPassword: "confirm-password",
    theme: "theme",
  };

  function readFormValues() {
    const data = new FormData(form);
    return {
      username: (data.get("username") || "").toString().trim(),
      email: (data.get("email") || "").toString().trim(),
      age: (data.get("age") || "").toString().trim(),
      password: (data.get("password") || "").toString(),
      confirmPassword: (data.get("confirmPassword") || "").toString(),
      theme: (data.get("theme") || "").toString(),
      newsletter: data.get("newsletter") === "on",
    };
  }

  function showError(fieldName, message) {
    const inputId = fieldToInputId[fieldName];
    const input = document.getElementById(inputId);
    const errorEl = document.getElementById(inputId + "-error");
    if (!input || !errorEl) return;

    errorEl.textContent = message;
    input.classList.toggle("invalid", Boolean(message));
    if (message) {
      input.setAttribute("aria-invalid", "true");
    } else {
      input.removeAttribute("aria-invalid");
    }
  }

  function validateField(fieldName, values) {
    const validator = validators[fieldName];
    if (!validator) return "";
    const message = validator(values[fieldName], values);
    showError(fieldName, message);
    return message;
  }

  function validateAll(values) {
    let firstInvalidField = null;
    Object.keys(validators).forEach(function (name) {
      const message = validateField(name, values);
      if (message && !firstInvalidField) firstInvalidField = name;
    });
    return firstInvalidField;
  }

  // Live validation as the user types / changes fields
  Object.keys(fieldToInputId).forEach(function (fieldName) {
    const input = document.getElementById(fieldToInputId[fieldName]);
    if (!input) return;
    input.addEventListener("blur", function () {
      validateField(fieldName, readFormValues());
      // If password changes, re-check confirmPassword too
      if (fieldName === "password") {
        validateField("confirmPassword", readFormValues());
      }
    });
    input.addEventListener("input", function () {
      // Clear the error once the user starts fixing the field
      if (input.classList.contains("invalid")) {
        showError(fieldName, "");
      }
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    status.textContent = "";
    status.className = "form-status";

    const values = readFormValues();
    const firstInvalid = validateAll(values);

    if (firstInvalid) {
      status.textContent = "Please fix the highlighted fields.";
      status.classList.add("failure");
      const focusTarget = document.getElementById(fieldToInputId[firstInvalid]);
      if (focusTarget) focusTarget.focus();
      return;
    }

    // No backend in this demo — just show what would be sent.
    const { confirmPassword, ...toSave } = values;
    console.log("Saving settings:", toSave);

    status.textContent = "Settings saved.";
    status.classList.add("success");
  });

  form.addEventListener("reset", function () {
    Object.keys(fieldToInputId).forEach(function (name) {
      showError(name, "");
    });
    status.textContent = "";
    status.className = "form-status";
  });
})();
