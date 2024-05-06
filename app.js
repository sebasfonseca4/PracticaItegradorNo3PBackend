import express from "express"
import { engine } from 'express-handlebars';
import session from "express-session";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";

import sessionsRouter from "./routes/sessions.js";
import viewsRouter from "./routes/views.js";
import prodsRouter from './routes/products.js';

import passport from 'passport';
import initializePassport from './config/passport.config.js';

import logger from "./utils/logger.js";


const app = express()

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.urlencoded({extended:true}))

app.use(cookieParser());

initializePassport();

app.use(session({
    store:MongoStore.create({
        mongoUrl:"mongodb+srv://sebasfads:ZXCasdqwe123@ecommerce.rvp0qsu.mongodb.net/ecommerce",
        ttl:15,
    }),
    secret:"secretCode",
    resave:true,
    saveUninitialized:true
}))

app.use("/api/sessions", sessionsRouter);
app.use("/", viewsRouter);
app.use("/store", prodsRouter);

app.use(passport.initialize());

app.get('/loggerTest', (req, res) => {
    logger.debug('Este es un mensaje de debug');
    logger.http('Este es un mensaje de HTTP');
    logger.info('Este es un mensaje de información');
    logger.warning('Este es un mensaje de advertencia');
    logger.error('Este es un mensaje de error');
    logger.fatal('Este es un mensaje de fatalidad');
  
    res.send('Logs generados. Verifica el archivo "errors.log" para los errores.');
});

// Conexión MongoDB
mongoose.connect("mongodb+srv://sebasfads:ZXCasdqwe123@ecommerce.rvp0qsu.mongodb.net/ecommerce");

app.listen(3000, () => {
    console.log("Servidor listo http://127.0.0.1:3000");
})

