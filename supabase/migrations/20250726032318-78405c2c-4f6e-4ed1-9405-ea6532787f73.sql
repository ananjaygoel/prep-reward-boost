-- Insert dummy questions for testing using existing topic IDs

-- Physics questions (Mechanics)
INSERT INTO public.questions (question_text, topic_id, question_type, difficulty, options, correct_answer, points, explanation, solution_steps) VALUES
(
  'A body is thrown vertically upward with an initial velocity of 20 m/s. What is the maximum height reached? (g = 10 m/s²)',
  '30505344-f07e-418d-a748-c09f702b411d', -- Mechanics
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
  'Given: u = 20 m/s, v = 0 (at max height), g = -10 m/s²\nUsing v² = u² + 2as\n0 = (20)² + 2(-10)s\n0 = 400 - 20s\ns = 20 m'
),
(
  'The SI unit of force is:',
  '30505344-f07e-418d-a748-c09f702b411d', -- Mechanics
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
  'A car accelerates from rest to 30 m/s in 10 seconds. What is the acceleration?',
  '30505344-f07e-418d-a748-c09f702b411d', -- Mechanics
  'numerical',
  'medium',
  NULL,
  '3'::jsonb,
  15,
  'Use basic kinematic equations for constant acceleration',
  'Given: u = 0, v = 30 m/s, t = 10 s\nAcceleration: a = (v-u)/t = (30-0)/10 = 3 m/s²'
);

-- Chemistry questions (Organic Chemistry)
INSERT INTO public.questions (question_text, topic_id, question_type, difficulty, options, correct_answer, points, explanation, solution_steps) VALUES
(
  'What is the molecular formula of benzene?',
  '961a1099-18f6-43fc-8712-47bb5eee0ed8', -- Organic Chemistry
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
  'Which functional group is present in alcohols?',
  '961a1099-18f6-43fc-8712-47bb5eee0ed8', -- Organic Chemistry
  'single_correct',
  'easy',
  '[
    "-COOH",
    "-OH", 
    "-CHO",
    "-CO-"
  ]'::jsonb,
  '1'::jsonb,
  10,
  'Alcohols contain the hydroxyl (-OH) functional group',
  'The -OH group attached to carbon characterizes alcohols'
);

-- Chemistry questions (Physical Chemistry)
INSERT INTO public.questions (question_text, topic_id, question_type, difficulty, options, correct_answer, points, explanation, solution_steps) VALUES
(
  'Which of the following is the strongest acid?',
  '9b776536-892d-485d-9071-b64da34b5d63', -- Physical Chemistry
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
  'Acid strength increases down the group: HF < HCl < HBr < HI\nThis is due to decreasing bond strength and increasing atomic size'
);

-- Mathematics questions (Calculus)
INSERT INTO public.questions (question_text, topic_id, question_type, difficulty, options, correct_answer, points, explanation, solution_steps) VALUES
(
  'What is the derivative of sin(x)?',
  '93aeeaf7-ca79-4717-8c3b-5af5b7efeb37', -- Calculus
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
  'Find the integral of x²dx:',
  '93aeeaf7-ca79-4717-8c3b-5af5b7efeb37', -- Calculus
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

-- Mathematics questions (Algebra)
INSERT INTO public.questions (question_text, topic_id, question_type, difficulty, options, correct_answer, points, explanation, solution_steps) VALUES
(
  'Solve for x: 2x + 5 = 17',
  '5701edcd-4ead-4445-a7b0-0afe4e215ce6', -- Algebra
  'numerical',
  'easy',
  NULL,
  '6'::jsonb,
  5,
  'Isolate x by performing inverse operations',
  '2x + 5 = 17\n2x = 17 - 5\n2x = 12\nx = 6'
),
(
  'What is the value of x in the equation x² - 5x + 6 = 0?',
  '5701edcd-4ead-4445-a7b0-0afe4e215ce6', -- Algebra
  'single_correct',
  'medium',
  '[
    "x = 2, 3",
    "x = 1, 6",
    "x = -2, -3",
    "x = 0, 5"
  ]'::jsonb,
  '0'::jsonb,
  15,
  'Factorize the quadratic equation',
  'x² - 5x + 6 = 0\n(x - 2)(x - 3) = 0\nTherefore x = 2 or x = 3'
);