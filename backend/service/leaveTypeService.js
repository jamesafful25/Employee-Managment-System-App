const { LeaveType, Leave } = require('../model');
const { AppError } = require('../utils/errorHandler');

// Creat Leave Type
const createLeaveType = async(data) => {
    const existing = await LeaveType.findOne({ where: { name: data.name } });
    if (existing) throw new AppError('Leave type already exists', 409);

    const leaveType = await LeaveType.create({
        name: data.name,
        max_days: data.max_days,
    });

    return leaveType;
};

//Get all leave types 
const getAllLeaveTypes = async() => {
    const leaveTypes = await LeaveType.findAll({
        order: [
            ['name', 'ASC']
        ],
    });

    return leaveTypes;
};

//Get Leave Type by ID 
const getLeaveTypeById = async(id) => {
    const leaveType = await LeaveType.findByPk(id);
    if (!leaveType) throw new AppError('Leave type not found', 404);

    return leaveType;
};

//Update Leave Type 
const updateLeaveType = async(id, data) => {
    const leaveType = await LeaveType.findByPk(id);
    if (!leaveType) throw new AppError('Leave type not found', 404);

    // check if new name already taken
    if (data.name && data.name !== leaveType.name) {
        const existing = await LeaveType.findOne({ where: { name: data.name } });
        if (existing) throw new AppError('Leave type name already taken', 409);
    }

    //leaveType.name = data.name ? ? leaveType.name;
    //leaveType.max_days = data.max_days ? ? leaveType.max_days;

    leaveType.name = data.name || leaveType.name;
    leaveType.max_days = data.max_days || leaveType.max_days;

    await leaveType.save();

    return leaveType;
};

// Delete Leave Type 
const deleteLeaveType = async(id) => {
    const leaveType = await LeaveType.findByPk(id);
    if (!leaveType) throw new AppError('Leave type not found', 404);

    // cannot delete if leaves are attached to this type
    const leavesCount = await Leave.count({ where: { leave_type_id: id } });
    if (leavesCount > 0) {
        throw new AppError(
            `Cannot delete leave type with ${leavesCount} existing leave records attached`,
            400
        );
    }

    await leaveType.destroy();
};

module.exports = {
    createLeaveType,
    getAllLeaveTypes,
    getLeaveTypeById,
    updateLeaveType,
    deleteLeaveType,
};