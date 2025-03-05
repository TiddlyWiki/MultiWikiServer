import React, { useId, useState } from 'react';
import { useForm, UseFormRegisterReturn } from "react-hook-form";
import { changePassword, fetchPostSearchParams, FormFieldInput, useFormFieldHandler } from '../../helpers/utils';


export interface CreateUserForm {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export async function addNewUser(input: CreateUserForm) {

  const { username, email, password, confirmPassword } = input;

  if (password !== confirmPassword) throw 'Passwords do not match';

  const createUser = await fetchPostSearchParams('/admin/post-user', { username, email });

  if (!createUser.ok) throw await createUser.text() || 'Failed to add user'

  const userId = (await createUser.json()).userId.toString();

  await changePassword({ userId, password, confirmPassword });

}


const AddUserForm: React.FC<{ refreshPage: () => void }> = (props) => {

  const {
    handler, register, footer,
  } = useFormFieldHandler<CreateUserForm>(props.refreshPage);

  return (
    <div>
      <h1>Add New User</h1>
      <form onSubmit={handler(addNewUser)}>
        <FormFieldInput
          {...register("username", { required: true })}
          type="text" autoComplete="new-password" id
        />
        <FormFieldInput
          {...register("email", { required: true })}
          type="email" autoComplete="new-password" id
        />
        <FormFieldInput
          {...register("password", { required: true })}
          type="password" autoComplete="new-password" id
        />
        <FormFieldInput
          {...register("confirmPassword", { required: true })}
          type="password" autoComplete="new-password" id
        />

        {footer("Add User")}
      </form>
    </div>
  );

};



export default AddUserForm;
