import { useMutation } from '@tanstack/react-query';
import { UserAPI, UpdateProfileData } from '@/src/services/api/user.api';

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: (data: UpdateProfileData) => UserAPI.updateProfile(data),
  });
};

export const useUploadAvatar = () => {
  return useMutation({
    mutationFn: (file: File) => UserAPI.uploadAvatar(file),
  });
};

export const useRemoveAvatar = () => {
  return useMutation({
    mutationFn: () => UserAPI.removeAvatar(),
  });
};
