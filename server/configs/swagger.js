import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'QuickShow API Documentation',
            version: '1.0.0',
            description: 'API documentation for the QuickShow Movie Ticket Booking platform backend. Supports both Clerk & Custom JWT Auth.',
            contact: {
                name: 'Antigravity Developer Support'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local Development Server'
            }
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token (Clerk or Custom JWT) to access protected endpoints.'
                }
            }
        },
        security: [
            {
                BearerAuth: []
            }
        ]
    },
    apis: [
        './routes/*.js',
        './controllers/*.js',
        './server.js'
    ]
};

const swaggerSpec = swaggerJsdoc(options);

export const serveSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
