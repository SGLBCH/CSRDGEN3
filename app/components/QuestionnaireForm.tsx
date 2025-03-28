'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Questionnaire, Question, Section, ResponseMap } from '@/lib/types'
import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

// Add question explanations mapping
// This maps question IDs to their explanatory text
const questionExplanations: {[key: string]: string} = {
  // Company Profile & General Sustainability Context
  "company-name": "Your company's full registered legal name as it appears on official documents. This should match what's in your business registration.",
  "year-of-establishment": "The year when your company was officially founded or registered. For companies that have merged or been acquired, use the date of the original founding.",
  "employee-count": "Total number of employees (full-time equivalent) at the time of reporting. Include all permanent and fixed-term contract employees but exclude temporary workers or consultants.",
  "industry-sector": "The primary industry category that best describes your company's main business activities. If you operate across multiple sectors, list the predominant one.",
  "annual-turnover": "Your company's total revenue from sales of goods and services for the most recent complete fiscal year, excluding VAT and other indirect taxes.",
  "operational-geography": "Indicate the countries or regions where your company has physical operations, sells products, or provides services. Focus on regions representing significant portions of your business.",
  "sustainability-policy": "A formal document that outlines your company's approach to managing environmental and social impacts. This is typically approved by senior management and guides sustainability efforts.",
  "current-performance-metrics": "Describe the methods, metrics, or key performance indicators (KPIs) you use to track and evaluate your company's sustainability initiatives and their effectiveness.",
  "materiality-assessment": "A materiality assessment identifies and prioritizes the environmental, social, and governance issues that are most relevant to your business and stakeholders. It forms the foundation of effective sustainability reporting.",
  "sustainability-strategy": "Outline your company's overall approach to addressing environmental and social impacts. Include key focus areas, long-term goals, and how sustainability integrates with your business strategy.",
  
  // Environmental Impact – Emissions and Resource Use
  "scope1-emissions": "Scope 1 emissions are direct greenhouse gas emissions from sources owned or controlled by your company, such as fuel combustion in boilers, furnaces, vehicles, and chemical production.",
  "scope2-emissions": "Scope 2 emissions are indirect GHG emissions from purchased electricity, steam, heating, and cooling consumed by your company but generated elsewhere.",
  "scope3-emissions": "Scope 3 emissions are all other indirect emissions that occur in your company's value chain, including both upstream and downstream emissions (e.g., purchased goods, transportation, waste disposal).",
  "total-energy-consumption": "The total amount of energy your company consumes from all sources (electricity, fuel, etc.) expressed in kilowatt-hours. This helps establish your overall energy footprint.",
  "water-usage": "The total volume of water withdrawn by your company for any use, including production processes, cooling, cleaning, and domestic use within your facilities.",
  "renewable-energy-percentage": "The proportion of your energy that comes from renewable sources such as solar, wind, hydro, or biomass. This demonstrates your commitment to reducing fossil fuel dependence.",
  "waste-generated": "The total weight of all waste materials your company produces in a year, including solid waste, hazardous materials, and non-hazardous industrial waste.",
  "waste-recycling-rate": "The proportion of your total waste that is recycled or reused rather than sent to landfill or incineration. This reflects your company's circular economy practices.",
  "raw-material-consumption": "The total weight of all raw materials used in your production processes. This helps assess resource efficiency and dependency on natural resources.",
  "emissions-intensity": "A ratio that expresses your carbon emissions relative to a business metric (like production volume), allowing for meaningful comparisons over time and across industry peers.",
  
  // Energy Consumption & Efficiency
  "annual-electricity-consumption": "The total amount of electrical energy your company uses annually. This is usually measured by your electricity meters and shown on utility bills.",
  "annual-fuel-consumption": "The total volume of fuels (e.g., gasoline, diesel, natural gas) consumed by your company for vehicles, heating, or industrial processes.",
  "energy-cost-per-unit": "The amount spent on energy (all types) divided by your production volume. This efficiency metric helps identify potential for cost savings.",
  "energy-efficiency-rating": "An official energy performance certification for your buildings or equipment. In the EU, these typically range from A (most efficient) to G (least efficient).",
  "energy-saving-measures": "Any initiatives specifically designed to reduce energy consumption, such as LED lighting, improved insulation, energy-efficient equipment, or process optimization.",
  "energy-consumption-reduction": "The year-over-year decrease in total energy usage, expressed as a percentage. This shows progress in your energy efficiency efforts.",
  "renewable-installation-capacity": "The maximum power output of any on-site renewable energy systems such as solar panels or wind turbines that your company has installed.",
  "estimated-energy-savings": "The financial benefit realized from energy-saving initiatives implemented by your company, calculated as the difference in energy costs before and after implementation.",
  "energy-monitoring-method": "The tools, systems, or processes used to track and analyze energy consumption patterns, such as smart meters, energy management software, or manual recording.",
  "planned-energy-improvements": "Future projects or initiatives that your company intends to implement to further reduce energy consumption or improve energy management.",
  
  // Waste Management & Circular Economy Initiatives
  "annual-waste-total": "The total weight of all waste streams produced by your company's operations annually, including production waste, packaging, office waste, and any other discarded materials.",
  "waste-recycling-percentage": "The proportion of your total waste that is sent for recycling rather than disposal, representing your company's commitment to resource recovery.",
  "waste-reduction-strategy": "Specific initiatives designed to minimize waste at source, such as redesigning products or processes, implementing lean manufacturing, or reducing packaging.",
  "material-reuse": "Whether your company incorporates previously used materials back into your manufacturing processes, creating closed-loop systems that minimize waste.",
  "landfill-diversion-rate": "The proportion of waste that avoids landfill disposal through recycling, composting, energy recovery, or other alternative treatment methods.",
  "waste-repurposing": "The weight of waste materials that are sold as by-products or repurposed for other uses, turning potential waste into valuable resources.",
  "circular-economy-investment": "The financial resources dedicated to projects that promote circular economy principles, such as product redesign, take-back programs, or waste-to-resource systems.",
  "packaging-reduction-strategy": "Your company's approach to minimizing packaging materials through redesign, material selection, reusable systems, or other innovative solutions.",
  "life-cycle-analysis": "A systematic assessment of the environmental impacts of your products throughout their entire life cycle, from raw material extraction to disposal.",
  "circular-economy-kpi": "The primary metric used to track progress in implementing circular economy principles, such as material circularity index, recycling rates, or resource productivity.",
  
  // Social Impact & Human Rights
  "total-employee-count": "The total headcount of people employed by your company, including full-time, part-time, and contract staff, but excluding external consultants or temporary workers.",
  "gender-diversity-percentage": "The proportion of your workforce that identifies as female, calculated by dividing the number of female employees by the total number of employees and multiplying by 100.",
  "sustainability-training-hours": "The average number of hours each employee spends in training related to sustainability topics, including environmental awareness, social responsibility, and ethics.",
  "employee-turnover-rate": "The rate at which employees leave your company voluntarily or involuntarily, calculated as the number of departures divided by the average number of employees during the period.",
  "fair-labor-practices": "Whether your company adheres to principles of fair employment, including appropriate wages, working hours, non-discrimination, freedom of association, and safe working conditions.",
  "leadership-diversity": "The proportion of management and executive roles occupied by individuals from groups traditionally underrepresented in leadership, including women and ethnic minorities.",
  "human-rights-policy": "Your formal approach to ensuring respect for human rights throughout your operations and supply chain, typically aligned with international standards like the UN Guiding Principles.",
  "grievance-mechanisms": "Whether you have established formal channels for employees, community members, or other stakeholders to raise concerns about potential human rights or ethical violations.",
  "community-engagement": "Programs or activities your company undertakes to positively impact local communities, such as charitable donations, volunteer programs, or community development projects.",
  "health-safety-incident-rate": "A measure of workplace safety calculated as the number of recordable incidents per 100 employees, indicating the effectiveness of your health and safety management.",
  
  // Governance & Organizational Policies
  "sustainability-committee": "Whether you have established a formal group responsible for overseeing sustainability strategy, implementation, and performance monitoring.",
  "board-sustainability-frequency": "How often sustainability matters are included as agenda items in your company's board meetings, indicating the level of top-level attention to these issues.",
  "sustainability-in-strategy": "The approach used to incorporate sustainability considerations into your business planning, decision-making processes, and long-term strategic objectives.",
  "whistleblower-policy": "Whether your company has established protected channels for employees to report unethical, illegal, or inappropriate behavior without fear of retaliation.",
  "board-sustainability-expertise": "The proportion of board members with specific knowledge, experience, or qualifications in environmental, social, or governance (ESG) matters.",
  "anti-corruption-measures": "Whether you have established policies, procedures, and controls designed to prevent, detect, and address corrupt practices within your organization.",
  "external-assurance": "Whether an independent third party verifies the accuracy and reliability of your sustainability reporting, similar to financial statement auditing.",
  "executive-remuneration-link": "Whether compensation for senior leaders includes components tied to achieving sustainability targets, creating financial incentives for ESG performance.",
  "sustainability-reporting-frequency": "The frequency with which your company publicly discloses its sustainability performance, strategies, and impacts to stakeholders.",
  "stakeholder-engagement-process": "How you identify, interact with, and incorporate feedback from key stakeholders (employees, customers, investors, communities) into sustainability decision-making.",
  
  // Supply Chain Sustainability
  "supplier-sustainability-percentage": "The proportion of your supply chain partners that comply with your defined environmental, social, and ethical standards for responsible business conduct.",
  "supplier-code-of-conduct": "Whether you have established formal expectations and requirements for suppliers regarding environmental practices, labor conditions, human rights, and business ethics.",
  "supplier-audit-frequency": "The frequency with which you assess suppliers' compliance with your sustainability requirements through formal evaluation processes.",
  "local-suppliers-percentage": "The proportion of your supply chain partners located within a defined proximity to your operations, supporting local economies and potentially reducing transportation impacts.",
  "supplier-data-collection": "The methods, tools, and processes used to gather information about suppliers' environmental and social performance, such as questionnaires, audits, or reporting systems.",
  "supply-chain-emissions-calculation": "The approach used to estimate greenhouse gas emissions associated with your upstream supply chain activities, including data sources and calculation methodologies.",
  "number-of-audited-suppliers": "The number of supply chain partners that have undergone formal assessment to identify potential environmental, social, or governance risks.",
  "supply-chain-transparency-strategy": "Initiatives to increase visibility into supply chain operations, such as traceability systems, supplier mapping, or disclosure requirements.",
  "supply-chain-emissions-reduction": "The year-over-year decrease in greenhouse gas emissions from your supply chain, indicating progress in collaborative emission reduction efforts.",
  "supply-chain-incident-reporting": "The system established for suppliers and other stakeholders to report sustainability-related concerns, violations, or incidents within your supply chain.",
  
  // Climate Risks & Opportunities
  "climate-risk-identification": "The specific threats to your business from climate change that you have recognized, such as physical risks (e.g., flooding) or transition risks (e.g., policy changes).",
  "financial-impact-climate-risk": "The potential monetary cost to your business from identified climate risks, based on scenario analysis and financial modeling.",
  "climate-risk-mitigation-plan": "Whether you have developed a formal strategy to address and reduce the impacts of identified climate-related risks on your business.",
  "climate-risk-assessment-frequency": "How often you review and revise your analysis of climate-related risks and opportunities to ensure continued relevance amid changing conditions.",
  "revenue-at-risk-climate": "The proportion of your business income that could be negatively affected by climate-related impacts, based on your risk analysis.",
  "low-carbon-opportunities": "Potential business benefits from the shift to a cleaner economy, such as new products, markets, cost savings, or competitive advantages.",
  "climate-adaptation-investment": "Financial resources allocated to initiatives that help your business prepare for and adjust to climate change impacts.",
  "scenario-analysis": "Whether you have evaluated how different climate futures might affect your business, typically including scenarios aligned with different warming pathways.",
  "external-climate-tools": "Whether you employ specialized third-party methodologies, software, or services to analyze and understand your exposure to climate-related risks.",
  "climate-risk-calculation-method": "The specific approach, metrics, and methodology used to quantify your vulnerability to climate-related impacts.",
  
  // Biodiversity & Natural Capital
  "biodiversity-impact": "How your company's activities affect plant and animal species, ecosystems, and habitats in areas where you operate.",
  "ecosystem-preservation-measures": "Actions your company takes to protect or enhance natural habitats and species diversity in the locations where you have facilities.",
  "operations-in-sensitive-areas": "The proportion of your business activities located in or near protected areas, biodiversity hotspots, or other environmentally vulnerable regions.",
  "natural-capital-dependency": "How your business relies on natural resources and ecosystem services for its operations and value creation.",
  "biodiversity-investment": "Financial resources dedicated to initiatives specifically aimed at protecting or enhancing biodiversity, such as habitat restoration or species conservation.",
  "biodiversity-initiatives": "Whether your company has implemented programs designed to minimize harm to ecosystems and wildlife from your operations.",
  "land-use-footprint": "The total area of land occupied by your company's facilities, operations, and activities, indicating your spatial impact on the environment.",
  "natural-capital-assessment": "Whether you have evaluated your company's dependencies and impacts on natural resources and ecosystem services in quantitative terms.",
  "sustainable-materials-percentage": "The proportion of your product portfolio that incorporates materials with recognized sustainability certifications (e.g., FSC, MSC, organic).",
  "biodiversity-targets": "Specific, measurable goals your company has set to reduce negative impacts on biodiversity or contribute to ecosystem restoration.",
  
  // Reporting, Data Collection & Calculation Methodologies
  "data-collection-methods": "The specific approaches, systems, and tools used to gather information about your sustainability performance, such as surveys, meters, or management software.",
  "digital-tools-usage": "Whether your company employs specialized software, online platforms, or automated systems to collect, manage, and analyze sustainability information.",
  "data-update-frequency": "How often you refresh your sustainability performance information, indicating the timeliness and currency of your reporting.",
  "emissions-intensity-calculation": "The specific formula and approach used to calculate your greenhouse gas emissions relative to a business metric such as revenue or production volume.",
  "data-verification-process": "The processes used to ensure the accuracy and reliability of your sustainability information, such as internal reviews, cross-checks, or third-party verification.",
  "reporting-framework": "The global standard or guideline that your sustainability reporting follows, such as GRI, SASB, or TCFD, providing consistency and comparability.",
  "historical-data-availability": "Whether you maintain records of past sustainability performance, allowing for analysis of trends and progress over time.",
  "data-quality-assurance": "The specific controls, procedures, and checks implemented to maintain accuracy, completeness, and reliability of sustainability information.",
  "staff-training-hours": "The time invested in educating employees about proper methods for gathering, recording, and reporting sustainability performance information.",
  "future-reporting-improvements": "Future enhancements to your sustainability data collection, analysis, and reporting processes to increase accuracy, efficiency, or comprehensiveness."
};

interface QuestionnaireFormProps {
  reportId: string
  onSave?: (success: boolean) => void
}

// Create an extended section interface to handle both formats
interface ExtendedSection extends Omit<Section, 'questions'> {
  section?: string; // For alternative format where section is used instead of title
  description?: string;
  questions?: Question[]; // Make questions optional
}

// Create an extended question interface to handle different formats
interface ExtendedQuestion extends Question {
  question?: string; // Alternative to 'text' in some formats
  question_id?: string;
  question_text?: string;
  question_type?: string;
}

// Source format interfaces
interface SourceSection {
  section: string;
  description?: string;
  questions: SourceQuestion[];
}

interface SourceQuestion {
  question_id: string;
  question_text: string;
  question_type: string;
  required: boolean;
  options: string[] | null;
  unit?: string | null;
}

// Make the component use forwardRef to expose methods to parent components
const QuestionnaireForm = forwardRef<
  { saveResponses: () => Promise<void> },
  QuestionnaireFormProps
>(function QuestionnaireForm({ reportId, onSave }, ref) {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const [responses, setResponses] = useState<ResponseMap>({})
  const [activeSection, setActiveSection] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [questionnaireDebug, setQuestionnaireDebug] = useState<any>(null)

  // Fetch questionnaire data
  useEffect(() => {
    const fetchQuestionnaire = async () => {
      setIsLoading(true)
      setError('')
      
      try {
        const response = await fetch('/api/questionnaires')
        
        if (!response.ok) {
          throw new Error(`Error fetching questionnaire: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Questionnaire raw data:', data)
        
        if (!data || data.length === 0) {
          setError('No questionnaires found in the database')
          setIsLoading(false)
          return
        }
        
        // Always use the first questionnaire
        let questionnaireData = data[0]
        // Store raw data for debugging
        setQuestionnaireDebug(questionnaireData)
        console.log('Using questionnaire:', questionnaireData)
        console.log('Questions property:', questionnaireData.questions)
        console.log('Sections property:', questionnaireData.sections)
        
        // Deep log of structure
        if (questionnaireData.questions) {
          console.log('Questions object keys:', Object.keys(questionnaireData.questions))
          if (questionnaireData.questions.sections) {
            console.log('Found questions.sections:', questionnaireData.questions.sections)
            console.log('First section in questions.sections:', questionnaireData.questions.sections[0])
          }
        }
        
        // SPECIAL HANDLING FOR CSRD SME QUESTIONNAIRE FORMAT
        // This format has:
        // 1. A 'questions' object containing a 'sections' array where each section has:
        //    - A 'section' property (not 'title')
        //    - Questions with 'question_id', 'question_text', etc.
        // 2. A 'sections' property that's just an array of section names
        
        // Create restructured questionnaire
        const restructuredQuestionnaire = {
          ...questionnaireData,
          sections: []
        };
        
        // Parse sections if it's a string (happens when stored as JSONB in Postgres)
        let parsedSections = null;
        if (questionnaireData.sections && typeof questionnaireData.sections === 'string') {
          try {
            parsedSections = JSON.parse(questionnaireData.sections);
            console.log('Parsed sections string:', parsedSections);
          } catch (e) {
            console.error('Error parsing sections JSON string:', e);
          }
        } else if (questionnaireData.sections && typeof questionnaireData.sections === 'object') {
          // If it's already an object, use directly
          parsedSections = questionnaireData.sections;
          console.log('Sections is already an object:', parsedSections);
        }
        
        // Try to use questions.sections array if exists (primary approach)
        if (questionnaireData.questions && 
            questionnaireData.questions.sections && 
            Array.isArray(questionnaireData.questions.sections)) {
            
          console.log('Restructuring from questions.sections format');
          
          // Map the sections from the questions.sections format to the expected format
          restructuredQuestionnaire.sections = questionnaireData.questions.sections.map((section: SourceSection, index: number) => {
            return {
              id: `section-${index}`,
              title: section.section || `Section ${index + 1}`,
              description: section.description || '',
              questions: (section.questions || []).map((q: SourceQuestion, qIndex: number) => {
                return {
                  id: q.question_id || `question-${qIndex}`,
                  text: q.question_text || '',
                  type: q.question_type || 'text',
                  required: q.required || false,
                  options: q.options || [],
                  unit: q.unit || null
                };
              })
            };
          });
        } 
        // If the above didn't work, try with the parsed sections if available
        else if (parsedSections) {
          console.log('Using parsed sections format');
          
          // Check if parsedSections has a nested sections array
          if (parsedSections.sections && Array.isArray(parsedSections.sections)) {
            restructuredQuestionnaire.sections = parsedSections.sections.map((sectionName: string, index: number) => {
              return {
                id: `section-${index}`,
                title: sectionName,
                questions: [] // No questions directly available in this format
              };
            });
          } 
          // Or if it's directly an array
          else if (Array.isArray(parsedSections)) {
            restructuredQuestionnaire.sections = parsedSections.map((sectionName: string, index: number) => {
              return {
                id: `section-${index}`,
                title: sectionName,
                questions: [] // No questions directly available in this format
              };
            });
          }
        }
        // Last resort - try to derive sections from the questions structure if possible
        else if (questionnaireData.questions && typeof questionnaireData.questions === 'object') {
          console.log('Attempting to derive sections from questions object');
          
          // Check if questions is a nested object with first-level keys that could be section titles
          const keys = Object.keys(questionnaireData.questions);
          if (keys.length > 0 && typeof questionnaireData.questions[keys[0]] === 'object') {
            restructuredQuestionnaire.sections = keys.map((sectionKey, index) => {
              const sectionQuestions = questionnaireData.questions[sectionKey];
              // Check if the section contains an array of questions or is itself an object with question properties
              if (Array.isArray(sectionQuestions)) {
                return {
                  id: `section-${index}`,
                  title: sectionKey,
                  questions: sectionQuestions.map((q: any, qIndex: number) => ({
                    id: q.id || q.question_id || `question-${qIndex}`,
                    text: q.text || q.question_text || '',
                    type: q.type || q.question_type || 'text',
                    required: q.required || false,
                    options: q.options || [],
                    unit: q.unit || null
                  }))
                };
              } else {
                // If not an array, treat the object properties as question fields
                return {
                  id: `section-${index}`,
                  title: sectionKey,
                  questions: [{
                    id: `question-${index}-0`,
                    text: sectionQuestions.text || sectionQuestions.question_text || sectionKey,
                    type: sectionQuestions.type || sectionQuestions.question_type || 'text',
                    required: sectionQuestions.required || false,
                    options: sectionQuestions.options || [],
                    unit: sectionQuestions.unit || null
                  }]
                };
              }
            });
          }
        }
        
        console.log('Restructured questionnaire:', restructuredQuestionnaire);
        console.log('Restructured sections:', restructuredQuestionnaire.sections);
        
        // Final validation
        if (!restructuredQuestionnaire.sections || 
            !Array.isArray(restructuredQuestionnaire.sections) || 
            restructuredQuestionnaire.sections.length === 0) {
          console.error('Unable to create valid sections structure from data:', questionnaireData);
          setError('Could not create a valid questionnaire structure. Please check the database format.');
          setIsLoading(false);
          return;
        }
        
        // Set the restructured questionnaire
        setQuestionnaire(restructuredQuestionnaire);
        
        // Initialize responses for each question
        await fetchResponses(restructuredQuestionnaire, reportId);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching questionnaire:', error);
        setError('Failed to load questionnaire. Please try again later.');
        setIsLoading(false);
      }
    }

    if (reportId) {
      fetchQuestionnaire()
    }
  }, [reportId])

  // Fetch existing responses
  const fetchResponses = async (questionnaire: Questionnaire, reportId: string) => {
    try {
      const res = await fetch(`/api/responses?reportId=${reportId}`)
      
      if (!res.ok) {
        throw new Error('Failed to fetch responses')
      }
      
      const data = await res.json()
      console.log('Fetched responses data:', data)
      
      const responseMap: ResponseMap = {}
      
      // Initialize with empty responses
      if (questionnaire && questionnaire.sections) {
        questionnaire.sections.forEach(section => {
          if (section.questions) {
            section.questions.forEach(question => {
              responseMap[question.id] = ''
            })
          }
        })
      }
      
      // Add any existing responses
      if (data && typeof data === 'object') {
        // The API now returns a map of question_id -> response_value
        Object.entries(data).forEach(([questionId, value]) => {
          responseMap[questionId] = value as string
        })
      }
      
      console.log('Final responseMap:', responseMap)
      setResponses(responseMap)
    } catch (err) {
      console.error('Error fetching responses:', err)
      // Continue without responses - they'll be created when saved
    }
  }

  // Handle input changes
  const handleInputChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  // Save responses
  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccessMessage(null)

      if (!questionnaire) {
        throw new Error('No questionnaire loaded')
      }

      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportId,
          questionnaireId: questionnaire.id,
          responses
        })
      })

      if (!res.ok) {
        throw new Error('Failed to save responses')
      }

      setSuccessMessage('Responses saved successfully')
      
      // Also update the report content with the responses
      await updateReportContent()
      
      if (onSave) {
        onSave(true)
      }
    } catch (err) {
      console.error('Error saving responses:', err)
      setError('Error saving responses. Please try again.')
      if (onSave) {
        onSave(false)
      }
    } finally {
      setIsSaving(false)
      
      // Clear success message after 3 seconds
      if (successMessage) {
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    }
  }

  // Update the report content with the responses
  const updateReportContent = async () => {
    try {
      // Format responses for saving to report content
      const formattedResponses: any = {}
      
      if (questionnaire) {
        questionnaire.sections.forEach(section => {
          section.questions.forEach(question => {
            if (responses[question.id]) {
              formattedResponses[question.id] = responses[question.id]
            }
          })
        })
      }
      
      // Update the report with the responses in the content field
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: {
            responses: formattedResponses
          }
        })
      })

      if (!res.ok) {
        throw new Error('Failed to update report content')
      }
    } catch (err) {
      console.error('Error updating report content:', err)
      // Don't set an error message here as this is a secondary operation
    }
  }

  // Navigate to the next section
  const handleNextSection = () => {
    if (questionnaire && activeSection < questionnaire.sections.length - 1) {
      setActiveSection(activeSection + 1)
      window.scrollTo(0, 0)
    }
  }

  // Navigate to the previous section
  const handlePreviousSection = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1)
      window.scrollTo(0, 0)
    }
  }

  // Render question based on type
  const renderQuestion = (question: ExtendedQuestion) => {
    console.log('Rendering question:', question);
    
    // Extract question details with fallbacks
    const questionId = question.id;
    const questionText = question.text || question.question || 'Unnamed Question';
    const questionType = question.type || 'text';
    const isRequired = question.required === true;
    const options = question.options || [];
    
    // Render appropriate input based on question type
    switch (questionType) {
      case 'text':
        return (
          <textarea
            id={questionId}
            name={questionId}
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            value={responses[questionId] || ''}
            onChange={(e) => handleInputChange(questionId, e.target.value)}
            required={isRequired}
          />
        )
      
      case 'number':
        return (
          <div className="flex rounded-md shadow-sm">
            <input
              type="number"
              id={questionId}
              name={questionId}
              value={responses[questionId] || ''}
              onChange={(e) => handleInputChange(questionId, e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Enter a number"
              required={isRequired}
            />
            {question.unit && (
              <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                {question.unit}
              </span>
            )}
          </div>
        )
      
      case 'select':
        return (
          <select
            id={questionId}
            name={questionId}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            value={responses[questionId] || ''}
            onChange={(e) => handleInputChange(questionId, e.target.value)}
            required={isRequired}
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      
      case 'boolean':
        return (
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                id={`${questionId}-yes`}
                type="radio"
                name={questionId}
                value="true"
                checked={responses[questionId] === 'true'}
                onChange={(e) => handleInputChange(questionId, e.target.value)}
                className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                required={isRequired}
              />
              <label htmlFor={`${questionId}-yes`} className="ml-2 block text-sm text-gray-700">
                Yes
              </label>
            </div>
            <div className="flex items-center">
              <input
                id={`${questionId}-no`}
                type="radio"
                name={questionId}
                value="false"
                checked={responses[questionId] === 'false'}
                onChange={(e) => handleInputChange(questionId, e.target.value)}
                className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                required={isRequired}
              />
              <label htmlFor={`${questionId}-no`} className="ml-2 block text-sm text-gray-700">
                No
              </label>
            </div>
          </div>
        )
      
      default:
        return <p>Unsupported question type</p>
    }
  }

  // Expose methods to parent components using ref
  useImperativeHandle(ref, () => ({
    saveResponses: async () => {
      await handleSave();
    }
  }));

  if (isLoading) {
    return <div className="py-6">Loading questionnaire...</div>
  }

  if (error) {
    return (
      <div>
        <div className="rounded-md bg-red-50 p-4 my-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
        
        <div className="mt-6 border p-4 bg-gray-50 rounded">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Debug Information</h3>
          <p className="text-xs text-gray-600 mb-4">The following is the raw questionnaire structure received from the server:</p>
          <details>
            <summary className="text-xs font-medium text-blue-600 cursor-pointer">Click to show/hide raw data</summary>
            <pre className="mt-2 text-xs overflow-auto max-h-96 bg-gray-100 p-2 rounded">
              {JSON.stringify(questionnaireDebug || {}, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    )
  }

  if (!questionnaire) {
    return <div className="py-6">No questionnaire available. Please ensure you have run the sample questionnaire SQL script in the Supabase SQL Editor.</div>
  }

  // Get current section
  if (!questionnaire.sections || !Array.isArray(questionnaire.sections) || questionnaire.sections.length === 0) {
    return <div className="py-6">The questionnaire does not contain any sections. Please check the database structure.</div>
  }
  
  // Check if activeSection is out of bounds
  if (activeSection < 0 || activeSection >= questionnaire.sections.length) {
    setActiveSection(0) // Reset to first section
    return <div className="py-6">Loading section...</div>
  }
  
  const currentSection = questionnaire.sections[activeSection] as ExtendedSection
  
  // Handle different section formats - old format uses title/questions, new might use section/questions
  const sectionTitle = currentSection.title || currentSection.section || "Untitled Section"
  const sectionQuestions = currentSection.questions || []
  const sectionDescription = currentSection.description || ""
  
  console.log('Current section:', currentSection)
  console.log('Section title:', sectionTitle)
  console.log('Section questions:', sectionQuestions)

  return (
    <div className="space-y-6">
      {/* Section navigation */}
      <nav className="flex items-center justify-center" aria-label="Progress">
        <ol className="flex items-center space-x-5">
          {questionnaire.sections.map((section, index) => (
            <li key={section.id || `section-${index}`}>
              <button
                onClick={() => setActiveSection(index)}
                className={`relative flex items-center justify-center ${
                  index === activeSection
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50'
                } rounded-full h-8 w-8 text-sm font-medium`}
              >
                {index + 1}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* Section title */}
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{sectionTitle}</h3>
        {sectionDescription && (
          <p className="mt-2 text-sm text-gray-500">{sectionDescription}</p>
        )}
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-8">
        {sectionQuestions.map((question) => {
          const q = question as ExtendedQuestion;
          // Get the question ID - could be in different formats
          const questionId = q.id || q.question_id || '';
          return (
            <div key={q.id} className="space-y-2">
              <label
                htmlFor={q.id}
                className="block text-sm font-medium text-gray-700"
              >
                {q.text || q.question || 'Unnamed Question'} 
                {q.required && <span className="text-red-500">*</span>}
              </label>
              {/* Add the explanation text if available for this question */}
              {questionExplanations[questionId] && (
                <p className="mt-1 text-sm italic text-gray-500">{questionExplanations[questionId]}</p>
              )}
              {renderQuestion(q)}
            </div>
          );
        })}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-5">
        <button
          type="button"
          onClick={handlePreviousSection}
          disabled={activeSection === 0}
          className={`rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            activeSection === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Previous
        </button>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {isSaving ? 'Saving...' : 'Save Responses'}
          </button>
          
          {activeSection < questionnaire.sections.length - 1 ? (
            <button
              type="button"
              onClick={handleNextSection}
              className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {isSaving ? 'Submitting...' : 'Complete Questionnaire'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

export default QuestionnaireForm; 