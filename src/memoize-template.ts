import { template } from 'lodash';
import memoize from 'memoizee';

export const memoizeOptions = {
  max: 512, // limit cache size
  // maxAge: 1500,
  normalizer: (args: any) => {
    let result = '';
    if (args.length) {
      result += args[0];
      if (args.length === 2) {
        const opts = args[1];
        result += ['escape', 'evaluate', 'interpolate', 'sourceURL', 'variable'].map(key => opts[key] ? key+'='+opts[key]: '').filter(Boolean).join(',');
        if (opts.imports) result += 'import=' + Object.keys(opts.imports).sort().join(' ');
      }
    }
    return result;
  },
}
export const memoizeTemplate = memoize(template, memoizeOptions);
