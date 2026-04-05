export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type BloomLevel = 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create';
export type QuestionType = 'MCQ' | 'Descriptive' | 'Case-based';

export interface Question {
  id?: string;
  text: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  marks: number;
  topic: string;
  difficulty: Difficulty;
  bloomLevel: BloomLevel;
  type: QuestionType;
  btLevel?: string; // e.g. "1,2"
  coLevel?: string; // e.g. "2"
}

export interface Section {
  name: string;
  instructions: string;
  questions: Question[];
  numQuestions?: number;
  marksPerQuestion?: number;
}

export interface QuestionPaper {
  id?: string;
  userId: string;
  title: string;
  syllabus: string;
  difficulty: Difficulty;
  bloomLevels: BloomLevel[];
  questionTypes: QuestionType[];
  totalMarks: number;
  numQuestions: number;
  sections: Section[];
  createdAt: string;
  
  // New metadata for the template
  collegeName?: string;
  examType?: string; // e.g. "END SEMESTER EXAMINATION"
  monthYear?: string; // e.g. "MAY 2025"
  branch?: string; // e.g. "Computer Engineering"
  semester?: string; // e.g. "SEM-VI"
  subjectCode?: string; // e.g. "CE 320"
  examDate?: string;
  timeDuration?: string; // e.g. "02.00 Hours"
  courseOutcomes?: string[]; // e.g. ["CO1: ...", "CO2: ..."]
  
  // 40-marks template metadata
  academicYear?: string; // e.g. "2024-25"
  facultyName?: string; // e.g. "Dr. Sharvari Govilkar"
  classDivSem?: string; // e.g. "TY A/B SEM VI"
  classTest?: string; // e.g. "Class Test: II"
  department?: string; // e.g. "Department of Computer Engineering"
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: string;
}
