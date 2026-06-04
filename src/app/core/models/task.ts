export interface Subtask {
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status?: string;
  subtasks?: Subtask[];
}
