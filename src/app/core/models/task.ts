export interface Task {
  title: string;
  description?: string;
  status?: string;
  isCompleted?: boolean;

  subtasks?: {title: string; isCompleted: boolean }[];
}
