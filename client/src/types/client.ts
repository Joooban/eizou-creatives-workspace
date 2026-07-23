export type Client = {
  id: number;
  name: string;
  contractStart: string;
  contractEnd: string;
  driveFolder: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};