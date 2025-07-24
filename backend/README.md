# NFS Logistics Tracking System - Backend

A complete Node.js/Express backend system for tracking shipments using Ship24 API integration.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- Ship24 API account (free tier available)

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Run the automated setup:**
   ```bash
   node setup.js
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Visit your tracking system:**
   - Main site: http://localhost:3000
   - API health: http://localhost:3000/api/health

## 📋 Manual Setup (Alternative)

If you prefer manual setup:

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

### 3. Setup Database
```bash
npm run init-db
```

### 4. Start the Server
```bash
npm start
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_HOST` | MySQL host | localhost | Yes |
| `DATABASE_USER` | MySQL username | root | Yes |
| `DATABASE_PASSWORD` | MySQL password | - | Yes |
| `DATABASE_NAME` | Database name | nfs_logistics | Yes |
| `SHIP24_API_KEY` | Ship24 API key | - | No* |
| `PORT` | Server port | 3000 | No |
| `NODE_ENV` | Environment | development | No |

*Ship24 API key is optional for testing - the system will use mock data if not provided.

## 📊 Database Schema

### Orders Table
- Stores order information
- Links orders to tracking numbers and carriers
- Supports customer details and shipment info

### Tracking Cache Table
- Caches Ship24 API responses
- Reduces API calls and improves performance
- Configurable expiration times

### API Logs Table
- Logs all API requests for monitoring
- Tracks response times and errors
- Useful for debugging and analytics

## 🛠 API Endpoints

### Public Endpoints

#### `GET /api/health`
Health check for the system
```json
{
  "status": "ok",
  "services": {
    "database": { "status": "healthy" },
    "ship24": { "success": true }
  }
}
```

#### `GET /api/order/:orderNumber`
Get order details by order number
```bash
curl http://localhost:3000/api/order/NFS-2024-001234
```

#### `POST /api/track`
Track a shipment by order number
```bash
curl -X POST http://localhost:3000/api/track \
  -H "Content-Type: application/json" \
  -d '{"orderNumber": "NFS-2024-001234"}'
```

#### `GET /api/carriers`
Get list of supported carriers
```bash
curl http://localhost:3000/api/carriers
```

### Admin Endpoints

#### `GET /api/orders`
List all orders (paginated)
```bash
curl "http://localhost:3000/api/orders?page=1&limit=10"
```

#### `POST /api/orders`
Create a new order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "order_number": "NFS-2024-001239",
    "tracking_number": "1234567890",
    "carrier_name": "DHL Express",
    "carrier_code": "dhl",
    "customer_name": "John Doe",
    "origin": "London, UK",
    "destination": "New York, USA",
    "service_type": "Express",
    "order_date": "2024-01-20"
  }'
```

#### `GET /api/search`
Search orders
```bash
curl "http://localhost:3000/api/search?q=john"
```

#### `GET /api/stats`
Get order statistics
```bash
curl http://localhost:3000/api/stats
```

## 🚢 Ship24 Integration

### Supported Carriers
- DHL, FedEx, UPS
- Emirates SkyCargo, Qatar Airways Cargo, Turkish Cargo
- USPS, China Post, Japan Post
- And 1500+ more carriers worldwide

### API Features
- Real-time tracking data
- Automatic carrier detection
- Event timeline with locations
- Status mapping and formatting
- Intelligent caching system

### Getting Your API Key
1. Sign up at https://ship24.com/
2. Choose a plan (free tier available)
3. Get your API key from the dashboard
4. Add it to your `.env` file

## 📈 Performance Features

### Caching System
- Caches Ship24 responses for 30 minutes
- Reduces API calls and costs
- Serves cached data if API is unavailable

### Rate Limiting
- Protects against abuse
- Configurable limits per IP
- Returns appropriate error messages

### Request Logging
- Logs all API requests to database
- Tracks response times and errors
- Useful for monitoring and debugging

## 🔒 Security Features

### Input Validation
- Validates order number format
- Sanitizes all input data
- Prevents SQL injection with prepared statements

### CORS Protection
- Configurable allowed origins
- Credentials support
- Preflight request handling

### Helmet Protection
- Sets security headers
- Prevents common attacks
- XSS and CSRF protection

## 📝 Sample Data

The system comes with 5 sample orders for testing:

| Order Number | Customer | Carrier | Status |
|--------------|----------|---------|--------|
| NFS-2024-001234 | John Smith | DHL Express | In Transit |
| NFS-2024-001235 | Jane Doe | FedEx | Delivered |
| NFS-2024-001236 | Ahmed Al-Rashid | Emirates SkyCargo | Processing |
| NFS-2024-001237 | Maria Rodriguez | Qatar Airways Cargo | Express |
| NFS-2024-001238 | Hans Mueller | Turkish Cargo | Standard |

## 🛠 Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run init-db` - Initialize/reset database

### File Structure
```
backend/
├── package.json          # Dependencies and scripts
├── server.js            # Main server file
├── database.js          # Database connection and queries
├── ship24-service.js    # Ship24 API integration
├── setup.js            # Automated setup script
├── .env                # Environment configuration
└── scripts/
    └── init-database.js # Database initialization
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Error
```bash
Error: ER_ACCESS_DENIED_ERROR: Access denied for user
```
**Solution:** Check your database credentials in `.env`

#### Ship24 API Error
```bash
Error: Failed to create tracker: Unauthorized
```
**Solution:** Verify your Ship24 API key is correct

#### Port Already in Use
```bash
Error: listen EADDRINUSE :::3000
```
**Solution:** Change PORT in `.env` or stop the other process

### Debug Mode
Set `NODE_ENV=development` in `.env` to see detailed error messages.

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the API logs in the database
3. Check the console output for errors
4. Verify your Ship24 API key and database connection

## 📄 License

MIT License - See LICENSE file for details
