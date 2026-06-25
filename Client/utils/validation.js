// Field-level validation
export const validateField = (name, value, formData = {}) => {
  const result = { isValid: true, message: '' };

  switch (name) {
    case 'name': {
      const trimmed = value.trim();
      if (!trimmed) {
        result.isValid = false;
        result.message = 'Name is required';
      } else if (trimmed.length < 2) {
        result.isValid = false;
        result.message = 'Name must be at least 2 characters';
      } else if (trimmed.length > 50) {
        result.isValid = false;
        result.message = 'Name must be under 50 characters';
      } else if (!/^[a-zA-Z\s]+$/.test(trimmed)) {
        result.isValid = false;
        result.message = 'Name can only contain letters and spaces';
      }
      break;
    }
    case 'email': {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) {
        result.isValid = false;
        result.message = 'Email is required';
      } else if (!emailRegex.test(value.trim())) {
        result.isValid = false;
        result.message = 'Please enter a valid email address';
      }
      break;
    }
    case 'password': {
      if (!value) {
        result.isValid = false;
        result.message = 'Password is required';
      } else if (value.length < 8) {
        result.isValid = false;
        result.message = 'Password must be at least 8 characters';
        result.strength = 'weak';
      } else {
        let strength = 0;
        if (/[a-z]/.test(value)) strength++;
        if (/[A-Z]/.test(value)) strength++;
        if (/[0-9]/.test(value)) strength++;
        if (/[^a-zA-Z0-9]/.test(value)) strength++;

        if (strength <= 2) result.strength = 'weak';
        else if (strength === 3) result.strength = 'medium';
        else result.strength = 'strong';
      }
      break;
    }
    case 'confirmPassword': {
      if (!value) {
        result.isValid = false;
        result.message = 'Please confirm your password';
      } else if (value !== formData.password) {
        result.isValid = false;
        result.message = 'Passwords do not match';
      }
      break;
    }
    default:
      break;
  }

  return result;
};

// Full signup form validation
export const validateSignupForm = (formData) => {
  const errors = {};
  let isValid = true;

  const nameResult = validateField('name', formData.name);
  if (!nameResult.isValid) { errors.name = nameResult.message; isValid = false; }

  const emailResult = validateField('email', formData.email);
  if (!emailResult.isValid) { errors.email = emailResult.message; isValid = false; }

  const passwordResult = validateField('password', formData.password);
  if (!passwordResult.isValid) { errors.password = passwordResult.message; isValid = false; }

  const confirmResult = validateField('confirmPassword', formData.confirmPassword, formData);
  if (!confirmResult.isValid) { errors.confirmPassword = confirmResult.message; isValid = false; }

  return { isValid, errors };
};

// Full login form validation
export const validateLoginForm = (formData) => {
  const errors = {};
  let isValid = true;

  const emailResult = validateField('email', formData.email);
  if (!emailResult.isValid) { errors.email = emailResult.message; isValid = false; }

  const passwordResult = validateField('password', formData.password);
  if (!passwordResult.isValid) { errors.password = passwordResult.message; isValid = false; }

  return { isValid, errors };
};

// Sanitize text input
export const sanitizeInput = (str) => {
  return str.replace(/[<>"'/]/g, '').trim();
};
