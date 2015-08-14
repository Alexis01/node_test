/* global mongoose */
var express = require("express"),
    app = express(),
    swig = require('swig'),
    bodyParser  = require("body-parser"),
    mongoose = require('mongoose');


/* Registro de SWIG para extender el HTML. */
app.engine('html', swig.renderFile);

/* Extensión por defecto del motor: HTML. */
app.set('view engine', 'html');

/* Configuración del directorio desde donde se extraerán las vistas. */
app.set('views', __dirname + '/views');

/* Desactivamos la caché de Express, SWIG ya lo hace. */
app.set('view cache', false);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//Conexión a la bbdd
mongoose.connect('mongodb://192.168.45.130/ehours', function(err, res) {
    if(err) throw err;
    console.log('Connected to Database');
});
//Incluimos los modelos a usar en la app
require('./models/team_users')(app, mongoose);
require('./models/team_checks')(app, mongoose);

//ruta para los servicios con usuarios
var UserServiceCtrl= require('./controllers/controllerUser');

//enrutadores para el userService
var router = express.Router();

//ENRUTAMOS LOS SERVICIOS DEL USUARIO
router.post('/enter', UserServiceCtrl.enter);
router.post('/out', UserServiceCtrl.out);

//y lanzamos la ejecución
app.get('/', function(req, res) {
  res.render('login');
});
app.use('/team', router);
app.use(express.static(__dirname + '/assets'));

app.listen(3000, function() {
  console.log("Node server running on http://localhost:3000");
});