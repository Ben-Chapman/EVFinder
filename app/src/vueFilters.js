import Vue from "vue";

import { titleCase } from "./helpers/libs";

Vue.filter("myFilter", (value) => {
  return value.toUpperCase();
});

Vue.filter("titleCase", (value) => {
  return titleCase(value);
});

Vue.filter("convertToCurrency", (value) => {
  var formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(value);
});
