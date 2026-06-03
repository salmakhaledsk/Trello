import { Task } from './task';

export interface Column {
  name: string;
  tasks: Task[];
}
