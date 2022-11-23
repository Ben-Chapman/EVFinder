import { camelCase, startCase } from 'lodash';

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
  return { ...tmp, ...inputObject }
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
    // minimumFractionDigits must also be set when maximumFractionDigits is < 2
    // This is needed to support Safari <15 on iOS
    //https://stackoverflow.com/a/41045289
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return formatter.format(item)
}

export function titleCase(item) {
  return startCase(camelCase(item))
}

export function sortObjectByKey(item) {
  return Object.fromEntries(Object.entries(item).sort())
}

export function cl(whatToLog) {
  if (typeof (whatToLog) === 'object' && whatToLog != null) {
    console.log(JSON.stringify(whatToLog))
  } else {
    console.log(whatToLog)
  }
}

export function stripHTML(html) {
  // https://stackoverflow.com/a/47140708
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
}

export function generateUrlQueryParams(item, sliceLength) {
  /**
   * For a given item, generate query parameters. Accepts an object.
   * The input object (item) contains the full localqueryParams object, so
   * we have to loop through that object, and only generate query params for
   * Object keys which have a value (user selected a filter item).
   */
  var url = new URL(window.location.href)
  Object.keys(item)
    .forEach(key => {
      const queryParam = key.slice(0, sliceLength)
      const queryValue = item[key].join(',')

      // Only generate a query param, if the user has selected a filter item
      if (item[key].length > 0) {
        url.searchParams.set(queryParam, queryValue)
      }
      // When a user deselects a filter item, remove it from the list of query params
      else if (item[key].length == 0 && url.searchParams.has(queryParam)) {
        url.searchParams.delete(queryParam)
      }
    })
  // Push query param changes to the URL
  window.history.replaceState({}, '', url.search)
}
