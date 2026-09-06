const express = require('express');
const cors = require('cors');
const db = require('./db');

const authRoutes = require('./routes/auth');
const farmerRoutes = require('./routes/farmer');
const farmerProduceRoutes = require('./routes/farmer-produce');
const farmerOfferRoutes = require('./routes/farmer-offers');
const farmerTransactionRoutes = require('./routes/farmer-transactions');
const farmerLogisticsRoutes = require('./routes/farmer-logistics');

const buyerRoutes = require('./routes/buyer');
const buyerOfferRoutes = require('./routes/buyer-offers');
const buyerTransactionRoutes = require('./routes/buyer-transactions');
const buyerLogisticsRoutes = require('./routes/buyer-logistics');

const notificationRoutes = require('./routes/notifications');

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());


// =====================================================
// AUTHENTICATION
// =====================================================

app.use(
    '/api/auth',
    authRoutes
);


// =====================================================
// FARMER ROUTES
// =====================================================

app.use(
    '/api/farmer',
    farmerRoutes
);

app.use(
    '/api/farmer/produce',
    farmerProduceRoutes
);

app.use(
    '/api/farmer/offers',
    farmerOfferRoutes
);

app.use(
    '/api/farmer/transactions',
    farmerTransactionRoutes
);

app.use(
    '/api/farmer/logistics',
    farmerLogisticsRoutes
);


// =====================================================
// BUYER ROUTES
// =====================================================

app.use(
    '/api/buyer/offers',
    buyerOfferRoutes
);

app.use(
    '/api/buyer/transactions',
    buyerTransactionRoutes
);

app.use(
    '/api/buyer/logistics',
    buyerLogisticsRoutes
);

app.use(
    '/api/buyer',
    buyerRoutes
);


// =====================================================
// NOTIFICATIONS
// =====================================================

app.use(
    '/api/notifications',
    notificationRoutes
);


// =====================================================
// ROOT ROUTE
// =====================================================

app.get(
    '/',
    (req, res) => {

        res.json({
            message:
                'AgriLink AI Backend is running'
        });

    }
);


// =====================================================
// DATABASE TEST
// =====================================================

app.get(
    '/api/test-db',
    (req, res) => {

        db.query(
            'SELECT 1 AS test',
            (err, results) => {

                if (err) {

                    console.error(
                        'Database connection failed:',
                        err
                    );

                    return res.status(500).json({

                        error:
                            'Database connection failed',

                        details:
                            err.message,

                        code:
                            err.code

                    });

                }


                res.json({

                    message:
                        'MySQL connected successfully',

                    result:
                        results

                });

            }
        );

    }
);


// =====================================================
// 404 HANDLER
// =====================================================

app.use(
    (req, res) => {

        res.status(404).json({

            error:
                'API route not found',

            path:
                req.originalUrl

        });

    }
);


// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
    (err, req, res, next) => {

        console.error(
            'Server error:',
            err
        );

        res.status(500).json({

            error:
                'Internal server error',

            details:
                err.message

        });

    }
);


// =====================================================
// START SERVER
// =====================================================

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `AgriLink AI Backend running on http://localhost:${PORT}`
        );

    }
);