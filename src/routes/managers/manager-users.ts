import { BaseKeyMap, BaseManager, BaseManagerMap,  } from "../BaseManager";

export const UserKeyMap: BaseKeyMap<UserManager, true> = {
  user_create: true,
  user_delete: true,
  user_list: true,
  user_update: true,
  user_update_password: true,
} 

export type UserManagerMap = BaseManagerMap<UserManager>;

export class UserManager extends BaseManager {

  user_list = this.ZodRequest(z => z.undefined(), async () => {

    if (!this.user) throw "User not authenticated";

    if (!this.user.isAdmin) throw "User is not an admin";

    const res = await this.prisma.users.findMany({
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


  user_create = this.ZodRequest(z => z.object({
    username: z.string(),
    email: z.string(),
    role_id: z.prismaField("Roles", "role_id", "number", false),
  }), async ({ username, email, role_id }) => {

    if (!this.user) throw "User not authenticated";

    if (!this.user.isAdmin) throw "User is not an admin";

    const user = await this.prisma.users.create({
      data: { username, email, password: "", roles: { connect: { role_id } } },
      select: { user_id: true, created_at: true }
    });

    return user;
  });

  user_update = this.ZodRequest(z => z.object({
    user_id: z.number(),
    username: z.string(),
    email: z.string(),
    role_id: z.prismaField("Roles", "role_id", "number").optional(),
  }), async ({ user_id, username, email, role_id }) => {

    if (!this.user) throw "User not authenticated";

    if (!this.user.isAdmin) throw "User is not an admin";

    if (this.user.user_id === user_id) throw "Admin cannot update themselves";

    await this.prisma.users.update({
      where: { user_id },
      data: { username, email, roles: { set: [{ role_id }] } }
    });

    return null;
  }, z => z.null());


  user_delete = this.ZodRequest(z => z.object({
    user_id: z.number(),
  }), async ({ user_id }) => {

    if (!this.user) throw "User not authenticated";

    if (!this.user.isAdmin) throw "User is not an admin";

    if (this.user.user_id === user_id) throw "Admin cannot delete themselves";

    const bags = await this.prisma.bags.count({ where: { owner_id: user_id } });

    if (bags) throw "User owns bags and cannot be deleted";

    await this.prisma.users.delete({ where: { user_id } });

    return null;
  });


  user_update_password = this.ZodRequest(z => z.object({
    user_id: z.prismaField("Users", "user_id", "number"),
    registrationRequest: z.string().optional(),
    registrationRecord: z.string().optional(),
  }), async ({ user_id, registrationRecord, registrationRequest }) => {

    if (!this.user)
      throw "You are not authenticated";

    if (this.user.user_id !== user_id && !this.user.isAdmin)
      throw "You must be an admin to update another user's password";

    const userExists = await this.prisma.users.count({ where: { user_id } });
    if (!userExists) throw "User does not exist";

    if (registrationRequest) {
      return this.PasswordService.createRegistrationResponse({
        userID: user_id,
        registrationRequest
      });
    } else if (registrationRecord) {
      await this.prisma.users.update({
        where: { user_id },
        data: { password: registrationRecord }
      });
    }

    return null;
  });

}