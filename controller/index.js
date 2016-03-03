var fs = require('fs');

var Controller = function (Cloudant, BaseController) {
  var controller = BaseController()

  controller.register = function(req, res){
    if ( !req.body.host ){
      res.send('Must provide a host to register:', 500);
    } else {
      Cloudant.register( req.body.id, req.body.host, function(err, id){
        if (err) {
          res.send( err, 500);
        } else {
          res.json({ 'serviceId': id });
        }
    });
    }
  };

  controller.list = function(req, res){
    Cloudant.find(null, function(err, data){
      if (err) {
        res.send( err, 500);
      } else {
        res.json( data );
      }
    });
  };

  controller.find = function(req, res){
    Cloudant.find(req.params.id, function(err, data){
      if (err) {
        res.send( err, 404);
      } else {
        res.json( data );
      }
    });
  };

  controller.findResourcePost = function( req, res ){
    controller.findResource( req, res );
  };

  controller.findResource = function(req, res){
    Cloudant.find(req.params.id, function(err, data){
      if (err) {
        res.send( err, 500);
      } else {
        // Get the item
        var options = {
          view : req.params.view,
          index : req.params.index
        };

        for (var key in req.query) {
          if (req.query.hasOwnProperty(key)) {
            options[key] = req.query[key];
          }
        }
        Cloudant.getResource( data.host, req.params.item, options, function(error, json){
          if (error) {
            res.send( error, 500);
          } else if ( req.params.format ) {

            var key = ['cloudant', req.params.id ].join(':');
            var path = ['files', key].join('/');
            var fileName = key + '.' + req.params.format;

            Cloudant.files.exists(path, fileName, function( exists, path ){
              if ( exists ){
                if (path.substr(0, 4) == 'http'){
                  res.redirect( path );
                } else {
                  res.sendfile( path );
                }
              } else {
                console.log(data)
                Cloudant.exportToFormat( req.params.format, key, key, json[0], {}, function(err, file){
                  if (err){
                    res.send(err, 500);
                  } else {
                    res.sendfile( file );
                  }
                });
              }
            });

          } else {
            res.json( json[0] );
          }
        });
      }
    });
  };

  controller.del = function(req, res){
    if ( !req.params.id ){
      res.send( 'Must specify a service id', 500 );
    } else {
      Cloudant.remove(req.params.id, function(err, data){
        if (err) {
          res.send( err, 500);
        } else {
          res.json( data );
        }
      });
    }
  };

  controller.featureserver = function( req, res ){
    var callback = req.query.callback;
    delete req.query.callback;

    for (var k in req.body){
      req.query[k] = req.body[k];
    }

    Cloudant.find(req.params.id, function(err, data){
      if (err) {
        res.send( err, 500);
      } else {
        // Get the item
        var options = {
          view : req.params.view,
          index : req.params.index
        };

        for (var key in req.query) {
          if (req.query.hasOwnProperty(key)) {
            options[key] = req.query[key];
          }
        }

        Cloudant.getResource( data.host, req.params.item, options, function(error, geojson){
          if (error) {
            res.send( error, 500);
          } else {
            // pass to the shared logic for FeatureService routing
            delete req.query.geometry;
            controller.processFeatureServer( req, res, err, geojson, callback);
          }
        });
      }
    });

  };

  controller.thumbnail = function(req, res){

    // check the image first and return if exists
    var key = ['cloudant', req.params.id, req.params.item].join(':');
    var dir = '/thumbs/';
    req.query.width = parseInt( req.query.width ) || 150;
    req.query.height = parseInt( req.query.height ) || 150;
    req.query.f_base = dir + key + '/' + req.query.width + '::' + req.query.height;

    var fileName = Cloudant.thumbnailExists(key, req.query);
    if ( fileName ){
      res.sendfile( fileName );
    } else {

      Cloudant.find(req.params.id, function(err, data){
        if (err) {
          res.send( err, 500);
        } else {
          // Get the item
          Cloudant.getResource( data.host, req.params.item, req.query, function(error, itemJson){
            if (error) {
              res.send( error, 500);
            } else {
              var key = ['cloudant', req.params.id, req.params.item].join(':');

              // generate a thumbnail
              Cloudant.thumbnailGenerate( itemJson[0], key, req.query, function(err, file){
                if (err){
                  res.send(err, 500);
                } else {
                  // send back image
                  res.sendfile( file );
                }
              });

            }
          });
        }
      });
    }

  };


  controller.preview = function(req, res){
   res.view(__dirname + '/../views/demo', { locals:{ host: req.params.id, item: req.params.item } });
  };

  return controller;

};

module.exports = Controller;
