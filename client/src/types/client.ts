export type Client = {
  id: number;
  name: string;
  contractStart: string;
  contractEnd: string;
  driveFolder: string | null;
  notes: string | null;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};