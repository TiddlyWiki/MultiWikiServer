import { FormContextType, RJSFSchema, StrictRJSFSchema, UiSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import Form from '@rjsf/mui';
// import Form from "@rjsf/semantic-ui";
import { IChangeEvent } from '@rjsf/core';
import { JSONSchema7 } from "json-schema";


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
  onSubmit: (data: IChangeEvent<any, RJSFSchema, any>, event: React.FormEvent<any>) => void,
}) {
  return <Form
    schema={{
      type: "object",
      required: props.required,
      properties: filterProps(props.properties, false),
    }}
    uiSchema={filterProps(props.properties, true)}
    validator={validator}
    onSubmit={props.onSubmit}

  />
}