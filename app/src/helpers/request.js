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

export async function apiRequest(
  apiEndpoint,
  manufacturer,
  requiredParams = [],
  additionalParams = {},
  timeout
) {
  // Ensure that the apiEndpoint argument is valid
  const validApiEndpoints = ["inventory", "vin"];
  if (!validApiEndpoints.includes(apiEndpoint)) return {};

  var requestUri = `/api/${apiEndpoint}/${manufacturer.toLowerCase()}`;

  /**
   * The EV Finder API expects query params, so writing the function arguments into an
   * Object which is used for the Axios request. For those manufacturers which require
   * additional information from the Vue app (e.g. Audi and it's geo parameter), combining
   * the requiredParams and additionalParams Objects.
   */
  var params = {
    zip: requiredParams[0],
    year: requiredParams[1],
    model: requiredParams[2],
    radius: requiredParams[3],
    ...additionalParams,
  };

  const axiosConfig = {
    method: "get",
    baseURL: "http://localhost",
    withCredentials: false,
    responseType: "json",
    timeout: timeout,
  };

  try {
    const response = await axios
      .create(axiosConfig)
      .get(requestUri, { params: params });
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
      console.log(`This REquest error firing: ${error?.message}`);
      throw error?.message;
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log("Aborting");
      controller.abort();
      throw error;
    }
  }
}
