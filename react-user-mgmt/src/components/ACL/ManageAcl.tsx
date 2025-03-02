import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAsyncEffect } from '../../helpers/useAsyncEffect';
import { DataLoader } from '../../helpers/utils';

interface Role {
  role_id: number;
  role_name: string;
}

interface Permission {
  permission_id: string;
  permission_name: string;
  permission_description: string;
}

interface AclRecord {
  acl_id: number;
  role_name: string;
  permission_name: string;
  permission_description: string;
}

interface Recipe {
  recipe_name: string;
}

interface Bag {
  bag_name: string;
}

interface FormValues {
  role_id: number;
  permission_id: string;
}

interface ManageAclProps {
  recipeName: string;
  bagName: string;
}

const test = {
  "roles": [
    {
      "role_id": 1,
      "role_name": "ADMIN",
      "description": "System Administrator"
    },
    {
      "role_id": 2,
      "role_name": "USER",
      "description": "Basic User"
    }
  ],
  "recipe": {
    "recipe_name": "recipe-rho",
    "recipe_id": 4,
    "description": "First wiki",
    "owner_id": null,
    "bag_names": [
      "bag-alpha",
      "bag-beta"
    ]
  },
  "bag": {
    "bag_id": 120,
    "bag_name": "bag-beta",
    "description": "Another test bag",
    "accesscontrol": null
  },
  "recipeAclRecords": [],
  "bagAclRecords": [],
  "permissions": [
    "READ",
    "WRITE",
    "ADMIN"
  ]
}

interface ACLDATA {
  roles: {
    role_id: number;
    role_name: string;
    description: string;
  }[];
  recipe: {
    recipe_name: string;
    recipe_id: number;
    description: string;
    owner_id: null;
    bag_names: string[];
  };
  bag: {
    bag_id: number;
    bag_name: string;
    description: string;
    accesscontrol: null;
  };
  recipeAclRecords: never[];
  bagAclRecords: never[];
  permissions: string[];
}


const ManageAcl = DataLoader(async () => {
  const res = await fetch(location.pathname + "/info.json", {});
  if (res.status !== 200) throw new Error("Failed to fetch user data");
  const result: ACLDATA = await res.json();
  return {
    ...result,
    permissions: result.permissions.map(e => ({
      permission_id: e,
      permission_name: e,
      permission_description: ""
    }))
  };

}, (result, refresh, { recipeName, bagName }: ManageAclProps) => {

  const { recipe, bag, roles, permissions } = result;
  const [recipeAclRecords, setRecipeAclRecords] = useState<AclRecord[]>([]);
  const [bagAclRecords, setBagAclRecords] = useState<AclRecord[]>([]);
  const loading = false;

  const recipeForm = useForm<FormValues>({
    defaultValues: {
      role_id: 0,
      permission_id: "READ"
    }
  });

  const bagForm = useForm<FormValues>({
    defaultValues: {
      role_id: 0,
      permission_id: "READ"
    }
  });

  // useAsyncEffect(async () => {
  //   setLoading(true);
  //   try {
  //     // These would be actual API calls in a real implementation
  //     const fetchedRoles = await fetchRoles();
  //     const fetchedPermissions = await fetchPermissions();
  //     const fetchedRecipeAcl = await fetchRecipeAcl(recipeName);
  //     const fetchedBagAcl = await fetchBagAcl(bagName);

  //     setRoles(fetchedRoles);
  //     setPermissions(fetchedPermissions);
  //     setRecipeAclRecords(fetchedRecipeAcl);
  //     setBagAclRecords(fetchedBagAcl);
  //   } catch (error) {
  //     console.error("Error loading ACL data:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, undefined, undefined, [recipeName, bagName]);

  // // Mock API call functions - replace with actual API calls
  // const fetchRoles = async (): Promise<Role[]> => {
  //   // Simulating API response
  //   return [
  //     { role_id: "1", role_name: "Admin" },
  //     { role_id: "2", role_name: "Editor" },
  //     { role_id: "3", role_name: "Viewer" }
  //   ];
  // };

  // const fetchPermissions = async (): Promise<Permission[]> => {
  //   return [
  //     { permission_id: "1", permission_name: "Read", permission_description: "Can view content" },
  //     { permission_id: "2", permission_name: "Write", permission_description: "Can modify content" },
  //     { permission_id: "3", permission_name: "Delete", permission_description: "Can remove content" }
  //   ];
  // };

  // const fetchRecipeAcl = async (recipeName: string): Promise<AclRecord[]> => {
  //   return [
  //     { acl_id: "1", role_name: "Admin", permission_name: "Write", permission_description: "Can modify content" },
  //     { acl_id: "2", role_name: "Viewer", permission_name: "Read", permission_description: "Can view content" }
  //   ];
  // };

  // const fetchBagAcl = async (bagName: string): Promise<AclRecord[]> => {
  //   return [
  //     { acl_id: "3", role_name: "Admin", permission_name: "Delete", permission_description: "Can remove content" },
  //     { acl_id: "4", role_name: "Editor", permission_name: "Write", permission_description: "Can modify content" }
  //   ];
  // };

  const handleAddRecipeAcl = async (data: FormValues) => {
    console.log("Adding recipe ACL:", data);

    // Simulate API call - Replace with actual implementation
    const roleName = roles.find(r => r.role_id === data.role_id)?.role_name || '';
    const permission = permissions.find(p => p.permission_id === data.permission_id);

    if (permission) {
      const newRecord: AclRecord = {
        acl_id: 0,
        role_name: roleName,
        permission_name: permission.permission_name,
        permission_description: permission.permission_description
      };

      setRecipeAclRecords([...recipeAclRecords, newRecord]);
      recipeForm.reset();
    }
  };

  const handleAddBagAcl = async (data: FormValues) => {
    console.log("Adding bag ACL:", data);

    // Simulate API call - Replace with actual implementation
    const roleName = roles.find(r => r.role_id === data.role_id)?.role_name || '';
    const permission = permissions.find(p => p.permission_id === data.permission_id);

    if (permission) {
      const newRecord: AclRecord = {
        acl_id: 0, // Generate random ID for demo
        role_name: roleName,
        permission_name: permission.permission_name,
        permission_description: permission.permission_description
      };

      setBagAclRecords([...bagAclRecords, newRecord]);
      bagForm.reset();
    }
  };

  const handleDeleteRecipeAcl = async (aclId: number) => {
    // Simulate API call - Replace with actual implementation
    setRecipeAclRecords(recipeAclRecords.filter(record => record.acl_id !== aclId));
  };

  const handleDeleteBagAcl = async (aclId: number) => {
    // Simulate API call - Replace with actual implementation
    setBagAclRecords(bagAclRecords.filter(record => record.acl_id !== aclId));
  };

  if (loading) {
    return <div>Loading ACL data...</div>;
  }

  return (
    <div>
      <div className="container">
        <h2>Recipe ACL: {recipe.recipe_name}</h2>
        <div className="acl-section">
          <div className="acl-form">
            <h3>Add Recipe ACL Record</h3>
            <form onSubmit={recipeForm.handleSubmit(handleAddRecipeAcl)}>
              <div className="form-group">
                <Controller
                  name="role_id"
                  control={recipeForm.control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <select {...field} className="tc-select">
                      <option value="">Select Role</option>
                      {roles.map(role => (
                        <option key={role.role_id} value={role.role_id}>
                          {role.role_name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {recipeForm.formState.errors.role_id && (
                  <span className="error-message">Role is required</span>
                )}
              </div>

              <div className="form-group">
                <Controller
                  name="permission_id"
                  control={recipeForm.control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <select {...field} className="tc-select">
                      <option value="">Select Permission</option>
                      {permissions.map(permission => (
                        <option key={permission.permission_id} value={permission.permission_id}>
                          {permission.permission_name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {recipeForm.formState.errors.permission_id && (
                  <span className="error-message">Permission is required</span>
                )}
              </div>

              <button type="submit" className="btn btn-add">
                Add ACL Record
              </button>
            </form>
          </div>
          <div className="acl-table">
            <table>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Permission</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recipeAclRecords.map(record => (
                  <tr key={record.acl_id}>
                    <td>{record.role_name}</td>
                    <td>
                      {record.permission_name} (<small>{record.permission_description}</small>)
                    </td>
                    <td>
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDeleteRecipeAcl(record.acl_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="container">
        <h2>Bag ACL: {bag.bag_name}</h2>
        <div className="acl-section">
          <div className="acl-form">
            <h3>Add Bag ACL Record</h3>
            <form onSubmit={bagForm.handleSubmit(handleAddBagAcl)}>
              <div className="form-group">
                <Controller
                  name="role_id"
                  control={bagForm.control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <select {...field} className="tc-select">
                      <option value="">Select Role</option>
                      {roles.map(role => (
                        <option key={role.role_id} value={role.role_id}>
                          {role.role_name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {bagForm.formState.errors.role_id && (
                  <span className="error-message">Role is required</span>
                )}
              </div>

              <div className="form-group">
                <Controller
                  name="permission_id"
                  control={bagForm.control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <select {...field} className="tc-select">
                      <option value="">Select Permission</option>
                      {permissions.map(permission => (
                        <option key={permission.permission_id} value={permission.permission_id}>
                          {permission.permission_name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {bagForm.formState.errors.permission_id && (
                  <span className="error-message">Permission is required</span>
                )}
              </div>

              <button type="submit" className="btn btn-add">
                Add ACL Record
              </button>
            </form>
          </div>
          <div className="acl-table">
            <table>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Permission</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bagAclRecords.map(record => (
                  <tr key={record.acl_id}>
                    <td>{record.role_name}</td>
                    <td>
                      {record.permission_name} (<small>{record.permission_description}</small>)
                    </td>
                    <td>
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDeleteBagAcl(record.acl_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ManageAcl;
