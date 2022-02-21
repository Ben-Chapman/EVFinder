function parseQueryParams(inputParams) {
  if (Object.keys(inputParams).length > 0) {
    const paramMapping = {
      'z': 'zipcode',
      'y': 'year',
      'm': 'model',
      'r': 'radius',
    }

    const queryParams = inputParams  // z, y, m, r

    // Write query params to local data store
    Object.keys(queryParams).forEach(k => {
      const key = k
      const longName = paramMapping[k]
      const value = queryParams[k]

      // console.log(`blah  ${k}: ${queryParams[k]}`)
      if (Object.keys(paramMapping).includes(key)) {
        console.log('writing qps')
        this.localForm[longName] = value
      }
    })
    return true  // Successfully parsed query params
  }
  else {
    return false
  }
}

export default {parseQueryParams}