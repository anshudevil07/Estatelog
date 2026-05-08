// Form validation utilities

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password) {
  return password && password.length >= 6;
}

export function validateRequired(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

export function validatePhone(phone) {
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return re.test(phone);
}

/**
 * Validate a property form object
 * Returns an errors object — empty means valid
 */
export function validatePropertyForm(data) {
  const errors = {};

  if (!validateRequired(data.name)) errors.name = "Property name is required";
  if (!validateRequired(data.location)) errors.location = "Location is required";
  if (!validateRequired(data.price) || isNaN(data.price) || Number(data.price) <= 0) {
    errors.price = "Valid price is required";
  }
  if (!validateRequired(data.type)) errors.type = "Property type is required";
  if (!validateRequired(data.status)) errors.status = "Status is required";
  if (!validateRequired(data.bedrooms) || isNaN(data.bedrooms)) {
    errors.bedrooms = "Number of bedrooms is required";
  }
  if (!validateRequired(data.bathrooms) || isNaN(data.bathrooms)) {
    errors.bathrooms = "Number of bathrooms is required";
  }
  if (!validateRequired(data.sqft) || isNaN(data.sqft)) {
    errors.sqft = "Square footage is required";
  }

  return errors;
}

/**
 * Validate a lead form object
 */
export function validateLeadForm(data) {
  const errors = {};

  if (!validateRequired(data.name)) errors.name = "Name is required";
  if (!validateRequired(data.email)) errors.email = "Email is required";
  else if (!validateEmail(data.email)) errors.email = "Enter a valid email";
  if (!validateRequired(data.phone)) errors.phone = "Phone is required";
  if (!validateRequired(data.status)) errors.status = "Status is required";

  return errors;
}
