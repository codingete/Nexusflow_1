import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const fetchAllRequests = createAsyncThunk(
  "request/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/requests");
      return res.data.data?.requests;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch requests");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchRequestsByStudent = createAsyncThunk(
  "request/fetchByStudent",
  async (studentId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/requests/student/${studentId}`);
      return res.data.data?.requests;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch requests");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchRequestsBySupervisor = createAsyncThunk(
  "request/fetchBySupervisor",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/requests/supervisor");
      return res.data.data?.requests;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch requests");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const acceptRequest = createAsyncThunk(
  "request/accept",
  async (requestId, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/requests/${requestId}/accept`);
      toast.success("Request accepted successfully");
      return res.data.data?.request;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const rejectRequest = createAsyncThunk(
  "request/reject",
  async ({ requestId, reason }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/requests/${requestId}/reject`, { reason });
      toast.success("Request rejected");
      return res.data.data?.request;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

const requestSlice = createSlice({
  name: "request",
  initialState: {
    list: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearRequestError: (state) => {
      state.error = null;
    },
    clearSelectedRequest: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRequestsByStudent.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      .addCase(fetchRequestsBySupervisor.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRequestsBySupervisor.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchRequestsBySupervisor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(acceptRequest.fulfilled, (state, action) => {
        if (state.list) {
          state.list = state.list.map((r) =>
            r._id === action.payload._id ? { ...r, status: "accepted" } : r
          );
        }
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        if (state.list) {
          state.list = state.list.map((r) =>
            r._id === action.payload._id ? { ...r, status: "rejected" } : r
          );
        }
      });
  },
});

export const { clearRequestError, clearSelectedRequest } = requestSlice.actions;
export default requestSlice.reducer;