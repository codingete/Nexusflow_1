import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const getProjectFeedback = createAsyncThunk(
    "feedback/getProjectFeedback",
    async (projectId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/student/projects/${projectId}/feedback`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch feedback");
        }
    }
);

export const createFeedback = createAsyncThunk(
    "feedback/createFeedback",
    async ({ projectId, rating, comment, type }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/student/projects/${projectId}/feedback`, { rating, comment, type });
            toast.success("Thanks for your feedback!");
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || "Failed to submit feedback";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

const feedbackSlice = createSlice({
    name: "feedback",
    initialState: { list: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getProjectFeedback.pending, (state) => { state.loading = true; })
            .addCase(getProjectFeedback.fulfilled, (state, action) => { 
        state.loading = false; 
        state.list = action.payload?.feedback || action.payload || []; 
      })
            .addCase(getProjectFeedback.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            .addCase(createFeedback.fulfilled, (state, action) => { state.list.unshift(action.payload); });
    }
});

export default feedbackSlice.reducer;