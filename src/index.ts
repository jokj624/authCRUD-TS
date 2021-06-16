import express, { Express } from "express"; 
import routes from './api/route';
import generalErrorHandler from "./errors/generalErrorHandler";
const app : Express = express(); 
import connectDB from "./Loaders/db";

// Connect Database
connectDB();

app.use(express.urlencoded());
app.use(express.json()); 

app.use(routes);
app.use(generalErrorHandler);
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "production" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app 
  .listen(5000, () => {
    console.log(`
    ################################################
    🛡️  Server listening on port: 5000 🛡️
    ################################################
  `);
  })
  .on("error", (err) => {
    console.error(err);
    process.exit(1);
  });