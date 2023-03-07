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

// const axios = require("axios/dist/browser/axios.cjs");
const axios = require("axios").default;
const controller = new AbortController();

function apiHelper(uri, timeout) {
  axiosConfig = {
    method: "get",
    baseURL: "https://api.theevfinder.com",
    withCredentials: false,
    responseType: "json",
    timeout: timeout,
  };

  const http = axios.create(axiosConfig);

  http
    .get((url = uri), { signal: controller.signal })

    .then((response) => {
      console.log(response.statusText);
    })

    .catch((error) => {
      if (error.response) {
        // The server responded with a status code > 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.log(error.message);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
        controller.abort();
      }
    });
}
