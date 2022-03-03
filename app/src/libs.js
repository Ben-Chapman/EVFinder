import {camelCase} from 'lodash';

var flattendObj = {}
const flattenObject = (obj, keyName) => {
  Object.keys(obj).forEach(key => {
    var newKey = camelCase(`${keyName}-${key}`)
    if (typeof obj[key] === "object") {
        if (obj[key] != null) {
        // Recurse
          flattenObject(obj[key], newKey);
        }
    } else {
      flattendObj[newKey] = obj[key];
    }
  })
}

flattenObject(d, '')
flattendObj