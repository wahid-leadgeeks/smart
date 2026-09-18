export type DepartmentFunction =
  | 'Website Management'
  | 'Infrastructure Management'
  | 'Cybersecurity'
  | 'Technology Optimization & Innovation'
  | 'Others';

export type GoalType = 'Breakthrough' | 'Improvement' | 'Routine';

export type GoalStatus =
  | 'Not started'
  | 'In Progress'
  | 'Completed'
  | 'Postponed'
  | 'Cancelled';

export type AccomplishmentStatus =
  | 'Completed: Early'
  | 'Completed: On Time'
  | 'Completed: Late'
  | 'Ongoing'
  | 'Not Started'
  | 'Overdue';

export interface MonthlyLog {
  id?: number;
  goal_id: number;
  month_number: number; // 1 to 12
  month_name: string;   // January .. December
  achievement_status: 'Not started' | 'In Progress' | 'Completed' | 'Overdue' | 'N/A';
  result_link: string;
  result_url?: string;
  challenge: string;
  homework: string;
  updated_at?: string;
}

export interface Goal {
  id: number;
  row_number: number;
  function: DepartmentFunction;
  title: string;
  specific_statement: string;
  action_plan: string;
  target: string;
  the_way: string;
  goal_type: GoalType;
  owner: string;
  pic: string;
  collaborators: string;
  collaboration_flag: 'Yes' | 'No';
  type: string;
  period: string;
  complexity: string;
  frequency: string;
  execution_period: string;
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
  budget_available: string;
  hr_available: string;
  time_available: string;
  tech_available: string;
  resource_plan: string;
  company_focus_ref: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  day_counter?: string;
  status: GoalStatus;
  accomplishment_status: AccomplishmentStatus;
  half_adjustment?: string;
  notes?: string;
  monthly_logs?: MonthlyLog[];
}

export interface BigSixObjective {
  id: number;
  objective_number: number;
  title: string;
  status_quo: string;
  strategic_objective: string;
  focus_area: string;
  pic: string;
  focus_category: string;
  company_focus?: string;
  company_priority?: string;
}

export interface FilterState {
  search: string;
  function: DepartmentFunction | 'All';
  status: GoalStatus | 'All';
  goalType: GoalType | 'All';
}

export type ViewMode = 'roadmap' | 'board' | 'cadence' | 'strategic';
