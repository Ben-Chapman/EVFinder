/* eslint-disable */

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
import { version } from "../../package.json";

/**
 * @param {String} logData
 * @param {String} severity
 */
export async function logMessage(logData, severity = "error") {
  if (process.env.NODE_ENV == "development") {
    console.error(logData);
  } else {
    const axiosConfig = {
      baseURL: "https://api.theevfinder.com/api/logger",
      method: "post",

      // Allows changes to the request data before it is sent to the server
      transformRequest: [
        function (data) {
          data = { errorMessage: data };
          // Include some non-PII data to assist in troubleshooting
          const additionalData = {
            userAgent: window.navigator.userAgent,
            appVersion: version,
          };
          return JSON.stringify({ ...data, ...additionalData });
        },
      ],

      // Custom headers to be sent with the request
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
      },

      timeout: 3000,

      // Make cross-site Access-Control requests using credentials?
      withCredentials: false,

      // `validateStatus` defines whether to resolve or reject the promise for a given
      // HTTP response status code. If `validateStatus` returns `true` (or is set to `null`
      // or `undefined`), the promise will be resolved; otherwise, the promise will be
      // rejected.
      validateStatus: function (status) {
        return status >= 200 && status < 300; // default
      },
    };

    let apiEndpoint = severity.toLowerCase() === "error" ? "/error" : "/info";

    try {
      axios.create(axiosConfig).post(apiEndpoint, logData);
    } catch (error) {
      if (process.env.NODE_ENV == "development") {
        console.error(`Logger.js Error: ${error}`);
      }
    }
  }
}
