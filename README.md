# Bridge Aid

A simple web app that helps users find local social services (food, housing, mental health, legal aid, jobs) and provides clear, plain-language action plans.

## Features

- **Simple Onboarding Form**: Collect user information (ZIP code, age, income, household size, primary need, language preference)
- **Smart Matching**: Matches resources based on category, location, eligibility, and language support
- **Action Plans**: Provides 3-step action plans for each matched resource (AI-powered or mock)
- **Bilingual Support**: English and Spanish language support
- **Clean UI**: Accessible, mobile-friendly interface with large buttons and clear typography

## Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express
- **Data Source**: Flexible - supports JSON file, external APIs, or databases (see Configuration)
- **AI Features**: Optional OpenAI API integration for action plan generation and translation

## Project Structure

```
BridgeAid/
├── backend/
│   ├── server.js          # Express server
│   ├── resourceService.js # Resource data service (API/DB/JSON)
│   ├── matching.js        # Resource matching logic
│   ├── aiService.js       # AI service for action plans
│   ├── resources.json     # Seed data (10 example resources)
│   ├── package.json
│   └── .env               # Environment variables (create from .env.example)
├── frontend/
│   ├── src/
│   │   ├── App.tsx        # Main app component
│   │   ├── components/
│   │   │   ├── OnboardingForm.tsx
│   │   │   └── ResultsPage.tsx
│   │   └── ...
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file (copy from example if available, or create manually)
```

Edit `.env` with your configuration:
```env
# Server Configuration
PORT=3001

# OpenAI API Key (optional - for AI-generated action plans)
OPENAI_API_KEY=your_key_here

# Resource Data Source Configuration
# Options: 'json', 'api', 'database'
# Default: 'json' (uses resources.json file)
RESOURCE_DATA_SOURCE=json

# External API Configuration (when RESOURCE_DATA_SOURCE=api)
RESOURCE_API_URL=https://api.example.com/resources
RESOURCE_API_KEY=your_api_key_here

# Database Configuration (when RESOURCE_DATA_SOURCE=database)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=bridgeaid
# DB_USER=your_db_user
# DB_PASSWORD=your_db_password
```

**Notes**: 
- The app works without an OpenAI API key - it will use mock action plans instead.
- By default, `RESOURCE_DATA_SOURCE=json` uses the local `resources.json` file.
- Set `RESOURCE_DATA_SOURCE=api` to use an external API (configure `RESOURCE_API_URL` and `RESOURCE_API_KEY`).
- Set `RESOURCE_DATA_SOURCE=database` to use a database (database integration is a placeholder for future implementation).

4. Start the backend server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will open at `http://localhost:3000`

## Usage

1. Fill out the onboarding form with your information:
   - ZIP code
   - Age range
   - Income bracket
   - Household size
   - Primary need (food, housing, mental health, legal, jobs)
   - Preferred language (English/Spanish)

2. Click "Find Resources" to get matched resources

3. Review the results page which shows:
   - Matched resources with distance
   - Contact information (phone, website, hours)
   - Eligibility information
   - 3-step action plan for each resource

4. Click "Start Over" to search again

## Data Sources

The app supports multiple data sources for resources:

### 1. JSON File (Default)
The app includes 10 example resources in Alameda County, California:
- 2 Food assistance resources
- 2 Housing assistance resources
- 2 Mental health resources
- 2 Legal aid resources
- 2 Job training resources

All resources support both English and Spanish.

### 2. External API
Configure `RESOURCE_DATA_SOURCE=api` in your `.env` file to fetch resources from an external API. The service supports:
- RESTful APIs with JSON responses
- Bearer token or API key authentication
- Automatic normalization of different API response formats
- Fallback to JSON file if API fails

### 3. Database (Future)
Database integration is supported in the architecture but requires implementation. The service can connect to:
- PostgreSQL
- MongoDB
- Other databases (with custom implementation)

### Resource Caching
Resources are cached in memory for 1 hour to reduce API calls and improve performance. Use the `/refresh-resources` endpoint to manually refresh the cache.

## Matching Logic

Resources are matched based on:
1. **Category**: Must match the user's primary need
2. **Eligibility**: Checks eligibility tags (low_income, senior, parent, veteran, disabled)
3. **Language**: Prefers resources that support the user's preferred language
4. **Distance**: Sorted by approximate distance from user's ZIP code

Returns top 3-5 matches.

## AI Features

The app includes an optional AI service (`backend/aiService.js`) that:
- Generates personalized 3-step action plans using OpenAI GPT-3.5
- Translates action plans to Spanish when needed
- Falls back to mock action plans if API key is not provided

The AI service is modular and can be easily replaced with other translation/AI services.

## Development

### Backend Endpoints

- `GET /health` - Health check endpoint
  - Returns: `{ status: 'ok', resourcesCount: number, dataSource: string, cacheAge: string }`
- `POST /match` - Match resources based on user criteria
  - Request body: `{ zip, ageRange, incomeBracket, householdSize, primaryNeed, preferredLanguage }`
  - Response: `{ matches: Resource[], count: number }`
- `POST /refresh-resources` - Manually refresh the resource cache
  - Response: `{ status: 'success', resourcesCount: number, message: string }`

### Adding New Resources

Edit `backend/resources.json` and add new resource objects with the following structure:
```json
{
  "id": 11,
  "name": "Resource Name",
  "category": "food|housing|mental_health|legal|jobs",
  "address": "Full address",
  "zip": "94601",
  "hours": "Mon-Fri: 9am-5pm",
  "phone": "(510) 123-4567",
  "website": "https://example.com",
  "eligibilityNotes": "Eligibility description",
  "eligibilityTags": ["low_income", "senior"],
  "languagesSupported": ["English", "Spanish"]
}
```

## Resource Service Architecture

The `resourceService.js` module provides a flexible data layer that:
- **Normalizes data** from different sources to a common format
- **Supports multiple sources**: JSON files, REST APIs, and databases
- **Implements caching** (1-hour TTL) to reduce API calls
- **Automatic fallback** to JSON file if primary source fails
- **Category mapping** to handle different naming conventions
- **ZIP code extraction** from various address formats

### Using External APIs

To connect to an external resource API:

1. Set `RESOURCE_DATA_SOURCE=api` in your `.env`
2. Configure `RESOURCE_API_URL` with your API endpoint
3. Set `RESOURCE_API_KEY` if authentication is required
4. The service will automatically normalize the API response format

The service handles common API response structures:
- Direct arrays: `[{resource1}, {resource2}]`
- Wrapped in `resources`: `{resources: [...]}`
- Wrapped in `data`: `{data: [...]}`
- Wrapped in `results`: `{results: [...]}`
- Wrapped in `organizations`: `{organizations: [...]}`

## Demo Notes

- The app is optimized for hackathon demo clarity
- No authentication required
- Default data source is local JSON (no external API dependencies except optional OpenAI)
- Can be configured to use external APIs or databases
- Mock distance calculation for demo purposes
- Simple eligibility matching rules

## License

See LICENSE file for details.
