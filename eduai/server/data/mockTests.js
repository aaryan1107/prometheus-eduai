export const mockTests = [
  {
    id: "math-algebra-1",
    subject: "Mathematics",
    chapter: "Algebra",
    grade: "Grade 10",
    durationMinutes: 12,
    difficulty: "Core",
    testType: "Concept Check",
    questions: [
      {
        id: "alg-q1",
        question: "Solve: 2x + 5 = 17.",
        options: ["x = 4", "x = 5", "x = 6", "x = 11"],
        correctAnswer: "x = 6",
        concept: "Linear equations",
        solution: "Subtract 5 from both sides to get 2x = 12, then divide by 2."
      },
      {
        id: "alg-q2",
        question: "Expand: 3(a + 4).",
        options: ["3a + 4", "3a + 7", "3a + 12", "a + 12"],
        correctAnswer: "3a + 12",
        concept: "Distributive property",
        solution: "Multiply 3 by both terms inside the bracket: 3a + 12."
      }
    ]
  },
  {
    id: "math-geometry-1",
    subject: "Mathematics",
    chapter: "Geometry",
    grade: "Grade 10",
    durationMinutes: 12,
    difficulty: "Core",
    testType: "Marks Drill",
    questions: [
      {
        id: "geo-q1",
        question: "The angles of a triangle are 60 degrees, 50 degrees and x. Find x.",
        options: ["50 degrees", "60 degrees", "70 degrees", "80 degrees"],
        correctAnswer: "70 degrees",
        concept: "Triangle angle sum",
        solution: "Angles in a triangle add to 180 degrees, so x = 180 - 60 - 50 = 70 degrees."
      },
      {
        id: "geo-q2",
        question: "A square has side length 6 cm. What is its area?",
        options: ["12 cm2", "24 cm2", "36 cm2", "48 cm2"],
        correctAnswer: "36 cm2",
        concept: "Area of a square",
        solution: "Area of a square is side x side, so 6 x 6 = 36 cm2."
      }
    ]
  },
  {
    id: "math-probability-1",
    subject: "Mathematics",
    chapter: "Probability",
    grade: "Grade 10",
    durationMinutes: 10,
    difficulty: "Core",
    testType: "Concept Check",
    questions: [
      {
        id: "prob-q1",
        question: "A bag contains 2 red balls and 3 blue balls. What is the probability of selecting a blue ball?",
        options: ["2/5", "3/5", "1/2", "3/2"],
        correctAnswer: "3/5",
        concept: "Basic probability",
        solution: "There are 5 total balls and 3 blue balls, so probability = 3/5."
      },
      {
        id: "prob-q2",
        question: "If P(E) = 0.35, what is P(not E)?",
        options: ["0.35", "0.65", "1.35", "0"],
        correctAnswer: "0.65",
        concept: "Complementary events",
        solution: "P(not E) = 1 - P(E) = 1 - 0.35 = 0.65."
      }
    ]
  },
  {
    id: "physics-motion-1",
    subject: "Physics",
    chapter: "Motion",
    grade: "Grade 9",
    durationMinutes: 10,
    difficulty: "Core",
    testType: "Concept Check",
    questions: [
      {
        id: "motion-q1",
        question: "Which formula links speed, distance and time?",
        options: ["speed = distance/time", "speed = time/distance", "speed = distance x time", "speed = mass x acceleration"],
        correctAnswer: "speed = distance/time",
        concept: "Speed formula",
        solution: "Speed tells how much distance is covered per unit time."
      },
      {
        id: "motion-q2",
        question: "What does acceleration measure?",
        options: ["Change in mass", "Change in speed or velocity over time", "Total distance only", "Weight of an object"],
        correctAnswer: "Change in speed or velocity over time",
        concept: "Acceleration",
        solution: "Acceleration is the rate of change of velocity with time."
      }
    ]
  },
  {
    id: "physics-electricity-1",
    subject: "Physics",
    chapter: "Electricity",
    grade: "Grade 10",
    durationMinutes: 10,
    difficulty: "Core",
    testType: "Application",
    questions: [
      {
        id: "elec-q1",
        question: "What is the unit of electric current?",
        options: ["Volt", "Ampere", "Ohm", "Watt"],
        correctAnswer: "Ampere",
        concept: "Electric current",
        solution: "Electric current is measured in amperes."
      },
      {
        id: "elec-q2",
        question: "If voltage is 12 V and resistance is 4 ohms, what is current?",
        options: ["2 A", "3 A", "8 A", "48 A"],
        correctAnswer: "3 A",
        concept: "Ohm's law",
        solution: "Using I = V/R, current = 12/4 = 3 A."
      }
    ]
  },
  {
    id: "chem-atomic-1",
    subject: "Chemistry",
    chapter: "Atomic Structure",
    grade: "Grade 9",
    durationMinutes: 10,
    difficulty: "Core",
    testType: "Recall",
    questions: [
      {
        id: "atom-q1",
        question: "Which particle has a negative charge?",
        options: ["Proton", "Neutron", "Electron", "Nucleus"],
        correctAnswer: "Electron",
        concept: "Subatomic particles",
        solution: "Electrons are negatively charged particles outside the nucleus."
      },
      {
        id: "atom-q2",
        question: "Where are protons found?",
        options: ["In shells", "In the nucleus", "Outside the atom", "Between atoms"],
        correctAnswer: "In the nucleus",
        concept: "Atomic nucleus",
        solution: "Protons and neutrons are found in the nucleus."
      }
    ]
  },
  {
    id: "chem-bonding-1",
    subject: "Chemistry",
    chapter: "Chemical Bonding",
    grade: "Grade 10",
    durationMinutes: 12,
    difficulty: "Core",
    testType: "Concept Check",
    questions: [
      {
        id: "bond-q1",
        question: "What happens in ionic bonding?",
        options: ["Electrons are shared", "Electrons are transferred", "Atoms disappear", "Nuclei combine"],
        correctAnswer: "Electrons are transferred",
        concept: "Ionic bonding",
        solution: "Ionic bonding happens when electrons transfer from one atom to another."
      },
      {
        id: "bond-q2",
        question: "Covalent bonding usually involves:",
        options: ["Sharing electrons", "Transferring protons", "Losing neutrons", "Breaking nuclei"],
        correctAnswer: "Sharing electrons",
        concept: "Covalent bonding",
        solution: "Covalent bonds form when atoms share electron pairs."
      }
    ]
  },
  {
    id: "bio-cells-1",
    subject: "Biology",
    chapter: "Cell Structure",
    grade: "Grade 9",
    durationMinutes: 10,
    difficulty: "Core",
    testType: "Recall",
    questions: [
      {
        id: "cell-q1",
        question: "Which structure controls most cell activities?",
        options: ["Cell wall", "Nucleus", "Vacuole", "Cytoplasm"],
        correctAnswer: "Nucleus",
        concept: "Cell organelles",
        solution: "The nucleus contains genetic material and controls many cell activities."
      },
      {
        id: "cell-q2",
        question: "Which part is found in plant cells but not animal cells?",
        options: ["Cell membrane", "Cytoplasm", "Cell wall", "Nucleus"],
        correctAnswer: "Cell wall",
        concept: "Plant and animal cells",
        solution: "Plant cells have a cell wall, while animal cells do not."
      }
    ]
  },
  {
    id: "bio-photosynthesis-1",
    subject: "Biology",
    chapter: "Photosynthesis",
    grade: "Grade 9",
    durationMinutes: 10,
    difficulty: "Core",
    testType: "Concept Check",
    questions: [
      {
        id: "photo-q1",
        question: "Which gas do plants take in for photosynthesis?",
        options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
        correctAnswer: "Carbon dioxide",
        concept: "Photosynthesis inputs",
        solution: "Plants use carbon dioxide and water to make glucose during photosynthesis."
      },
      {
        id: "photo-q2",
        question: "Which pigment helps absorb light energy?",
        options: ["Chlorophyll", "Hemoglobin", "Insulin", "Keratin"],
        correctAnswer: "Chlorophyll",
        concept: "Chlorophyll",
        solution: "Chlorophyll absorbs light energy for photosynthesis."
      }
    ]
  },
  {
    id: "english-reading-1",
    subject: "English",
    chapter: "Reading Comprehension",
    grade: "Grade 10",
    durationMinutes: 12,
    difficulty: "Core",
    testType: "Skill Drill",
    questions: [
      {
        id: "read-q1",
        question: "What should evidence in a reading answer do?",
        options: ["Replace the explanation", "Support the point", "Add random detail", "Repeat the question only"],
        correctAnswer: "Support the point",
        concept: "Evidence use",
        solution: "Evidence should support the point and be explained clearly."
      },
      {
        id: "read-q2",
        question: "A good inference is based on:",
        options: ["Only guessing", "Text clues and reasoning", "Personal opinion only", "The longest sentence"],
        correctAnswer: "Text clues and reasoning",
        concept: "Inference",
        solution: "Inference combines evidence from the text with logical reasoning."
      }
    ]
  },
  {
    id: "english-writing-1",
    subject: "English",
    chapter: "Grammar / Writing Skills",
    grade: "Grade 10",
    durationMinutes: 10,
    difficulty: "Core",
    testType: "Writing Skill",
    questions: [
      {
        id: "write-q1",
        question: "Which sentence is clearest?",
        options: ["Because rain.", "The match was cancelled because it rained.", "Cancelled match rain because.", "It rain match cancelled."],
        correctAnswer: "The match was cancelled because it rained.",
        concept: "Sentence clarity",
        solution: "A clear sentence has a complete idea and logical word order."
      },
      {
        id: "write-q2",
        question: "What should a paragraph usually have?",
        options: ["Only examples", "A main idea and supporting details", "No topic", "Only one word"],
        correctAnswer: "A main idea and supporting details",
        concept: "Paragraph structure",
        solution: "A paragraph should develop one main idea with support."
      }
    ]
  },
  {
    id: "sat-math-1",
    subject: "SAT Preparation",
    chapter: "SAT Math",
    grade: "SAT / External Exam",
    durationMinutes: 15,
    difficulty: "Core",
    testType: "SAT Drill",
    questions: [
      {
        id: "satm-q1",
        question: "If 3x = 21, what is x?",
        options: ["6", "7", "18", "24"],
        correctAnswer: "7",
        concept: "Linear equations",
        solution: "Divide both sides by 3 to get x = 7."
      },
      {
        id: "satm-q2",
        question: "A number increased by 20% becomes 60. What was the original number?",
        options: ["40", "48", "50", "72"],
        correctAnswer: "50",
        concept: "Percent change",
        solution: "Original x satisfies 1.2x = 60, so x = 50."
      }
    ]
  },
  {
    id: "sat-reading-1",
    subject: "SAT Preparation",
    chapter: "SAT Reading",
    grade: "SAT / External Exam",
    durationMinutes: 15,
    difficulty: "Core",
    testType: "SAT Drill",
    questions: [
      {
        id: "satr-q1",
        question: "For an evidence question, the best answer should:",
        options: ["Sound impressive", "Directly support the previous answer", "Be the longest option", "Introduce a new claim"],
        correctAnswer: "Directly support the previous answer",
        concept: "Evidence pairing",
        solution: "Evidence answers should directly support the claim or inference selected."
      },
      {
        id: "satr-q2",
        question: "When stuck between two SAT reading choices, first check:",
        options: ["Which sounds familiar", "Which is supported by exact text", "Which uses hard words", "Which is shortest"],
        correctAnswer: "Which is supported by exact text",
        concept: "Text evidence",
        solution: "SAT reading rewards answers that are directly supported by the passage."
      }
    ]
  }
];
