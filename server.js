// server.js - COMPLETE API FOR RAILWAY
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============= FLOWLYTICS ANALYTICS ENGINE =============
class SafeFlowlyticsAnalytics {
    constructor(orders) {
        this.orders = orders || [];
        this.analysis = this.performSafeAnalysis();
    }
    
    performSafeAnalysis() {
        // Initialize with safe defaults
        const metrics = {
            financial: {
                total_revenue: 0,
                delivered_revenue: 0,
                cancelled_revenue: 0,
                total_profit: 0,
                delivered_profit: 0,
                profit_margin: 0,
                average_order_value: 0
            },
            
            orders: {
                total: this.orders.length,
                delivered: 0,
                cancelled: 0,
                conversion_rate: 0,
                cancellation_rate: 0,
                avg_value: 0
            },
            
            customers: {
                unique: new Set(),
                repeat_buyers: 0,
                high_value_customers: [],
                customer_orders: {},
                customer_revenue: {},
                city_customers: {}
            },
            
            products: {
                by_revenue: {},
                by_revenue_sorted: [],
                low_margin_products: []
            },
            
            locations: {
                city_revenue: {},
                city_orders: {},
                city_cod_rate: {},
                city_return_rate: {},
                high_risk_cities: [],
                top_performing_cities: []
            },
            
            payments: {
                methods: {},
                cod_performance: {
                    revenue: 0,
                    orders: 0,
                    delivered: 0,
                    cancelled: 0,
                    profit: 0
                },
                prepaid_performance: {
                    revenue: 0,
                    orders: 0,
                    profit: 0
                }
            },
            
            returns: {
                total_returns: 0,
                return_rate: 0,
                revenue_lost_returns: 0,
                cancelled_orders: 0,
                cancellation_rate: 0,
                revenue_lost_cancellations: 0
            },
            
            insights: [],
            
            summary: {
                overall_score: 0,
                health_status: '',
                top_opportunity: '',
                critical_risk: '',
                recommended_action: ''
            }
        };
        
        // Process all orders
        for (const order of this.orders) {
            this.processOrderSafely(order, metrics);
        }
        
        // Calculate derived metrics
        this.calculateDerivedMetricsSafely(metrics);
        
        // Generate AI insights
        this.generateAIInsightsSafely(metrics);
        
        // Calculate business score
        this.calculateBusinessScoreSafely(metrics);
        
        return metrics;
    }
    
    processOrderSafely(order, metrics) {
        try {
            const revenue = Number(order?.revenue) || 0;
            const profit = Number(order?.profit) || (revenue * 0.2); // Default 20% margin
            const status = (order?.status || '').toString().toLowerCase();
            const quantity = Number(order?.quantity) || 1;
            const isDelivered = status.includes('delivered');
            const isCancelled = status.includes('cancel');
            const paymentMethod = order?.payment_method || 'Unknown';
            const city = order?.city || 'Unknown';
            const productName = order?.product_name || 'Unknown Product';
            const customerId = order?.customer_id || `CUST_${Math.random().toString(36).substr(2, 9)}`;
            
            // Financial Metrics
            metrics.financial.total_revenue += revenue;
            metrics.financial.total_profit += profit;
            
            if (isDelivered) {
                metrics.financial.delivered_revenue += revenue;
                metrics.financial.delivered_profit += profit;
                metrics.orders.delivered++;
            } else if (isCancelled) {
                metrics.financial.cancelled_revenue += revenue;
                metrics.orders.cancelled++;
            }
            
            // Customer Intelligence
            metrics.customers.unique.add(customerId);
            
            if (!metrics.customers.customer_orders[customerId]) {
                metrics.customers.customer_orders[customerId] = [];
                metrics.customers.customer_revenue[customerId] = 0;
            }
            
            metrics.customers.customer_orders[customerId].push(order);
            metrics.customers.customer_revenue[customerId] += revenue;
            
            // High value customers (spending over ₹1L)
            if (revenue >= 100000 && !metrics.customers.high_value_customers.includes(customerId)) {
                metrics.customers.high_value_customers.push(customerId);
            }
            
            // City customers
            if (!metrics.customers.city_customers[city]) {
                metrics.customers.city_customers[city] = new Set();
            }
            metrics.customers.city_customers[city].add(customerId);
            
            // Product Performance
            if (isDelivered && productName) {
                if (!metrics.products.by_revenue[productName]) {
                    metrics.products.by_revenue[productName] = {
                        revenue: 0,
                        profit: 0,
                        quantity: 0,
                        orders: 0
                    };
                }
                
                metrics.products.by_revenue[productName].revenue += revenue;
                metrics.products.by_revenue[productName].profit += profit;
                metrics.products.by_revenue[productName].quantity += quantity;
                metrics.products.by_revenue[productName].orders++;
                
                // Check for low margin
                const margin = revenue > 0 ? (profit / revenue * 100) : 0;
                if (margin < 15) {
                    metrics.products.low_margin_products.push({
                        name: productName,
                        revenue: revenue,
                        profit: profit,
                        margin: margin
                    });
                }
            }
            
            // Location Analysis
            if (city) {
                if (!metrics.locations.city_revenue[city]) {
                    metrics.locations.city_revenue[city] = 0;
                    metrics.locations.city_orders[city] = 0;
                    metrics.locations.city_cod_rate[city] = { total: 0, cod: 0 };
                }
                
                metrics.locations.city_revenue[city] += revenue;
                metrics.locations.city_orders[city]++;
                
                // COD rate tracking
                metrics.locations.city_cod_rate[city].total++;
                if (paymentMethod === 'COD') {
                    metrics.locations.city_cod_rate[city].cod++;
                }
            }
            
            // Payment Method Intelligence
            if (paymentMethod) {
                if (!metrics.payments.methods[paymentMethod]) {
                    metrics.payments.methods[paymentMethod] = {
                        revenue: 0,
                        orders: 0,
                        delivered: 0,
                        cancelled: 0,
                        profit: 0
                    };
                }
                
                metrics.payments.methods[paymentMethod].revenue += revenue;
                metrics.payments.methods[paymentMethod].orders++;
                metrics.payments.methods[paymentMethod].profit += profit;
                
                if (isDelivered) metrics.payments.methods[paymentMethod].delivered++;
                if (isCancelled) metrics.payments.methods[paymentMethod].cancelled++;
                
                // COD vs Prepaid
                if (paymentMethod === 'COD') {
                    metrics.payments.cod_performance.revenue += revenue;
                    metrics.payments.cod_performance.orders++;
                    metrics.payments.cod_performance.profit += profit;
                    if (isDelivered) metrics.payments.cod_performance.delivered++;
                    if (isCancelled) metrics.payments.cod_performance.cancelled++;
                } else {
                    metrics.payments.prepaid_performance.revenue += revenue;
                    metrics.payments.prepaid_performance.orders++;
                    metrics.payments.prepaid_performance.profit += profit;
                }
            }
            
        } catch (error) {
            console.warn("Error processing order:", error.message);
        }
    }
    
    calculateDerivedMetricsSafely(metrics) {
        const totalOrders = this.orders.length;
        const deliveredOrders = metrics.orders.delivered || 0;
        const cancelledOrders = metrics.orders.cancelled || 0;
        
        // Financial Metrics
        metrics.financial.profit_margin = metrics.financial.delivered_revenue > 0 ?
            (metrics.financial.delivered_profit / metrics.financial.delivered_revenue * 100) : 0;
        
        metrics.financial.average_order_value = deliveredOrders > 0 ?
            metrics.financial.delivered_revenue / deliveredOrders : 0;
        
        // Order Metrics
        metrics.orders.conversion_rate = totalOrders > 0 ?
            (deliveredOrders / totalOrders * 100) : 0;
        
        metrics.orders.cancellation_rate = totalOrders > 0 ?
            (cancelledOrders / totalOrders * 100) : 0;
        
        metrics.orders.avg_value = deliveredOrders > 0 ?
            metrics.financial.delivered_revenue / deliveredOrders : 0;
        
        // Customer Metrics
        const uniqueCustomers = metrics.customers.unique.size || 0;
        const repeatCustomers = Object.values(metrics.customers.customer_orders || {})
            .filter(orders => orders.length > 1).length;
        
        metrics.customers.repeat_buyers = repeatCustomers;
        
        // Product Metrics
        metrics.products.by_revenue_sorted = Object.entries(metrics.products.by_revenue || {})
            .map(([name, data]) => ({
                name,
                ...data,
                margin: data.revenue > 0 ? (data.profit / data.revenue * 100) : 0
            }))
            .sort((a, b) => b.revenue - a.revenue);
        
        // Location Metrics
        Object.entries(metrics.locations.city_cod_rate || {}).forEach(([city, data]) => {
            data.rate = data.total > 0 ? (data.cod / data.total * 100) : 0;
        });
        
        metrics.locations.high_risk_cities = Object.entries(metrics.locations.city_cod_rate || {})
            .filter(([city, data]) => data.rate > 50)
            .map(([city]) => city);
        
        metrics.locations.top_performing_cities = Object.entries(metrics.locations.city_revenue || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([city, revenue]) => ({ city, revenue }));
    }
    
    generateAIInsightsSafely(metrics) {
        metrics.insights = [];
        
        // Insight 1: COD Performance
        const codOrders = metrics.payments.cod_performance?.orders || 0;
        const codCancelled = metrics.payments.cod_performance?.cancelled || 0;
        
        if (codOrders > 0) {
            const codCancellationRate = (codCancelled / codOrders * 100);
            
            if (codCancellationRate > 50) {
                metrics.insights.push({
                    id: 'cod_high_cancellation',
                    title: 'High COD Cancellation Detected',
                    description: `COD payments show ${codCancellationRate.toFixed(1)}% cancellation rate, significantly impacting revenue.`,
                    category: 'Payment Risk',
                    severity: 'Critical',
                    impact: 'Revenue Loss',
                    recommendation: 'Implement advance payment confirmation or reduce COD availability in high-risk areas.',
                    estimated_savings: 'Potential 5-10% revenue recovery'
                });
            }
        }
        
        // Insight 2: Customer Retention Opportunity
        const uniqueCustomers = metrics.customers.unique?.size || 1;
        const repeatBuyers = metrics.customers.repeat_buyers || 0;
        const repeatRate = (repeatBuyers / uniqueCustomers * 100);
        
        if (repeatRate < 30) {
            metrics.insights.push({
                id: 'low_repeat_rate',
                title: 'Customer Retention Opportunity',
                description: `Only ${repeatRate.toFixed(1)}% of customers make repeat purchases. Industry average is 35-40%.`,
                category: 'Customer Growth',
                severity: 'Opportunity',
                impact: 'Untapped Revenue Potential',
                recommendation: 'Implement loyalty program, personalized email campaigns, and post-purchase engagement.',
                estimated_savings: 'Potential 15-25% revenue growth'
            });
        }
        
        // Insight 3: High Value Customer Opportunity
        const highValueCustomers = metrics.customers.high_value_customers?.length || 0;
        
        if (highValueCustomers > 0) {
            metrics.insights.push({
                id: 'high_value_customers',
                title: 'High Value Customers Identified',
                description: `${highValueCustomers} customers spending over ₹1L each.`,
                category: 'Customer Intelligence',
                severity: 'Opportunity',
                impact: 'Revenue Growth',
                recommendation: 'Create VIP program with exclusive offers, early access, and personalized service.',
                estimated_savings: 'Potential 20-30% higher lifetime value'
            });
        }
    }
    
    calculateBusinessScoreSafely(metrics) {
        let score = 100;
        
        // Deduct for risks
        const codCancellationRate = metrics.payments.cod_performance?.orders > 0 ?
            (metrics.payments.cod_performance.cancelled / metrics.payments.cod_performance.orders * 100) : 0;
        
        if (codCancellationRate > 50) score -= 20;
        if (codCancellationRate > 30) score -= 10;
        
        const uniqueCustomers = metrics.customers.unique?.size || 1;
        const repeatBuyers = metrics.customers.repeat_buyers || 0;
        const repeatRate = (repeatBuyers / uniqueCustomers * 100);
        
        if (repeatRate < 20) score -= 10;
        if (repeatRate < 30) score -= 5;
        
        const profitMargin = metrics.financial.profit_margin || 0;
        if (profitMargin < 15) score -= 10;
        if (profitMargin < 20) score -= 5;
        
        score = Math.max(0, Math.min(100, Math.round(score)));
        
        metrics.summary.overall_score = score;
        
        // Determine health status
        if (score >= 80) {
            metrics.summary.health_status = 'Excellent';
            metrics.summary.recommended_action = 'Maintain current strategies and focus on scaling profitable segments';
        } else if (score >= 60) {
            metrics.summary.health_status = 'Good';
            metrics.summary.recommended_action = 'Address key risks while optimizing high-performing areas';
        } else if (score >= 40) {
            metrics.summary.health_status = 'Needs Attention';
            metrics.summary.recommended_action = 'Prioritize critical risk mitigation and operational improvements';
        } else {
            metrics.summary.health_status = 'Critical';
            metrics.summary.recommended_action = 'Immediate action required on multiple business fronts';
        }
        
        // Determine top opportunity
        const opportunities = (metrics.insights || []).filter(i => i.severity === 'Opportunity');
        if (opportunities.length > 0) {
            metrics.summary.top_opportunity = opportunities[0].title;
        } else {
            metrics.summary.top_opportunity = 'Optimize existing customer base for repeat purchases';
        }
        
        // Determine critical risk
        const criticalRisks = (metrics.insights || []).filter(i => i.severity === 'Critical');
        if (criticalRisks.length > 0) {
            metrics.summary.critical_risk = criticalRisks[0].title;
        } else {
            metrics.summary.critical_risk = 'No critical risks detected';
        }
    }
    
    getTopCustomers(n = 5) {
        const customerRevenue = this.analysis.customers.customer_revenue || {};
        
        return Object.entries(customerRevenue)
            .map(([id, revenue]) => ({
                id,
                revenue,
                orders: (this.analysis.customers.customer_orders?.[id]?.length || 0),
                average_order_value: (this.analysis.customers.customer_orders?.[id]?.length > 0 ? 
                    revenue / this.analysis.customers.customer_orders[id].length : 0)
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, n);
    }
}

// ============= HTML GENERATOR =============
function formatCurrency(value) {
    if (!value && value !== 0) return '₹0';
    const numValue = Number(value);
    if (isNaN(numValue)) return '₹0';
    
    if (numValue >= 10000000) return `₹${(numValue / 10000000).toFixed(2)} Cr`;
    if (numValue >= 100000) return `₹${(numValue / 100000).toFixed(2)} L`;
    if (numValue >= 1000) return `₹${(numValue / 1000).toFixed(1)}K`;
    return `₹${Math.round(numValue).toLocaleString('en-IN')}`;
}

function generateDashboardHTML(metrics, orders) {
    const topCustomers = (new SafeFlowlyticsAnalytics(orders)).getTopCustomers(5);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flowlytics AI • Enterprise Analytics</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        /* Your CSS styles from previous code */
        :root {
            --primary-blue: #1a237e;
            --primary-blue-light: #534bae;
            --accent-teal: #00bcd4;
            --success-green: #4caf50;
            --warning-orange: #ff9800;
            --danger-red: #f44336;
            --dark-charcoal: #263238;
            --light-gray: #f5f5f5;
            --medium-gray: #757575;
            --border-color: #e0e0e0;
            
            --gradient-primary: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-light));
            --gradient-success: linear-gradient(135deg, var(--success-green), #8bc34a);
            --gradient-warning: linear-gradient(135deg, var(--warning-orange), #ffb74d);
            --gradient-danger: linear-gradient(135deg, var(--danger-red), #ef5350);
            --gradient-accent: linear-gradient(135deg, var(--accent-teal), #26c6da);
            
            --shadow-light: 0 2px 12px rgba(0, 0, 0, 0.08);
            --shadow-medium: 0 4px 20px rgba(0, 0, 0, 0.12);
            
            --radius-sm: 8px;
            --radius-md: 12px;
            --radius-lg: 16px;
            
            --space-xs: 8px;
            --space-sm: 16px;
            --space-md: 24px;
            --space-lg: 32px;
            --space-xl: 48px;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            color: var(--dark-charcoal);
            line-height: 1.6;
            min-height: 100vh;
            padding: var(--space-sm);
        }
        
        .container {
            max-width: 1440px;
            margin: 0 auto;
        }
        
        .platform-header {
            background: var(--gradient-primary);
            color: white;
            padding: var(--space-lg) var(--space-xl);
            border-radius: var(--radius-lg);
            margin-bottom: var(--space-lg);
            box-shadow: var(--shadow-medium);
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--space-md);
            margin-bottom: var(--space-lg);
        }
        
        .metric-card {
            background: white;
            padding: var(--space-md);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-light);
            border: 1px solid var(--border-color);
            text-align: center;
        }
        
        .metric-value {
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-blue);
            margin-bottom: var(--space-xs);
        }
        
        .card {
            background: white;
            border-radius: var(--radius-md);
            padding: var(--space-lg);
            box-shadow: var(--shadow-light);
            margin-bottom: var(--space-lg);
            border: 1px solid var(--border-color);
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--space-lg);
            padding-bottom: var(--space-sm);
            border-bottom: 2px solid var(--light-gray);
        }
        
        .table-container {
            overflow-x: auto;
            border-radius: var(--radius-sm);
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            background: white;
            border: 1px solid var(--border-color);
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .data-table th {
            background: var(--light-gray);
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            color: var(--primary-blue);
        }
        
        .data-table td {
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .status-indicator {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        
        .status-success {
            background: rgba(76, 175, 80, 0.1);
            color: var(--success-green);
        }
        
        .status-warning {
            background: rgba(255, 152, 0, 0.1);
            color: var(--warning-orange);
        }
        
        .status-danger {
            background: rgba(244, 67, 54, 0.1);
            color: var(--danger-red);
        }
        
        .action-button {
            background: var(--gradient-primary);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: var(--radius-sm);
            font-weight: 600;
            cursor: pointer;
        }
        
        @media (max-width: 768px) {
            .metrics-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        @media (max-width: 480px) {
            .metrics-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="platform-header">
            <h1>Flowlytics AI</h1>
            <p>Intelligent Analytics & Automation Platform for eCommerce Entrepreneurs</p>
        </header>

        <div class="card">
            <div class="card-header">
                <h2>Business Overview</h2>
            </div>
            
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${formatCurrency(metrics.financial.delivered_revenue)}</div>
                    <div class="metric-label">Delivered Revenue</div>
                    <div>${metrics.orders.delivered || 0} orders</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">${formatCurrency(metrics.financial.delivered_profit)}</div>
                    <div class="metric-label">Total Profit</div>
                    <div>${metrics.financial.profit_margin.toFixed(1)}% margin</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">${formatCurrency(metrics.financial.average_order_value)}</div>
                    <div class="metric-label">Average Order Value</div>
                    <div>Industry: ₹1,500</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">${metrics.customers.unique?.size || 0}</div>
                    <div class="metric-label">Unique Customers</div>
                    <div>${metrics.customers.repeat_buyers || 0} repeat buyers</div>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: var(--space-lg);">
                <h3>Business Health Score: ${metrics.summary.overall_score} - ${metrics.summary.health_status}</h3>
                <p>${metrics.summary.recommended_action}</p>
            </div>
        </div>

        ${metrics.insights.length > 0 ? `
        <div class="card">
            <div class="card-header">
                <h2>AI Business Insights</h2>
            </div>
            
            ${metrics.insights.map(insight => `
                <div style="padding: var(--space-md); margin-bottom: var(--space-sm); border-left: 4px solid ${insight.severity === 'Critical' ? 'var(--danger-red)' : insight.severity === 'Warning' ? 'var(--warning-orange)' : 'var(--success-green)'}; background: white;">
                    <h3>${insight.title}</h3>
                    <p>${insight.description}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-sm);">
                        <span class="status-indicator status-${insight.severity.toLowerCase()}">
                            ${insight.category}
                        </span>
                        <button class="action-button">Take Action</button>
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-md);">
            <div class="card">
                <div class="card-header">
                    <h2>Top Customers</h2>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Customer ID</th>
                                <th>Revenue</th>
                                <th>Orders</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${topCustomers.map(customer => `
                                <tr>
                                    <td>${customer.id}</td>
                                    <td>${formatCurrency(customer.revenue)}</td>
                                    <td>${customer.orders}</td>
                                    <td>
                                        <span class="status-indicator ${customer.orders > 1 ? 'status-success' : 'status-warning'}">
                                            ${customer.orders > 1 ? 'Repeat Buyer' : 'Single Purchase'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2>Top Products</h2>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Revenue</th>
                                <th>Profit</th>
                                <th>Margin</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${metrics.products.by_revenue_sorted.slice(0, 5).map(product => `
                                <tr>
                                    <td>${product.name}</td>
                                    <td>${formatCurrency(product.revenue)}</td>
                                    <td>${formatCurrency(product.profit)}</td>
                                    <td>${product.margin.toFixed(1)}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <footer style="text-align: center; padding: var(--space-lg); color: var(--medium-gray);">
            <p><strong>Flowlytics AI Enterprise Platform</strong></p>
            <p>${orders.length} orders processed • Generated on ${new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}</p>
        </footer>
    </div>
</body>
</html>`;
}

// ============= API ENDPOINTS =============

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Flowlytics AI',
        version: '5.1',
        timestamp: new Date().toISOString(),
        endpoints: {
            analyze: 'POST /analyze',
            dashboard: 'POST /dashboard',
            health: 'GET /health'
        }
    });
});

// Main analysis endpoint
app.post('/analyze', (req, res) => {
    console.log('Analyze endpoint called');
    
    try {
        let orderData = [];
        
        // Extract data from different formats
        if (Array.isArray(req.body)) {
            orderData = req.body;
        } else if (req.body.orders && Array.isArray(req.body.orders)) {
            orderData = req.body.orders;
        } else if (req.body.data && Array.isArray(req.body.data)) {
            orderData = req.body.data;
        } else if (req.body) {
            // Single order
            orderData = [req.body];
        }
        
        console.log(`Received ${orderData.length} orders`);
        
        if (orderData.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No order data provided',
                instructions: 'Send orders as array in body.orders, body.data, or directly as array'
            });
        }
        
        // Process analytics
        const analytics = new SafeFlowlyticsAnalytics(orderData);
        const metrics = analytics.analysis;
        
        // Generate HTML dashboard
        const html = generateDashboardHTML(metrics, orderData);
        
        res.json({
            success: true,
            data: {
                orders_processed: orderData.length,
                analytics: {
                    financial: {
                        total_revenue: metrics.financial.total_revenue,
                        delivered_revenue: metrics.financial.delivered_revenue,
                        total_profit: metrics.financial.total_profit,
                        profit_margin: metrics.financial.profit_margin,
                        average_order_value: metrics.financial.average_order_value
                    },
                    orders: {
                        total: metrics.orders.total,
                        delivered: metrics.orders.delivered,
                        conversion_rate: metrics.orders.conversion_rate
                    },
                    customers: {
                        unique: metrics.customers.unique.size,
                        repeat_buyers: metrics.customers.repeat_buyers
                    }
                },
                insights: metrics.insights,
                business_health: {
                    score: metrics.summary.overall_score,
                    status: metrics.summary.health_status,
                    recommendation: metrics.summary.recommended_action
                }
            },
            html: html,
            generated_at: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Dashboard endpoint (HTML only)
app.post('/dashboard', (req, res) => {
    try {
        let orderData = [];
        
        if (Array.isArray(req.body)) {
            orderData = req.body;
        } else if (req.body.orders && Array.isArray(req.body.orders)) {
            orderData = req.body.orders;
        } else if (req.body.data && Array.isArray(req.body.data)) {
            orderData = req.body.data;
        }
        
        const analytics = new SafeFlowlyticsAnalytics(orderData);
        const html = generateDashboardHTML(analytics.analysis, orderData);
        
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
        
    } catch (error) {
        res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
    }
});

// Default route
app.get('/', (req, res) => {
    res.json({
        message: 'Flowlytics AI API',
        version: '5.1',
        endpoints: [
            'GET  /health - Health check',
            'POST /analyze - Analyze orders (returns JSON with HTML)',
            'POST /dashboard - Get HTML dashboard only'
        ],
        example_request: {
            method: 'POST',
            url: '/analyze',
            body: {
                orders: [
                    {
                        "order_id": "TEST001",
                        "customer_id": "CUST001", 
                        "revenue": 150000,
                        "profit": 30000,
                        "status": "Delivered",
                        "city": "Mumbai",
                        "payment_method": "UPI",
                        "product_name": "Test Product",
                        "product_category": "Electronics",
                        "quantity": 1
                    }
                ]
            }
        }
    });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Flowlytics AI API running on port ${port}`);
    console.log(`🌐 Health check: http://localhost:${port}/health`);
    console.log(`📊 Analyze endpoint: POST http://localhost:${port}/analyze`);
    console.log(`📈 Dashboard endpoint: POST http://localhost:${port}/dashboard`);
});