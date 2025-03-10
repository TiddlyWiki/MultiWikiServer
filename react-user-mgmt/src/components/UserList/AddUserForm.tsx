import React, { useId, useState } from 'react';
import { useForm, UseFormRegisterReturn } from "react-hook-form";
import { changePassword, fetchPostSearchParams, FormFieldInput, serverRequest, useFormFieldHandler } from '../../helpers/utils';


export interface CreateUserForm {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export async function addNewUser(input: CreateUserForm) {

  const { username, email, password, confirmPassword } = input;

  if (password !== confirmPassword) throw 'Passwords do not match';

  const { user_id } = await serverRequest.user_create({ username, email, role_id: 2 })

  await changePassword({ userId: user_id.toString(), password, confirmPassword });

  return "User added successfully";

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
          type="text" autoComplete="new-password" id title="Username"
        />
        <FormFieldInput
          {...register("email", { required: true })}
          type="email" autoComplete="new-password" id title="Email"
        />
        <FormFieldInput
          {...register("password", { required: true })}
          type="password" autoComplete="new-password" id title="Password"
        />
        <FormFieldInput
          {...register("confirmPassword", { required: true })}
          type="password" autoComplete="new-password" id title="Confirm Password"
        />

        {footer("Add User")}
      </form>
    </div>
  );

};



export default AddUserForm;
