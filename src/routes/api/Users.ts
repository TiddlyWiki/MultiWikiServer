import { ApiStateObject } from "../../StateObject";
import { makeEndpoint } from "./_index";

export const serverDeleteUserAccount = makeEndpoint({
  zodRequest: z => z.object({
    user_id: z.number(),
  }),
  handler: async (state, { user_id }) => {
    if (!state.authenticatedUser) throw "User not authenticated";

    if (!state.authenticatedUser.isAdmin) throw "User is not an admin";

    if (state.authenticatedUser.user_id === user_id) throw "Admin cannot delete themselves";

    const bags = await state.prisma.bags.count({ where: { owner_id: user_id } });

    if (bags) throw "User owns bags and cannot be deleted";

    await state.prisma.users.delete({ where: { user_id } });

    return null;
  },
  zodResponse: z => z.any(),
});

export const serverGetUsers = makeEndpoint({
  zodRequest: z => z.undefined(),
  handler: async (state) => {
    if (!state.authenticatedUser) throw "User not authenticated";

    if (!state.authenticatedUser.isAdmin) throw "User is not an admin";

    const res = await state.prisma.users.findMany({
      select:{
        user_id: true,
        username: true,
        email: true,
        roles: true,
        last_login: true,
        created_at: true,
      }
    });
    return res.map(e => ({
      ...e,
      last_login: e.last_login?.toISOString(),
      created_at: e.created_at.toISOString(),
    }));
  },
  zodResponse: z => z.any(),
});

export const serverUpdateUser = makeEndpoint({
  zodRequest: z => z.object({
    user_id: z.number(),
    username: z.string(),
    email: z.string(),
    role_id: z.prismaField("Roles", "role_id", "number", false).optional(),
  }),
  handler: async (state, { user_id, username, email, role_id }) => {
    if (!state.authenticatedUser) throw "User not authenticated";

    if (!state.authenticatedUser.isAdmin) throw "User is not an admin";

    if (state.authenticatedUser.user_id === user_id) throw "Admin cannot update themselves";

    await state.prisma.users.update({
      where: { user_id },
      data: { username, email, roles: { set: [{ role_id }] } }
    });

    return null;
  },
  zodResponse: z => z.any(),
});
