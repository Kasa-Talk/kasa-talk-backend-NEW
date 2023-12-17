const express = require('express');
const swaggerUI = require('swagger-ui-express');
const bodyParser = require('body-parser');
const appMiddleware = require('./middleware');
const swaggerDocs = require('./swaggerDocs');

const app = express();
const PORT = process.env.PORT || 8080;

// middleware untuk menghandle body json
app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded({ extended: true }));

// Serve Swagger UI documentation
const swaggerOptions = {
  explorer: true,
};
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs, swaggerOptions));

app.use(appMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
