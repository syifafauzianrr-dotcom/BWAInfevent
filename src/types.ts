export interface Option {
  id: string;
  text: string;
  isEliminated: boolean;
  color: string;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  options: string[];
}

export interface Voter {
  name: string;
  votedOptionId: string | null;
}

export interface Room {
  id: string;
  title: string;
  description: string;
  options: Option[];
  voters: { [voterName: string]: string | null }; // map of voter name -> optionId voted
  isEnded: boolean;
  spinning: boolean;
  resultOptionId: string | null;
  vetoedOptionIds: string[];
  createdAt: number;
}
