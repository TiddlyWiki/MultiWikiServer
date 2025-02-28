import React, { useState } from 'react';
import { addNewUser, CreateUserForm } from '../../helpers/utils';
import { useForm } from "react-hook-form";

const AddUserForm: React.FC = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handler<T>(fn: (input: T) => Promise<void>) {
    return (input: T) => fn(input).then(
      e => { setSuccess(`User added`); setError(''); reset(); },
      e => { setSuccess(''); setError(`${e}`); }
    );
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isLoading },
    reset,
  } = useForm<CreateUserForm>();

  return (
    <div>
      <h1>Add New User</h1>
      <form onSubmit={handleSubmit(handler(addNewUser))}>
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
          <button type="submit"
            className="mws-btn mws-btn-primary"
            disabled={isSubmitting || isLoading}
          >
            Add User
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUserForm;
