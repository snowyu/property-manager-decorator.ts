import { template, TemplateExecutor } from 'lodash';
import { memoizeTemplate as mTemplate } from './memoize-template';

/**
 * generateTemplateValue.call(aObj, aTemplate, aOptions)
 * @param aTemplate the template string
 * @param aOptions  the template option
 */
export function generateTemplateValue(this: any, aTemplate: string|TemplateExecutor, aOptions?: any) {
  let result;
  if (typeof aTemplate === 'string') aTemplate = mTemplate(aTemplate, aOptions);
  try {
    result = aTemplate(this);
  } catch (error) {
    if (!(error instanceof ReferenceError)) throw error;
  }
  return result;
}

// generate Template Field to the metatype.
export function generateTemplateProperty(
  aFieldName: string, aOptions: any, aMetaType: any,
) {
  let vTemplate = aOptions.template;
  const vImports = aOptions.imports;
  // delete aOptions.imports;
  // delete aOptions.template;

  if (typeof vTemplate === 'string') {
    const vTemplateOpts = vImports ? {imports: vImports} : undefined;
    vTemplate = template(vTemplate, vTemplateOpts);
  }
  if (typeof vTemplate !== 'function') return;

  if (aOptions.required !== false) aOptions.required = true;
  const vOpts = {
    ...aOptions,
    type: 'String',
    get() {
      let result = this['$' + aFieldName];
      if (result === undefined) {
        try {
          result = vTemplate(this);
        } catch (err) {
          if (!(err instanceof ReferenceError)) throw err;
        }
      }
      return result;
    },
  };
  if (aOptions.writable === true) {
    aMetaType[`$${aFieldName}`] = {type: 'String', enumerable: false};
    vOpts.set = function(value: any) {
      if (value != null) this[`$${aFieldName}`] = value;
    };
  }
  aMetaType[aFieldName] = vOpts;
  return aMetaType;
}
