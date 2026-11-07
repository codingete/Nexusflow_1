import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";


export const createDeadline = createAsyncThunk(
  "createDeadline",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `/deadline/create-deadline/${id}`,
        data
      );
      toast.success(res.data.message || "Deadline updated successfully");
      return res.data.data?.deadline || res.data.data||res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create deadline");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message
      );
    }
  }
);

const deadlineSlice = createSlice({
  name: "deadline",
  initialState: {
    deadlines: [],
    nearby: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearDeadlineError: (state) => {
      state.error = null;
    },
    setSelectedDeadline: (state, action) => {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDeadline.pending, (state) => {
        state.loading = true;
      })
      .addCase(createDeadline.fulfilled, (state, action) => {
        state.loading = false;
        if (state.deadlines) state.deadlines.push(action.payload);
      })
      .addCase(createDeadline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDeadlineError, setSelectedDeadline } = deadlineSlice.actions;
export default deadlineSlice.reducer;