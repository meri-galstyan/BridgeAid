import React, { useState } from 'react';
import { UserInfo } from '../App';

interface OnboardingFormProps {
  onSubmit: (userInfo: UserInfo) => void;
  loading: boolean;
  error: string | null;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState<Omit<UserInfo, 'householdSize'> & { householdSize: string }>({
    zip: '',
    ageRange: '',
    incomeBracket: '',
    householdSize: '1',
    primaryNeed: '',
    preferredLanguage: 'English',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      householdSize: parseInt(formData.householdSize, 10),
    });
  };

  return (
    <div className="container">
      <h1>Bridge Aid</h1>
      <p style={{ textAlign: 'center', marginBottom: '30px', color: '#7f8c8d', fontSize: '1.1rem' }}>
        Answer a few questions to connect with relevant local services.
      </p>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="zip">ZIP Code *</label>
          <input
            type="text"
            id="zip"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            required
            pattern="[0-9]{5}"
            placeholder="94601"
            maxLength={5}
          />
        </div>

        <div className="form-group">
          <label htmlFor="ageRange">Age Range *</label>
          <select
            id="ageRange"
            name="ageRange"
            value={formData.ageRange}
            onChange={handleChange}
            required
          >
            <option value="">Select age range</option>
            <option value="18-24">18-24</option>
            <option value="25-34">25-34</option>
            <option value="35-44">35-44</option>
            <option value="45-54">45-54</option>
            <option value="55-64">55-64</option>
            <option value="65+">65+</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="incomeBracket">Income Bracket *</label>
          <select
            id="incomeBracket"
            name="incomeBracket"
            value={formData.incomeBracket}
            onChange={handleChange}
            required
          >
            <option value="">Select income bracket</option>
            <option value="very_low">&lt; $15,000</option>
            <option value="low">$15,000 – $30,000</option>
            <option value="moderate">$30,000 – $60,000</option>
            <option value="above_moderate">$60,000+</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="householdSize">Household Size *</label>
          <input
            type="number"
            id="householdSize"
            name="householdSize"
            value={formData.householdSize}
            onChange={handleChange}
            required
            min="1"
            max="20"
          />
        </div>

        <div className="form-group">
          <label htmlFor="primaryNeed">Primary Need *</label>
          <select
            id="primaryNeed"
            name="primaryNeed"
            value={formData.primaryNeed}
            onChange={handleChange}
            required
          >
            <option value="">Select primary need</option>
            <option value="food">Food Assistance</option>
            <option value="housing">Housing Assistance</option>
            <option value="mental_health">Mental Health Services</option>
            <option value="legal">Legal Aid</option>
            <option value="jobs">Job Training & Employment</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="preferredLanguage">Preferred Language *</label>
          <select
            id="preferredLanguage"
            name="preferredLanguage"
            value={formData.preferredLanguage}
            onChange={handleChange}
            required
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish / Español</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Finding Resources...' : 'Find Resources'}
        </button>
      </form>
    </div>
  );
};

export default OnboardingForm;

