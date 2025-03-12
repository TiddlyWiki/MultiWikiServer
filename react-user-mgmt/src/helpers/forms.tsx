import { FormContextType, RJSFSchema, StrictRJSFSchema, UiSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import Form from '@rjsf/mui';
// import Form from "@rjsf/semantic-ui";
import { IChangeEvent } from '@rjsf/core';
import { JSONSchema7 } from "json-schema";
import { Alert, Stack } from '@mui/material';
import { useState } from 'react';


interface JSONProps extends JSONSchema7, UiSchema {

}

function filterProps(props: Record<string, JSONProps>, uischema: boolean) {
  const result = {} as any;
  Object.entries(props).forEach(([key, value]) => {
    result[key] = Object.fromEntries(Object.entries(value).filter(([k, v]) => k.startsWith("ui:") === uischema));
  });
  return result;
}

export function JsonForm<T extends Record<string, JSONProps>>(props: {
  properties: T,
  required: (string & keyof T)[],
  onSubmit: (data: IChangeEvent<any, RJSFSchema, any>, event: React.FormEvent<any>) => Promise<string>,
  submitOptions?: UiSchema["ui:submitButtonOptions"],
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  return <>
    <Form
      schema={{
        type: "object",
        required: props.required,
        properties: filterProps(props.properties, false),
      }}
      uiSchema={{
        ...filterProps(props.properties, true),
        "ui:submitButtonOptions": props.submitOptions
      }}
      validator={validator}
      onSubmit={async (data, event) => {
        setErrorMessage(null);
        const [good, error, result] = await props.onSubmit(data, event)
          .then((result) => [true, undefined, result], (error) => [false, error, undefined]);

        if (good) {
          setErrorMessage(null);
          setSuccessMessage(result);
        } else if (typeof error === 'string') {
          setErrorMessage(error);
          setSuccessMessage(null);
        } else {
          setErrorMessage("An error occurred");
          setSuccessMessage(null);
          console.log(error);
        }
      }}
    />
    <Stack paddingBlock={2}>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}
    </Stack>
  </>
}