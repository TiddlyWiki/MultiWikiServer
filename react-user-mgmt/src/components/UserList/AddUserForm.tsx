import React, { useId, useState } from 'react';
import { useForm, UseFormRegisterReturn } from "react-hook-form";
import { changePassword, FormFieldInput, serverRequest, useFormFieldHandler } from '../../helpers/utils';
import { Alert, Card, CardContent, CardHeader, Stack } from '@mui/material';
import { JsonFormSimple } from '../../helpers/forms';


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

  const [value, onChange] = useState({});


  return (
    <Card sx={{ width: "20rem" }}>
      <CardHeader title="Add New User" />
      <CardContent>
        <JsonFormSimple
          required={['username', 'email', 'password', 'confirmPassword']}
          properties={{
            username: { type: 'string', title: 'Username' },
            email: { type: 'string', title: 'Email', "ui:inputType": "email" },
            password: { type: 'string', title: 'Password', 'ui:widget': 'password' },
            confirmPassword: { type: 'string', title: 'Confirm Password', 'ui:widget': 'password' }
          }}
          value={value}
          onChange={onChange}
          onSubmit={async (data, event) => {
            const result = await addNewUser(data.formData);
            props.refreshPage();
            return result;
          }}
        />

      </CardContent>
    </Card>
  )



};



export default AddUserForm;
