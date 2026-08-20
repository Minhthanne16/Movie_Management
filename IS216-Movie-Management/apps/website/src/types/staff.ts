export interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  shift: string;
  status: string;
  enabled: boolean;
  createdAt: string;
}

export interface StaffRequest {
  name: string;
  email: string;
  phone: string;
  role: string;
  shift: string;
  status: string;
}
