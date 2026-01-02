/**
 * Resource Service - Fetches resources from multiple data sources
 * Supports: External APIs, Databases, and JSON fallback
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cache for resources (in-memory, can be replaced with Redis in production)
let resourceCache = {
  data: null,
  timestamp: null,
  ttl: 3600000 // 1 hour in milliseconds
};

/**
 * Normalize resource data from different sources to a common format
 */
function normalizeResource(resource, source = 'json') {
  // If already in our format, return as-is
  if (resource.id && resource.name && resource.category) {
    return resource;
  }

  // Map common API formats to our format
  // This handles various API response structures
  return {
    id: resource.id || resource.resource_id || resource.organization_id || Math.random(),
    name: resource.name || resource.organization_name || resource.title || 'Unknown Resource',
    category: mapCategory(resource.category || resource.service_category || resource.type),
    address: resource.address || resource.location?.address || resource.physical_address || '',
    zip: extractZip(resource.zip || resource.postal_code || resource.location?.postal_code || resource.address || ''),
    hours: resource.hours || resource.hours_of_operation || resource.schedule || 'Contact for hours',
    phone: resource.phone || resource.phone_number || resource.contact_phone || '',
    website: resource.website || resource.url || resource.web_url || '',
    eligibilityNotes: resource.eligibilityNotes || resource.eligibility_notes || resource.eligibility || resource.description || '',
    eligibilityTags: resource.eligibilityTags || resource.eligibility_tags || resource.tags || [],
    languagesSupported: resource.languagesSupported || resource.languages_supported || resource.languages || ['English']
  };
}

/**
 * Map various category names to our standard categories
 */
function mapCategory(category) {
  if (!category) return 'other';
  
  const categoryLower = category.toLowerCase();
  
  // Map common variations to our categories
  const categoryMap = {
    'food': 'food',
    'food assistance': 'food',
    'food bank': 'food',
    'meal': 'food',
    'nutrition': 'food',
    'housing': 'housing',
    'shelter': 'housing',
    'rental assistance': 'housing',
    'mental health': 'mental_health',
    'mental healthcare': 'mental_health',
    'counseling': 'mental_health',
    'therapy': 'mental_health',
    'legal': 'legal',
    'legal aid': 'legal',
    'legal services': 'legal',
    'jobs': 'jobs',
    'employment': 'jobs',
    'job training': 'jobs',
    'workforce': 'jobs',
    'career': 'jobs'
  };

  return categoryMap[categoryLower] || categoryLower;
}

/**
 * Extract ZIP code from address string
 */
function extractZip(text) {
  if (!text) return '';
  
  // Try to find 5-digit ZIP code
  const zipMatch = text.match(/\b\d{5}\b/);
  if (zipMatch) {
    return zipMatch[0];
  }
  
  // Try to find ZIP+4 format
  const zipPlus4Match = text.match(/\b\d{5}-\d{4}\b/);
  if (zipPlus4Match) {
    return zipPlus4Match[0].substring(0, 5);
  }
  
  return '';
}

/**
 * Load resources from JSON file (fallback)
 */
function loadFromJSON() {
  try {
    const resourcesData = readFileSync(join(__dirname, 'resources.json'), 'utf8');
    const resources = JSON.parse(resourcesData);
    console.log(`Loaded ${resources.length} resources from JSON file`);
    return resources.map(r => normalizeResource(r, 'json'));
  } catch (error) {
    console.error('Error loading resources from JSON:', error);
    return [];
  }
}

/**
 * Fetch resources from external API
 */
async function fetchFromAPI(apiUrl, apiKey = null) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
      // Some APIs use different auth formats
      if (apiKey.includes(':')) {
        // API key format might be different
        headers['X-API-Key'] = apiKey;
      }
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle different API response structures
    let resources = [];
    if (Array.isArray(data)) {
      resources = data;
    } else if (data.resources) {
      resources = data.resources;
    } else if (data.data) {
      resources = data.data;
    } else if (data.results) {
      resources = data.results;
    } else if (data.organizations) {
      resources = data.organizations;
    } else {
      console.warn('Unexpected API response structure:', Object.keys(data));
      resources = [];
    }

    console.log(`Fetched ${resources.length} resources from API`);
    return resources.map(r => normalizeResource(r, 'api'));
  } catch (error) {
    console.error('Error fetching from API:', error.message);
    throw error;
  }
}

/**
 * Fetch resources from database (placeholder for future implementation)
 */
async function fetchFromDatabase(dbConfig) {
  // This is a placeholder for database integration
  // You can implement PostgreSQL, MongoDB, etc. here
  console.log('Database integration not yet implemented');
  return [];
}

/**
 * Get all resources from configured sources
 * Priority: API > Database > JSON fallback
 */
export async function getAllResources() {
  // Check cache first
  if (resourceCache.data && resourceCache.timestamp) {
    const age = Date.now() - resourceCache.timestamp;
    if (age < resourceCache.ttl) {
      console.log(`Using cached resources (${Math.floor(age / 1000)}s old)`);
      return resourceCache.data;
    }
  }

  let resources = [];
  const dataSource = process.env.RESOURCE_DATA_SOURCE || 'json';

  try {
    switch (dataSource.toLowerCase()) {
      case 'api':
        const apiUrl = process.env.RESOURCE_API_URL;
        const apiKey = process.env.RESOURCE_API_KEY;
        
        if (!apiUrl) {
          throw new Error('RESOURCE_API_URL not configured');
        }

        resources = await fetchFromAPI(apiUrl, apiKey);
        break;

      case 'database':
        const dbConfig = {
          // Add your database config here
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD
        };
        resources = await fetchFromDatabase(dbConfig);
        break;

      case 'json':
      default:
        resources = loadFromJSON();
        break;
    }

    // If API/Database failed or returned empty, fall back to JSON
    if (resources.length === 0 && dataSource !== 'json') {
      console.log('No resources from primary source, falling back to JSON');
      resources = loadFromJSON();
    }

    // Update cache
    resourceCache.data = resources;
    resourceCache.timestamp = Date.now();

    console.log(`Total resources available: ${resources.length}`);
    return resources;

  } catch (error) {
    console.error('Error loading resources:', error);
    
    // Always fall back to JSON on error
    if (dataSource !== 'json') {
      console.log('Falling back to JSON file due to error');
      resources = loadFromJSON();
      resourceCache.data = resources;
      resourceCache.timestamp = Date.now();
      return resources;
    }
    
    throw error;
  }
}

/**
 * Refresh the resource cache
 */
export async function refreshResources() {
  resourceCache.data = null;
  resourceCache.timestamp = null;
  return await getAllResources();
}

/**
 * Get resource count
 */
export async function getResourceCount() {
  const resources = await getAllResources();
  return resources.length;
}

