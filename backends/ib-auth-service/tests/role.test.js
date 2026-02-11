const RoleService = require('../server/api/services/RoleService');
const { getPool } = require('../server/utils/db');

jest.mock('../server/utils/db');

describe('RoleService', () => {
    let mockPool;

    beforeEach(() => {
        mockPool = {
            request: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({ recordset: [] }),
        };
        getPool.mockResolvedValue(mockPool);
    });

    describe('createRole', () => {
        it('should create a role successfully', async () => {
            const roleName = 'Admin';
            const description = 'Administrator role';

            const result = await RoleService.createRole(roleName, description);

            expect(result).toHaveProperty('id');
            expect(result.name).toBe(roleName);
            expect(mockPool.query).toHaveBeenCalled();
        });
    });

    describe('assignPermissionToRole', () => {
        it('should assign a permission to a role', async () => {
            const roleId = 'role-123';
            const permissionId = 'perm-456';

            await RoleService.assignPermissionToRole(roleId, permissionId);

            expect(mockPool.input).toHaveBeenCalledWith('roleId', roleId);
            expect(mockPool.input).toHaveBeenCalledWith('permissionId', permissionId);
            expect(mockPool.query).toHaveBeenCalled();
        });
    });
});
