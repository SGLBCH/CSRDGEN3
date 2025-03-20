import json
from collections import defaultdict

# Flat list of questions (extracted from your SQL insert example).
# Each dictionary includes all fields, including guidance fields.
flat_questions = [
    # Section 1: Company Profile & General Sustainability Context
    {"question_id": "company-name", "section": "Company Profile & General Sustainability Context", "question_text": "What is the legal name of your company? E.g. \"ABC Manufacturing Ltd.\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "ABC Manufacturing Ltd."},
    {"question_id": "year-of-establishment", "section": "Company Profile & General Sustainability Context", "question_text": "In what year was your company established? E.g. \"1998\"", "question_type": "number", "options": None, "required": False, "calculation_method": "No calculation required – simply enter the year.", "example": "1998"},
    {"question_id": "employee-count", "section": "Company Profile & General Sustainability Context", "question_text": "What is your current number of employees? E.g. \"75\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Count all full-time and part-time employees.", "example": "75"},
    {"question_id": "industry-sector", "section": "Company Profile & General Sustainability Context", "question_text": "Which industry sector does your company operate in? E.g. \"Manufacturing\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "Manufacturing"},
    {"question_id": "annual-turnover", "section": "Company Profile & General Sustainability Context", "question_text": "What is your annual turnover in €? E.g. \"500000\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Enter the total annual turnover in euros.", "example": "500000"},
    {"question_id": "operational-geography", "section": "Company Profile & General Sustainability Context", "question_text": "List the geographical regions where your company operates. E.g. \"Europe, Asia\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "Europe, Asia"},
    {"question_id": "sustainability-policy", "section": "Company Profile & General Sustainability Context", "question_text": "Does your company have a dedicated sustainability policy? E.g. \"Yes\"", "question_type": "boolean", "options": None, "required": False, "calculation_method": None, "example": "Yes"},
    {"question_id": "current-performance-metrics", "section": "Company Profile & General Sustainability Context", "question_text": "How do you currently measure sustainability performance? E.g. \"Basic tracking of energy and waste data\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "Basic tracking of energy and waste data"},
    {"question_id": "materiality-assessment", "section": "Company Profile & General Sustainability Context", "question_text": "Has your company performed a materiality assessment for sustainability topics? E.g. \"No\"", "question_type": "boolean", "options": None, "required": False, "calculation_method": None, "example": "No"},
    {"question_id": "sustainability-strategy", "section": "Company Profile & General Sustainability Context", "question_text": "Provide a brief description of your company’s sustainability strategy. E.g. \"We focus on reducing waste and energy consumption.\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "We focus on reducing waste and energy consumption."},

    # Section 2: Environmental Impact – Emissions and Resource Use
    {"question_id": "scope1-emissions", "section": "Environmental Impact – Emissions and Resource Use", "question_text": "What is your total Scope 1 CO₂ emissions (direct emissions) in tonnes CO₂e? E.g. \"120\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Sum all direct emissions from owned/controlled sources, measured in tonnes CO₂e.", "example": "120"},
    {"question_id": "scope2-emissions", "section": "Environmental Impact – Emissions and Resource Use", "question_text": "What is your total Scope 2 CO₂ emissions (indirect energy-related emissions) in tonnes CO₂e? E.g. \"80\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Sum emissions from purchased energy (electricity, heat, steam) in tonnes CO₂e.", "example": "80"},
    {"question_id": "scope3-emissions", "section": "Environmental Impact – Emissions and Resource Use", "question_text": "What is your estimated Scope 3 CO₂ emissions (other indirect emissions) in tonnes CO₂e? E.g. \"200\" (if applicable)", "question_type": "number", "options": None, "required": False, "calculation_method": "Estimate using supplier data and industry averages if exact data is unavailable.", "example": "200"},
    {"question_id": "total-energy-consumption", "section": "Environmental Impact – Emissions and Resource Use", "question_text": "What is your total energy consumption in kWh? E.g. \"150000\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Aggregate all energy use in kilowatt-hours (kWh) annually.", "example": "150000"},
    {"question_id": "water-usage", "section": "Environmental Impact – Emissions and Resource Use", "question_text": "What is your total water usage in cubic meters? E.g. \"2500\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Measure water usage over the reporting period in cubic meters.", "example": "2500"},
    {"question_id": "renewable-energy-percentage", "section": "Environmental Impact – Emissions and Resource Use", "question_text": "What percentage of your total energy consumption comes from renewable sources? E.g. \"40%\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Calculate: (Renewable Energy kWh / Total Energy kWh) x 100.", "example": "40"},
    {"question_id": "waste-generated", "section": "Environmental Impact – Emissions and Resource Use", "question_text": "What is the total amount of waste generated annually in tonnes? E.g. \"15\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Sum all waste produced monthly to get an annual figure in tonnes.", "example": "15"},
    {"question_id": "waste-recycling-rate", "section": "Environmental Impact – Emissions and Resource Use", "question_text": "What is your waste recycling rate in percentage? E.g. \"65%\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Calculate: (Recycled Waste / Total Waste) x 100.", "example": "65"},
    {"question_id": "raw-material-consumption", "section": "Environmental Impact – Emissions and Resource Use", "question_text": "What is the total consumption of raw materials in tonnes? E.g. \"50\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Sum all raw material inputs for the production process.", "example": "50"},
    {"question_id": "emissions-intensity", "section": "Environmental Impact – Emissions and Resource Use", "question_text": "What is your CO₂ emissions intensity (e.g. tonnes CO₂e per unit produced)? E.g. \"0.5\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Calculate: Total CO₂ emissions (Scope 1+2+3) divided by total production output.", "example": "0.5"},

    # Section 3: Energy Consumption & Efficiency
    {"question_id": "annual-electricity-consumption", "section": "Energy Consumption & Efficiency", "question_text": "What is your annual electricity consumption in kWh? E.g. \"120000\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Measure all electricity usage in kilowatt-hours.", "example": "120000"},
    {"question_id": "annual-fuel-consumption", "section": "Energy Consumption & Efficiency", "question_text": "What is your annual fuel consumption in liters (or equivalent energy unit)? E.g. \"8000\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Record the volume of fuel used annually in liters.", "example": "8000"},
    {"question_id": "energy-cost-per-unit", "section": "Energy Consumption & Efficiency", "question_text": "What is the energy cost per unit of production? E.g. \"€0.15\" (calculate total energy cost divided by units produced)", "question_type": "number", "options": None, "required": False, "calculation_method": "Divide the total energy expenditure by the production quantity.", "example": "0.15"},
    {"question_id": "energy-efficiency-rating", "section": "Energy Consumption & Efficiency", "question_text": "If applicable, what is your average energy efficiency rating? E.g. \"A\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "A"},
    {"question_id": "energy-saving-measures", "section": "Energy Consumption & Efficiency", "question_text": "Has your company implemented energy-saving measures? E.g. \"Yes\"", "question_type": "boolean", "options": None, "required": False, "calculation_method": None, "example": "Yes"},
    {"question_id": "energy-consumption-reduction", "section": "Energy Consumption & Efficiency", "question_text": "What is the percentage reduction in energy consumption compared to the previous year? E.g. \"10%\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Calculate: ((Last Year kWh - This Year kWh) / Last Year kWh) x 100.", "example": "10"},
    {"question_id": "renewable-installation-capacity", "section": "Energy Consumption & Efficiency", "question_text": "What is the capacity of any installed renewable energy systems in kW? E.g. \"25\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Sum the rated capacities of all renewable installations (in kW).", "example": "25"},
    {"question_id": "estimated-energy-savings", "section": "Energy Consumption & Efficiency", "question_text": "What are the estimated annual savings from energy efficiency measures in €? E.g. \"3500\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Estimate based on reduced energy costs compared to previous expenditures.", "example": "3500"},
    {"question_id": "energy-monitoring-method", "section": "Energy Consumption & Efficiency", "question_text": "How do you monitor your energy usage? E.g. \"Using smart meters and manual logs\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "Using smart meters and manual logs"},
    {"question_id": "planned-energy-improvements", "section": "Energy Consumption & Efficiency", "question_text": "What improvements are planned to increase energy efficiency? E.g. \"Installation of LED lighting across all facilities\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "Installation of LED lighting across all facilities"},

    # Section 4: Waste Management & Circular Economy Initiatives
    {"question_id": "annual-waste-total", "section": "Waste Management & Circular Economy Initiatives", "question_text": "What is your company’s total annual waste generation in tonnes? E.g. \"20\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Sum all waste streams to obtain the total (in tonnes).", "example": "20"},
    {"question_id": "waste-recycling-percentage", "section": "Waste Management & Circular Economy Initiatives", "question_text": "What is your waste recycling percentage? E.g. \"70%\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Calculate: (Recycled Waste / Total Waste) x 100.", "example": "70"},
    {"question_id": "waste-reduction-strategy", "section": "Waste Management & Circular Economy Initiatives", "question_text": "Have you implemented any waste reduction strategies? E.g. \"Yes\"", "question_type": "boolean", "options": None, "required": False, "calculation_method": None, "example": "Yes"},
    {"question_id": "material-reuse", "section": "Waste Management & Circular Economy Initiatives", "question_text": "Do you reuse any materials in your production process? E.g. \"Yes\"", "question_type": "boolean", "options": None, "required": False, "calculation_method": None, "example": "Yes"},
    {"question_id": "landfill-diversion-rate", "section": "Waste Management & Circular Economy Initiatives", "question_text": "What percentage of your waste is diverted from landfill? E.g. \"50%\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Calculate: (Waste Not Landfilled / Total Waste) x 100.", "example": "50"},
    {"question_id": "waste-repurposing", "section": "Waste Management & Circular Economy Initiatives", "question_text": "What is the total amount of waste repurposed or sold in tonnes? E.g. \"5\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Sum all waste materials that are reused or sold (in tonnes).", "example": "5"},
    {"question_id": "circular-economy-investment", "section": "Waste Management & Circular Economy Initiatives", "question_text": "What is your annual investment in circular economy initiatives in €? E.g. \"10000\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Enter the total monetary value invested in circular economy projects.", "example": "10000"},
    {"question_id": "packaging-reduction-strategy", "section": "Waste Management & Circular Economy Initiatives", "question_text": "Describe your strategy for reducing packaging waste. E.g. \"Switching to reusable packaging\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "Switching to reusable packaging"},
    {"question_id": "life-cycle-analysis", "section": "Waste Management & Circular Economy Initiatives", "question_text": "Have you conducted a life-cycle analysis for your products? E.g. \"No\"", "question_type": "boolean", "options": None, "required": False, "calculation_method": None, "example": "No"},
    {"question_id": "circular-economy-kpi", "section": "Waste Management & Circular Economy Initiatives", "question_text": "What is the key performance indicator you use to measure circular economy performance? E.g. \"Percentage of materials recycled\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "Percentage of materials recycled"},

    # Section 5: Social Impact & Human Rights
    {"question_id": "total-employee-count", "section": "Social Impact & Human Rights", "question_text": "What is the total number of employees? E.g. \"75\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Simple headcount.", "example": "75"},
    {"question_id": "gender-diversity-percentage", "section": "Social Impact & Human Rights", "question_text": "What is the percentage of female employees? E.g. \"40%\" (Calculate: (Number of female employees / Total employees) x 100)", "question_type": "number", "options": None, "required": False, "calculation_method": "Calculate: (Number of female employees / Total employees) x 100.", "example": "40"},
    {"question_id": "sustainability-training-hours", "section": "Social Impact & Human Rights", "question_text": "How many hours of sustainability training are provided per employee per year? E.g. \"5\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Total training hours divided by number of employees.", "example": "5"},
    {"question_id": "employee-turnover-rate", "section": "Social Impact & Human Rights", "question_text": "What is your employee turnover rate in percentage? E.g. \"15%\" (Calculate: (Departures / Average employee count) x 100)", "question_type": "number", "options": None, "required": False, "calculation_method": "Calculate: (Departures / Average employee count) x 100.", "example": "15"},
    {"question_id": "fair-labor-practices", "section": "Social Impact & Human Rights", "question_text": "Does your company implement fair labor practices? E.g. \"Yes\"", "question_type": "boolean", "options": None, "required": False, "calculation_method": None, "example": "Yes"},
    {"question_id": "leadership-diversity", "section": "Social Impact & Human Rights", "question_text": "What is the percentage of leadership positions held by underrepresented groups? E.g. \"25%\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Calculate: (Number in underrepresented leadership roles / Total leadership roles) x 100.", "example": "25"},
    {"question_id": "human-rights-policy", "section": "Social Impact & Human Rights", "question_text": "Please describe your company’s human rights policy. E.g. \"We adhere to international standards.\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "We adhere to international standards."},
    {"question_id": "grievance-mechanisms", "section": "Social Impact & Human Rights", "question_text": "Does your company have grievance mechanisms in place? E.g. \"Yes\"", "question_type": "boolean", "options": None, "required": False, "calculation_method": None, "example": "Yes"},
    {"question_id": "community-engagement", "section": "Social Impact & Human Rights", "question_text": "Describe any community engagement initiatives. E.g. \"Sponsorship of local education programs\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "Sponsorship of local education programs"},
    {"question_id": "health-safety-incident-rate", "section": "Social Impact & Human Rights", "question_text": "What is your health and safety incident rate (number of incidents per 100 employees)? E.g. \"2\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Calculate: (Number of incidents / Total employees) x 100.", "example": "2"},

    # Section 6: Governance & Organizational Policies
    {"question_id": "sustainability-committee", "section": "Governance & Organizational Policies", "question_text": "Does your company have a dedicated sustainability committee? E.g. \"Yes\"", "question_type": "boolean", "options": None, "required": False, "calculation_method": None, "example": "Yes"},
    {"question_id": "board-sustainability-frequency", "section": "Governance & Organizational Policies", "question_text": "How frequently does the board discuss sustainability issues? E.g. \"Quarterly\" (Select one)", "question_type": "select", "options": ["Monthly", "Quarterly", "Annually", "Never"], "required": False, "calculation_method": None, "example": "Quarterly"},
    {"question_id": "sustainability-in-strategy", "section": "Governance & Organizational Policies", "question_text": "How is sustainability integrated into your overall company strategy? E.g. \"It is part of our long-term business plan.\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "It is part of our long-term business plan."},
    {"question_id": "whistleblower-policy", "section": "Governance & Organizational Policies", "question_text": "Do you have a whistleblower policy in place? E.g. \"Yes\"", "question_type": "boolean", "options": None, "required": False, "calculation_method": None, "example": "Yes"},
    {"question_id": "board-sustainability-expertise", "section": "Governance & Organizational Policies", "question_text": "What percentage of your board has sustainability expertise? E.g. \"30%\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Calculate: (Number of board members with expertise / Total board members) x 100.", "example": "30"},
    {"question_id": "anti-corruption-measures", "section": "Governance & Organizational Policies", "question_text": "Has your company implemented anti-corruption measures? E.g. \"Yes\"", "question_type": "boolean", "options": None, "required": False, "calculation_method": None, "example": "Yes"},
    {"question_id": "external-assurance", "section": "Governance & Organizational Policies", "question_text": "Is your sustainability data externally assured? E.g. \"No\"", "question_type": "boolean", "options": None, "required": False, "calculation_method": None, "example": "No"},
    {"question_id": "executive-remuneration-link", "section": "Governance & Organizational Policies", "question_text": "Is executive remuneration linked to sustainability performance? E.g. \"Yes\"", "question_type": "boolean", "options": None, "required": False, "calculation_method": None, "example": "Yes"},
    {"question_id": "sustainability-reporting-frequency", "section": "Governance & Organizational Policies", "question_text": "How often do you produce sustainability reports? E.g. \"Annual\" (Select one)", "question_type": "select", "options": ["Annual", "Biannual", "Quarterly", "Ad Hoc"], "required": False, "calculation_method": None, "example": "Annual"},
    {"question_id": "stakeholder-engagement-process", "section": "Governance & Organizational Policies", "question_text": "Describe the process for stakeholder engagement in sustainability governance. E.g. \"Regular meetings and surveys.\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "Regular meetings and surveys."},

    # Section 7: Supply Chain Sustainability
    {"question_id": "supplier-sustainability-percentage", "section": "Supply Chain Sustainability", "question_text": "What percentage of your suppliers meet your sustainability criteria? E.g. \"60%\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Calculate: (Number of compliant suppliers / Total suppliers) x 100.", "example": "60"},
    {"question_id": "supplier-code-of-conduct", "section": "Supply Chain Sustainability", "question_text": "Do you have a supplier sustainability code of conduct? E.g. \"Yes\"", "question_type": "boolean", "options": None, "required": False, "calculation_method": None, "example": "Yes"},
    {"question_id": "supplier-audit-frequency", "section": "Supply Chain Sustainability", "question_text": "How often are sustainability audits conducted for your suppliers? E.g. \"Annually\" (Select one)", "question_type": "select", "options": ["Annually", "Biennially", "On-demand", "Never"], "required": False, "calculation_method": None, "example": "Annually"},
    {"question_id": "local-suppliers-percentage", "section": "Supply Chain Sustainability", "question_text": "What percentage of your suppliers are local? E.g. \"50%\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Calculate: (Local suppliers / Total suppliers) x 100.", "example": "50"},
    {"question_id": "supplier-data-collection", "section": "Supply Chain Sustainability", "question_text": "How do you collect sustainability performance data from suppliers? E.g. \"Regular surveys and audits.\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "Regular surveys and audits."},
    {"question_id": "supply-chain-emissions-calculation", "section": "Supply Chain Sustainability", "question_text": "Describe your method for calculating supply chain emissions. E.g. \"Sum supplier-reported emissions and estimate gaps using industry averages.\"", "question_type": "text", "options": None, "required": False, "calculation_method": "Method: Sum supplier-reported emissions and add estimates for missing data.", "example": "Sum supplier-reported emissions and estimate gaps using industry averages."},
    {"question_id": "number-of-audited-suppliers", "section": "Supply Chain Sustainability", "question_text": "How many suppliers have been evaluated for sustainability risks? E.g. \"15\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Count all suppliers audited during the reporting period.", "example": "15"},
    {"question_id": "supply-chain-transparency-strategy", "section": "Supply Chain Sustainability", "question_text": "What strategies are in place to improve supply chain transparency? E.g. \"Implementing a digital tracking system.\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "Implementing a digital tracking system."},
    {"question_id": "supply-chain-emissions-reduction", "section": "Supply Chain Sustainability", "question_text": "What is the percentage reduction in supply chain emissions compared to last year? E.g. \"5%\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Calculate: ((Last year emissions – This year emissions) / Last year emissions) x 100.", "example": "5"},
    {"question_id": "supply-chain-incident-reporting", "section": "Supply Chain Sustainability", "question_text": "Describe your reporting mechanism for supply chain sustainability incidents. E.g. \"A dedicated hotline and online form.\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "A dedicated hotline and online form."},

    # Section 8: Climate Risks & Opportunities
    {"question_id": "climate-risk-identification", "section": "Climate Risks & Opportunities", "question_text": "List the climate-related risks identified by your company. E.g. \"Flood risk to production sites\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "Flood risk to production sites"},
    {"question_id": "financial-impact-climate-risk", "section": "Climate Risks & Opportunities", "question_text": "What is the estimated financial impact of climate risks in €? E.g. \"20000\" (Estimate based on historical data and forecast scenarios)", "question_type": "number", "options": None, "required": False, "calculation_method": "Estimate by reviewing past incident costs and projected risks.", "example": "20000"},
    {"question_id": "climate-risk-mitigation-plan", "section": "Climate Risks & Opportunities", "question_text": "Does your company have a climate risk mitigation plan? E.g. \"Yes\"", "question_type": "boolean", "options": None, "required": False, "calculation_method": None, "example": "Yes"},
    {"question_id": "climate-risk-assessment-frequency", "section": "Climate Risks & Opportunities", "question_text": "How frequently do you update your climate risk assessments? E.g. \"Annually\" (Select one)", "question_type": "select", "options": ["Annually", "Biennially", "Quarterly", "Never"], "required": False, "calculation_method": None, "example": "Annually"},
    {"question_id": "revenue-at-risk-climate", "section": "Climate Risks & Opportunities", "question_text": "What percentage of your revenue is potentially at risk due to climate change? E.g. \"8%\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Calculate based on risk scenarios relative to total revenue.", "example": "8"},
    {"question_id": "low-carbon-opportunities", "section": "Climate Risks & Opportunities", "question_text": "What opportunities have you identified from transitioning to a low-carbon economy? E.g. \"Cost savings from energy efficiency\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "Cost savings from energy efficiency"},
    {"question_id": "climate-adaptation-investment", "section": "Climate Risks & Opportunities", "question_text": "What is your annual investment in climate adaptation measures in €? E.g. \"5000\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Enter the total funds dedicated to adaptation projects.", "example": "5000"},
    {"question_id": "scenario-analysis", "section": "Climate Risks & Opportunities", "question_text": "Have you conducted a scenario analysis for climate risks? E.g. \"No\"", "question_type": "boolean", "options": None, "required": False, "calculation_method": None, "example": "No"},
    {"question_id": "external-climate-tools", "section": "Climate Risks & Opportunities", "question_text": "Do you use external tools for climate risk assessment? E.g. \"Yes\"", "question_type": "boolean", "options": None, "required": False, "calculation_method": None, "example": "Yes"},
    {"question_id": "climate-risk-calculation-method", "section": "Climate Risks & Opportunities", "question_text": "Describe your calculation method for assessing climate risk exposure. E.g. \"Multiply loss scenarios by likelihood percentages and sum the outcomes.\"", "question_type": "text", "options": None, "required": False, "calculation_method": "Method: Multiply estimated loss amounts by their probability and add the results.", "example": "Multiply loss scenarios by likelihood percentages and sum the outcomes."},

    # Section 9: Biodiversity & Natural Capital
    {"question_id": "biodiversity-impact", "section": "Biodiversity & Natural Capital", "question_text": "Describe the impact your operations have on local biodiversity. E.g. \"Minimal impact due to controlled land use.\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "Minimal impact due to controlled land use."},
    {"question_id": "ecosystem-preservation-measures", "section": "Biodiversity & Natural Capital", "question_text": "What measures are in place to preserve local ecosystems? E.g. \"Tree planting and habitat restoration programs.\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "Tree planting and habitat restoration programs."},
    {"question_id": "operations-in-sensitive-areas", "section": "Biodiversity & Natural Capital", "question_text": "What percentage of your operations are in ecologically sensitive areas? E.g. \"10%\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Calculate: (Operations in sensitive areas / Total operations) x 100.", "example": "10"},
    {"question_id": "natural-capital-dependency", "section": "Biodiversity & Natural Capital", "question_text": "Describe your dependency on natural capital. E.g. \"Dependence on local water resources for production.\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "Dependence on local water resources for production."},
    {"question_id": "biodiversity-investment", "section": "Biodiversity & Natural Capital", "question_text": "What is your annual investment in biodiversity projects in €? E.g. \"3000\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Enter total monetary investment aimed at preserving biodiversity.", "example": "3000"},
    {"question_id": "biodiversity-initiatives", "section": "Biodiversity & Natural Capital", "question_text": "Have you initiated projects to reduce negative impacts on biodiversity? E.g. \"Yes\"", "question_type": "boolean", "options": None, "required": False, "calculation_method": None, "example": "Yes"},
    {"question_id": "biodiversity-impact-calculation", "section": "Biodiversity & Natural Capital", "question_text": "Describe your method for estimating biodiversity impact. E.g. \"Compare land use changes against baseline biodiversity indices.\"", "question_type": "text", "options": None, "required": False, "calculation_method": "Method: Evaluate changes in land use and compare with historical biodiversity data.", "example": "Compare land use changes against baseline biodiversity indices."},
    {"question_id": "water-quality-reporting", "section": "Biodiversity & Natural Capital", "question_text": "Do you report water quality metrics (e.g., pH, dissolved oxygen)? E.g. \"Yes – with pH and DO measurements\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "Yes – with pH and DO measurements"},
    {"question_id": "habitat-restoration-strategy", "section": "Biodiversity & Natural Capital", "question_text": "What strategies are employed for habitat restoration? E.g. \"Partnering with local conservation groups\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "Partnering with local conservation groups"},
    {"question_id": "local-conservation-engagement", "section": "Biodiversity & Natural Capital", "question_text": "Does your company engage with local conservation groups? E.g. \"Yes\"", "question_type": "boolean", "options": None, "required": False, "calculation_method": None, "example": "Yes"},

    # Section 10: Reporting, Data Collection & Calculation Methodologies
    {"question_id": "data-collection-methods", "section": "Reporting, Data Collection & Calculation Methodologies", "question_text": "What methods do you use to collect sustainability data? E.g. \"Manual logs, automated meters, and supplier reports.\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "Manual logs, automated meters, and supplier reports."},
    {"question_id": "digital-tools-usage", "section": "Reporting, Data Collection & Calculation Methodologies", "question_text": "Do you use digital tools for tracking sustainability data? E.g. \"Yes\"", "question_type": "boolean", "options": None, "required": False, "calculation_method": None, "example": "Yes"},
    {"question_id": "data-update-frequency", "section": "Reporting, Data Collection & Calculation Methodologies", "question_text": "How frequently is your sustainability data updated? E.g. \"Quarterly\" (Select one)", "question_type": "select", "options": ["Monthly", "Quarterly", "Annually", "Real-time"], "required": False, "calculation_method": None, "example": "Quarterly"},
    {"question_id": "emissions-intensity-calculation", "section": "Reporting, Data Collection & Calculation Methodologies", "question_text": "Describe your calculation method for emissions intensity. E.g. \"Divide total CO₂ emissions by production output.\"", "question_type": "text", "options": None, "required": False, "calculation_method": "Method: Total CO₂ emissions divided by number of units produced.", "example": "Divide total CO₂ emissions by production output."},
    {"question_id": "data-verification-process", "section": "Reporting, Data Collection & Calculation Methodologies", "question_text": "How is your sustainability data verified? E.g. \"Through internal audits and external assurance.\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "Through internal audits and external assurance."},
    {"question_id": "reporting-framework", "section": "Reporting, Data Collection & Calculation Methodologies", "question_text": "Which internationally recognized reporting framework do you use? E.g. \"GRI\" (Select one)", "question_type": "select", "options": ["GRI", "SASB", "None", "Other"], "required": False, "calculation_method": None, "example": "GRI"},
    {"question_id": "historical-data-availability", "section": "Reporting, Data Collection & Calculation Methodologies", "question_text": "Do you have historical sustainability data available? E.g. \"Yes\"", "question_type": "boolean", "options": None, "required": False, "calculation_method": None, "example": "Yes"},
    {"question_id": "data-quality-assurance", "section": "Reporting, Data Collection & Calculation Methodologies", "question_text": "What measures do you have in place to ensure data quality? E.g. \"Regular cross-checks with financial data.\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "Regular cross-checks with financial data."},
    {"question_id": "staff-training-hours", "section": "Reporting, Data Collection & Calculation Methodologies", "question_text": "How many hours per year are dedicated to training staff on sustainability data collection? E.g. \"8\"", "question_type": "number", "options": None, "required": False, "calculation_method": "Total annual training hours per relevant staff member.", "example": "8"},
    {"question_id": "future-reporting-improvements", "section": "Reporting, Data Collection & Calculation Methodologies", "question_text": "What improvements do you plan for your reporting methodologies? E.g. \"Implementing a centralized digital platform.\"", "question_type": "text", "options": None, "required": False, "calculation_method": None, "example": "Implementing a centralized digital platform."}
]

# Define a mapping for units for number-type questions.
unit_mapping = {
    "year-of-establishment": None,
    "employee-count": None,
    "annual-turnover": "€",
    "scope1-emissions": "tonnes CO₂e",
    "scope2-emissions": "tonnes CO₂e",
    "scope3-emissions": "tonnes CO₂e",
    "total-energy-consumption": "kWh",
    "water-usage": "cubic meters",
    "renewable-energy-percentage": "%",
    "waste-generated": "tonnes",
    "waste-recycling-rate": "%",
    "raw-material-consumption": "tonnes",
    "emissions-intensity": "tonnes CO₂e/unit produced",
    "annual-electricity-consumption": "kWh",
    "annual-fuel-consumption": "liters",
    "energy-cost-per-unit": "€",
    "energy-consumption-reduction": "%",
    "renewable-installation-capacity": "kW",
    "estimated-energy-savings": "€",
    "annual-waste-total": "tonnes",
    "waste-recycling-percentage": "%",
    "landfill-diversion-rate": "%",
    "waste-repurposing": "tonnes",
    "circular-economy-investment": "€",
    "total-employee-count": None,
    "gender-diversity-percentage": "%",
    "sustainability-training-hours": "hours",
    "employee-turnover-rate": "%",
    "leadership-diversity": "%",
    "health-safety-incident-rate": "incidents per 100 employees",
    "board-sustainability-expertise": "%",
    "supplier-sustainability-percentage": "%",
    "local-suppliers-percentage": "%",
    "supply-chain-emissions-reduction": "%",
    "financial-impact-climate-risk": "€",
    "revenue-at-risk-climate": "%",
    "climate-adaptation-investment": "€",
    "operations-in-sensitive-areas": "%",
    "biodiversity-investment": "€",
    "staff-training-hours": "hours"
}

# Create a new nested structure: a dictionary keyed by section,
# where each value is a list of question dictionaries.
grouped_questions = defaultdict(list)

for question in flat_questions:
    # Create a new question dictionary that excludes 'calculation_method' and 'example'
    new_question = {
        "question_id": question["question_id"],
        "question_text": question["question_text"],
        "question_type": question["question_type"],
        "options": question["options"],
        "required": question["required"]
    }
    # For number type questions, add a unit if available in our mapping.
    if question["question_type"] == "number":
        new_question["unit"] = unit_mapping.get(question["question_id"])
    grouped_questions[question["section"]].append(new_question)

# Optional: Convert the grouped questions into a list of sections with a title and questions.
sections = []
for section_name, questions in grouped_questions.items():
    sections.append({
        "section": section_name,
        "questions": questions
    })

# Output the nested JSON structure
nested_json = {
    "sections": sections
}

print(json.dumps(nested_json, indent=2))
