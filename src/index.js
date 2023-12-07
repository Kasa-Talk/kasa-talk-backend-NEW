const express = require('express');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const bodyParser = require('body-parser');
const appMiddleware = require('./middleware');

const app = express();
const PORT = process.env.PORT || 8080;

// middleware untuk menghandle body json
app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded({ extended: true }));

// Open API docs
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kasa-Talk API',
      version: '1.0.0',
    },
    servers: [
      {
        url: `${process.env.BASE_URL}`,
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const options2 = {
  explorer: true,
};

const specs = swaggerJsDoc(options);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs, options2));

app.use(appMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
