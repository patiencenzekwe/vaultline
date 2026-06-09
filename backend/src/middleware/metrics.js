const client = require('prom-client');

// Create a Registry
const register = new client.Registry();

// Add default Node.js metrics
client.collectDefaultMetrics({
    register,
    prefix: 'vaultline_',
});

// HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
    name: 'vaultline_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
    registers: [register],
});

// HTTP request counter
const httpRequestTotal = new client.Counter({
    name: 'vaultline_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
});

// Active connections gauge
const activeConnections = new client.Gauge({
    name: 'vaultline_active_connections',
    help: 'Number of active connections',
    registers: [register],
});

// Transfer counter
const transferTotal = new client.Counter({
    name: 'vaultline_transfers_total',
    help: 'Total number of transfers processed',
    labelNames: ['status'],
    registers: [register],
});

// Transfer amount histogram
const transferAmount = new client.Histogram({
    name: 'vaultline_transfer_amount_gbp',
    help: 'Transfer amounts in GBP',
    buckets: [10, 50, 100, 250, 500, 1000, 5000, 10000],
    registers: [register],
});

// Middleware to track HTTP metrics
const metricsMiddleware = (req, res, next) => {
    const start = Date.now();
    activeConnections.inc();

    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route ? req.route.path : req.path;

        httpRequestDuration.observe(
            { method: req.method, route, status_code: res.statusCode },
            duration
        );

        httpRequestTotal.inc({
            method: req.method,
            route,
            status_code: res.statusCode,
        });

        activeConnections.dec();
    });

    next();
};

module.exports = {
    register,
    metricsMiddleware,
    transferTotal,
    transferAmount,
};