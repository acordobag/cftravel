var Sequelize = require('sequelize');
var connection = new Sequelize("guaymi", "root", "root", {
  host: 'localhost',
  dialect: 'mysql',
  define: { timestamps: false },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
module.exports = {
  'secret': 'jajaweonquepono',
  'database': connection
}
//Produccion
  //'database' : '''
//Desarrollo
  //'database' : ''
