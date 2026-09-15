export type CompanyTypeOption = 
  | 'Startup'
  | 'Private'
  | 'Public'
  | 'MNC'
  | 'Government'
  | 'Other';

export type CompanySizeOption = 
  | '1-10'
  | '11-50'
  | '51-200'
  | '201-500'
  | '501-1000'
  | '1000+';

export interface CompanyProfile {
  id: string;
  userId: string;
  companyName: string;
  logo?: string;
  officialEmail: string;
  phoneNumber: string;
  companyType: CompanyTypeOption;
  companySize: CompanySizeOption;
  foundedYear?: number | string;
  website?: string;
  linkedin?: string;
  description?: string;
  updatedAt: string;
}
