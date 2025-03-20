-- Create users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT UNIQUE,
    has_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create questionnaires table
CREATE TABLE questionnaires (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    questions JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create responses table
CREATE TABLE responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    questionnaire_id UUID REFERENCES questionnaires(id) ON DELETE CASCADE NOT NULL,
    answers JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX idx_responses_user ON responses(user_id);
CREATE INDEX idx_responses_questionnaire ON responses(questionnaire_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only read their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Anyone can view questionnaires
CREATE POLICY "Anyone can view questionnaires" ON questionnaires
    FOR SELECT
    USING (true);

-- Users can only view their own responses
CREATE POLICY "Users can view own responses" ON responses
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own responses
CREATE POLICY "Users can insert own responses" ON responses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Example questionnaire template
INSERT INTO questionnaires (title, questions) VALUES (
    'CSRD Environmental Report',
    '{
        "sections": [
            {
                "title": "Carbon Emissions",
                "questions": [
                    {
                        "id": "q1",
                        "type": "number",
                        "required": true,
                        "label": "What is your total CO2 emission for the reporting period?",
                        "unit": "tonnes"
                    },
                    {
                        "id": "q2",
                        "type": "select",
                        "required": true,
                        "label": "What methodology did you use to calculate emissions?",
                        "options": [
                            "GHG Protocol",
                            "ISO 14064",
                            "Other"
                        ]
                    }
                ]
            }
        ]
    }'
); 