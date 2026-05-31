import {
  FaHeart,
  FaBook,
  FaGamepad,
  FaTrophy
} from "react-icons/fa";

export const statusConfig = {
  wishlist: {
    icon: <FaHeart />,
    label: "Wishlist",
    className: "status-wishlist",
  },

  backlog: {
    icon: <FaBook />,
    label: "Backlog",
    className: "status-backlog",
  },

  playing: {
    icon: <FaGamepad />,
    label: "Playing",
    className: "status-playing",
  },

  completed: {
    icon: <FaTrophy />,
    label: "Completed",
    className: "status-completed",
  },
};

function StatusBadge({ status }) {
  const config = statusConfig[status];

  if (!config) return null;

  return (
    <div className={`status-badge ${config.className}`}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}

export default StatusBadge;