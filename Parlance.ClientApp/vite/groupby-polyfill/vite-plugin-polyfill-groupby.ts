// vite-plugin-polyfill-groupby.ts

import {Plugin} from 'vite';

export default function PolyfillGroupByPlugin(): Plugin {
    return {
        name: 'polyfill-groupby',
        transform(code, id) {
            if (!/node_modules/.test(id) && id.endsWith(".ts")) {         // Ignore 'node_modules' files
                return {
                    code: `
            if (!Object.prototype.groupBy) {
              Object.defineProperty(Object.prototype, 'groupBy', {
                value: function(keyGetter) {
                  return this.reduce((result, item) => {
                    const key = keyGetter(item);
                    if (!result[key]) result[key] = [];
                    result[key].push(item);
                    return result;
                  }, {});
                },
                enumerable: false
              });
            }
            
            ${code}
          `,
                    map: null
                };
            }
        }
    };
}