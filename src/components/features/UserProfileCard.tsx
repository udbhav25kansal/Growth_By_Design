interface User {
  id: number;
  name: string;
  email: string;
}

interface UserProfileCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (userId: number) => void;
}

/**
 * UserProfileCard - Displays user information with optional edit/delete actions
 * Used for displaying user profiles in lists or dashboards
 */
export default function UserProfileCard({ user, onEdit, onDelete }: UserProfileCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(user)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(user.id)}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 