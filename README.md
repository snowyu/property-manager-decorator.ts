# Property Manager Decorator

> ECMAScript / TypeScript decorator for class-style Property Manager components.

This library fully depends on the [Property Manager](https://github.com/snowyu/property-manager.js), so please read its README before using this library.

Features:

* Inherited properties with class.
* Assign properties from a plain object.
* Clone object.
* Compare object whether is the same.
* Export properties to a plain object.
* Declare properties with type and default value.
  * Suports `arrayOf` property with type
  * Suports property with `template`(the property value is determined by the template content):
    * `template` *{string | (this) => string}*:
      * the template string, eg, `'${author}-${uuid()}'`
      * or customize template function, `function() {return this.author + '-' + uuid()}`
    * `imports`: *{Object}* the optional functions could be used in the template string.
    * **NOTE**: the template property is readonly by default. You can make it writealbe.
      Once a new value has been written, the template will be no useful unless the new value is null or undefined.

The rules of the properties:

* Exported attributes means they are the `JSON.stringify(aObj)` attributes only.
* The `non-enumerable` attributes can not be exported and assigned.
* The enumerable attributes beginning with '$' can not be exported. but can be assigned.
* The `undefined` value can not be exported.
* The readonly(`writable` is false) attributes can not be assigned.
* The assignment order of properties is the order of defined properties.

**NOTE: ONLY FOR**  `NormalPropertyManager` and `AdvancePropertyManager`

## Usage

**Required**: [ECMAScript Decorators](https://github.com/tc39/proposal-decorators).

* If you use Babel, [@babel/plugin-proposal-decorators](https://babel.dev/docs/en/babel-plugin-proposal-decorators) is needed.
* If you use TypeScript, enable `--experimentalDecorators` flag.

> It does not support the stage 2 decorators yet since mainstream transpilers still transpile to the old decorators.

## Example

Following is the example written in typescript.

```ts
import { PropertyManager, Property as Prop } from 'property-manager-decorator';
import AdvancePropertyManager from 'property-manager/lib/advance';
import { arrayOf } from 'property-manager/lib/array';
import { uuid, randomInt } from './utils';

@PropertyManager
class DemoItem extends AdvancePropertyManager {
  @Prop('init') value: string= 'init';
  @Prop('home') kind: string= 'home';
  constructor(options?) {
    super(options);
  }
}

@PropertyManager
class Demo extends AdvancePropertyManager {
  // the default value is true
  @Prop({default: true}) enabled: boolean = true;
  // the value is the default value too.
  @Prop({value: true}) enabled: boolean = true;
  // the `true` is the default value.
  @Prop(true) enabled: boolean = true;
  @Prop({required: true}) author!: string;
  @Prop({template: '${author}-${uuid}', imports: {uuid, randomInt}}) id!: string;
  @Prop({type: arrayOf(DemoItem)}) items!: DemoItem[];

  constructor(options?) {
    super(options);
  }
}
```
