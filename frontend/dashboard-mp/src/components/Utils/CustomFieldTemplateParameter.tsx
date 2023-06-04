import { Form } from 'react-bootstrap';
import {
  FieldTemplateProps,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  getTemplate,
  getUiOptions,
} from '@rjsf/utils';
import React from 'react';

/** The `FieldTemplate` component is the template used by `SchemaField` to render any field. It renders the field
 * content, (label, description, children, errors and help) inside of a `WrapIfAdditional` component.
 *
 * @param props - The `FieldTemplateProps` for this component
 */

export default function CustomFieldTemplateParameter<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({
  id,
  children,
  displayLabel,
  rawErrors = [],
  errors,
  help,
  description,
  rawDescription,
  classNames,
  style,
  disabled,
  label,
  hidden,
  onDropPropertyClick,
  onKeyChange,
  readonly,
  required,
  schema,
  uiSchema,
  registry,
}: FieldTemplateProps<T, S, F>) {
  const uiOptions = getUiOptions(uiSchema);
  const WrapIfAdditionalTemplate = getTemplate<'WrapIfAdditionalTemplate', T, S, F>(
    'WrapIfAdditionalTemplate',
    registry,
    uiOptions
  );
  if (hidden) {
    return <div className='hidden'>{children}</div>;
  }
  return (
    <WrapIfAdditionalTemplate
      classNames={classNames}
      style={style}
      disabled={disabled}
      id={id}
      label={label}
      onDropPropertyClick={onDropPropertyClick}
      onKeyChange={onKeyChange}
      readonly={readonly}
      required={required}
      schema={schema}
      uiSchema={uiSchema}
      registry={registry}
    >
      <Form.Group className={label.length > 0 ? 'shadow p-3 mb-2 bg-white rounded' : ''}>
        {displayLabel && (
          <Form.Label htmlFor={id} className={rawErrors.length > 0 ? 'text-danger' : ''}>
            <kbd>
              {label}
            {required ? '*' : null}
            </kbd>
          </Form.Label>
        )}
        {children}
        {displayLabel && rawDescription && (
          <Form.Text className={rawErrors.length > 0 ? 'text-danger' : 'text-muted'}>{description}</Form.Text>
        )}
        {errors}
        {help}
      </Form.Group>
    </WrapIfAdditionalTemplate>
  );
}