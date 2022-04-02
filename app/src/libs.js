import {camelCase, startCase} from 'lodash';

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
  return flattendObj
}

function normalizeObjectKeys(inputObject, keyMap) {
  let tmp = {}
  Object.entries(keyMap).forEach(([key, value]) => {
    if (Object.keys(inputObject).includes(value)) {
      tmp[key] = inputObject[value]
    }
  })
  return {...tmp, ...inputObject}
}

export default function normalizeJson(inputJson, keyMap) {
  var result = []
  inputJson.forEach(i => {
    result.push(
      normalizeObjectKeys(
        flattenObject(i, ''),
        keyMap
      ))
  })
  return result
}

export function convertToCurrency(item) {
  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    })
  return formatter.format(item)
}

export function titleCase(item) {
  return startCase(camelCase(item))
}