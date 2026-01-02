import React from 'react';
import { UserInfo, Resource } from '../App';

interface ResultsPageProps {
  resources: Resource[];
  userInfo: UserInfo;
  onReset: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ resources, userInfo, onReset }) => {
  const formatDistance = (distance: number): string => {
    if (distance === 0) {
      return 'Same ZIP code';
    }
    return `${distance} mile${distance !== 1 ? 's' : ''} away`;
  };

  const formatCategory = (category: string): string => {
    const categoryMap: { [key: string]: string } = {
      food: 'Food Assistance',
      housing: 'Housing Assistance',
      mental_health: 'Mental Health Services',
      legal: 'Legal Aid',
      jobs: 'Job Training & Employment',
    };
    return categoryMap[category] || category;
  };

  return (
    <div className="App">
      <div className="container">
        <div className="results-header">
          <h2>Your Matched Resources</h2>
          <p className="results-count">
            Found {resources.length} resource{resources.length !== 1 ? 's' : ''} for {formatCategory(userInfo.primaryNeed)}
          </p>
        </div>

        {resources.map((resource) => (
          <div key={resource.id} className="resource-card">
            <h3 className="resource-name">
              {resource.name}
              <span className="distance-badge">{formatDistance(resource.distance)}</span>
            </h3>

            <div className="resource-info">
              <div className="resource-info-item">
                <span className="resource-info-label">Category:</span>
                <span className="resource-info-value">{formatCategory(resource.category)}</span>
              </div>

              <div className="resource-info-item">
                <span className="resource-info-label">Address:</span>
                <span className="resource-info-value">{resource.address}</span>
              </div>

              <div className="resource-info-item">
                <span className="resource-info-label">Hours:</span>
                <span className="resource-info-value">{resource.hours}</span>
              </div>

              <div className="resource-info-item">
                <span className="resource-info-label">Phone:</span>
                <span className="resource-info-value">
                  <a href={`tel:${resource.phone}`}>{resource.phone}</a>
                </span>
              </div>

              {resource.website && (
                <div className="resource-info-item">
                  <span className="resource-info-label">Website:</span>
                  <span className="resource-info-value">
                    <a href={resource.website} target="_blank" rel="noopener noreferrer">
                      {resource.website}
                    </a>
                  </span>
                </div>
              )}
            </div>

            <div className="eligibility-section">
              <div className="eligibility-title">Eligibility:</div>
              <div>{resource.eligibilityNotes}</div>
            </div>

            {resource.actionPlan && resource.actionPlan.steps.length > 0 && (
              <div className="action-plan">
                <div className="action-plan-title">Your Action Plan</div>
                <ol className="action-plan-steps">
                  {resource.actionPlan.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ))}

        <button className="secondary" onClick={onReset}>
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;

