Bags and recipes both have owners. If they don't have owners they're considered site-wide and any admin can do owner stuff. 

But do they both need ACLs? An ACL is Read, Write, and Admin. For a recipe, that's self-explanatory. What about for a bag?

We only write to the top bag anyway. What's the point of having separate write permissions on both the bag and recipe? I guess it would at least restrict who can write to a bag, regardless of where in the recipe it is, so people can't overwrite site-wide bags like the site title. If they can read it they can add it to a recipe. 

Only the owner and site admins would have admin privileges on a recipe or bag, which includes setting the acl. I guess that means they could delegate administering the acl for that bag or recipe to others. 

A role is what your role (your job) is on the site. A permission is read, write, admin. An ACL is `[role, permission, entity]`. It says that if your job is this then you have this permission on this entity.

What happens if a recipe contains bags you can't read?

I don't know. Thoughts?