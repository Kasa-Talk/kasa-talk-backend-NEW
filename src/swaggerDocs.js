const swaggerJsDoc = require('swagger-jsdoc');

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

const swaggerDocs = swaggerJsDoc(options);

module.exports = swaggerDocs;

/**
 * @swagger
 * /path-to-setUser:
 *   post:
 *     summary: Create a new user
 *     description: Endpoint to register a new user.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's name.
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email.
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 description: User's password.
 *                 example: password123
 *               confirmPassword:
 *                 type: string
 *                 description: Confirm password.
 *                 example: password123
 *     responses:
 *       201:
 *         description: User created successfully. Please check your email to activate the account.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: null
 *                   description: Null if no errors.
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: User created successfully.
 *                      Please check your email to activate the account.
 *                 data:
 *                   type: object
 *                   description: User information.
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: User ID.
 *                       example: 1
 *                     name:
 *                       type: string
 *                       description: User's name.
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: User's email.
 *                       example: john@example.com
 *                     expireTime:
 *                       type: string
 *                       description: Expiry time of the user account.
 *                       example: '2023-12-14 12:00:00'
 *       400:
 *         description: Bad Request. Invalid input or account already activated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   description: Array of error messages.
 *                   items:
 *                     type: string
 *                     example: Invalid email format.
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: Register Failed
 *                 data:
 *                   type: null
 *                   description: Null data.
 *       500:
 *         description: Internal Server Error. User creation failed or email sending failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   description: Array of error messages.
 *                   items:
 *                     type: string
 *                     example: User not created in the database.
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: Register Failed
 *                 data:
 *                   type: null
 *                   description: Null data.
 */
