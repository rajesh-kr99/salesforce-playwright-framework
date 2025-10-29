// tests/api/helpers/sortHelper.ts
import type { FieldPermissionData, FieldPermissionRecord } from '../utils/types';

export function sortRecordsById(data: FieldPermissionData): FieldPermissionData {
  if (data.records && Array.isArray(data.records)) {
    data.records.sort((a: FieldPermissionRecord, b: FieldPermissionRecord) =>
      a.Id.localeCompare(b.Id)
    );
  }
  return data;
}
