import React, { useState } from 'react';
import './App.css';
import OnboardingForm from './components/OnboardingForm';
import ResultsPage from './components/ResultsPage';

export interface UserInfo {
  zip: string;
  ageRange: string;
  incomeBracket: string;
  householdSize: number;
  primaryNeed: string;
  preferredLanguage: string;
}

export interface Resource {
  id: number;
  name: string;
  category: string;
  address: string;
  zip: string;
  hours: string;
  phone: string;
  website: string;
  eligibilityNotes: string;
  eligibilityTags: string[];
  languagesSupported: string[];
  distance: number;
  actionPlan?: {
    steps: string[];
  };
}

function App() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (info: UserInfo) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3001/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(info),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }

      const data = await response.json();
      setResources(data.matches || []);
      setUserInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUserInfo(null);
    setResources([]);
    setError(null);
  };

  if (userInfo && resources.length > 0) {
    return (
      <ResultsPage
        resources={resources}
        userInfo={userInfo}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="App">
      <OnboardingForm
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
    </div>
  );
}

export default App;

