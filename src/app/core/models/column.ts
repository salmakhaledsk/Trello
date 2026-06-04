import { Task } from './task';

export interface Column {
  id: string;
  name: string;
  tasks: Task[];
}
