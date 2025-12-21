import React from "react";
import { Routes as ReactRoutes, Route } from "react-router";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminDashboard from "./pages/admin-dashboard/admindashboard.jsx";
import AdminStudents from "./pages/admin-students/adminstudents.jsx";
import AdminTeachers from "./pages/admin-teachers/adminteachers.jsx";

import LandingPage from "./pages/Landing/landingPage.jsx";
import SpaceCreationPage from "./pages/SpaceCreation/spacecreation.jsx";
import InitialInvitePage from "./pages/SpaceCreation/inviteteam.jsx";

import ChatList from "./pages/User_chats/user_chats";
import LoginPage from "./pages/SignIn/signInPage.jsx";
import UserPage from "./pages/UserSpace/zj-space.jsx";
import UserTaskPage from "./pages/UserSpace/UserTaskPage.jsx";
import UserFilesShared from "./pages/UserSpace/UserFilesShared.jsx";
import UserPeoplePage from "./pages/UserSpace/UserPeoplePage.jsx";
import HomePage from "./pages/HomePage/homepage.jsx";
import ProfilePage from "./pages/AccSettings/accsettingspage.jsx";
import GradeViewing from "./pages/GradeViewing/gradeViewing.jsx";
import TaskPage from "./pages/Task/task.jsx";
import NotificationPage from "./pages/Notifications/notification.jsx";
import FilePage from "./pages/Files/files.jsx";
import SpacePage from "./pages/Space/SpacePage.jsx";
import SettingsPage from "./pages/Settings/settings.jsx";

import TaskViewPage from "./pages/Task-View/TaskViewPage.jsx";
import TaskViewPageAdmin from "./pages/Task-view Admin/Task-View-Admin.jsx";
import TaskViewAll from "./pages/Task-view Admin/Task-View-All.jsx";
import ViewFilePage from "./pages/ViewFiles/ViewFiles.jsx";

import AdminTaskPage from "./pages/UserSpace/AdminSpacePages/AdminTaskPage.jsx";
import AdminCreateActivityPage from "./pages/UserSpace/AdminSpacePages/AdminCreateActivityPage.jsx";
import AdminFilesSharedPage from "./pages/UserSpace/AdminSpacePages/AdminFilesSharedPage.jsx";

import ProfProfilePage from "./pages/prof-AccSettings/profaccsettingspage.jsx";
import ProfNotificationPage from "./pages/prof-Notifications/profnotification.jsx";
import ProfListActivityPage from "./pages/prof-ListActivities/proflistactivitypage.jsx";
import ProfFilePage from "./pages/prof-Files/proffiles.jsx";
import ProfFilesBySubject from "./pages/prof-Files/ProfFilesBySubject";
import ProfGradeRecordPage from "./pages/prof-GradeViewing/profgradeviewing.jsx";
import ProfHomePage from "./pages/prof-HomePage/profhomepage.jsx";
import ProfSettingsPage from "./pages/Prof-Settings/profsettings.jsx";
import CreateSpaceAdmin from "./pages/CreateSpace-Admin/CreateSpace-Admin.jsx";

import ThesisSpace from "./pages/Prof-Space/Thesis-space.jsx";
import ProfTaskPage from "./pages/Prof-Space/ProfTaskPage";
import ProfFilesShared from "./pages/Prof-Space/ProfFilesShared";
import ProfPeoplePage from "./pages/Prof-Space/ProfPeoplePage";

import CreateFileAdmin from "./pages/CreateFile-Admin/createfile.jsx";
import ViewAllFilesPage from "./pages/ViewAllFiles/view-all-files.jsx";

import ParentLogin from "./pages/parent-login/parentlogin.jsx";
import ParentGradeView from "./pages/parent-grade-view/parentgradeview.jsx";
import { SignInPageWithOAuth } from "./pages/test-page/signInPageWithOAuth.jsx";
import PageNotFound from "./pages/PageNotFound/pageNotFound.jsx";
import Onboarding from "./pages/SignIn/onBoardingPage.jsx";
import OAuthCallback from "./pages/SignIn/oauthCallbackPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function Routes() {
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        pauseOnHover
        closeOnClick
      />
      <ReactRoutes>
        

        <Route path="/test-page" element={<SignInPageWithOAuth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-students" element={<AdminStudents />} />
        <Route path="/admin-teachers" element={<AdminTeachers />} />

        {/* STUDENT ROUTES */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/chatlist" element={<ChatList />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-space" element={<SpaceCreationPage />} />
        <Route path="/initial-invite" element={<InitialInvitePage />} />

        <Route path="/home" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        
        <Route path="/accsettings" element={<ProfilePage />} />
        <Route path="/grade-viewing" element={<GradeViewing />} />
        <Route path="/task" element={<TaskPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/files" element={<FilePage />} />
        <Route path="/view-files" element={<ViewFilePage/>} />
        <Route path="/space" element={<SpacePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/view-all-files" element={<ViewAllFilesPage />} />

        {/* USER SPACE (example si zj,this is also the home or stream of the space) same rin to sa home ng admin, naiiba lang pagdating sa ibang buttons /navigation */}
        <Route path="/user-space-zj" element={<UserPage />} />


        {/* USER SPACE SUBPAGES */}
        <Route path="/user-space-zj/tasks" element={<UserTaskPage />} />
        <Route path="/user-space-zj/files-shared" element={<UserFilesShared />} />
        <Route path="/user-space-zj/people" element={<UserPeoplePage />} />

        <Route path="/admintaskpage" element={<AdminTaskPage />} />
        <Route path="/admin-create-activity-page" element={<AdminCreateActivityPage />} />

        {/* ADMIN STUDENT ROUTES */}
        <Route path="/task-view" element={<TaskViewPage />} />
        <Route path="/task-view-admin" element={<TaskViewPageAdmin />} />
        <Route path="/task-view-all" element={<TaskViewAll />} />
        <Route path="/create-space-admin" element={<CreateSpaceAdmin />} />
        <Route path="/create-file-admin" element={<CreateFileAdmin />} />
        <Route path="/upload-file-admin" element={<CreateFileAdmin />} />
        <Route path="/admin-files-shared" element={<AdminFilesSharedPage />} />

        {/* PROFESSOR ROUTES */}
        <Route path="/prof-acc-settings" element={<ProfProfilePage />} />
        <Route path="/prof-notifications" element={<ProfNotificationPage />} />
        <Route path="/prof-list-activity" element={<ProfListActivityPage />} />
        <Route path="/prof-files" element={<ProfFilePage />} />
        <Route path="/prof-files-by-subject" element={<ProfFilesBySubject />} />
        <Route path="/prof-grade-viewing" element={<ProfGradeRecordPage />} />
        <Route path="/prof-home" element={<ProfHomePage />} />
        <Route path="/prof-settings" element={<ProfSettingsPage />} />

        {/* PROFESSOR SPACE ROUTES */}
        <Route path="/prof-space-thesis" element={<ThesisSpace />} />
        <Route path="/prof-space-thesis/tasks" element={<ProfTaskPage />} />
        <Route path="/prof-space-thesis/files-shared" element={<ProfFilesShared />} />
        <Route path="/prof-space-thesis/people" element={<ProfPeoplePage />} />

        {/* PARENT ROUTES */}
        <Route path="/parent-grade-login" element={<ParentLogin />} />
        <Route path="/parent-grade-view" element={<ParentGradeView />} />

        <Route path="*" element={<PageNotFound />} />

      </ReactRoutes>
    </>
  );
}
