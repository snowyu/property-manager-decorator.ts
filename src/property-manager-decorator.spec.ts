// tslint:disable: max-classes-per-file
import 'jest-extended';
import { AdvancePropertyManager, PropManagerType, arrayOf } from 'property-manager';
import { PropertyManager, Property } from './property-manager-decorator';

describe('PropertyManager Decorator', () => {
  @PropertyManager
  class DemoItem extends AdvancePropertyManager {
    @Property('init') value!: string;
    @Property('home') kind!: string;
    constructor(options?) {
      super(options);
    }
  }

  @PropertyManager
  class DemoDefault extends AdvancePropertyManager {
    @Property() as!: string;
    @Property(123) a!: number;
    @Property({default: true}) b!: number;
    constructor(options?) {
      super(options);
    }
  }

  @PropertyManager
  class ChildDemo extends DemoDefault {
    @Property({default: '123'}) chi!: string;
    constructor(options?) {
      super(options);
    }
  }

  @PropertyManager
  class TemplateDemo extends DemoDefault {
    @Property({
      template: '${as}#${chi}-${uuid()}',
      imports: {uuid() { return '1eu3'; }},
    }) id!: string;
    @Property({
      template: '${as}!',
      writable: true,
    }) t1!: string;
    @Property({default: '123'}) chi!: string;
    @Property({type: arrayOf(DemoItem)}) items!: DemoItem[];

    constructor(options?) {
      super(options);
    }
  }

  it('should set default property manager correctly', async () => {
    const result = new DemoDefault({as: 'Hi world'});
    expect(result.a).toEqual(123);
    expect(result.b).toEqual(true);
    expect(result.toJSON()).toMatchObject({ as: 'Hi world' });
  });

  it('should get child default property manager', async () => {
    const result = new ChildDemo({as: 'Hi world'});
    expect(result.a).toEqual(123);
    expect(result.b).toEqual(true);
    expect(result.chi).toEqual('123');
    expect(result.toJSON()).toMatchObject({ as: 'Hi world' });
    result.assign({a: 56})
    expect(result.a).toEqual(56);
  });

  it('should get/set template property', async () => {
    const result = new TemplateDemo({as: 'Hi world'});
    expect(result.id).toEqual('Hi world#123-1eu3');
    expect(result.t1).toEqual('Hi world!');
    result.t1 = 'myT1';
    expect(result.t1).toEqual('myT1');
    expect(() => result.id = 'ssss').toThrowError('Cannot set property id');
    expect(result.a).toEqual(123);
    expect(result.b).toEqual(true);
    expect(result.chi).toEqual('123');
    expect(result.toJSON()).toMatchObject({ as: 'Hi world' });
    result.as = 'try'
    result.chi = '432'
    expect(result.id).toEqual('try#432-1eu3');
    expect(result.toJSON()).toMatchObject({ as: 'try', chi: '432' });
  });

  it('should assign object and ignore readonly template property', async () => {
    const result = new TemplateDemo({id: '___', as: 'Hi world'});
    expect(result.id).toEqual('Hi world#123-1eu3');
    expect(JSON.stringify(result)).toBe('{"t1":"Hi world!","items":[],"as":"Hi world"}')
  })

  it('should export object and ignore template property', () => {
    @PropertyManager
    class TemplateDemo1 extends DemoDefault {
      @Property({
        template: '${as}#${chi}-${uuid()}',
        imports: {uuid() { return '1eu3'; }},
        exported: true,
      }) id!: string;
      @Property({
        template: '${as}!',
        writable: true,
      }) t1!: string;
      @Property({default: '123'}) chi!: string;
      @Property({type: arrayOf(DemoItem)}) items!: DemoItem[];

      constructor(options?) {
        super(options);
      }
    }
    const result = new TemplateDemo1({id: '___', as: 'Hi world'});
    expect(JSON.stringify(result)).toBe('{"id":"Hi world#123-1eu3","t1":"Hi world!","items":[],"as":"Hi world"}')
  });

  it('should get array property', async () => {
    const result = new TemplateDemo({as: 'Hi world', items: [{value: '1'}, {value: '2', kind: 'H'}]});
    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toHaveProperty('value', '1');
    expect(result.items[0]).toHaveProperty('kind', 'home');
    expect(result.items[1]).toHaveProperty('value', '2');
    expect(result.items[1]).toHaveProperty('kind', 'H');
    expect(result.toJSON()).toMatchObject({ as: 'Hi world', items: [{value: '1'}, {value: '2', kind: 'H'}] });
  });
  testPMAoP('advance')
  testPMAoP('normal')
});


function testPMAoP(name: PropManagerType) {
  @PropertyManager(name)
  class DemoItem {
    @Property('init') value!: string;
    @Property('home') kind!: string;
    constructor(options?) {
      this.initialize(options)
    }
  }
  interface DemoItem extends AdvancePropertyManager {
    value: string
    kind: string
  }

  @PropertyManager(name)
  class DemoDefault {
    @Property() as!: string;
    @Property(123) a!: number;
    @Property({default: true}) b!: number;
    constructor(options?) {
      this.initialize(options)
    }
  }
  interface DemoDefault extends AdvancePropertyManager {
    as: string;
    a: number;
    b: number;
  }

  @PropertyManager(name)
  class ChildDemo extends DemoDefault {
    @Property({default: '123'}) chi!: string;
  }
  interface ChildDemo extends DemoDefault {chi: string}

  @PropertyManager(name)
  class TemplateDemo extends DemoDefault {
    @Property({
      template: '${as}#${chi}-${uuid()}',
      imports: {uuid() { return '1eu3'; }},
    }) id!: string;
    @Property({
      template: '${as}!',
      writable: true,
    }) t1!: string;
    @Property({default: '123'}) chi!: string;
    @Property({type: arrayOf(DemoItem)}) items!: DemoItem[];

  }
  interface TemplateDemo extends DemoDefault {
    id: string
    t1: string
    chi: string
    items: DemoItem[]
  }

  describe(`AoP ${name} PropertyManager Decorator`, () => {
    it('should set default property manager correctly', async () => {
      const result = new DemoDefault({as: 'Hi world'});
      expect(result.a).toEqual(123);
      expect(result.b).toEqual(true);
      expect(result.toJSON()).toMatchObject({ as: 'Hi world' });
    });

    it('should get child default property manager', async () => {
      const result = new ChildDemo({as: 'Hi world'});
      expect(result.a).toEqual(123);
      expect(result.b).toEqual(true);
      expect(result.chi).toEqual('123');
      expect(result.toJSON()).toMatchObject({ as: 'Hi world' });
    });

    it('should get/set template property', async () => {
      const result = new TemplateDemo({as: 'Hi world'});
      expect(result.id).toEqual('Hi world#123-1eu3');
      expect(result.t1).toEqual('Hi world!');
      result.t1 = 'myT1';
      expect(result.t1).toEqual('myT1');
      expect(() => result.id = 'ssss').toThrowError('Cannot set property id');
      expect(result.a).toEqual(123);
      expect(result.b).toEqual(true);
      expect(result.chi).toEqual('123');
      expect(result.toJSON()).toMatchObject({ as: 'Hi world' });
      result.as = 'try'
      result.chi = '432'
      expect(result.id).toEqual('try#432-1eu3');
      expect(result.toJSON()).toMatchObject({ as: 'try', chi: '432' });
    });

    it('should get array property', async () => {
      const result = new TemplateDemo({as: 'Hi world', items: [{value: '1'}, {value: '2', kind: 'H'}]});
      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toHaveProperty('value', '1');
      expect(result.items[0]).toHaveProperty('kind', 'home');
      expect(result.items[1]).toHaveProperty('value', '2');
      expect(result.items[1]).toHaveProperty('kind', 'H');
      expect(result.toJSON()).toMatchObject({ as: 'Hi world', items: [{value: '1'}, {value: '2', kind: 'H'}] });
    });
  })


}
