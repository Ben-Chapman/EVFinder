/**
 * Copyright 2023 Ben Chapman
 *
 * This file is part of The EV Finder.
 *
 * The EV Finder is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software Foundation,
 * either version 3 of the License, or (at your option) any later version.
 *
 * The EV Finder is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with The EV Finder.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import { camelCase, includes } from "lodash";
import { logMessage } from "./logger";

/**
 * Helper function which flattens a nested Object to an Object containing only key: value pairs
 * @param {Object} obj An input Object containing nested key: value pairs.
 * @param {String} keyPrefix A prefix which will be appended to the key name.
 * @returns {String} A flat Object containing only key: value pairs. The key name will
 * be a concatenation of the strings contained in the original nested object keys.
 * For example, an input Object of
 * {
 *   key1:
 *     {
 *       childKey1: "value",
 *       childKey2: "value"
 *     }
 * }
 * will result in a flattened Object of:
 * {
 *   prefixNameKey1ChildKey1: 'value',
 *   prefixNameKey1ChildKey2: 'value'
 * }
 */
let flattendObj = {};
export function flattenObject(obj, keyPrefix) {
  Object.keys(obj).forEach((key) => {
    var newKey = camelCase(`${keyPrefix}-${key}`);
    if (typeof obj[key] === "object") {
      if (obj[key] != null) {
        // Recurse
        flattenObject(obj[key], newKey);
      }
    } else {
      flattendObj[newKey] = obj[key];
    }
  });
  return flattendObj;
}

function normalizeObjectKeys(inputObject, keyMap) {
  let tmp = {};
  Object.entries(keyMap).forEach(([key, value]) => {
    if (Object.keys(inputObject).includes(value)) {
      tmp[key] = inputObject[value];
    }
  });
  return { ...tmp, ...inputObject };
}

export function normalizeJson(inputJson, keyMap) {
  var result = [];
  inputJson.forEach((i) => {
    result.push(normalizeObjectKeys(flattenObject(i, ""), keyMap));
  });
  return result;
}
/**
 * Helper function which converts a Number to a USD-formatted string.
 * @param {Number} item An input Number which is to be converted to a USD currency string.
 * The output value will be rounded to the nearest whole dollar amount.
 * @returns {String} A USD-formatted string of the input Number. 123 -> $1.23, 24.99 -> $25
 */
export function convertToCurrency(item) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    // minimumFractionDigits must also be set when maximumFractionDigits is < 2
    // This is needed to support Safari <15 on iOS
    //https://stackoverflow.com/a/41045289
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(item);
}

/**
 *
 * @param {String} priceString An string containing a USD currency like $50,000.
 * @returns {Number} A Number equivalent in value to the input string.
 */
export function priceStringToNumber(priceString) {
  return Number(parseFloat(priceString.replace("$", "").replaceAll(",", "")));
}

/**
 * Helper function which converts a string to Title Case
 * @param {String} str An input string which is to be Title Cased
 * @returns {String} A Title Cased string
 */
export function titleCase(str) {
  function capitalize(str) {
    if (str.length == 0) return str;
    return str[0].toUpperCase() + str.slice(1);
  }
  // If the input string is undefined, return an empty string, if the input string is
  // ALL CAPS, lowercase it first so capitalize() can actually Title Case the string
  const returnStr = !str
    ? []
    : str === str.toUpperCase()
    ? str.toLowerCase().split(" ")
    : str.split(" ");

  return returnStr.map(capitalize).join(" ");
}

/**
 * Helper function to sort an Object by it's keys
 * @param {Object} item An Object which is to be sorted
 * @returns {Object} An Object whose keys are in alphabetical order
 */
export function sortObjectByKey(item) {
  return Object.fromEntries(Object.entries(item).sort());
}
/**
 * A helper function to log to console.log
 * @param {*} whatToLog Any Javascript type which is to be logged to console.log.
 */
export function cl(whatToLog) {
  if (typeof whatToLog === "object" && whatToLog != null) {
    console.log(JSON.stringify(whatToLog));
  } else {
    console.log(whatToLog);
  }
}
/**
 * A helper function which strips HTML to return plain text
 * @param {String} html A string containing HTML of which the markup will be stripped
 * @returns A plain-text string, stripped of HTML
 */
export function stripHTML(html) {
  // https://stackoverflow.com/a/47140708
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

export function generateUrlQueryParams(item, sliceLength) {
  /**
   * For a given item, generate query parameters. Accepts an object.
   * The input object (item) contains the full localqueryParams object, so
   * we have to loop through that object, and only generate query params for
   * Object keys which have a value (user selected a filter item).
   */
  var url = new URL(window.location.href);
  Object.keys(item).forEach((key) => {
    const queryParam = key.slice(0, sliceLength);
    const queryValue = item[key].join(",");

    // Only generate a query param, if the user has selected a filter item
    if (item[key].length > 0) {
      url.searchParams.set(queryParam, queryValue);
    }
    // When a user deselects a filter item, remove it from the list of query params
    else if (item[key].length == 0 && url.searchParams.has(queryParam)) {
      url.searchParams.delete(queryParam);
    }
  });
  // Push query param changes to the URL
  window.history.replaceState({}, "", url.search);
}
/**
 *
 * @param {String} errorText A error message String which is to be shown as an Error in
 * the EV Finder UI.
 * @returns {Array} An error message which is consumed by the EV Finder Vue app
 */
export function generateErrorMessage(errorText) {
  return ["ERROR", errorText];
}

/**
 *
 * @param {String} input A string containing valid HTML query parameter(s). An example
 * would be: "name=value&name1=value1"
 * @returns {Object} The query parameter as an Object
 */
export function queryParamStringToObject(input) {
  // Validate input looks like a query param
  if (!input.includes("=")) {
    throw new Error("Input is not a valid query parameter");
  }

  // If input has the leading ?, strip it
  if (input.includes("?")) {
    input = input.split("?")[1];
  }

  const res = {};
  // Split the string into individual query parameters
  input.split("&").forEach((element) => {
    // Split each query param into it's name / value pair
    const kv = element.split("=");
    const name = kv[0];
    const value = kv[1];
    res[name] = value;
  });
  return res;
}

/**
<<<<<<< HEAD
 *
 * @param {Object} inputObject An Object to search through
 * @param {String} valueToSearchFor The value you wish to search for
 * @returns Boolean True if valueToSearchFor was found in inputObject. False if
 * valueToSearchFor was not found in inputObject
 */
export function doesObjectContainValue(inputObject, valueToSearchFor) {
  return inputObject.filter((obj) =>
    Object.keys(obj).some((key) => obj[key].includes(valueToSearchFor))
  );
}

export function validateUrlPath(urlPath) {
  // Split the URL
  // /inventory/2024/kia/ev6?zipcode=07040&radius=20
  urlPath = urlPath.split("/");
  const urlComponents = {
    requestType: urlPath[0],
    requestYear: urlPath[1],
    requestManufacturer: urlPath[2],
    requestModel: urlPath[3],
  };

  if (urlComponents.requestType === "/inventory|vin/") {
    if (yearOptions.includes(urlComponents.requestYear)) {
      if (
        modelOptions.includes(urlComponents.requestManufacturer) &&
        modelOptions.includes(urlComponents.requestModel)
      ) {
        return true;
      }
    }
  } else {
    return false;
  }
}
=======
 * Obtain latitude and longitude information for a given zip code.
 * @param {String} zip A US zip code which is used to determine it's geographic location
 * @returns {Object} An Object containing the latitude and longitude of the provided zip code
 */
export async function getGeoFromZipcode(zip) {
  const osmApi = "https://nominatim.openstreetmap.org/search?";

  const geo = await fetch(
    osmApi + new URLSearchParams({ postalcode: zip, country: "US", format: "json" }),
    { method: "GET", mode: "cors" }
  );

  if (geo.ok) {
    const mapData = await geo.json();
    return {
      zipcode: zip,
      lat: mapData[0].lat,
      lon: mapData[0].lon,
    };
  } else {
    logMessage(`Geo Lookup Failure for ${zip} (${geo.status}): ${geo.text}`);
  }
}

/**
 * Search an Array of Objects for a given key, returning the object if found
 * @param {Array} arr An Array containing N number of Objects within.
 * @param {String} searchKey The Object.key() you wish to find.
 * @returns {Object} If found, the Object containing the searchKey
 */
export function searchArrayOfObjects(arrayToSearch, searchKey) {
  return arrayToSearch.filter((obj) =>
    Object.keys(obj).some((key) => obj[key].includes(searchKey))
  );
}
>>>>>>> main
