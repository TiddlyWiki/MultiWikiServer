import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAsyncEffect } from '../../helpers/useAsyncEffect';
import { DataLoader, serverRequests } from '../../helpers/utils';


interface FormValues {
  role_id: number;
  permission_id: string;
}


interface ManageAcl {
  recipe_name: PrismaField<"Recipes", "recipe_name">
}

const ManageAcl = DataLoader(async ({ recipe_name }: ManageAcl) => {

  const result = await serverRequest("ListACL", { recipe_name });

  return {
    ...result,
    permissions: result.permissions.map(e => ({
      permission_id: e,
      permission_name: e,
      permission_description: ""
    }))
  };

}, (result, refresh, props) => {

  const { recipe, bag, roles, permissions, recipeAclRecords, bagAclRecords } = result;

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

  const handleAddRecipeAcl = async (data: FormValues) => {
    console.log("Adding recipe ACL:", data);

    await serverRequest("CreateACL", "WRITE", {
      entity_type: "recipe",
      entity_name: recipe.recipe_name,
      role_id: +data.role_id,
      permission: data.permission_id,
    });

    recipeForm.reset();
    refresh();

  };

  const handleAddBagAcl = async (data: FormValues) => {
    console.log("Adding bag ACL:", data);

    await serverRequest("CreateACL", "WRITE", {
      entity_type: "bag",
      entity_name: bag.bag_name,
      role_id: +data.role_id,
      permission: data.permission_id,
    });

    bagForm.reset();
    refresh();

  };

  const handleDeleteRecipeAcl = async (aclId: number) => {
    await serverRequest("DeleteACL", "WRITE", { acl_id: aclId });
    refresh();
  };

  const handleDeleteBagAcl = async (aclId: number) => {
    await serverRequest("DeleteACL", "WRITE", { acl_id: aclId });
    refresh();
  };

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
                    <td>{record.role?.role_name}</td>
                    <td>{record.permission}</td>
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
                    <td>{record.role?.role_name}</td>
                    <td>{record.permission}</td>
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
