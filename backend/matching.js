/**
 * Matching logic for resources based on user criteria
 */

/**
 * Calculate approximate distance between two ZIP codes
 * This is a simplified mock calculation for demo purposes
 */
function calculateDistance(zip1, zip2) {
  // Simple mock: if ZIP codes match, distance is 0
  // Otherwise, return a random distance between 2-15 miles
  if (zip1 === zip2) {
    return 0;
  }
  // Extract first 3 digits for rough proximity
  const zip1Prefix = zip1.substring(0, 3);
  const zip2Prefix = zip2.substring(0, 3);
  
  if (zip1Prefix === zip2Prefix) {
    return Math.floor(Math.random() * 5) + 1; // 1-5 miles
  }
  return Math.floor(Math.random() * 10) + 5; // 5-15 miles
}

/**
 * Check if resource matches eligibility based on user info
 */
function matchesEligibility(resource, userInfo) {
  // If no eligibility tags, resource is open to all
  if (!resource.eligibilityTags || resource.eligibilityTags.length === 0) {
    return true;
  }

  // Basic eligibility matching rules
  const userTags = [];
  
  // Determine user tags based on their info
  if (userInfo.incomeBracket === 'low' || userInfo.incomeBracket === 'very_low') {
    userTags.push('low_income');
  }
  
  if (userInfo.ageRange === '65+') {
    userTags.push('senior');
  }
  
  if (userInfo.householdSize > 1) {
    // Assume households with multiple people might have children
    // In a real app, we'd ask about children explicitly
    userTags.push('parent');
  }

  // Check if any user tags match resource eligibility tags
  // If resource has tags, at least one should match OR resource should be open to all
  if (resource.eligibilityTags.length > 0 && userTags.length > 0) {
    return resource.eligibilityTags.some(tag => userTags.includes(tag));
  }

  // If resource has no specific tags or user has no tags, allow match
  return true;
}

/**
 * Check if resource supports user's preferred language
 */
function supportsLanguage(resource, preferredLanguage) {
  if (!resource.languagesSupported || resource.languagesSupported.length === 0) {
    return true; // Assume English if not specified
  }
  
  return resource.languagesSupported.some(
    lang => lang.toLowerCase() === preferredLanguage.toLowerCase()
  );
}

/**
 * Match resources based on user criteria
 * Returns top 3-5 matches sorted by relevance
 */
export function matchResources(resources, userInfo) {
  const {
    zip,
    primaryNeed,
    preferredLanguage = 'English'
  } = userInfo;

  // Step 1: Filter by category
  let matches = resources.filter(resource => 
    resource.category === primaryNeed
  );

  // Step 2: Filter by eligibility
  matches = matches.filter(resource => 
    matchesEligibility(resource, userInfo)
  );

  // Step 3: Filter by language support (prefer matches, but don't exclude)
  const languageMatches = matches.filter(resource =>
    supportsLanguage(resource, preferredLanguage)
  );
  
  // If we have language matches, prefer those; otherwise use all matches
  const prioritizedMatches = languageMatches.length > 0
    ? languageMatches
    : matches;

  // Step 4: Calculate distance and sort
  const matchesWithDistance = prioritizedMatches.map(resource => ({
    ...resource,
    distance: calculateDistance(zip, resource.zip)
  }));

  // Sort by distance (closer first), then by name
  matchesWithDistance.sort((a, b) => {
    if (a.distance !== b.distance) {
      return a.distance - b.distance;
    }
    return a.name.localeCompare(b.name);
  });

  // Return top 3-5 matches
  return matchesWithDistance.slice(0, 5);
}

