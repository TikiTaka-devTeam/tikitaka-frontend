import PageHeader from "../../../components/common/PageHeader.jsx";

function DashboardHeader({ profile }) {
  return <PageHeader unreadCount={profile.unread_notification_count} />;
}

export default DashboardHeader;
