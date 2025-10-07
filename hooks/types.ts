// Cooking Timer Types
export interface TimerStep { 
    id: number; 
    stepName: string; 
    duration: number; 
}

export interface Recipe { 
    id: string; 
    name: string; 
    memo: string; 
    timers: TimerStep[]; }

// Tabata Timer Types
export interface Workout {
  id: string;
  name: string;
  prepare: number;
  work: number;
  rest: number;
  rounds: number;
}