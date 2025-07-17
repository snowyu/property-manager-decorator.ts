# Property Manager Decorator

ECMAScript/TypeScript decorators for adding powerful property management features to classes, built on the [Property Manager](https://github.com/snowyu/property-manager.js) library.

[![npm version](https://badge.fury.io/js/property-manager-decorator.svg)](https://badge.fury.io/js/property-manager-decorator)

This library allows you to declaratively add features like serialization, cloning, deep comparison, and typed properties to your classes using intuitive decorators.

## Features

* **Declarative Properties**: Define properties, types, and default values directly in your class using the `@Property` decorator.
* **Inheritance**: Properties are inherited through the class hierarchy.
* **Serialization**: Easily convert class instances to plain JavaScript objects via `toJSON()`.
* **Assignment**: Assign properties from a plain object using `assign()`.
* **Cloning**: Create a deep copy of an object with `clone()`.
* **Comparison**: Check if two objects are deeply equal with `isSame()`.
* **Typed Arrays**: Supports `arrayOf` for typed arrays.
* **Template Properties**: Define properties whose values are dynamically generated from a template string.

**NOTE: ONLY FOR**  `NormalPropertyManager` and `AdvancePropertyManager`

## Installation

```bash
npm install property-manager-decorator property-manager
```

## Setup

**Required**: [ECMAScript Decorators](https://github.com/tc39/proposal-decorators).

### TypeScript

Enable the `experimentalDecorators` flag in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

### Babel

If you are using JavaScript with Babel, you need to enable the legacy decorators proposal plugin.

```bash
npm install --save-dev @babel/plugin-proposal-decorators
```

And in your `.babelrc`:

```json
{
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "legacy": true }]
  ]
}
```

> **Note**: This library uses legacy (Stage 1) decorators, as this is what is currently supported by mainstream transpilers like TypeScript and Babel.

## Usage

There are two primary ways to use this library:

1. **Inheritance**: Your class extends a base class from `property-manager`.
2. **Composition (AOP)**: You apply the decorator to a plain class, and the functionality is injected.

### 1. Inheritance (Recommended)

This is the most straightforward approach. Your class extends `AdvancePropertyManager` (or `NormalPropertyManager`) and gets all the property management methods.

```ts
import { PropertyManager, Property } from 'property-manager-decorator';
import { AdvancePropertyManager } from 'property-manager';

@PropertyManager
class User extends AdvancePropertyManager {
  // A property with a default value
  @Property('guest')
  role!: string;

  // A required property, will throw if not provided
  @Property({ required: true })
  username!: string;

  constructor(options?: any) {
    super(options);
  }
}

const user = new User({ username: 'testuser' });

console.log(user.role); // 'guest'
console.log(user.username); // 'testuser'
console.log(user.toJSON()); // { role: 'guest', username: 'testuser' }
```

Advanced Usage:

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

### 2. Composition / AOP Style

If you cannot or prefer not to extend a base class, you can apply the `@PropertyManager` decorator to a plain class. This will inject the property management methods (`toJSON`, `assign`, `clone`, etc.) directly into your class prototype.

```ts
import { PropertyManager, Property } from 'property-manager-decorator';
import { AdvancePropertyManager } from 'property-manager';

@PropertyManager
export class User {
  @Property('guest')
  role!: string;

  @Property({ required: true })
  username!: string;

  constructor(options?: any) {
    // The `initialize` method is injected by the decorator
    this.initialize(options);
  }
}

// --- TypeScript Declaration Merging ---
// To make TypeScript aware of the injected methods,
// you must extend the interface.
export interface User extends AdvancePropertyManager {}

const user = new User({ username: 'testuser' });
console.log(user.toJSON()); // { role: 'guest', username: 'testuser' }
```

Advanced Usage:

```ts
import { PropertyManager, Property as Prop } from 'property-manager-decorator';
import { AdvancePropertyManager } from 'property-manager';
import { uuid, randomInt } from './utils';

@PropertyManager
export class DemoItem {
  @Prop('init') value: string= 'init';
  @Prop('home') kind: string= 'home';
  constructor(options?) {
    // initialize PropertyManager
    this.initialize(options);
  }
}
@PropertyManager
export class Demo {
  // the default value is true
  @Prop({default: true}) enabled: boolean = true;
  // the value is the default value too.
  // @Prop({value: true}) enabled: boolean = true;
  // the `true` is the default value.
  // @Prop(true) enabled: boolean = true;
  @Prop({required: true}) author!: string;
  @Prop({template: '${author}-${uuid}', imports: {uuid, randomInt}}) id!: string;
  @Prop({type: arrayOf(DemoItem)}) items!: DemoItem[];

  constructor(options?) {
    // initialize PropertyManager
    this.initialize(options);
  }
}

// The TS can not know the added methods,
// Ugly hardcore patch for AOP injects
// https://github.com/microsoft/TypeScript/issues/4881
interface DemoItem extends AdvancePropertyManager {}

interface Demo extends AdvancePropertyManager {}
```

> #### A Note on TypeScript and AOP
>
> The AOP approach relies on modifying the class prototype at runtime. TypeScript's static analysis cannot automatically detect these injected methods. This is a long-standing issue tracked here: [microsoft/TypeScript#4881](https://github.com/microsoft/TypeScript/issues/4881).
>
> To ensure type safety and autocompletion, you must use **declaration merging** by defining an interface with the same name as your class and extending `AdvancePropertyManager`, as shown in the example above.
> This manually informs TypeScript about the methods that will be available on instances of your class.
>
> Ugly hardcore patch for AOP injects
> Or add the following file (file to be removed once the feature comes out):

```ts
// MyClass.d.ts
import { DemoItem } from './DemoItem';
import { AdvancePropertyManager } from 'property-manager';

declare module './Demo' {
  export interface DemoItem extends AdvancePropertyManager {}
  export interface Demo extends AdvancePropertyManager {}
}
```

## Advanced Features

### Array Properties

Use `arrayOf` from the `property-manager` library to define typed arrays. When you assign plain objects to this property, they will be automatically converted into instances of the specified class.

```ts
import { PropertyManager, Property } from 'property-manager-decorator';
import { AdvancePropertyManager, arrayOf } from 'property-manager';

@PropertyManager
class Tag extends AdvancePropertyManager {
  @Property() name!: string;
}

@PropertyManager
class Post extends AdvancePropertyManager {
  @Property() title!: string;

  @Property({ type: arrayOf(Tag) })
  tags!: Tag[];
}

const post = new Post({
  title: 'My First Post',
  tags: [
    { name: 'typescript' },
    { name: 'decorators' }
  ]
});

console.log(post.tags[0] instanceof Tag); // true
console.log(post.toJSON());
// { title: 'My First Post', tags: [{ name: 'typescript' }, { name: 'decorators' }] }
```

### Template Properties

You can define a property whose value is dynamically generated from a template string. The template can reference other properties of the instance.

By default, template properties are **read-only**. You can make them writable by setting `writable: true`.

> **Note on Writable Templates**: Once a new value is written to a `writable` template property, the template logic is bypassed for that instance. The property will return the new value until it is set back to `null` or `undefined`, at which point the template evaluation is restored.

```ts
import { PropertyManager, Property } from 'property-manager-decorator';
import { AdvancePropertyManager } from 'property-manager';
import { v4 as uuid } from 'uuid';

@PropertyManager
class Document extends AdvancePropertyManager {
  @Property({ required: true })
  author!: string;

  // This property's value is generated from the template.
  // `uuid` is imported and made available in the template scope.
  @Property({
    template: '${author}-${uuid()}',
    imports: { uuid }
  })
  id!: string;

  // You can make a template property writable.
  @Property({
    template: 'Title: ${this.id}',
    writable: true
  })
  title!: string;
}

const doc = new Document({ author: 'John Doe' });

console.log(doc.id); // "John Doe-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
console.log(doc.title); // "Title: John Doe-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

// You can overwrite a writable template property
doc.title = 'My Custom Title';
console.log(doc.title); // "My Custom Title"

// Attempting to write to a readonly template property will throw an error.
// doc.id = 'new-id'; // Throws "Cannot set property id"
```

* `template` *{string | (this) => string}*:
  * the template string, eg, `'${author}-${uuid()}'`
  * or customize template function, `function() {return this.author + '-' + uuid()}`
  * `imports`: *{Object}* the optional functions could be used in the template string.
  * **NOTE**: the template property is readonly by default. You can make it writealbe.
    Once a new value has been written, the template will be no useful unless the new value is null or undefined.

## Property Rules

The behavior of properties is governed by the following rules:

- **Serialization (`toJSON`)**:
  - `non-enumerable` properties are not exported.
  - Properties starting with `$`(the `nonExported1stChar` default value) are not exported.
  - Properties with `undefined` values are not exported.
- **Assignment (`assign`)**:
  - `non-enumerable` properties cannot be assigned.
  - Properties starting with `$` can be assigned.
  - `readonly` properties (`writable: false`) cannot be assigned.
- **Order**: Properties are assigned in the order they are defined in the class.
- **Templates**: Template properties are read-only by default. If `writable: true`, the template is only used until a value is explicitly set.
