import type { IAbilityOptions, IPropDescriptor } from 'property-manager';
import { PropertyAbility } from 'property-manager';
import { generateTemplateProperty } from './template-property';

type TemplateFunc = (aObj: any) => string;
export interface PropDescriptor extends IPropDescriptor {
  default?: any;
  template?: string | TemplateFunc;
  imports?: any;
}

export type Constructor = new (...args: any[]) => any;

const innerPropsName = '__PMProperties__';
/**
 * decorator of a property
 * @param options the options for the property
 * @return PropertyDecorator | void
 */
export function Property(options?: PropDescriptor | string | number | boolean ): any {
  return (target: any, key: string, _descriptor: PropertyDescriptor) => {
    const ctor = target.constructor;
    if (ctor) {
      if (!ctor[innerPropsName]) {ctor[innerPropsName] = {}}
      const vProps = ctor[innerPropsName];
      if (typeof options === 'object' && options.default) {
        options.value = options.default;
      }
      vProps[key] = options;
    }
  };
}

/**
 * The Property Manager Decorator of a class
 * Note: NO SUPPORTS for Simple Property-manager yet.
 * @param options the ctor or property-manager options.
 */
export function PropertyManager(options: Constructor|IAbilityOptions): any {
  if (typeof options === 'function') {
    return PropertyManagerFactory(options);
  } else {
    return function(ctor) {
      return PropertyManagerFactory(ctor, options);
    };
  }
}

function PropertyManagerFactory(ctor: Constructor|any, options?: IAbilityOptions) {
  const vProps = ctor[innerPropsName];
  if (vProps) {
    if (!ctor.defineProperties) {PropertyAbility(ctor, options)}
    const defineProperties = ctor.defineProperties;
    Object.keys(vProps).forEach(k => {
      const v = vProps[k];
      if (v && v.template) {
        generateTemplateProperty(k, v, vProps);
      }
    });
    defineProperties(ctor, vProps);
    delete ctor[innerPropsName];
  }
  return ctor;
}

/*
https://github.com/microsoft/TypeScript/issues/4881
Ugly hardcore patch for AOP injects:
Add the following file (file to be removed once the feature comes out):

```ts
// MyClass.d.ts
import { MyClass } from './MyClass';
import { Mod } from './ClassModifier';

declare module './MyClass' {
  export interface MyClass extends Mod {}
}
```
*/
