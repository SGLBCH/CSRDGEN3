-- CSRD SME Questionnaire SQL

-- Insert the questionnaire into the questionnaires table
INSERT INTO public.questionnaires (
  title,
  description,
  questions,
  sections,
  created_at,
  updated_at
)
VALUES (
  'CSRD SME Sustainability Assessment',
  'A comprehensive questionnaire designed to help SMEs assess their sustainability performance and CSRD readiness.',
  '{
    "sections": [
      {
        "section": "Company Profile & General Sustainability Context",
        "questions": [
          {
            "question_id": "company-name",
            "question_text": "What is the legal name of your company? E.g. \"ABC Manufacturing Ltd.\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "year-of-establishment",
            "question_text": "In what year was your company established? E.g. \"1998\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": null
          },
          {
            "question_id": "employee-count",
            "question_text": "What is your current number of employees? E.g. \"75\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": null
          },
          {
            "question_id": "industry-sector",
            "question_text": "Which industry sector does your company operate in? E.g. \"Manufacturing\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "annual-turnover",
            "question_text": "What is your annual turnover in €? E.g. \"500000\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "€"
          },
          {
            "question_id": "operational-geography",
            "question_text": "List the geographical regions where your company operates. E.g. \"Europe, Asia\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "sustainability-policy",
            "question_text": "Does your company have a dedicated sustainability policy? E.g. \"Yes\"",
            "question_type": "boolean",
            "options": null,
            "required": false
          },
          {
            "question_id": "current-performance-metrics",
            "question_text": "How do you currently measure sustainability performance? E.g. \"Basic tracking of energy and waste data\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "materiality-assessment",
            "question_text": "Has your company performed a materiality assessment for sustainability topics? E.g. \"No\"",
            "question_type": "boolean",
            "options": null,
            "required": false
          },
          {
            "question_id": "sustainability-strategy",
            "question_text": "Provide a brief description of your company's sustainability strategy. E.g. \"We focus on reducing waste and energy consumption.\"",
            "question_type": "text",
            "options": null,
            "required": false
          }
        ]
      },
      {
        "section": "Environmental Impact – Emissions and Resource Use",
        "questions": [
          {
            "question_id": "scope1-emissions",
            "question_text": "What is your total Scope 1 CO₂ emissions (direct emissions) in tonnes CO₂e? E.g. \"120\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "tonnes CO₂e"
          },
          {
            "question_id": "scope2-emissions",
            "question_text": "What is your total Scope 2 CO₂ emissions (indirect energy-related emissions) in tonnes CO₂e? E.g. \"80\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "tonnes CO₂e"
          },
          {
            "question_id": "scope3-emissions",
            "question_text": "What is your estimated Scope 3 CO₂ emissions (other indirect emissions) in tonnes CO₂e? E.g. \"200\" (if applicable)",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "tonnes CO₂e"
          },
          {
            "question_id": "total-energy-consumption",
            "question_text": "What is your total energy consumption in kWh? E.g. \"150000\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "kWh"
          },
          {
            "question_id": "water-usage",
            "question_text": "What is your total water usage in cubic meters? E.g. \"2500\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "cubic meters"
          },
          {
            "question_id": "renewable-energy-percentage",
            "question_text": "What percentage of your total energy consumption comes from renewable sources? E.g. \"40%\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "%"
          },
          {
            "question_id": "waste-generated",
            "question_text": "What is the total amount of waste generated annually in tonnes? E.g. \"15\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "tonnes"
          },
          {
            "question_id": "waste-recycling-rate",
            "question_text": "What is your waste recycling rate in percentage? E.g. \"65%\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "%"
          },
          {
            "question_id": "raw-material-consumption",
            "question_text": "What is the total consumption of raw materials in tonnes? E.g. \"50\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "tonnes"
          },
          {
            "question_id": "emissions-intensity",
            "question_text": "What is your CO₂ emissions intensity (e.g. tonnes CO₂e per unit produced)? E.g. \"0.5\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "tonnes CO₂e/unit produced"
          }
        ]
      },
      {
        "section": "Energy Consumption & Efficiency",
        "questions": [
          {
            "question_id": "annual-electricity-consumption",
            "question_text": "What is your annual electricity consumption in kWh? E.g. \"120000\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "kWh"
          },
          {
            "question_id": "annual-fuel-consumption",
            "question_text": "What is your annual fuel consumption in liters (or equivalent energy unit)? E.g. \"8000\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "liters"
          },
          {
            "question_id": "energy-cost-per-unit",
            "question_text": "What is the energy cost per unit of production? E.g. \"€0.15\" (calculate total energy cost divided by units produced)",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "€"
          },
          {
            "question_id": "energy-efficiency-rating",
            "question_text": "If applicable, what is your average energy efficiency rating? E.g. \"A\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "energy-saving-measures",
            "question_text": "Has your company implemented energy-saving measures? E.g. \"Yes\"",
            "question_type": "boolean",
            "options": null,
            "required": false
          },
          {
            "question_id": "energy-consumption-reduction",
            "question_text": "What is the percentage reduction in energy consumption compared to the previous year? E.g. \"10%\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "%"
          },
          {
            "question_id": "renewable-installation-capacity",
            "question_text": "What is the capacity of any installed renewable energy systems in kW? E.g. \"25\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "kW"
          },
          {
            "question_id": "estimated-energy-savings",
            "question_text": "What are the estimated annual savings from energy efficiency measures in €? E.g. \"3500\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "€"
          },
          {
            "question_id": "energy-monitoring-method",
            "question_text": "How do you monitor your energy usage? E.g. \"Using smart meters and manual logs\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "planned-energy-improvements",
            "question_text": "What improvements are planned to increase energy efficiency? E.g. \"Installation of LED lighting across all facilities\"",
            "question_type": "text",
            "options": null,
            "required": false
          }
        ]
      },
      {
        "section": "Waste Management & Circular Economy Initiatives",
        "questions": [
          {
            "question_id": "annual-waste-total",
            "question_text": "What is your company's total annual waste generation in tonnes? E.g. \"20\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "tonnes"
          },
          {
            "question_id": "waste-recycling-percentage",
            "question_text": "What is your waste recycling percentage? E.g. \"70%\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "%"
          },
          {
            "question_id": "waste-reduction-strategy",
            "question_text": "Have you implemented any waste reduction strategies? E.g. \"Yes\"",
            "question_type": "boolean",
            "options": null,
            "required": false
          },
          {
            "question_id": "material-reuse",
            "question_text": "Do you reuse any materials in your production process? E.g. \"Yes\"",
            "question_type": "boolean",
            "options": null,
            "required": false
          },
          {
            "question_id": "landfill-diversion-rate",
            "question_text": "What percentage of your waste is diverted from landfill? E.g. \"50%\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "%"
          },
          {
            "question_id": "waste-repurposing",
            "question_text": "What is the total amount of waste repurposed or sold in tonnes? E.g. \"5\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "tonnes"
          },
          {
            "question_id": "circular-economy-investment",
            "question_text": "What is your annual investment in circular economy initiatives in €? E.g. \"10000\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "€"
          },
          {
            "question_id": "packaging-reduction-strategy",
            "question_text": "Describe your strategy for reducing packaging waste. E.g. \"Switching to reusable packaging\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "life-cycle-analysis",
            "question_text": "Have you conducted a life-cycle analysis for your products? E.g. \"No\"",
            "question_type": "boolean",
            "options": null,
            "required": false
          },
          {
            "question_id": "circular-economy-kpi",
            "question_text": "What is the key performance indicator you use to measure circular economy performance? E.g. \"Percentage of materials recycled\"",
            "question_type": "text",
            "options": null,
            "required": false
          }
        ]
      },
      {
        "section": "Social Impact & Human Rights",
        "questions": [
          {
            "question_id": "total-employee-count",
            "question_text": "What is the total number of employees? E.g. \"75\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": null
          },
          {
            "question_id": "gender-diversity-percentage",
            "question_text": "What is the percentage of female employees? E.g. \"40%\" (Calculate: (Number of female employees / Total employees) x 100)",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "%"
          },
          {
            "question_id": "sustainability-training-hours",
            "question_text": "How many hours of sustainability training are provided per employee per year? E.g. \"5\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "hours"
          },
          {
            "question_id": "employee-turnover-rate",
            "question_text": "What is your employee turnover rate in percentage? E.g. \"15%\" (Calculate: (Departures / Average employee count) x 100)",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "%"
          },
          {
            "question_id": "fair-labor-practices",
            "question_text": "Does your company implement fair labor practices? E.g. \"Yes\"",
            "question_type": "boolean",
            "options": null,
            "required": false
          },
          {
            "question_id": "leadership-diversity",
            "question_text": "What is the percentage of leadership positions held by underrepresented groups? E.g. \"25%\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "%"
          },
          {
            "question_id": "human-rights-policy",
            "question_text": "Please describe your company's human rights policy. E.g. \"We adhere to international standards.\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "grievance-mechanisms",
            "question_text": "Does your company have grievance mechanisms in place? E.g. \"Yes\"",
            "question_type": "boolean",
            "options": null,
            "required": false
          },
          {
            "question_id": "community-engagement",
            "question_text": "Describe any community engagement initiatives. E.g. \"Sponsorship of local education programs\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "health-safety-incident-rate",
            "question_text": "What is your health and safety incident rate (number of incidents per 100 employees)? E.g. \"2\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "incidents per 100 employees"
          }
        ]
      },
      {
        "section": "Governance & Organizational Policies",
        "questions": [
          {
            "question_id": "sustainability-committee",
            "question_text": "Does your company have a dedicated sustainability committee? E.g. \"Yes\"",
            "question_type": "boolean",
            "options": null,
            "required": false
          },
          {
            "question_id": "board-sustainability-frequency",
            "question_text": "How frequently does the board discuss sustainability issues? E.g. \"Quarterly\" (Select one)",
            "question_type": "select",
            "options": [
              "Monthly",
              "Quarterly",
              "Annually",
              "Never"
            ],
            "required": false
          },
          {
            "question_id": "sustainability-in-strategy",
            "question_text": "How is sustainability integrated into your overall company strategy? E.g. \"It is part of our long-term business plan.\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "whistleblower-policy",
            "question_text": "Do you have a whistleblower policy in place? E.g. \"Yes\"",
            "question_type": "boolean",
            "options": null,
            "required": false
          },
          {
            "question_id": "board-sustainability-expertise",
            "question_text": "What percentage of your board has sustainability expertise? E.g. \"30%\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "%"
          },
          {
            "question_id": "anti-corruption-measures",
            "question_text": "Has your company implemented anti-corruption measures? E.g. \"Yes\"",
            "question_type": "boolean",
            "options": null,
            "required": false
          },
          {
            "question_id": "external-assurance",
            "question_text": "Is your sustainability data externally assured? E.g. \"No\"",
            "question_type": "boolean",
            "options": null,
            "required": false
          },
          {
            "question_id": "executive-remuneration-link",
            "question_text": "Is executive remuneration linked to sustainability performance? E.g. \"Yes\"",
            "question_type": "boolean",
            "options": null,
            "required": false
          },
          {
            "question_id": "sustainability-reporting-frequency",
            "question_text": "How often do you produce sustainability reports? E.g. \"Annual\" (Select one)",
            "question_type": "select",
            "options": [
              "Annual",
              "Biannual",
              "Quarterly",
              "Ad Hoc"
            ],
            "required": false
          },
          {
            "question_id": "stakeholder-engagement-process",
            "question_text": "Describe the process for stakeholder engagement in sustainability governance. E.g. \"Regular meetings and surveys.\"",
            "question_type": "text",
            "options": null,
            "required": false
          }
        ]
      },
      {
        "section": "Supply Chain Sustainability",
        "questions": [
          {
            "question_id": "supplier-sustainability-percentage",
            "question_text": "What percentage of your suppliers meet your sustainability criteria? E.g. \"60%\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "%"
          },
          {
            "question_id": "supplier-code-of-conduct",
            "question_text": "Do you have a supplier sustainability code of conduct? E.g. \"Yes\"",
            "question_type": "boolean",
            "options": null,
            "required": false
          },
          {
            "question_id": "supplier-audit-frequency",
            "question_text": "How often are sustainability audits conducted for your suppliers? E.g. \"Annually\" (Select one)",
            "question_type": "select",
            "options": [
              "Annually",
              "Biennially",
              "On-demand",
              "Never"
            ],
            "required": false
          },
          {
            "question_id": "local-suppliers-percentage",
            "question_text": "What percentage of your suppliers are local? E.g. \"50%\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "%"
          },
          {
            "question_id": "supplier-data-collection",
            "question_text": "How do you collect sustainability performance data from suppliers? E.g. \"Regular surveys and audits.\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "supply-chain-emissions-calculation",
            "question_text": "Describe your method for calculating supply chain emissions. E.g. \"Sum supplier-reported emissions and estimate gaps using industry averages.\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "number-of-audited-suppliers",
            "question_text": "How many suppliers have been evaluated for sustainability risks? E.g. \"15\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": null
          },
          {
            "question_id": "supply-chain-transparency-strategy",
            "question_text": "What strategies are in place to improve supply chain transparency? E.g. \"Implementing a digital tracking system.\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "supply-chain-emissions-reduction",
            "question_text": "What is the percentage reduction in supply chain emissions compared to last year? E.g. \"5%\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "%"
          },
          {
            "question_id": "supply-chain-incident-reporting",
            "question_text": "Describe your reporting mechanism for supply chain sustainability incidents. E.g. \"A dedicated hotline and online form.\"",
            "question_type": "text",
            "options": null,
            "required": false
          }
        ]
      },
      {
        "section": "Climate Risks & Opportunities",
        "questions": [
          {
            "question_id": "climate-risk-identification",
            "question_text": "List the climate-related risks identified by your company. E.g. \"Flood risk to production sites\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "financial-impact-climate-risk",
            "question_text": "What is the estimated financial impact of climate risks in €? E.g. \"20000\" (Estimate based on historical data and forecast scenarios)",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "€"
          },
          {
            "question_id": "climate-risk-mitigation-plan",
            "question_text": "Does your company have a climate risk mitigation plan? E.g. \"Yes\"",
            "question_type": "boolean",
            "options": null,
            "required": false
          },
          {
            "question_id": "climate-risk-assessment-frequency",
            "question_text": "How frequently do you update your climate risk assessments? E.g. \"Annually\" (Select one)",
            "question_type": "select",
            "options": [
              "Annually",
              "Biennially",
              "Quarterly",
              "Never"
            ],
            "required": false
          },
          {
            "question_id": "revenue-at-risk-climate",
            "question_text": "What percentage of your revenue is potentially at risk due to climate change? E.g. \"8%\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "%"
          },
          {
            "question_id": "low-carbon-opportunities",
            "question_text": "What opportunities have you identified from transitioning to a low-carbon economy? E.g. \"Cost savings from energy efficiency\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "climate-adaptation-investment",
            "question_text": "What is your annual investment in climate adaptation measures in €? E.g. \"5000\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "€"
          },
          {
            "question_id": "scenario-analysis",
            "question_text": "Have you conducted a scenario analysis for climate risks? E.g. \"No\"",
            "question_type": "boolean",
            "options": null,
            "required": false
          },
          {
            "question_id": "external-climate-tools",
            "question_text": "Do you use external tools for climate risk assessment? E.g. \"Yes\"",
            "question_type": "boolean",
            "options": null,
            "required": false
          },
          {
            "question_id": "climate-risk-calculation-method",
            "question_text": "Describe your calculation method for assessing climate risk exposure. E.g. \"Multiply loss scenarios by likelihood percentages and sum the outcomes.\"",
            "question_type": "text",
            "options": null,
            "required": false
          }
        ]
      },
      {
        "section": "Biodiversity & Natural Capital",
        "questions": [
          {
            "question_id": "biodiversity-impact",
            "question_text": "Describe the impact your operations have on local biodiversity. E.g. \"Minimal impact due to controlled land use.\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "ecosystem-preservation-measures",
            "question_text": "What measures are in place to preserve local ecosystems? E.g. \"Tree planting and habitat restoration programs.\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "operations-in-sensitive-areas",
            "question_text": "What percentage of your operations are in ecologically sensitive areas? E.g. \"10%\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "%"
          },
          {
            "question_id": "natural-capital-dependency",
            "question_text": "Describe your dependency on natural capital. E.g. \"Dependence on local water resources for production.\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "biodiversity-investment",
            "question_text": "What is your annual investment in biodiversity projects in €? E.g. \"3000\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "€"
          },
          {
            "question_id": "biodiversity-initiatives",
            "question_text": "Have you initiated projects to reduce negative impacts on biodiversity? E.g. \"Yes\"",
            "question_type": "boolean",
            "options": null,
            "required": false
          },
          {
            "question_id": "biodiversity-impact-calculation",
            "question_text": "Describe your method for estimating biodiversity impact. E.g. \"Compare land use changes against baseline biodiversity indices.\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "water-quality-reporting",
            "question_text": "Do you report water quality metrics (e.g., pH, dissolved oxygen)? E.g. \"Yes – with pH and DO measurements\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "habitat-restoration-strategy",
            "question_text": "What strategies are employed for habitat restoration? E.g. \"Partnering with local conservation groups\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "local-conservation-engagement",
            "question_text": "Does your company engage with local conservation groups? E.g. \"Yes\"",
            "question_type": "boolean",
            "options": null,
            "required": false
          }
        ]
      },
      {
        "section": "Reporting, Data Collection & Calculation Methodologies",
        "questions": [
          {
            "question_id": "data-collection-methods",
            "question_text": "What methods do you use to collect sustainability data? E.g. \"Manual logs, automated meters, and supplier reports.\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "digital-tools-usage",
            "question_text": "Do you use digital tools for tracking sustainability data? E.g. \"Yes\"",
            "question_type": "boolean",
            "options": null,
            "required": false
          },
          {
            "question_id": "data-update-frequency",
            "question_text": "How frequently is your sustainability data updated? E.g. \"Quarterly\" (Select one)",
            "question_type": "select",
            "options": [
              "Monthly",
              "Quarterly",
              "Annually",
              "Real-time"
            ],
            "required": false
          },
          {
            "question_id": "emissions-intensity-calculation",
            "question_text": "Describe your calculation method for emissions intensity. E.g. \"Divide total CO₂ emissions by production output.\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "data-verification-process",
            "question_text": "How is your sustainability data verified? E.g. \"Through internal audits and external assurance.\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "reporting-framework",
            "question_text": "Which internationally recognized reporting framework do you use? E.g. \"GRI\" (Select one)",
            "question_type": "select",
            "options": [
              "GRI",
              "SASB",
              "None",
              "Other"
            ],
            "required": false
          },
          {
            "question_id": "historical-data-availability",
            "question_text": "Do you have historical sustainability data available? E.g. \"Yes\"",
            "question_type": "boolean",
            "options": null,
            "required": false
          },
          {
            "question_id": "data-quality-assurance",
            "question_text": "What measures do you have in place to ensure data quality? E.g. \"Regular cross-checks with financial data.\"",
            "question_type": "text",
            "options": null,
            "required": false
          },
          {
            "question_id": "staff-training-hours",
            "question_text": "How many hours per year are dedicated to training staff on sustainability data collection? E.g. \"8\"",
            "question_type": "number",
            "options": null,
            "required": false,
            "unit": "hours"
          },
          {
            "question_id": "future-reporting-improvements",
            "question_text": "What improvements do you plan for your reporting methodologies? E.g. \"Implementing a centralized digital platform.\"",
            "question_type": "text",
            "options": null,
            "required": false
          }
        ]
      }
    ]
  }',
  '{
    "sections": [
      "Company Profile & General Sustainability Context",
      "Environmental Impact – Emissions and Resource Use",
      "Energy Consumption & Efficiency",
      "Waste Management & Circular Economy Initiatives",
      "Social Impact & Human Rights",
      "Governance & Organizational Policies",
      "Supply Chain Sustainability",
      "Climate Risks & Opportunities",
      "Biodiversity & Natural Capital",
      "Reporting, Data Collection & Calculation Methodologies"
    ]
  }',
  current_timestamp,
  current_timestamp
);
