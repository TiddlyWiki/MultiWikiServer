import React, { useState, useEffect } from 'react';
import { changePassword, fetchPostSearchParams } from '../helpers/utils';
import { useForm, SubmitHandler } from "react-hook-form"

// function AddUserForm() {
//   interface Inputs {
//     username: string
//     email: string
//     password: string
//     confirmPassword: string
//   }
//   const {
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors },
//   } = useForm<Inputs>()
//   const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data)

//   return (
//     <form onSubmit={handleSubmit(onSubmit)}>
//       <input {...register("username", { required: true })} />
//       <input {...register("email", { required: true })} />
//       <input {...register("password", { required: true })} />
//       <input {...register("confirmPassword", { required: true })} />
//       <input type="submit" />
//     </form>
//   )
// }

interface Inputs {
  username: string
  email: string
  password: string
  confirmPassword: string
}

async function addNewUser(input: Inputs) {
  throw new Error("Function not implemented.");
  const { username, email, password, confirmPassword } = input;

  if (password !== confirmPassword) throw 'Passwords do not match';

  const createUser = await fetchPostSearchParams('/admin/post-user', { username, email });

  if (!createUser.ok) throw await createUser.text() || 'Failed to add user'

  const userId = await createUser.json();

  await changePassword(userId, password);

}

const AddUserForm: React.FC = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>()
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data)



  // const handleSubmit = async (formData: FormData) => {
  //   setError('');
  //   setSuccess('');
  //   const username = formData.get('username') as string;
  //   const email = formData.get('email') as string;
  //   const password = formData.get('password') as string;
  //   const confirmPassword = formData.get('confirmPassword') as string;
  //   // Validate form
  //   if (password !== confirmPassword) {
  //     setError('Passwords do not match');
  //     return;
  //   }
  //   try {
  //     setSuccess('User added successfully');
  //   } catch (err) {
  //     setError('An error occurred while adding the user');
  //     console.error('Error adding user:', err);
  //   }
  // };

  return (
    <div>
      <h1>Add New User</h1>
      <form onSubmit={handleSubmit(addNewUser)}>
        <div className="mws-form-group">
          <label htmlFor="username">Username:</label>
          <input {...register("username", { required: true })}
            type="text"
            id="username"
            className="mws-form-input"
            autoComplete="new-password"
          />
        </div>
        <div className="mws-form-group">
          <label htmlFor="email">Email:</label>
          <input {...register("email", { required: true })}
            type="email"
            id="email"
            className="mws-form-input"
            autoComplete="new-password"
          />
        </div>
        <div className="mws-form-group">
          <label htmlFor="password">Password:</label>
          <input {...register("password", { required: true })}
            type="password"
            id="password"
            className="mws-form-input"
            autoComplete="new-password"
          />
        </div>
        <div className="mws-form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input {...register("confirmPassword", { required: true })}
            type="password"
            id="confirmPassword"
            className="mws-form-input"
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="mws-error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="mws-success-message">
            {success}
          </div>
        )}

        <div className="mws-form-actions">
          <button type="submit" className="mws-btn mws-btn-primary">
            Add User
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUserForm;
