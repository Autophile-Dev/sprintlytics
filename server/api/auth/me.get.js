import { requireAuth } from "../../utils/requireAuth";

export default defineEventHandler(async (event) => {
  // Guard the endpoint; throws 401 if user session is invalid/missing
  const user = requireAuth(event);

  return {
    success: true,
    user: {
      id: user._id,
      email: user.email,
      roles: user.roles,
      createdAt: user.createdAt,
    },
  };
});
