/**
  * property-manager-decorator v0.1.0
  * (c) 2020-present Riceball LEE
  * @license MIT
  */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('lodash'), require('memoizee'), require('property-manager/lib/ability')) :
    typeof define === 'function' && define.amd ? define(['exports', 'lodash', 'memoizee', 'property-manager/lib/ability'], factory) :
    (global = global || self, factory(global.PropertyManagerDecorator = {}, global.lodash, global.memoize, global.propertyManager));
}(this, (function (exports, lodash, memoize, propertyManager) { 'use strict';

    memoize = memoize && memoize.hasOwnProperty('default') ? memoize['default'] : memoize;
    propertyManager = propertyManager && propertyManager.hasOwnProperty('default') ? propertyManager['default'] : propertyManager;

    var memoizeOptions = {
      max: 512,
      // maxAge: 1500,
      normalizer: function normalizer(args) {
        var result = '';

        if (args.length) {
          result += args[0];

          if (args.length === 2) {
            var opts = args[1];
            result += ['escape', 'evaluate', 'interpolate', 'sourceURL', 'variable'].map(function (key) {
              return opts[key] ? key + '=' + opts[key] : '';
            }).filter(Boolean).join(',');
            if (opts.imports) result += 'import=' + Object.keys(opts.imports).sort().join(' ');
          }
        }

        return result;
      }
    };
    var memoizeTemplate = memoize(lodash.template, memoizeOptions);

    function _typeof(obj) {
      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function (obj) {
          return typeof obj;
        };
      } else {
        _typeof = function (obj) {
          return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
      }

      return _typeof(obj);
    }

    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);

      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
        keys.push.apply(keys, symbols);
      }

      return keys;
    }

    function _objectSpread2(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i] != null ? arguments[i] : {};

        if (i % 2) {
          ownKeys(Object(source), true).forEach(function (key) {
            _defineProperty(target, key, source[key]);
          });
        } else if (Object.getOwnPropertyDescriptors) {
          Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
        } else {
          ownKeys(Object(source)).forEach(function (key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
          });
        }
      }

      return target;
    }

    /**
     * generateTemplateValue.call(aObj, aTemplate, aOptions)
     * @param aTemplate the template string
     * @param aOptions  the template option
     */

    function generateTemplateValue(aTemplate, aOptions) {
      var result;
      if (typeof aTemplate === 'string') aTemplate = memoizeTemplate(aTemplate, aOptions);

      try {
        result = aTemplate(this);
      } catch (error) {
        if (!(error instanceof ReferenceError)) throw error;
      }

      return result;
    } // generate Template Field to the metatype.

    function generateTemplateProperty(aFieldName, aOptions, aMetaType) {
      var vTemplate = aOptions.template;
      var vImports = aOptions.imports; // delete aOptions.imports;
      // delete aOptions.template;

      if (typeof vTemplate === 'string') {
        var vTemplateOpts = vImports ? {
          imports: vImports
        } : undefined;
        vTemplate = lodash.template(vTemplate, vTemplateOpts);
      }

      if (typeof vTemplate !== 'function') return;
      if (aOptions.required !== false) aOptions.required = true;

      var vOpts = _objectSpread2({}, aOptions, {
        type: 'String',
        get: function get() {
          var result = this['$' + aFieldName];

          if (result === undefined) {
            try {
              result = vTemplate(this);
            } catch (err) {
              if (!(err instanceof ReferenceError)) throw err;
            }
          }

          return result;
        }
      });

      if (aOptions.writable === true) {
        aMetaType["$".concat(aFieldName)] = {
          type: 'String',
          enumerable: false
        };

        vOpts.set = function (value) {
          if (value != null) this["$".concat(aFieldName)] = value;
        };
      }

      aMetaType[aFieldName] = vOpts;
      return aMetaType;
    }

    var innerPropsName = '__PMProperties__';
    /**
     * decorator of a property
     * @param options the options for the property
     * @return PropertyDecorator | void
     */

    function Property(options) {
      return function (target, key, descriptor) {
        var ctor = target.constructor;

        if (ctor) {
          if (!ctor[innerPropsName]) ctor[innerPropsName] = {};
          var vProps = ctor[innerPropsName];

          if (_typeof(options) === 'object' && options["default"]) {
            options.value = options["default"];
          }

          vProps[key] = options;
        }
      };
    }
    /**
     * decorator of a class
     * Note: NO SUPPORTS for Simple Property-manager yet.
     * @param options the ctor or property-manager options.
     */

    function PropertyManager(options) {
      if (typeof options === 'function') {
        return PropertyManagerFactory(options);
      } else {
        return function (ctor) {
          return PropertyManagerFactory(ctor, options);
        };
      }
    }

    function PropertyManagerFactory(ctor, options) {
      var vProps = ctor[innerPropsName];

      if (vProps) {
        if (!ctor.defineProperties) propertyManager(ctor, options);
        var defineProperties = ctor.defineProperties;
        Object.keys(vProps).forEach(function (k) {
          var v = vProps[k];

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
    这样子，无法看到注入的方法,需要这个:

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

    exports.Property = Property;
    exports.PropertyManager = PropertyManager;
    exports.generateTemplateProperty = generateTemplateProperty;
    exports.generateTemplateValue = generateTemplateValue;
    exports.memoizeOptions = memoizeOptions;
    exports.memoizeTemplate = memoizeTemplate;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
