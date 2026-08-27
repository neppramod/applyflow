export interface Job {
  id: number;
  company: string;
  role: string;
  status: 'APPLIED' | 'INTERVIEWING' | 'OFFER' | 'REJECTED';
  appliedDate: string;
  description: string;
  link?: string;      // Added optional field
  location?: string;  // Added optional field
}

// Interface to map backend Spring Data Page wrapper object responses
export interface PaginatedResponse {
  content: Job[];
  totalPages: number;
  totalElements: number;
  number: number; // Current page index
  size: number;
}
