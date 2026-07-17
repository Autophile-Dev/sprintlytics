/**
 * Route guard utility to enforce authentication and authorization.
 * Throws 401 Unauthorized if the user is not authenticated.
 * Throws 403 Forbidden if the user lacks the required roles.
 * 
 * @param {object} event Nuxt H3 Event
 * @param {object} options Guard options
 * @param {string[]} options.roles Array of required roles (e.g. ['admin'])
 * @returns {object} The authenticated User document
 */
export function requireAuth(event, options = {}) {
  const user = event.context.user;

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "You must be logged in to access this resource.",
    });
  }

  if (options.roles && options.roles.length > 0) {
    const hasRequiredRole = options.roles.some(role => user.roles.includes(role));
    if (!hasRequiredRole) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
        message: "You do not have permission to perform this action.",
      });
    }
  }

  return user;
}
