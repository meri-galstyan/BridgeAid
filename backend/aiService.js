/**
 * AI Service for generating action plans and translations
 * This module is designed to be easily replaceable with mock data
 */

/**
 * Generate a 3-step action plan for a resource
 * If OpenAI API key is available, uses GPT; otherwise returns mock plan
 */
export async function generateActionPlan(resource, userInfo) {
  const preferredLanguage = userInfo.preferredLanguage || 'English';
  
  // Check if OpenAI API key is available
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (openaiApiKey) {
    try {
      return await generateActionPlanWithAI(resource, userInfo, openaiApiKey);
    } catch (error) {
      console.error('AI generation failed, falling back to mock:', error);
      // Fall through to mock generation
    }
  }
  
  // Generate mock action plan
  const plan = generateMockActionPlan(resource);
  
  // Translate if needed
  if (preferredLanguage.toLowerCase() === 'spanish') {
    return translateToSpanish(plan);
  }
  
  return plan;
}

/**
 * Generate action plan using OpenAI API
 */
async function generateActionPlanWithAI(resource, userInfo, apiKey) {
  const prompt = `Generate a simple 3-step action plan for someone to access this resource:
  
Resource: ${resource.name}
Category: ${resource.category}
Phone: ${resource.phone}
Website: ${resource.website}
Hours: ${resource.hours}
Eligibility: ${resource.eligibilityNotes}

User context:
- Age: ${userInfo.ageRange}
- Income: ${userInfo.incomeBracket}
- Household size: ${userInfo.householdSize}

Return ONLY a JSON object with this exact format:
{
  "steps": [
    "Step 1 description (plain language, actionable)",
    "Step 2 description (plain language, actionable)",
    "Step 3 description (plain language, actionable)"
  ]
}

Keep each step to one sentence. Use simple, clear language.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates clear, simple action plans for accessing social services.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const planData = JSON.parse(jsonMatch[0]);
      return {
        steps: planData.steps || []
      };
    }
    
    throw new Error('Invalid response format from AI');
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

/**
 * Generate a mock action plan (fallback when AI is not available)
 */
function generateMockActionPlan(resource) {
  const category = resource.category;
  
  const templates = {
    food: [
      `Call ${resource.phone} during ${resource.hours} to check current availability.`,
      `Visit ${resource.name} at ${resource.address} during their open hours.`,
      `Bring a valid ID and proof of address (if required). No appointment needed for walk-ins.`
    ],
    housing: [
      `Call ${resource.phone} or visit ${resource.website} to learn about application requirements.`,
      `Gather required documents: proof of income, ID, and household information.`,
      `Schedule an appointment or submit your application online or in person.`
    ],
    mental_health: [
      `Call ${resource.phone} to speak with a counselor or schedule an appointment.`,
      `If this is a crisis, call immediately - services are available 24/7.`,
      `Be ready to provide basic information about your situation and insurance status (if applicable).`
    ],
    legal: [
      `Call ${resource.phone} during ${resource.hours} to request an intake appointment.`,
      `Prepare a brief description of your legal issue and any relevant documents.`,
      `Attend your appointment - free legal services are provided based on eligibility.`
    ],
    jobs: [
      `Visit ${resource.name} at ${resource.address} or call ${resource.phone} to learn about programs.`,
      `Complete an intake form and assessment to determine which services fit your needs.`,
      `Attend orientation and training sessions to build skills and connect with employers.`
    ]
  };
  
  const steps = templates[category] || [
    `Contact ${resource.name} at ${resource.phone} during ${resource.hours}.`,
    `Visit their website at ${resource.website} for more information.`,
    `Prepare any required documents and schedule an appointment if needed.`
  ];
  
  return { steps };
}

/**
 * Simple translation to Spanish (mock - in production, use proper translation API)
 */
function translateToSpanish(plan) {
  // Simple mock translation - in production, use OpenAI or Google Translate API
  const translations = {
    'Call': 'Llame',
    'Visit': 'Visite',
    'during': 'durante',
    'to check': 'para verificar',
    'current availability': 'disponibilidad actual',
    'at': 'en',
    'their open hours': 'sus horarios de atención',
    'Bring': 'Traiga',
    'valid ID': 'identificación válida',
    'proof of address': 'comprobante de domicilio',
    'if required': 'si es necesario',
    'No appointment needed': 'No se necesita cita',
    'for walk-ins': 'para visitas sin cita',
    'or': 'o',
    'to learn about': 'para conocer',
    'application requirements': 'requisitos de solicitud',
    'Gather required documents': 'Reúna los documentos requeridos',
    'proof of income': 'comprobante de ingresos',
    'household information': 'información del hogar',
    'Schedule an appointment': 'Programe una cita',
    'submit your application': 'presente su solicitud',
    'online': 'en línea',
    'in person': 'en persona',
    'to speak with': 'para hablar con',
    'a counselor': 'un consejero',
    'schedule an appointment': 'programar una cita',
    'If this is a crisis': 'Si esto es una crisis',
    'call immediately': 'llame inmediatamente',
    'services are available': 'los servicios están disponibles',
    'Be ready to provide': 'Esté preparado para proporcionar',
    'basic information': 'información básica',
    'about your situation': 'sobre su situación',
    'insurance status': 'estado del seguro',
    'if applicable': 'si corresponde',
    'to request an intake appointment': 'para solicitar una cita de admisión',
    'Prepare a brief description': 'Prepare una breve descripción',
    'of your legal issue': 'de su problema legal',
    'any relevant documents': 'cualquier documento relevante',
    'Attend your appointment': 'Asista a su cita',
    'free legal services': 'servicios legales gratuitos',
    'are provided': 'se proporcionan',
    'based on eligibility': 'según la elegibilidad',
    'Complete an intake form': 'Complete un formulario de admisión',
    'and assessment': 'y evaluación',
    'to determine': 'para determinar',
    'which services fit your needs': 'qué servicios se ajustan a sus necesidades',
    'Attend orientation': 'Asista a la orientación',
    'and training sessions': 'y sesiones de capacitación',
    'to build skills': 'para desarrollar habilidades',
    'and connect with employers': 'y conectarse con empleadores',
    'Contact': 'Contacte',
    'for more information': 'para más información',
    'Prepare any required documents': 'Prepare cualquier documento requerido',
    'and schedule an appointment if needed': 'y programe una cita si es necesario'
  };
  
  // Simple word-by-word translation (very basic - in production use proper translation)
  const translatedSteps = plan.steps.map(step => {
    let translated = step;
    // Replace common phrases
    Object.entries(translations).forEach(([en, es]) => {
      translated = translated.replace(new RegExp(en, 'gi'), es);
    });
    return translated;
  });
  
  return { steps: translatedSteps };
}

