export interface CollegeProfile {
  id?: string;
  userId: string;
  
  // 1. Basic Information
  institutionName: string;
  logoUrl?: string;
  institutionType?: string;
  establishedYear?: string;
  
  // 2. Official Contact
  officialEmail: string;
  phoneNumber?: string;
  website?: string;
  linkedinUrl?: string;
  
  // 3. Institution Address
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  
  // 4. Academic Information
  affiliatedUniversity?: string;
  accreditation?: string;
  naacGrade?: string; // legacy support
  departments?: string[] | string;
  
  // 5. Placement Cell
  placementCellName?: string;
  placementOfficerName?: string;
  placementOfficerEmail?: string;
  placementOfficerPhone?: string;
  
  // 6. About Institution
  description?: string;
  
  updatedAt?: string;
}
