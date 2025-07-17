# 属性管理器装饰器

ECMAScript/TypeScript 装饰器，用于向类中添加强大的属性管理功能，基于 [Property Manager](https://github.com/snowyu/property-manager.js) 库构建。

[![npm version](https://badge.fury.io/js/property-manager-decorator.svg)](https://badge.fury.io/js/property-manager-decorator)

该库允许你使用直观的装饰器，声明性地向类中添加诸如序列化、克隆、深度比较和类型化属性等功能。

## 特性

* **声明式属性**: 使用 `@Property` 装饰器直接在类中定义属性、类型和默认值。
* **继承**: 属性可通过类层级继承。
* **序列化**: 通过 `toJSON()` 轻松将类实例转换为纯 JavaScript 对象。
* **赋值**: 使用 `assign()` 从纯对象赋值属性。
* **克隆**: 使用 `clone()` 创建对象的深拷贝。
* **比较**: 使用 `isSame()` 检查两个对象是否深度相等。
* **类型化数组**: 支持 `arrayOf` 定义类型化数组。
* **模板属性**: 定义属性值由模板字符串动态生成。

**注意: 仅适用于** `NormalPropertyManager` 和 `AdvancePropertyManager`

## 安装

```bash
npm install property-manager-decorator property-manager
```

## 设置

**必需**: [ECMAScript Decorators](https://github.com/tc39/proposal-decorators)。

### TypeScript

在您的 `tsconfig.json` 中启用 `experimentalDecorators` 标志：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

### Babel

如果您在 JavaScript 中使用 Babel，需要启用旧版的装饰器提案插件。

```bash
npm install --save-dev @babel/plugin-proposal-decorators
```

然后在您的 `.babelrc` 中配置：

```json
{
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "legacy": true }]
  ]
}
```

> **注意**: 本库使用旧版 (Stage 1) 装饰器，因为这是目前主流转译器（如 TypeScript 和 Babel）所支持的规范。

## 使用

主要有两种使用方式：

1. **继承**: 您的类继承自 `property-manager` 的基类。
2. **组合 (AOP)**: 您将装饰器应用于一个普通类，功能将被注入。

### 1. 继承 (推荐)

这是最直接的方法。您的类继承 `AdvancePropertyManager` (或 `NormalPropertyManager`)，从而获得所有属性管理方法。

```ts
import { PropertyManager, Property } from 'property-manager-decorator';
import { AdvancePropertyManager } from 'property-manager';

@PropertyManager
class User extends AdvancePropertyManager {
  // 带默认值的属性
  @Property('guest')
  role!: string;

  // 必需属性，如果未提供则会抛出错误
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

高级用法:

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
  // 默认值为 true
  @Prop({default: true}) enabled: boolean = true;
  // value 也是默认值
  @Prop({value: true}) enabled: boolean = true;
  // `true` 就是默认值
  @Prop(true) enabled: boolean = true;
  @Prop({required: true}) author!: string;
  @Prop({template: '${author}-${uuid}', imports: {uuid, randomInt}}) id!: string;
  @Prop({type: arrayOf(DemoItem)}) items!: DemoItem[];

  constructor(options?) {
    super(options);
  }
}
```

### 2. 组合 / AOP 风格

如果您不能或不想继承基类，可以将 `@PropertyManager` 装饰器应用于一个普通类。这会将属性管理方法 (`toJSON`, `assign`, `clone` 等) 直接注入到您的类原型中。

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
    // `initialize` 方法由装饰器注入
    this.initialize(options);
  }
}

// --- TypeScript 声明合并 ---
// 为了让 TypeScript 识别注入的方法，
// 您必须扩展接口。
export interface User extends AdvancePropertyManager {}

const user = new User({ username: 'testuser' });
console.log(user.toJSON()); // { role: 'guest', username: 'testuser' }
```

高级用法:

```ts
import { PropertyManager, Property as Prop } from 'property-manager-decorator';
import { AdvancePropertyManager } from 'property-manager';
import { uuid, randomInt } from './utils';

@PropertyManager
export class DemoItem {
  @Prop('init') value: string= 'init';
  @Prop('home') kind: string= 'home';
  constructor(options?) {
    // 初始化 PropertyManager
    this.initialize(options);
  }
}
@PropertyManager
export class Demo {
  // 默认值为 true
  @Prop({default: true}) enabled: boolean = true;
  // value 也是默认值
  // @Prop({value: true}) enabled: boolean = true;
  // `true` 就是默认值
  // @Prop(true) enabled: boolean = true;
  @Prop({required: true}) author!: string;
  @Prop({template: '${author}-${uuid}', imports: {uuid, randomInt}}) id!: string;
  @Prop({type: arrayOf(DemoItem)}) items!: DemoItem[];

  constructor(options?) {
    // 初始化 PropertyManager
    this.initialize(options);
  }
}

// TypeScript 无法识别添加的方法，
// 这是针对 AOP 注入的丑陋补丁
// https://github.com/microsoft/TypeScript/issues/4881
interface DemoItem extends AdvancePropertyManager {}

interface Demo extends AdvancePropertyManager {}
```

> #### 关于 TypeScript 和 AOP 的说明
>
> AOP 方法依赖于在运行时修改类原型。TypeScript 的静态分析无法自动检测这些注入的方法。这是一个长期存在的问题，可在此处跟踪: [microsoft/TypeScript#4881](https://github.com/microsoft/TypeScript/issues/4881)。
>
> 为确保类型安全和自动补全，您必须使用 **声明合并**，即定义一个与您的类同名的接口并继承 `AdvancePropertyManager`，如上例所示。
> 这会手动告知 TypeScript 您的类实例上将拥有哪些方法。
>
> 这是针对 AOP 注入的丑陋补丁
> 或者添加以下文件 (该功能实现后即可删除此文件):

```ts
// MyClass.d.ts
import { DemoItem } from './DemoItem';
import { AdvancePropertyManager } from 'property-manager';

declare module './Demo' {
  export interface DemoItem extends AdvancePropertyManager {}
  export interface Demo extends AdvancePropertyManager {}
}
```

## 高级功能

### 数组属性

使用 `property-manager` 库中的 `arrayOf` 来定义类型化数组。当您将纯对象赋给此属性时，它们将自动转换为指定类的实例。

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

### 模板属性

您可以定义一个属性，其值由模板字符串动态生成。模板可以引用实例的其他属性。

默认情况下，模板属性是 **只读的**。您可以通过设置 `writable: true` 使其可写。

> **关于可写模板的说明**: 一旦为 `writable` 的模板属性写入新值，该实例的模板逻辑将被绕过。该属性将返回新值，直到它被设置回 `null` 或 `undefined`，此时模板求值将恢复。

```ts
import { PropertyManager, Property } from 'property-manager-decorator';
import { AdvancePropertyManager } from 'property-manager';
import { v4 as uuid } from 'uuid';

@PropertyManager
class Document extends AdvancePropertyManager {
  @Property({ required: true })
  author!: string;

  // 此属性的值由模板生成。
  // `uuid` 被导入并在模板作用域中可用。
  @Property({
    template: '${author}-${uuid()}',
    imports: { uuid }
  })
  id!: string;

  // 您可以使模板属性可写。
  @Property({
    template: 'Title: ${this.id}',
    writable: true
  })
  title!: string;
}

const doc = new Document({ author: 'John Doe' });

console.log(doc.id); // "John Doe-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
console.log(doc.title); // "Title: John Doe-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

// 您可以覆盖一个可写的模板属性
doc.title = 'My Custom Title';
console.log(doc.title); // "My Custom Title"

// 尝试写入只读模板属性将抛出错误。
// doc.id = 'new-id'; // 抛出 "Cannot set property id"
```

* `template` *{string | (this) => string}*:
  * 模板字符串, 例如, `'${author}-${uuid()}'`
  * 或自定义模板函数, `function() {return this.author + '-' + uuid()}`
  * `imports`: *{Object}* 可在模板字符串中使用的可选函数。
  * **注意**: 模板属性默认是只读的。您可以使其可写。
    一旦写入新值，模板将不再生效，除非新值为 null 或 undefined。

## 属性规则

属性的行为受以下规则约束：

- **序列化 (`toJSON`)**:
  - `non-enumerable` (不可枚举) 属性不会被导出。
  - 以 `$` (默认的 `nonExported1stChar` 值) 开头的属性不会被导出。
  - 值为 `undefined` 的属性不会被导出。
- **赋值 (`assign`)**:
  - `non-enumerable` (不可枚举) 属性无法被赋值。
  - 以 `$` 开头的属性可以被赋值。
  - `readonly` (只读, `writable: false`) 属性无法被赋值。
- **顺序**: 属性按其在类中定义的顺序进行赋值。
- **模板**: 模板属性默认是只读的。如果设置为 `writable: true`，则模板仅在显式设置值之前使用。
