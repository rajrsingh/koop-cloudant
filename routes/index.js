module.exports = {
  'post /cloudant': 'register',
  'get /cloudant': 'list',
  'get /cloudant/:id': 'find',
  'get /cloudant/:id/:item/_design/:view/_geo/:index': 'findResource',
  'get /cloudant/:id/:item/_design/:view/_geo/:index/FeatureServer/:layer/:method': 'featureserver',
  'get /cloudant/:id/:item/_design/:view/_geo/:index/FeatureServer/:layer': 'featureserver',
  'get /cloudant/:id/:item/_design/:view/_geo/:index/FeatureServer': 'featureserver',
  'post /cloudant/:id/:item/_design/:view/_geo/:index/FeatureServer/:layer/:method': 'featureserver',
  'post /cloudant/:id/:item/_design/:view/_geo/:index/FeatureServer/:layer': 'featureserver',
  'post /cloudant/:id/:item/_design/:view/_geo/:index/FeatureServer': 'featureserver',
  'get /cloudant/:id/:item/_design/:view/_geo/:index/thumbnail': 'thumbnail',
  'delete /cloudant/:id': 'del',
  'get /cloudant/:id/:item/_design/:view/_geo/:index/preview': 'preview'
}
