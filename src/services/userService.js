// Path: Main/frontend/src/services/userService.js

import api from './api';

export const updateAvatar = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const { data } = await api.put('/users/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data; 
};

export const deleteAvatar = async () => {
    const { data } = await api.delete('/users/profile/avatar');
    return data;
};

// module.exports(
//     updateAvatar,
//     deleteAvatar
// );