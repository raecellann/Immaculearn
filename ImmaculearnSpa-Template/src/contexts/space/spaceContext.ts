import { createContext } from "react";
import {
  Space,
  SpaceCreateData,
  SpacePendingInvitation,
  Task,
  DraftTask,
  TaskCreateData,
  PendingSpaceInvitation,
  CourseSpaceCreateData,
  CourseSPace,
  QuestionnaireData,
  AnswerData,
  StudentData,
  TaskUpdateData,
  UserCompletedTaskData,
  RespondentsTaskData,
  TaskResultApiResponse,
} from "../../types/space";
import { UseQueryResult, UseMutationResult } from "@tanstack/react-query";

export interface SpaceContextType {
  // UI state
  currentSpace: Space | null;
  setCurrentSpace: (space: Space | null) => void;
  setTaskId: (taskID: number) => void;
  questionnaire: QuestionnaireData[];
  questionnaireEditData: QuestionnaireData[];
  questionnaireEditDataLoading: boolean;

  allUserCompletedTask: UserCompletedTaskData[];
  allUserCompletedTaskLoading: boolean;

  allRespondentsInTask: RespondentsTaskData[];
  allRespondentsInTaskLoading: boolean;


  studentResponseData: TaskResultApiResponse;
  studentResponseDataLoading: boolean;

  // Server data
  userSpaces: Space[];
  userSpacesLoading: boolean;
  courseSpaces: CourseSPace[];
  courseSpacesLoading: boolean;
  friendSpaces: Space[];
  friendSpacesLoading: boolean;
  isLoading: boolean;

  allUploadedTasks: Task[];
  allUploadedTasksLoading: boolean;

  archivedSpaces: CourseSPace[];
  archivedSpacesLoading: boolean;

  joinRequestsByLink: SpacePendingInvitation[];
  joinRequestsByLinkLoading: boolean;

  pendingSpaceInvitation: PendingSpaceInvitation[];
  pendingSpaceInvitationLoading: boolean;

  allJoinRequestsData: SpacePendingInvitation[];
  allJoinRequestsLoading: boolean;

  // Queries
  useJoinRequests: (
    spaceId: string,
  ) => UseQueryResult<SpacePendingInvitation[], Error>;

  // New: Task queries
  useUploadedTasks: (space_uuid: string) => UseQueryResult<Task[], Error>;

  useDraftedTasks: (spaceId: string) => UseQueryResult<DraftTask[], Error>;

  // Space mutations
  createSpace: (data: SpaceCreateData) => Promise<any>;
  createCourseSpace: (data: CourseSpaceCreateData) => Promise<any>;
  joinSpace: (inviteCode: string) => Promise<any>;
  inviteUser: (space_uuid: string, email: string) => Promise<any>;
  acceptJoinRequest: (userId: number, spaceUuid: string) => Promise<any>;
  declineJoinRequest: (userId: number, spaceUuid: string) => Promise<any>;
  leaveSpace: (space_uuid: string) => Promise<any>;
  deleteSpace: (spaceUuid: string) => Promise<any>;
  updateSpace: (spaceUuid: string, spaceData?: any) => Promise<any>;
  removeUserFromSpace: (spaceUuid: string, userId: number) => Promise<any>;
  setArchive: (spaceUuid: string) => Promise<any>;
  submitTaskAnswer: (answerData: AnswerData) => Promise<any>;

  // Invitation mutations
  getAllPendingRequest: (spaceUuid: string) => Promise<any>;
  acceptInvitation: (accountId: number, spaceUuid: string) => Promise<any>;
  declineInvitation: (accountId: number, spaceUuid: string) => Promise<any>;

  /**
   * SPACE INVITATION
   */
  acceptSpaceInvitation: (spaceUuid: string) => Promise<any>;
  declineSpaceInvitation: (spaceUuid: string) => Promise<any>;

  // New: Task mutations
  uploadTaskMutation: UseMutationResult<
    any,
    Error,
    { space_uuid: string; taskData: TaskCreateData },
    unknown
  >;

  draftTaskMutation: UseMutationResult<
    any,
    Error,
    { spaceId: string; taskData: TaskCreateData },
    unknown
  >;

  updateTaskByTaskIdMutation: UseMutationResult<
    any,
    Error,
    { taskData: TaskUpdateData },
    unknown
  >;

  updateTaskStatusMutation: UseMutationResult<
    any,
    Error,
    { taskId: number; newStatus: string },
    unknown
  >;

  updateStudentGrades: UseMutationResult<
    any,
    Error,
    { student_id: number;
      space_uuid: string;
      prelim: number;
      midterm: number;
      prefinals: number;
      finals: number; },
    unknown
  >;

  student_remarks: StudentData[];

  one_student_remarks: StudentData[];
  oneremarksLoading: boolean;
}

export const SpaceContext = createContext<SpaceContextType | undefined>(
  undefined,
);
