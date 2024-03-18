
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../Firebase'; // Adjust the import path according to your setup
import './ListOfUsers.css';

// Assume CSS is correctly imported or adjusted as needed

const ListOfUsers = ({ onSelectedUsersChange }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollectionRef = collection(db, 'Users');
      const usersSnapshot = await getDocs(usersCollectionRef);
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    };

    fetchUsers();
  }, []);

  const handleSelectUser = (userId) => {
    setSelectedUsers(prevSelected => {
      const newSelected = prevSelected.includes(userId)
        ? prevSelected.filter(id => id !== userId)
        : [...prevSelected, userId];
      onSelectedUsersChange(newSelected); // Call the passed-down callback function with the new selection
      return newSelected;
    });
  };

  return (
    <div className="user-list-component">
      {users.map(user => (
        <div className="user-list-container" key={user.id}>
          <input
            type="checkbox"
            className="user-list-checkbox"
            id={user.id}
            checked={selectedUsers.includes(user.id)}
            onChange={() => handleSelectUser(user.id)}
          />
          <div>{user.username}</div>
          <label htmlFor={user.id}>{user.name}</label> {/* Adjust according to your user object structure */}
        </div>
      ))}
      {/* More form elements like group name, details, etc. */}
    </div>
  );
};

export default ListOfUsers;
