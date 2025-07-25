-- Insert dummy questions for testing
-- Physics questions
INSERT INTO public.questions (question_text, topic_id, question_type, difficulty, options, correct_answer, points, explanation, solution_steps) VALUES
(
  'A body is thrown vertically upward with an initial velocity of 20 m/s. What is the maximum height reached? (g = 10 m/s²)',
  (SELECT id FROM topics WHERE name = 'Kinematics' LIMIT 1),
  'single_correct',
  'easy',
  '[
    "10 m",
    "20 m", 
    "30 m",
    "40 m"
  ]'::jsonb,
  '1'::jsonb,
  10,
  'Using the kinematic equation v² = u² + 2as, at maximum height v = 0',
  'Given: u = 20 m/s, v = 0 (at max height), g = -10 m/s²
Using v² = u² + 2as
0 = (20)² + 2(-10)s
0 = 400 - 20s
s = 20 m'
),
(
  'The SI unit of force is:',
  (SELECT id FROM topics WHERE name = 'Laws of Motion' LIMIT 1),
  'single_correct', 
  'easy',
  '[
    "Joule",
    "Newton",
    "Watt", 
    "Pascal"
  ]'::jsonb,
  '1'::jsonb,
  5,
  'Force is measured in Newtons (N) in the SI system',
  'By definition, 1 Newton = 1 kg⋅m/s²'
),
(
  'A car accelerates from rest to 30 m/s in 10 seconds. Calculate the acceleration and distance covered.',
  (SELECT id FROM topics WHERE name = 'Kinematics' LIMIT 1),
  'numerical',
  'medium',
  NULL,
  '3'::jsonb,
  15,
  'Use basic kinematic equations for constant acceleration',
  'Given: u = 0, v = 30 m/s, t = 10 s
Acceleration: a = (v-u)/t = (30-0)/10 = 3 m/s²
Distance: s = ut + ½at² = 0 + ½(3)(10)² = 150 m'
);

-- Chemistry questions  
INSERT INTO public.questions (question_text, topic_id, question_type, difficulty, options, correct_answer, points, explanation, solution_steps) VALUES
(
  'What is the molecular formula of benzene?',
  (SELECT id FROM topics WHERE name = 'Hydrocarbons' LIMIT 1),
  'single_correct',
  'easy', 
  '[
    "C₆H₁₂",
    "C₆H₆",
    "C₆H₁₄",
    "C₆H₁₀"
  ]'::jsonb,
  '1'::jsonb,
  10,
  'Benzene is an aromatic hydrocarbon with 6 carbon atoms and 6 hydrogen atoms',
  'Benzene has a ring structure with alternating double bonds, giving it the formula C₆H₆'
),
(
  'Which of the following is the strongest acid?',
  (SELECT id FROM topics WHERE name = 'Equilibrium' LIMIT 1),
  'single_correct',
  'medium',
  '[
    "HCl",
    "HF", 
    "HI",
    "HBr"
  ]'::jsonb,
  '2'::jsonb,
  15,
  'HI is the strongest among halogen acids due to the large size of iodine',
  'Acid strength increases down the group: HF < HCl < HBr < HI
This is due to decreasing bond strength and increasing atomic size'
);

-- Mathematics questions
INSERT INTO public.questions (question_text, topic_id, question_type, difficulty, options, correct_answer, points, explanation, solution_steps) VALUES
(
  'What is the derivative of sin(x)?',
  (SELECT id FROM topics WHERE name = 'Differentiation' LIMIT 1),
  'single_correct',
  'easy',
  '[
    "cos(x)",
    "-cos(x)",
    "sin(x)", 
    "-sin(x)"
  ]'::jsonb,
  '0'::jsonb,
  10,
  'The derivative of sin(x) with respect to x is cos(x)',
  'By definition: d/dx[sin(x)] = cos(x)'
),
(
  'Solve for x: 2x + 5 = 17',
  (SELECT id FROM topics WHERE name = 'Algebra' LIMIT 1),
  'numerical',
  'easy',
  NULL,
  '6'::jsonb,
  5,
  'Isolate x by performing inverse operations',
  '2x + 5 = 17
2x = 17 - 5
2x = 12  
x = 6'
),
(
  'Find the integral of x²dx:',
  (SELECT id FROM topics WHERE name = 'Integration' LIMIT 1),
  'single_correct',
  'medium',
  '[
    "x³/3 + C",
    "x³ + C",
    "2x + C",
    "3x² + C"
  ]'::jsonb,
  '0'::jsonb,
  15,
  'Use the power rule for integration',
  '∫x²dx = x^(2+1)/(2+1) + C = x³/3 + C'
);