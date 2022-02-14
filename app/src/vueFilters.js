import Vue from 'vue'

import {startCase, camelCase} from 'lodash';

Vue.filter('myFilter', value => {
  return value.toUpperCase();
});

Vue.filter('titleCase', value => {
  return startCase(camelCase(value))
});