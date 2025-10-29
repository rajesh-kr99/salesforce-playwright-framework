// types.ts

export interface FieldPermissionRecord {
  Id: string;
  Field: string;
  SobjectType: string;
  PermissionsRead: boolean;
  PermissionsEdit: boolean;
  ParentId: string;
  Parent?: {
    Name?: string;
    attributes?: any;
    Profile?: any;
  };
  attributes?: any;
}

export interface FieldPermissionData {
  totalSize: number;
  done: boolean;
  records: FieldPermissionRecord[];
}

// utils/types.ts
export interface AccountData {
  Name: string;
  Phone: string;
  Website: string;
  BillingStreet: string;
  BillingCity: string;
  BillingState: string;
  BillingPostalCode: string;
  BillingCountry: string;
  Industry: string;
  AnnualRevenue: number;
  NumberOfEmployees: number;
  Description: string;
  Type: string;
}
