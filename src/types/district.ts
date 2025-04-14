
export type DistrictConsentType = 'individual' | 'code_of_conduct' | 'written_permission';

export interface SchoolDistrict {
  id: string;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface DistrictSettings {
  id: string;
  district_id: string;
  min_age: number;
  max_age: number;
  require_parental_consent: boolean;
  consent_type: DistrictConsentType;
  created_at: string;
  updated_at: string;
}

export interface DistrictUser {
  id: string;
  user_id: string;
  district_id: string;
  role: string;
  consent_provided: boolean;
  consent_type: DistrictConsentType | null;
  consent_date: string | null;
  created_at: string;
  updated_at: string;
}
