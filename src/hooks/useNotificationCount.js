// src/hooks/useNotificationCount.js
import { useState, useEffect, useMemo, useRef } from 'react';
import { useSpace } from '../contexts/space/useSpace';
import { announcementService } from '../services/userAnnounceservice';

export function useNotificationCount(userRole = 'STUDENT') {
  const [schoolAnnouncements, setSchoolAnnouncements] = useState([]);
  const [viewedAnnouncements, setViewedAnnouncements] = useState(new Set());
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const hasFetchedAnnouncements = useRef(false);

  const {
    joinRequestsByLink,
    joinRequestsByLinkLoading,
    pendingSpaceInvitation,
    pendingSpaceInvitationLoading,
  } = useSpace();

  // Fetch announcements on component mount based on user role
  useEffect(() => {
    const fetchAnnouncements = async () => {
      // Prevent duplicate fetches
      if (hasFetchedAnnouncements.current) return;
      hasFetchedAnnouncements.current = true;
      
      try {
        setAnnouncementsLoading(true);
        
        // Get announcements based on user role
        const audience = userRole === 'PROFESSOR' ? 'PROFESSORS' : 'STUDENTS';
        const response = await announcementService.getAnnouncementsByAudience(audience);
        
        if (response.success && response.data) {
          setSchoolAnnouncements(response.data);
        }
      } catch (err) {
        console.error("Error fetching announcements:", err);
      } finally {
        setAnnouncementsLoading(false);
      }
    };

    fetchAnnouncements();
  }, [userRole]);

  // Load viewed announcements from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('viewedAnnouncements');
      if (saved) {
        setViewedAnnouncements(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error('Error loading viewed announcements:', error);
    }
  }, []);

  // Calculate unread notifications count
  const unreadNotificationsCount = useMemo(() => {
    let count = 0;
    
    // Count unread announcements (not in viewedAnnouncements)
    const unreadAnnouncements = schoolAnnouncements.filter(
      announcement => !viewedAnnouncements.has(announcement.announce_id)
    );
    count += unreadAnnouncements.length;
    
    // Count pending join requests (these are always unread until acted upon)
    count += joinRequestsByLink?.length || 0;
    
    // Count pending space invitations (these are always unread until acted upon)
    count += pendingSpaceInvitation?.length || 0;
    
    return count;
  }, [schoolAnnouncements, viewedAnnouncements, joinRequestsByLink, pendingSpaceInvitation]);

  // Function to mark announcement as viewed
  const markAnnouncementAsViewed = (announcementId) => {
    setViewedAnnouncements(prev => {
      const newSet = new Set(prev).add(announcementId);
      // Save to localStorage
      try {
        localStorage.setItem('viewedAnnouncements', JSON.stringify([...newSet]));
      } catch (error) {
        console.error('Error saving viewed announcements:', error);
      }
      return newSet;
    });
  };

  return {
    unreadNotificationsCount,
    schoolAnnouncements,
    viewedAnnouncements,
    markAnnouncementAsViewed,
    isLoading: announcementsLoading || joinRequestsByLinkLoading || pendingSpaceInvitationLoading,
  };
}
