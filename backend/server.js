import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { matchResources } from './matching.js';
import { generateActionPlan } from './aiService.js';
import { getAllResources, refreshResources, getResourceCount } from './resourceService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize resources (will be loaded on first request or via /health)
let resources = [];
let resourcesInitialized = false;

// Initialize resources on startup
async function initializeResources() {
  try {
    resources = await getAllResources();
    resourcesInitialized = true;
    console.log(`Initialized with ${resources.length} resources`);
  } catch (error) {
    console.error('Error initializing resources:', error);
    // Don't exit - allow server to start and try again on requests
  }
}

// Start initialization (don't await - let server start)
initializeResources();

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    if (!resourcesInitialized) {
      await initializeResources();
    }
    const count = await getResourceCount();
    res.json({ 
      status: 'ok', 
      resourcesCount: count,
      dataSource: process.env.RESOURCE_DATA_SOURCE || 'json',
      cacheAge: resources.length > 0 ? 'active' : 'none'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      error: error.message 
    });
  }
});

// Refresh resources endpoint (useful for updating cache)
app.post('/refresh-resources', async (req, res) => {
  try {
    resources = await refreshResources();
    resourcesInitialized = true;
    res.json({ 
      status: 'success', 
      resourcesCount: resources.length,
      message: 'Resources refreshed successfully'
    });
  } catch (error) {
    console.error('Error refreshing resources:', error);
    res.status(500).json({ 
      status: 'error', 
      error: error.message 
    });
  }
});

// Match resources endpoint
app.post('/match', async (req, res) => {
  try {
    const userInfo = req.body;
    
    // Validate required fields
    if (!userInfo.zip || !userInfo.primaryNeed) {
      return res.status(400).json({ 
        error: 'Missing required fields: zip and primaryNeed are required' 
      });
    }

    // Ensure resources are loaded
    if (!resourcesInitialized || resources.length === 0) {
      await initializeResources();
    }

    // Get fresh resources (will use cache if available)
    const currentResources = await getAllResources();

    // Match resources based on user criteria
    const matchedResources = matchResources(currentResources, userInfo);
    
    // Generate action plans for each matched resource
    const resourcesWithPlans = await Promise.all(
      matchedResources.map(async (resource) => {
        const actionPlan = await generateActionPlan(resource, userInfo);
        return {
          ...resource,
          actionPlan
        };
      })
    );

    res.json({
      matches: resourcesWithPlans,
      count: resourcesWithPlans.length
    });
  } catch (error) {
    console.error('Error matching resources:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Bridge Aid backend server running on http://localhost:${PORT}`);
});

