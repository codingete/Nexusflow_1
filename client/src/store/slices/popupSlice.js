import { createSlice } from "@reduxjs/toolkit";

const popupSlice = createSlice({
  name: "popup",
  initialState: {
    isCreateStudentModalOpen: false,
    isCreateTeacherModalOpen: false,
    isCreateProjectModalOpen: false,
    isCreateDeadlineModalOpen: false,
    isProfileModalOpen: false,
  },
  reducers: {
    toggleStudentModal: (state) => {
      state.isCreateStudentModalOpen = !state.isCreateStudentModalOpen;
    },
    toggleTeacherModal: (state) => {
      state.isCreateTeacherModalOpen = !state.isCreateTeacherModalOpen;
    },
    toggleProjectModal: (state) => {
      state.isCreateProjectModalOpen = !state.isCreateProjectModalOpen;
    },
    toggleDeadlineModal: (state) => {
      state.isCreateDeadlineModalOpen = !state.isCreateDeadlineModalOpen;
    },
    toggleProfileModal: (state) => {
      state.isProfileModalOpen = !state.isProfileModalOpen;
    },
    closeAllModals: (state) => {
      state.isCreateStudentModalOpen = false;
      state.isCreateTeacherModalOpen = false;
      state.isCreateProjectModalOpen = false;
      state.isCreateDeadlineModalOpen = false;
      state.isProfileModalOpen = false;
    },
  },
});

export const {
  toggleStudentModal,
  toggleTeacherModal,
  toggleProjectModal,
  toggleDeadlineModal,
  toggleProfileModal,
  closeAllModals,
} = popupSlice.actions;
export default popupSlice.reducer;