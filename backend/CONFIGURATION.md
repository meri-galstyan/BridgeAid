# Resource Service Configuration Guide

## Overview

The Bridge Aid backend now supports multiple data sources for resources:
- **JSON File** (default) - Uses `resources.json`
- **External API** - Fetches from REST APIs
- **Database** - Connects to databases (placeholder for implementation)

## Quick Start

By default, the service uses the JSON file. No configuration needed!

## Configuration Options

### 1. JSON File (Default)

No configuration needed. The service automatically uses `resources.json`.

```env
RESOURCE_DATA_SOURCE=json
```

### 2. External API

To use an external API:

```env
RESOURCE_DATA_SOURCE=api
RESOURCE_API_URL=https://api.example.com/resources
RESOURCE_API_KEY=your_api_key_here
```

**API Response Formats Supported:**

The service automatically handles these response structures:

- Direct array: `[{resource1}, {resource2}]`
- Wrapped in `resources`: `{resources: [...]}`
- Wrapped in `data`: `{data: [...]}`
- Wrapped in `results`: `{results: [...]}`
- Wrapped in `organizations`: `{organizations: [...]}`

**Authentication:**

The service supports:
- Bearer token: `Authorization: Bearer {apiKey}`
- API key header: `X-API-Key: {apiKey}`

### 3. Database (Future)

Database integration is supported in the architecture but requires implementation:

```env
RESOURCE_DATA_SOURCE=database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bridgeaid
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

## Resource Data Normalization

The service automatically normalizes resources from different sources to a common format:

**Required Fields (will be extracted/mapped):**
- `id` - Resource identifier
- `name` - Resource name
- `category` - One of: `food`, `housing`, `mental_health`, `legal`, `jobs`
- `address` - Full address
- `zip` - ZIP code (extracted from address if needed)
- `hours` - Operating hours
- `phone` - Contact phone
- `website` - Website URL
- `eligibilityNotes` - Eligibility description
- `eligibilityTags` - Array of tags (e.g., `["low_income", "senior"]`)
- `languagesSupported` - Array of languages (e.g., `["English", "Spanish"]`)

## Caching

Resources are cached in memory for **1 hour** to:
- Reduce API calls
- Improve response times
- Handle API failures gracefully

**Manual Cache Refresh:**

Use the `/refresh-resources` endpoint:
```bash
curl -X POST http://localhost:3001/refresh-resources
```

## Fallback Behavior

The service always falls back to the JSON file if:
- API request fails
- API returns empty results
- Database connection fails
- Any error occurs

This ensures the app always has resources available.

## Example API Integration

### Example 1: Simple REST API

```env
RESOURCE_DATA_SOURCE=api
RESOURCE_API_URL=https://api.resources.org/v1/resources
RESOURCE_API_KEY=abc123xyz
```

### Example 2: 211.org API (if available)

```env
RESOURCE_DATA_SOURCE=api
RESOURCE_API_URL=https://api.211.org/resources?location=alameda
RESOURCE_API_KEY=your_211_api_key
```

### Example 3: OpenReferral Format

```env
RESOURCE_DATA_SOURCE=api
RESOURCE_API_URL=https://api.openreferral.org/services
RESOURCE_API_KEY=your_key
```

## Testing

1. **Test with JSON (default):**
   ```bash
   # No .env needed, or set:
   RESOURCE_DATA_SOURCE=json
   ```

2. **Test with API:**
   ```bash
   # Set in .env:
   RESOURCE_DATA_SOURCE=api
   RESOURCE_API_URL=https://your-api.com/resources
   RESOURCE_API_KEY=your_key
   ```

3. **Check health:**
   ```bash
   curl http://localhost:3001/health
   ```

   Response:
   ```json
   {
     "status": "ok",
     "resourcesCount": 10,
     "dataSource": "json",
     "cacheAge": "active"
   }
   ```

## Troubleshooting

**Problem:** No resources loaded
- Check that `resources.json` exists and is valid JSON
- Check API URL and key if using external API
- Check server logs for errors

**Problem:** API not working
- Verify API URL is correct
- Check API key/authentication
- Service will automatically fall back to JSON

**Problem:** Resources not updating
- Cache refreshes every hour automatically
- Use `/refresh-resources` endpoint to force refresh
- Check that API is returning new data

## Next Steps

To implement database integration:
1. Install database driver (e.g., `pg` for PostgreSQL, `mongodb` for MongoDB)
2. Implement `fetchFromDatabase()` function in `resourceService.js`
3. Configure database connection in `.env`
4. Set `RESOURCE_DATA_SOURCE=database`

