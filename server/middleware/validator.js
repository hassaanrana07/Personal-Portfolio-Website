/**
 * Strict Input Validation Middleware
 * Week 12 Dynamic Portfolio - Hassaan Ali Akbar
 * 
 * Enforces strict type, length, regex format, and enum schemas.
 * Rejects non-conforming requests with HTTP 400 before controller execution.
 */

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const SLUG_REGEX = /^[a-z0-9-]+$/;
const ID_PARAM_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

/**
 * Validation engine supporting type, bounds, regex, and enums
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = req[source] || {};
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const val = data[field];
      const isPresent = val !== undefined && val !== null && val !== '';

      // 1. Required check
      if (rules.required && !isPresent) {
        errors.push(`${field} is required.`);
        continue;
      }

      if (!isPresent) continue; // Optional field omitted

      // 2. Type check
      if (rules.type) {
        if (rules.type === 'array') {
          if (!Array.isArray(val)) {
            errors.push(`${field} must be an array.`);
            continue;
          }
        } else if (rules.type === 'number') {
          if (typeof val !== 'number' && isNaN(Number(val))) {
            errors.push(`${field} must be a number.`);
            continue;
          }
        } else if (rules.type === 'boolean') {
          if (typeof val !== 'boolean' && val !== 'true' && val !== 'false' && val !== 0 && val !== 1) {
            errors.push(`${field} must be a boolean.`);
            continue;
          }
        } else if (typeof val !== rules.type) {
          errors.push(`${field} must be of type ${rules.type}.`);
          continue;
        }
      }

      // 3. String length checks
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (rules.minLength && trimmed.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters long.`);
        }
        if (rules.maxLength && trimmed.length > rules.maxLength) {
          errors.push(`${field} cannot exceed ${rules.maxLength} characters.`);
        }
        if (rules.format === 'email' && !EMAIL_REGEX.test(trimmed)) {
          errors.push(`${field} must be a valid email address.`);
        }
        if (rules.format === 'hexColor' && !HEX_COLOR_REGEX.test(trimmed)) {
          errors.push(`${field} must be a valid hex color (e.g. #FF9A3D).`);
        }
        if (rules.format === 'slug' && !SLUG_REGEX.test(trimmed)) {
          errors.push(`${field} must contain only lowercase alphanumeric characters and hyphens.`);
        }
        if (rules.format === 'id' && !ID_PARAM_REGEX.test(trimmed)) {
          errors.push(`${field} contains invalid characters.`);
        }
      }

      // 4. Number bounds checks
      if (rules.type === 'number' && typeof val === 'number') {
        if (rules.min !== undefined && val < rules.min) {
          errors.push(`${field} must be at least ${rules.min}.`);
        }
        if (rules.max !== undefined && val > rules.max) {
          errors.push(`${field} cannot exceed ${rules.max}.`);
        }
      }

      // 5. Enum checks
      if (rules.enum && !rules.enum.includes(val)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}.`);
      }

      // 6. Array checks
      if (rules.type === 'array' && Array.isArray(val)) {
        if (rules.maxItems && val.length > rules.maxItems) {
          errors.push(`${field} exceeds maximum of ${rules.maxItems} items.`);
        }
        if (rules.itemType) {
          const invalidItem = val.some((item) => typeof item !== rules.itemType);
          if (invalidItem) {
            errors.push(`All items in ${field} must be of type ${rules.itemType}.`);
          }
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors
      });
    }

    next();
  };
}

// ==================== PREDEFINED ROUTE SCHEMAS ====================

export const schemas = {
  // 1. Auth: Login
  login: {
    email: { required: true, type: 'string', format: 'email', minLength: 5, maxLength: 254 },
    password: { required: true, type: 'string', minLength: 8, maxLength: 128 }
  },

  // 2. Auth: Initial Setup
  setup: {
    name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
    email: { required: true, type: 'string', format: 'email', minLength: 5, maxLength: 254 },
    password: { required: true, type: 'string', minLength: 8, maxLength: 128 }
  },

  // 3. Auth: Update Account
  updateAccount: {
    name: { required: false, type: 'string', minLength: 2, maxLength: 100 },
    email: { required: false, type: 'string', format: 'email', minLength: 5, maxLength: 254 },
    currentPassword: { required: false, type: 'string', minLength: 8, maxLength: 128 },
    newPassword: { required: false, type: 'string', minLength: 8, maxLength: 128 }
  },

  // 4. Public: Contact Form Submission
  contact: {
    name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
    email: { required: true, type: 'string', format: 'email', minLength: 5, maxLength: 254 },
    subject: { required: true, type: 'string', minLength: 2, maxLength: 150 },
    message: { required: true, type: 'string', minLength: 10, maxLength: 5000 }
  },

  // 5. Admin: Profile Updates
  profile: {
    full_name: { required: false, type: 'string', minLength: 1, maxLength: 100 },
    title: { required: false, type: 'string', maxLength: 150 },
    tagline: { required: false, type: 'string', maxLength: 200 },
    headline: { required: false, type: 'string', maxLength: 250 },
    bio: { required: false, type: 'string', maxLength: 5000 },
    location: { required: false, type: 'string', maxLength: 100 },
    email: { required: false, type: 'string', format: 'email', maxLength: 254 },
    phone: { required: false, type: 'string', maxLength: 30 },
    status_text: { required: false, type: 'string', maxLength: 100 },
    status_badge: { required: false, type: 'string', maxLength: 50 },
    github_url: { required: false, type: 'string', maxLength: 500 },
    linkedin_url: { required: false, type: 'string', maxLength: 500 },
    instagram_url: { required: false, type: 'string', maxLength: 500 },
    resume_url: { required: false, type: 'string', maxLength: 500 }
  },

  // 6. Admin: Project Create/Update
  project: {
    name: { required: false, type: 'string', minLength: 1, maxLength: 200 },
    title: { required: false, type: 'string', minLength: 1, maxLength: 200 },
    slug: { required: false, type: 'string', maxLength: 100 },
    subtitle: { required: false, type: 'string', maxLength: 250 },
    description: { required: false, type: 'string', maxLength: 5000 },
    category: { required: false, type: 'string', maxLength: 100 },
    accent_color: { required: false, type: 'string', maxLength: 30 },
    preview_type: { required: false, type: 'string', maxLength: 50 },
    github_url: { required: false, type: 'string', maxLength: 500 },
    live_url: { required: false, type: 'string', maxLength: 500 },
    image_url: { required: false, type: 'string', maxLength: 500 }
  },

  // 7. Admin: Experience Create/Update
  experience: {
    role: { required: false, type: 'string', minLength: 1, maxLength: 150 },
    period: { required: false, type: 'string', minLength: 1, maxLength: 100 },
    type: { required: false, type: 'string', enum: ['work', 'education'] },
    company: { required: false, type: 'string', maxLength: 150 },
    organization: { required: false, type: 'string', maxLength: 150 },
    institution: { required: false, type: 'string', maxLength: 150 },
    location: { required: false, type: 'string', maxLength: 150 },
    description: { required: false, type: 'string', maxLength: 5000 }
  },

  // 8. Admin: Service Create/Update
  service: {
    title: { required: false, type: 'string', minLength: 1, maxLength: 150 },
    short_desc: { required: false, type: 'string', maxLength: 300 },
    full_desc: { required: false, type: 'string', maxLength: 5000 },
    icon_name: { required: false, type: 'string', maxLength: 50 }
  },

  // 9. Admin: Skill Create/Update
  skill: {
    name: { required: false, type: 'string', minLength: 1, maxLength: 100 },
    category: { required: false, type: 'string', minLength: 1, maxLength: 100 },
    color_hex: { required: false, type: 'string', maxLength: 30 },
    description: { required: false, type: 'string', maxLength: 500 }
  },

  // 10. URL Parameter ID/Slug
  paramId: {
    id: { required: true, type: 'string', format: 'id', maxLength: 64 }
  }
};
