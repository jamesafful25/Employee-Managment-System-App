const { Department, Employee } = require('../model');
const { AppError } = require('../utils/errorHandler');
const { parsePaginationParams, buildPaginationMeta } = require('../utils/pagination');

//create a new department
const createDepartment = async(data) => {
    const existing = await Department.findOne({ where: { name: data.name } });
    if (existing) throw new AppError('Department already exists', 409);
    const department = await Department.create({ name: data.name });
    return department.toJSON();
};

//get all departments
const getAllDepartments = async(query = {}) => {
    const { limit, offset, page } = parsePaginationParams(query);

    const { count, rows } = await Department.findAndCountAll({
        include: [{
                model: Employee,
                as: 'manager',
                attributes: ['id', 'first_name', 'last_name', 'position'],
            },
            {
                model: Employee,
                as: 'employees',
                attributes: ['id', 'first_name', 'last_name', 'position'],
            },
        ],
        limit,
        offset,
        order: [
            ['name', 'ASC']
        ],
    });

    const rows_with_count = rows.map((dept) => ({
        ...dept.toJSON(),
        employeeCount: dept.employees.length,
    }));

    return {
        data: rows_with_count,
        meta: buildPaginationMeta(count, page, limit),
    };
};


//get a single department
const getDepartmentById = async(id) => {
    const department = await Department.findByPk(id, {
        include: [{
                model: Employee,
                as: 'manager',
                attributes: ['id', 'first_name', 'last_name', 'position'],
            },
            {
                model: Employee,
                as: 'employees',
                attributes: ['id', 'first_name', 'last_name', 'position', 'role'],
            },
        ],
    });
    if (!department) throw new AppError('Department not found', 404);

    return {
        ...department.toJSON(),
        employeeCount: department.employees.length,
    };
};

//update department info
const updateDepartment = async(id, data) => {
    const department = await Department.findByPk(id);
    if (!department) throw new AppError('Department not found', 404);

    if (data.name && data.name !== department.name) {
        const existing = await Department.findOne({ where: { name: data.name } });
        if (existing) throw new AppError('Department name already taken', 409);
    }

    department.name = data.name || department.name;
    await department.save();

    const updatedDepartment = await Department.findByPk(id, {
        include: [
            { model: Employee, as: 'manager', attributes: ['id', 'first_name', 'last_name'] },
            { model: Employee, as: 'employees', attributes: ['id', 'first_name', 'last_name'] },
        ],
    });

    return updatedDepartment.toJSON();
};

//delete department
const deleteDepartment = async(id) => {
    const department = await Department.findByPk(id, {
        include: [{ model: Employee, as: 'employees' }],
    });
    if (!department) throw new AppError('Department not found', 404);

    if (department.employees.length > 0) {
        throw new AppError(
            `Cannot delete department with ${department.employees.length} assigned employees. Reassign them first.`,
            400
        );
    }

    await department.destroy();
    return { message: 'Department deleted successfully' };
};

//assign a new manager role
const assignManager = async(departmentId, employeeId) => {
    const department = await Department.findByPk(departmentId);
    if (!department) throw new AppError('Department not found', 404);

    const employee = await Employee.findByPk(employeeId);
    if (!employee) throw new AppError('Employee not found', 404);

    if (Number(employee.department_id) !== Number(departmentId)) {
        throw new AppError('Employee does not belong to this department', 400);
    }

    // demote previous manager back to employee role
    if (department.manager_id && department.manager_id !== Number(employeeId)) {
        const previousManager = await Employee.findByPk(department.manager_id);
        if (previousManager && previousManager.role === 'manager') {
            previousManager.role = 'employee';
            await previousManager.save();
        }
    }

    // promote new employee to manager
    if (employee.role !== 'manager') {
        employee.role = 'manager';
        await employee.save();
    }

    department.manager_id = employeeId;
    await department.save();

    const updatedDepartment = await Department.findByPk(departmentId, {
        include: [
            { model: Employee, as: 'manager', attributes: ['id', 'first_name', 'last_name'] },
            { model: Employee, as: 'employees', attributes: ['id', 'first_name', 'last_name'] },
        ],
    });

    return updatedDepartment.toJSON();
};

//assign an employee to a department
const assignEmployeeToDept = async(departmentId, employeeId) => {
    const department = await Department.findByPk(departmentId);
    if (!department) throw new AppError('Department not found', 404);

    const employee = await Employee.findByPk(employeeId);
    if (!employee) throw new AppError('Employee not found', 404);

    if (employee.department_id === departmentId) {
        throw new AppError('Employee already belongs to this department', 400);
    }

    employee.department_id = departmentId;
    await employee.save();

    const updatedDepartment = await Department.findByPk(departmentId, {
        include: [
            { model: Employee, as: 'manager', attributes: ['id', 'first_name', 'last_name'] },
            { model: Employee, as: 'employees', attributes: ['id', 'first_name', 'last_name'] },
        ],
    });

    return updatedDepartment.toJSON();
};

module.exports = {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
    assignManager,
    assignEmployeeToDept,
};