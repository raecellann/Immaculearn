import { useContext } from 'react';
import { AdminContext } from '../contexts/admin/adminContext';
import { AnnouncementData, AnnouncementCreateData } from '../types/admin';

export const useAdminAnnouncement = () => {
  const context = useContext(AdminContext);
  
  if (!context) {
    throw new Error('useAdminAnnouncement must be used within a AdminProvider');
  }

  return {
    createAnnouncement: context.createAnnouncement,
    getAllAnnouncements: context.getAllAnnouncements,
    updateAnnouncement: context.updateAnnouncement,
    deleteAnnouncement: context.deleteAnnouncement,
    refreshAnnouncements: context.refreshAnnouncements,
  };
};