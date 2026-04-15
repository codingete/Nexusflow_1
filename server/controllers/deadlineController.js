import asyncHandler from '../middlewares/asyncHandler.js';
import ErrorHandler from '../middlewares/error.js';
import {Deadline} from "../models/deadline.js";

export const createDeadline = asyncHandler(async (req, res, next) => {
    const { name, dueDate, project } = req.body;

    if (!name || !dueDate) {
        return next(new ErrorHandler('Name and due date are required', 400));
    }

    const deadlineData = {
        name,
        dueDate:new DataTransfer(dueDate),
createBy: req.user._id,
project:project||null,
    };
    
});
