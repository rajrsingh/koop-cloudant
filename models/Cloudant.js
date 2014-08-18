var request = require('request'),
  BaseModel = require('koop-server/lib/BaseModel.js'),
  terraformerWKT = require('terraformer-wkt-parser'),
  terraformerParser = require('terraformer-arcgis-parser');

var Cloudant = function( koop ){

  var cloudant = {};
  cloudant.__proto__ = BaseModel( koop );

  // adds a service to the Cache.db
  // needs a host, generates an id
  cloudant.register = function( id, host, callback ){
    var type = 'cloudant:services';
    koop.Cache.db.serviceCount( type, function(error, count){
      id = id || count++;
      koop.Cache.db.serviceRegister( type, {'id': id, 'host': host},  function( err, success ){
        callback( err, id );
      });
    });
  };

  cloudant.remove = function( id, callback ){
    koop.Cache.db.serviceRemove( 'cloudant:services', parseInt(id) || id,  callback);
  };

  // get service by id, no id == return all
  cloudant.find = function( id, callback ){
    koop.Cache.db.serviceGet( 'cloudant:services', parseInt(id) || id, callback);
  };

  // got the service and get the item
  cloudant.getResource = function( host, id, options, callback ){
    var self = this,
      type = 'Cloudant',
      key = [host,id].join('::');

    koop.Cache.get( type, key, options, function(err, entry ){
      if ( err ){
        // idField*
        // objectIds
        // returnCountOnly (true or false)
        // returnIdsOnly (true or false)
        // geometry (xmin,ymin,xmax,ymax)

        var url = host + '/' + id + '/_design/' + options.view + '/_geo/' + options.index + '?include_docs=true';

        if (options.geometry){
          // convert from esri json to geojson to wkt
          var g = terraformerParser.parse(options.geometry);
          var wkt = terraformerWKT.convert(g.geometry);
          url += '&g=' + wkt;
        } else {
          url += '&bbox=-180,-90,180,90'
        }

        if (options.resultOffset){
          url += 'startIndex=' + options.resultOffset;
        }

        request.get(url, function(err, data, response ){
          if (err) {
            callback(err, null);
          } else {
            var geojson = JSON.parse(data.body);
            koop.Cache.insert( type, key, geojson, 0, function( err, success){
              if ( success ) callback( null, [geojson] );
            });
          }
        });
      } else {
        callback( null, entry );
      }
    });
  };

  return cloudant;

}


module.exports = Cloudant;
