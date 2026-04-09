export interface LandFlowData {
  id: number;
  name: string;
  date: string; // ISO format: YYYY-MM-DD
  acre: number;
  flowTimes: number; // how many times land has been flowed/irrigated
}

export const LandFlowData: LandFlowData[] = [
  { id: 1, name: "Ashan Perera", date: "2024-03-12", acre: 120, flowTimes: 5 },
  { id: 2, name: "Nimal Fernando", date: "2024-05-28", acre: 85, flowTimes: 3 },
  { id: 3, name: "Kasun Silva", date: "2024-07-04", acre: 200, flowTimes: 6 },
  {
    id: 4,
    name: "Dilani Rajapaksa",
    date: "2024-09-15",
    acre: 60,
    flowTimes: 2,
  },
  {
    id: 5,
    name: "Priya Dissanayake",
    date: "2024-11-01",
    acre: 45,
    flowTimes: 4,
  },
  {
    id: 6,
    name: "Rukmal Jayawardena",
    date: "2025-01-20",
    acre: 310,
    flowTimes: 7,
  },
  {
    id: 7,
    name: "Saman Gunaratne",
    date: "2025-02-08",
    acre: 30,
    flowTimes: 1,
  },
  {
    id: 8,
    name: "Thilini Wickrama",
    date: "2025-03-17",
    acre: 72,
    flowTimes: 5,
  },
  {
    id: 9,
    name: "Chaminda Bandara",
    date: "2025-03-29",
    acre: 50,
    flowTimes: 3,
  },
  {
    id: 10,
    name: "Iresha Liyanage",
    date: "2025-04-02",
    acre: 95,
    flowTimes: 6,
  },
];
