export type EventItem = {
  id: number;
  title: string;
  game: string;
  date: string;
  slots: string;
  status: "Aperto" | "Pieno";
};

export const events: EventItem[] = [];