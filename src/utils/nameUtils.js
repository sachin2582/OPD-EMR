/**
 * Utility functions for handling patient names
 */

/**
 * Formats a patient's full name, handling null/empty middle names gracefully
 * @param {string} firstName - Patient's first name
 * @param {string} middleName - Patient's middle name (can be null, undefined, or empty)
 * @param {string} lastName - Patient's last name
 * @returns {string} Formatted full name
 */
export const formatFullName = (firstName, middleName, lastName) => {
  if (!firstName || !lastName) {
    return '';
  }
  
  const middle = middleName && middleName.trim() ? ` ${middleName.trim()}` : '';
  return `${firstName}${middle} ${lastName}`.trim();
};

/**
 * Formats a patient's full name from a patient object
 * @param {Object} patient - Patient object with firstName, middleName, lastName properties
 * @returns {string} Formatted full name
 */
export const formatPatientName = (patient) => {
  if (!patient) return '';
  
  return formatFullName(patient.firstName, patient.middleName, patient.lastName);
};

/**
 * Formats a patient's full name for display in templates (HTML/JSX)
 * @param {Object} patient - Patient object with firstName, middleName, lastName properties
 * @returns {string} Formatted full name for template use
 */
export const formatPatientNameForTemplate = (patient) => {
  if (!patient) return '';
  
  const middle = patient.middleName && patient.middleName.trim() ? ` ${patient.middleName.trim()}` : '';
  return `${patient.firstName}${middle} ${patient.lastName}`.trim();
};

/**
 * Formats a patient's full name for backend use (SQL queries, etc.)
 * @param {Object} patient - Patient object with firstName, middleName, lastName properties
 * @returns {string} Formatted full name for backend use
 */
export const formatPatientNameForBackend = (patient) => {
  if (!patient) return '';
  
  const middle = patient.middleName && patient.middleName.trim() ? ` ${patient.middleName.trim()}` : '';
  return `${patient.firstName}${middle} ${patient.lastName}`.trim();
};
