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

const axios = require("axios").default;
const controller = new AbortController();

/**
 * Helper function which standardizes requests to the EV Finder API.
 * @param {String} apiEndpoint Which EV Finder API endpoint to request. Either "inventory"
 * or "vin"
 * @param {String} manufacturer The name of the manufacturer for which the inventory request
 * is being made.
 * @param {Array} requiredParams An array of query parameter values which are
 * required for any inventory or vin API request. For inventory requests the required
 * params are [zip, year, model, radius]. For VIN requests the only required param is [vin].
 * @param {Number} timeout The timeout value for the HTTP request in milliseconds. If this
 * value has elapsed without a response from the EV Finder API, the request is aborted and
 * an error is returned to the caller.
 * @param {Object} additionalParams Optional. If there are additional query
 * parameters the Vue app needs to pass into the EV Finder API, include them here.
 * @return {Object} Either the inventory response from the EV Finder API or a descriptive
 * error message as a JSON Object.
 */
export async function apiRequest(
  apiEndpoint,
  manufacturer,
  requiredParams = [],
  timeout,
  additionalParams = {}
) {
  // Ensure that the apiEndpoint argument is valid
  const validApiEndpoints = ["inventory", "vin"];
  if (!validApiEndpoints.includes(apiEndpoint)) return {};

  const requestUri = `/api/${apiEndpoint}/${manufacturer.toLowerCase()}`;

  const axiosConfig = {
    method: "get",
    baseURL: "http://localhost",
    withCredentials: false,
    responseType: "json",
    timeout: timeout,
  };

  /**
   * The EV Finder API expects query params, so writing the function arguments into an
   * Object which is used for the Axios request. For those manufacturers which require
   * additional information from the Vue app (e.g. Audi and it's geo parameter), combining
   * the requiredParams and additionalParams Objects.
   */
  const buildRequestParams = () => {
    return apiEndpoint === "inventory"
      ? {
          zip: requiredParams[0],
          year: requiredParams[1],
          model: requiredParams[2],
          radius: requiredParams[3],
          ...additionalParams,
        }
      : {
          vin: requiredParams[0],
          ...additionalParams,
        };
  };

  try {
    const response = await axios
      .create(axiosConfig)
      .get(requestUri, { params: buildRequestParams() });
    console.log(`Response here: ${JSON.stringify(response.data)}`);
    // Return a successful response
    return response.data;
  } catch (error) {
    if (error.response) {
      // Request made and server responded
      console.log(`This Response error firing: ${error?.message}`);
      throw error?.response?.data;
    } else if (error.request) {
      // The request was made but no response was received
      console.log(`This Request error firing: ${error?.message}`);
      throw error?.message;
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log("Aborting");
      controller.abort();
      throw error;
    }
  }
}