
import { SiteConfig } from "../../commander";
import { assertSignature } from "../../services/SessionManager";
import { registerZodRoutes, zodManage, RouterKeyMap, RouterRouteMap } from "../router";

export const UserKeyMap: RouterKeyMap<UserManager, true> = {
  user_edit_data: true,
  user_create: true,
  user_delete: true,
  user_list: true,
  user_update: true,
  user_update_password: true,
  role_create: true,
  role_update: true,
}

export type UserManagerMap = RouterRouteMap<UserManager>;


export class UserManager {
  static defineRoutes(root: rootRoute, config: SiteConfig) {
    registerZodRoutes(root, new UserManager(), Object.keys(UserKeyMap));
  }

  user_edit_data = zodManage(z => z.object({
    user_id: z.prismaField("Users", "user_id", "string")
  }), async (state, prisma) => {
    state.okUser();

    const { user_id } = state.data;

    if (!state.user.isAdmin && state.user.user_id !== user_id)
      throw "Non-admins cannot retrieve the profile of other users"

    const user = await prisma.users.findUnique({
      where: { user_id },
      select: {
        user_id: true,
        username: true,
        email: true,
        roles: true,
        last_login: true,
        created_at: true,
      }
    });

    if (!user) throw "User not found";

    const allRoles = await prisma.roles.findMany({
      select: {
        role_id: true,
        role_name: true,
        description: true,
      }
    });

    return { user, allRoles }
  });

  user_list = zodManage(z => z.undefined(), async (state, prisma) => {

    state.okAdmin();

    const res = await prisma.users.findMany({
      select: {
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
  });


  user_create = zodManage(z => z.object({
    username: z.string(),
    email: z.string(),
    role_ids: z.prismaField("Roles", "role_id", "string", false).array(),
  }), async (state, prisma) => {
    const { username, email, role_ids } = state.data;

    state.okAdmin();

    const user = await prisma.users.create({
      data: { username, email, password: "", roles: { connect: role_ids.map(role_id => ({ role_id })) } },
      select: { user_id: true, created_at: true }
    });

    return user;
  });

  user_update = zodManage(z => z.object({
    user_id: z.prismaField("Users", "user_id", "string", false),
    username: z.string(),
    email: z.string(),
    role_ids: z.prismaField("Roles", "role_id", "string").array(),
  }), async (state, prisma) => {
    const { user_id, username, email, role_ids } = state.data;

    state.okAdmin();

    if (state.user.user_id === user_id) throw "Admin cannot update themselves";

    await prisma.users.update({
      where: { user_id },
      data: { username, email, roles: { set: role_ids.map(role_id => ({ role_id })) } }
    });

    return null;
  });


  user_delete = zodManage(z => z.object({
    user_id: z.prismaField("Users", "user_id", "string")
  }), async (state, prisma) => {
    const { user_id } = state.data;

    state.okAdmin();

    if (state.user.user_id === user_id) throw "Admin cannot delete themselves";

    const bags = await prisma.bags.count({ where: { owner_id: user_id } });

    if (bags) throw "User owns bags and cannot be deleted";

    await prisma.users.delete({ where: { user_id } });

    return null;
  });


  user_update_password = zodManage(z => z.object({
    user_id: z.prismaField("Users", "user_id", "string"),
    registrationRequest: z.string().optional(),
    registrationRecord: z.string().optional(),
    session_id: z.string().optional(),
    signature: z.string().optional(),
  }), async (state, prisma) => {
    const { user_id, registrationRecord, registrationRequest } = state.data;

    state.okUser();

    if (!state.user.isAdmin) {
      if (!state.data) throw "Session id and signature are required";
      const session = await prisma.sessions.findUnique({
        where: { session_id: state.data.session_id },
      });

      if (!session?.session_key)
        throw "Session not found";
      const { session_key } = session;
      const { session_id, signature } = state.data;
      if (!session_id || !signature)
        throw "Session id and signature are required";
      assertSignature({ session_id, session_key, signature });

      if (session.user_id !== user_id)
        throw "You must be an admin to update another user's password";

      if (state.user.user_id !== user_id)
        throw "You must be logged in as this user to update the password, "
        + "but normally this isn't supposed to happen (this is a bug, please report it)";

    }

    const userExists = await prisma.users.count({ where: { user_id } });
    if (!userExists) throw "User does not exist";

    if (registrationRequest) {
      return state.PasswordService.createRegistrationResponse({
        userID: user_id,
        registrationRequest
      });
    } else if (registrationRecord) {
      await prisma.users.update({
        where: { user_id },
        data: { password: registrationRecord }
      });
    }

    return null;
  });

  role_create = zodManage(z => z.object({
    role_name: z.string(),
    description: z.string(),
  }), async (state, prisma) => {
    const { role_name, description } = state.data;

    state.okAdmin();

    return await prisma.roles.create({
      data: { role_name, description }
    });

  });

  role_update = zodManage(z => z.object({
    role_id: z.prismaField("Roles", "role_id", "string"),
    role_name: z.prismaField("Roles", "role_name", "string"),
    description: z.prismaField("Roles", "description", "string"),
  }), async (state, prisma) => {
    const { role_id, role_name, description } = state.data;

    state.okUser();

    const roles = await prisma.roles.findMany({
      where: { role_name: { in: ["ADMIN", "USER"] } }
    });

    const forbidRoleIDs = new Set(roles.map(e => e.role_id));
    const forbidRoleNames = new Set(roles.map(e => e.role_name));

    if (!role_id) throw "Invalid role id";
    if (forbidRoleIDs.has(role_id)) throw "Cannot make changes to this role";
    if (forbidRoleNames.has(role_name)) throw "This role name is reserved";

    return await prisma.roles.update({
      where: { role_id },
      data: { role_name, description }
    });

  });

}