module.exports = async function(app, postgres, dbjson, utils){


require('../app/controller/routesController')(app, postgres, dbjson, utils);



}