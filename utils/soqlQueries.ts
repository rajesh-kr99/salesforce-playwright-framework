// tests/api/helpers/soqlQueries.ts
export const FIELD_PERMISSIONS_QUERY = `
SELECT Id, Field, SObjectType, PermissionsRead, PermissionsEdit, parentId, parent.Profile.Name
FROM FieldPermissions
WHERE parentId IN (
        SELECT id
        FROM permissionset
        WHERE PermissionSet.Profile.Name = 'System Administrator'
      )
  AND SObjectType = 'Account'
`;
