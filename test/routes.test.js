var should = require('should'),
  request = require('supertest'),
  config = require('config')
  koop = require('koop')(config),
  express = require('express')

var cloudantHost = 'https://normanb.cloudant.com';
var resource = 'colorado_skiing/_design/SpatialView/_geo/ski_areas';
var app = express();

before(function(done){
  var cloudant = require('../index.js');
  // register koop providers
  koop.register(cloudant)
  app.set('port', process.env.PORT || config.server.port || 1337)
  done();
});


describe('Koop Routes', function(){

    before(function(done){
      request(koop)
          .post('/cloudant')
          .set('Content-Type', 'application/json')
          .send({
            'host': cloudantHost,
            'id': 'tester'
          })
          .end(function(err, res){
            res.should.have.status(200);
            done();
      });
    });

    after(function(done){
      request(koop)
          .del('/cloudant/tester')
          .end(function(err, res){
            res.should.have.status(200);
            done();
      });
    });


    describe('/cloudant routes', function() {
      it('register should return 500 when POSTing w/o a host', function(done) {
        request(koop)
          .post('/cloudant')
          .end(function(err, res){
            res.should.have.status(500);
            done();
        });
      });

      it('should return 200 when GETing all registered providers', function(done) {
          request(koop)
            .get('/cloudant')
            .end(function(err, res){
              res.should.have.status( 200 );
              done();
          });
      });

      it('should return 200 when GETing a registered provider', function(done) {
          request(koop)
            .get('/cloudant/tester')
            .end(function(err, res){
              res.should.have.status( 200 );
              done();
          });
      });

    //   it('should return 404 when GETing an unknown provider/host', function(done) {
    //       request(koop)
    //         .get('/cloudant/bogus')
    //         .end(function(err, res){
    //           res.should.have.status( 404 );
    //           done();
    //       });
    //   });

      it('should return 200 when accessing item data', function(done) {
          request(koop)
            .get('/cloudant/tester/' + resource )
            .end(function(err, res){
              res.should.have.status( 200 );
              should.not.exist(err);
              done();
          });
      });

    //   it('should return 200 when accessing item as a featureservice', function(done) {
    //       request(koop)
    //         .get('/cloudant/tester/' + resource + '/FeatureServer')
    //         .end(function(err, res){
    //           res.should.have.status( 200 );
    //           should.not.exist(err);
    //           done();
    //       });
    //   });

    //   it('should return 200 when accessing item as a featureservice layer', function(done) {
    //       request(koop)
    //         .get('/cloudant/tester/' + resource + '/FeatureServer/0')
    //         .end(function(err, res){
    //           res.should.have.status( 200 );
    //           should.not.exist(err);
    //           done();
    //       });
    //   });

      it('should return 200 when accessing item as a featureservice query', function(done) {
          request(koop)
            .get('/cloudant/tester/' + resource + '/FeatureServer/0/query')
            .end(function(err, res){
              console.log(res);
              res.should.have.status( 200 );
              should.not.exist(err);
              done();
          });
      });

    });

});
