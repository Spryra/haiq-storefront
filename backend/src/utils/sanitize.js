'use strict';
const sanitizeHtml = require('sanitize-html');

/**
 * Strip all HTML tags and attributes from a string.
 * Allows no tags at all — plain text output only.
 * Use this on any free-text field that will be rendered in a UI or email.
 */
function stripHtml(value) {
  if (typeof value !== 'string') return value;
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });
}

/**
 * Strip script-injectable patterns from a string.
 * More aggressive than stripHtml — removes script patterns even in plain text.
 */
function sanitizeText(value) {
  if (typeof value !== 'string') return value;
  return stripHtml(value)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:text\/html/gi, '');
}

module.exports = { stripHtml, sanitizeText };
