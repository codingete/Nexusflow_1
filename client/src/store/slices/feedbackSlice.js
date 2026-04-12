import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../lib/axios";

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
            const response = await axiosInstance.post(`/student/projects/${projectId}/feedback`, { projectId, rating, comment, type });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to submit feedback");
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