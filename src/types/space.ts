
export interface SpaceMemberProfile {
    account_id: number;
    birth_date: string;
    course: string;
    department: string;
    email: string;
    full_name: string;
    gender: string;
    profile_pic: string;
    role: string;
    year_level: string;
}



interface SpaceSettings {
    space_cover: string;
    max_member: number;
}

export interface SpaceCreateData {
    space_name: string;
    description?: string;
    settings?: SpaceSettings;
}
export interface CourseSpaceCreateData {
    space_name: string;
    space_description: string;
    space_day: string;
    space_time_start: string;
    space_time_end: string;
    space_yr_lvl: number;
    space_settings?: SpaceSettings;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface SpacePendingInvitation {
    account_id: number;
    email: string;
    fullname: string;
    profile_pic: string;
    added_at: string;
}

export interface PendingSpaceInvitation {
  invitation_id: number;
  space_id: number;
  space_uuid: string;
  space_name: string;
  owner_id: number;
  invited_at: string;
  expires_at: string;
  owner_profile_pic: string;
  owner_email: string;
  owner_fullname: string;
}

export interface Space {
    space_id: string;
    space_uuid: string;
    space_name: string;
    space_type: string;
    members: SpaceMemberProfile[];
    description: string | null;
    settings?: SpaceSettings;
    created_by: string; // User ID
    created_at: string;
    updated_at: string;
}

export interface CourseSPace {
    space_id: string;
    space_uuid: string;
    space_name: string;
    space_description: string;
    space_day: string;
    space_time_start: string;
    space_time_end: string;
    space_yr_lvl: string;
    // space_type: string;
    members: SpaceMemberProfile[];
    // description: string | null;
    settings?: SpaceSettings;
    created_by: string; // User ID
    created_at: string;
    // updated_at: string;
}







export interface Task {
    has_answered: boolean,
    task_id: number;
    lesson_id?: number;
    space_id?: number;
    task_title: string;
    task_instruction?: string;
    total_score?: number;
    due_date: string;
    created_at: string;
    updated_at: string;
}

export interface DraftTask {
    id: number;
    task_id?: number;
    task_title: string;
    task_instruction?: string;
    task_scoring?: number;
    task_due: string;
    task_status: "Draft";
    task_file?: string;
    created_at: string;
    updated_at: string;
    space_id: string;
}

export interface TaskCreateData {
    space_id: number;
    title: string;
    instruction?: string;
    scoring?: number;
    status: string;
    due_date: string;
    groupsData?: any[];
}


export interface Choice {
  choice_id: number;
  letter_identifier: string;
  choice_answer: string;
}

export interface Question {
  question_id: number;
  task_id: number;
  question: string;
  question_type: string; // e.g., "mcq"
  order_no: number;
  choices: Choice[];
}

// The "data" array is just: Question[]
export type QuestionnaireData = Question[];


export type AnswerData = {
  task_id: number;
  answers: {
    question_id: number;
    choice_id: number;
  }[];
};