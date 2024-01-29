import React, { useEffect, useState, useContext, GroupContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../Firebase'; // Adjust this import path as necessary
import { collection, getDocs, addDoc, query, where, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { auth } from '../Firebase';
import Navbar from '../components/Navbar';
import { AuthContext } from "../context/AuthContext";
import './GroupsPanel.css';

//------------------------------------------------------------------------------//
//------------------------------------------------------------------------------//

function GroupsPanel() {

  const GroupContext = React.createContext();
  const { currentUser } = useContext(AuthContext);

  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showGroupPreview, setShowGroupPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("discover");
  const [searchTerm, setSearchTerm] = useState('');
  const [nonMemberGroups, setNonMemberGroups] = useState([]);
  const [nonMemberGroupsWithMembers, setNonMemberGroupsWithMembers] = useState([]);
  const [yourGroupsWithMembers, setYourGroupsWithMembers] = useState([]);
  const [yourGroups, setYourGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDetails, setNewGroupDetails] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("null");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [displayingCategory, setDisplayingCategory] = useState(false);
  const [openedGroup, setOpenedGroup] = useState([]);
  const [showErrorForm, setShowErrorForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  //------------------------------------------------------------------------------//
  //------------------------------------------------------------------------------//

  const fetchNonMemberGroups = async () => {

    if (!currentUser || !currentUser.uid) {
      console.error("Current user data is not available.");
      return;
    }

    // Step 1: Fetch group IDs that the user is already in
    const userGroupsRef = collection(db, 'UsersToGroup');
    const q = query(userGroupsRef, where('userID', '==', currentUser.uid)); // Replace with current user ID
    const userGroupsSnapshot = await getDocs(q);
    const userGroupIDs = userGroupsSnapshot.docs.map(doc => doc.data().groupID);

    // Step 2: Fetch all groups and filter out the ones the user is already in
    const groupsRef = collection(db, 'Groups');
    const allGroupsSnapshot = await getDocs(groupsRef);
    const nonMemberGroups = allGroupsSnapshot.docs
      .filter(doc => !userGroupIDs.includes(doc.id))
      .map(doc => ({ id: doc.id, ...doc.data() }));

    const groupsWithMembers = await fetchGroupsWithMembers(nonMemberGroups);
    setNonMemberGroups(nonMemberGroups);
    setNonMemberGroupsWithMembers(groupsWithMembers);
    return nonMemberGroups;

  };

  const fetchYourGroups = async () => {

    if (!currentUser || !currentUser.uid) {
      console.error("Current user data is not available.");
      return;
    }

    const userGroupsRef = collection(db, 'UsersToGroup');
    const q = query(userGroupsRef, where('userID', '==', currentUser.uid));
    const userGroupsSnapshot = await getDocs(q);
    const groupIDs = userGroupsSnapshot.docs.map(doc => doc.data().groupID);

    const groupsRef = collection(db, 'Groups');
    const allGroupsSnapshot = await getDocs(groupsRef);
    const filteredGroups = allGroupsSnapshot.docs
      .filter(doc => groupIDs.includes(doc.id))
      .map(doc => ({ id: doc.id, ...doc.data() }));

    const groupsWithMembers = await fetchGroupsWithMembers(filteredGroups)
    setYourGroupsWithMembers(groupsWithMembers);
    setYourGroups(filteredGroups);
    return filteredGroups;

  };

  const fetchGroupByName = async (groupName) => {

    const groupsRef = collection(db, 'Groups');
    const q = query(groupsRef, where('name', '==', groupName));
    const groupSnapshot = await getDocs(q);
    const groupByName = groupSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return groupByName;

  };

  const fetchGroupsWithMembers = async (groups) => {
    const groupsWithMembers = await Promise.all(groups.map(async (group) => {
      // Fetch members for each group
      const members = await fetchSelectedGroupMembers(group.name);
      return { ...group, members }; // Combine group info with its members
    }));
    return groupsWithMembers;
  };

  const fetchSelectedGroupMembers = async (groupName) => {

    const userGroupsRef = collection(db, 'UsersToGroup');

    const groupsRef = collection(db, 'Groups');
    const q = query(groupsRef, where('name', '==', groupName));
    const groupSnapshot = await getDocs(q);
    const groupByName = groupSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(selectedGroup);
    const q1 = query(userGroupsRef, where('groupID', '==', groupByName[0].id));
    const userGroupsSnapshot = await getDocs(q1);
    const groupMember = userGroupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(groupMember);
    console.log(currentUser.photoURL);

    setSelectedGroupMembers(groupMember);
    return groupMember;

  }

  const fetchCategories = async () => {

    const categoriesCol = collection(db, 'GroupCategories');
    const categoriesSnapshot = await getDocs(categoriesCol);
    const categoriesList = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCategories(categoriesList);
  };


  //------------------------------------------------------------------------------//
  //------------------------------------------------------------------------------//

  useEffect(() => {

    if (currentUser) {
      fetchCategories();
      fetchNonMemberGroups();
      fetchYourGroups();
    }
  }, []);

  //------------------------------------------------------------------------------//
  //------------------------------------------------------------------------------//

  const handleOkClick = () => {
    setShowErrorForm(false);
    setErrorMessage("");
    document.getElementsByClassName("overlay")[0].style.display = "none";
  };

  const deleteAllGroups = async () => {
    const collectionRef = collection(db, 'Groups'); // Replace with your collection name
    const documentToKeepId = '9OxeBXw9b5tVS3keD9D1'; // Replace with the ID of the document you want to keep

    getDocs(collectionRef)
      .then(snapshot => {
        const deletePromises = [];

        snapshot.forEach(doc => {
          if (doc.id !== documentToKeepId) {
            deletePromises.push(deleteDoc(doc.ref));
          }
        });

        return Promise.all(deletePromises);
      })
      .then(() => {
        console.log('All documents except the specified one have been deleted');
      })
      .catch(error => {
        console.error('Error deleting documents:', error);
      });
  }

  const deleteAllUsersToGroups = async () => {
    const collectionRef = collection(db, 'Messages'); // Replace with your collection name
    const variableName = 'groupName'; // The name of the variable to check
    const valueToKeep = 'Gomo'; // The value to keep

    // Query for documents that do NOT meet the condition
    const q = query(collectionRef, where(variableName, '!=', valueToKeep));

    getDocs(q)
      .then(snapshot => {
        const deletePromises = [];

        snapshot.forEach(doc => {
          deletePromises.push(deleteDoc(doc.ref));
        });

        return Promise.all(deletePromises);
      })
      .then(() => {
        console.log('All documents not meeting the condition have been deleted');
      })
      .catch(error => {
        console.error('Error deleting documents:', error);
      });
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };


  const handleCreateGroupClick = () => {

    setShowAddGroup(true);
    document.getElementsByClassName("overlay")[0].style.display = "flex";

  };


  const handleCloseFormClick = () => {

    setNewGroupName('');
    setNewGroupDetails('');
    setNewGroupCategory('');

    setShowAddGroup(false);
    setShowGroupPreview(false)
    setSelectedGroup(null);
    setSelectedGroupMembers([]);
    document.getElementsByClassName("overlay")[0].style.display = "none";

  };


  const handleSubmitNewGroup = async (e) => {

    e.preventDefault();
    setIsSubmitting(true);

    if (newGroupName !== '') {

      try {
        await addDoc(collection(db, 'Groups'), {

          name: newGroupName,
          details: newGroupDetails,
          imageUrl: '/brainwave.png', // Replace with actual image path or logic
          category: newGroupCategory.category,
          createdAt: Timestamp.now(),
          createdBy: currentUser.uid

        });

      } catch (error) {
        console.error('Error adding document: ', error);
      }

      fetchGroupByName(newGroupName).then(async (newGroup) => {

        try {
          await addDoc(collection(db, 'UsersToGroup'), {
            groupID: newGroup[0].id,
            grouName: newGroupName,
            userID: auth.currentUser.uid,
            userPermission: "group-owner",
            isMute: false,
            userDisplayName: currentUser.displayName,
            userPhotoURL: currentUser.photoURL
          });

        } catch (error) {
          console.error('Error adding document: ', error);
        }
      });

      fetchNonMemberGroups();
      fetchYourGroups();

      setNewGroupName('');
      setNewGroupDetails('');
      setNewGroupCategory('');
      document.getElementsByClassName("overlay")[0].style.display = "none";

    } else {

      setErrorMessage("Please enter a group name to create a group");
      console.log("Please enter a group name");
      setShowErrorForm(true);
      document.getElementsByClassName("overlay")[0].style.display = "flex";

    }

    setShowAddGroup(false)
    setIsSubmitting(false);
  };


  const handleGroupClick = (group) => {

    setSelectedGroup(group);
    fetchSelectedGroupMembers(group.name);
    setShowGroupPreview(true);
    document.getElementsByClassName("overlay")[0].style.display = "flex";


    //navigate(`/GroupPreview/${groupName}`);
  };


  const handleJoinGroupClick = async (e) => {

    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'UsersToGroup'), {
        groupID: selectedGroup.id,
        grouName: selectedGroup.name,
        userID: auth.currentUser.uid,
        isMute: false,
        userPermission: "default-member",
        userDisplayName: currentUser.displayName,
        userPhotoURL: currentUser.photoURL
      });

    } catch (error) {
      console.error('Error adding document: ', error);
    }

    setIsSubmitting(false);
    setSelectedGroup(null);
    setSelectedGroupMembers([]);
    setShowGroupPreview(false);
    document.getElementsByClassName("overlay")[0].style.display = "none";

    fetchYourGroups();
    fetchNonMemberGroups();

  }

  const handleYourGroupClick = (group) => {
    navigate(`/GroupPage/${group.name}`, { state: { group } });
  }

  const handleYourGroupsClick = () => {
    fetchYourGroups();
    setActiveTab("your");
  };

  const handleDiscoverGroupsClick = () => {
    setActiveTab("discover");
    setDisplayingCategory(false);
  };

  const handleCategoryClick = (categoryName) => {

    setSelectedCategory(categoryName);
    setDisplayingCategory(true);

  };



  return (

    <div className="groups-panel">

      <div className="search-container">
        <input
          type="text"
          placeholder="Search groups..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-bar"
        />
        <button className="filter-button" > <img src='/filter.png' className='filter-image' />Filter</button>
      </div>
      <div className="groups-panel-menu-btns-contianer">
        <button className="bob-btn-1" id='your-groups-btn' onClick={handleYourGroupsClick}>Your Groups</button>
        <button className="bob-btn-1" id='discover-groups-btn' onClick={handleDiscoverGroupsClick}>Discover Groups</button>
        <button className="bob-btn-1" id='create-groups-btn' onClick={handleCreateGroupClick}>Create Group</button>
      </div>

      <div className="white-line"></div>

      {activeTab === 'discover' && (
        <div>
          {!displayingCategory && (
            <div className="categories-container">
              <h2>Discover groups by category!</h2>
              <div className="categories-grid">
                {categories.map((category) => (
                  <div key={category.id} className="category-grid-item" onClick={() => handleCategoryClick(category.category)}>
                    <img src={category.imageUrl} alt={category.category} className="category-grid-image" />
                    <h3 className="category-name">{category.category}</h3>
                  </div>
                ))}
              </div>
              <h2>Or join recommended groups!</h2>
            </div>
          )}

          {displayingCategory && (
            <div>

              <img src={categories.filter(category => category.category === selectedCategory)[0].imageUrl} alt={categories.filter(category => category.category === selectedCategory)[0].category} className="category-banner-image" />
              <h1 className="category-banner-name">{selectedCategory}</h1>
              <button className="return-btn" onClick={handleDiscoverGroupsClick}>Back</button>

              <h2>Discover the category's trending groups!</h2>

            </div>
          )}

          <div className="groups-container">

            <div className="group-grid">
              {nonMemberGroupsWithMembers.filter(displayingCategory ? (group => group.name.toLowerCase().includes(searchTerm.toLowerCase()) && group.category.toLowerCase() === selectedCategory.toLowerCase()) : (group =>
                group.name && typeof group.name === 'string' &&
                group.name.toLowerCase().includes(searchTerm.toLowerCase()))
              ).map(group => (
                <div
                  key={group.name}
                  className="group-grid-item"
                  onClick={() => handleGroupClick(group)}
                >
                  <img src={group.imageUrl} alt={group.name} className="group-grid-image" />
                  <div className='group-grid-info-container'>
                    <h3 className="groups-name">{group.name}</h3>
                    <div className="group-grid-member-icons-container">
                      {group.members.length === 0 ? (
                        <img className="group-grid-member-icon" src="/cross.png" alt="Default" />
                      ) : (
                        group.members.map((member) => (
                          <img className="group-grid-member-icon" src={member.userPhotoURL} alt="user" />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'your' && (

        <div>
          <div className="groups-container">
            <h2>Your groups:</h2>
            <div className="group-grid">
              {yourGroupsWithMembers.filter(group => group.name.toLowerCase().includes(searchTerm.toLowerCase())).map(group => (
                <div
                  key={group.name}
                  className="group-grid-item"
                  onClick={() => handleYourGroupClick(group)}
                >
                  <img src={group.imageUrl} alt={group.name} className="group-grid-image" />
                  <div className='group-grid-info-container'>
                    <h3 className="groups-name">{group.name}</h3>
                    <div className="group-grid-member-icons-container">
                      {group.members.length === 0 ? (
                        <img className="group-grid-member-icon" src="/cross.png" alt="Default" />
                      ) : (
                        group.members.map((member) => (
                          <img className="group-grid-member-icon" src={member.userPhotoURL} alt="user" />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      )}


      {showAddGroup && (
        <div className="popup-form">
          <form onSubmit={handleSubmitNewGroup} className='popup-form-form'>

            <img src={'/brainwave.png'} alt={'brainwave'} className="popup-form-image" />
            <button className="popup-form-close-btn" type="button" onClick={handleCloseFormClick}>X</button>
            <img src="/Component 1.png" alt="cloud-icon" className="popup-form-cloud-icon" />

            <div className='popup-form-container'>

              <h1 className="popup-form-title">Create a new group!</h1>

              <div className="popup-form-div">
                <h2 className="popup-form-subtitle">Group Name:</h2>
                <input
                  className="popup-form-input"
                  type="text"
                  placeholder="Enter name here"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="popup-form-div">
                <h2 className="popup-form-subtitle">Group Details:</h2>
                <textarea
                  className="popup-form-input"
                  placeholder="Enterdetails here"
                  value={newGroupDetails}
                  onChange={(e) => setNewGroupDetails(e.target.value)}
                  disabled={isSubmitting}
                ></textarea>
              </div>


              <h2 className="popup-form-subtitle">Group Category:</h2>
              <div className="popup-form-tags-container">
                {categories.map((category) => (
                  <div key={category.id} className={newGroupCategory.category === category.category ? "popup-form-selected-tag" : "popup-form-unselected-tag"} onClick={() => setNewGroupCategory(category)}>
                    {category.category}
                  </div>
                ))}
              </div>



              <button type="submit" className='bob-btn-1' id="create-group-btn" disabled={isSubmitting}>Create Group</button>

            </div>
          </form>
        </div>
      )}

      {showGroupPreview && (
        <div className="popup-form">

          <form onSubmit={handleJoinGroupClick} className='popup-form-form'>

            <img src={selectedGroup.imageUrl} alt={selectedGroup.name} className='popup-form-image' />
            <button type="button" className="popup-form-close-btn" onClick={handleCloseFormClick}>X</button>
            <img src="/Component 1.png" alt="cloud-icon" className="popup-form-cloud-icon" />

            <div className='popup-form-container'>

              <h1 className="popup-form-title">{selectedGroup.name}</h1>

              <div>
                <h2 className="popup-form-subtitle">Group Description:</h2>
                <div className="popup-form-text">{selectedGroup.details}</div>
              </div>

              <div>
                <h2 className="popup-form-subtitle">Group Category:</h2>
                <div className="popup-form-selected-tag">{selectedGroup.category}</div>
              </div>

              <div>
                <h2 className="popup-form-subtitle">Group Members ({selectedGroupMembers.length}):</h2>

                <div className="popup-form-member-icons-container">

                  {selectedGroupMembers.length === 0 ? (
                    <img className="popup-form-member-icon" src="/cross.png" alt="Default" />
                  ) : (
                    selectedGroupMembers.map((member) => (
                      <img className="popup-form-member-icon" src={member.userPhotoURL} alt="user" />
                    )))}

                </div>
              </div>

              <button type="submit" className='bob-btn-1' id="join-group-btn" disabled={isSubmitting}>Join Group</button>
            </div>


          </form>
        </div>
      )}
      <div className="overlay"></div>

      {showErrorForm && (
        <div className="popup-form" id="error-form">
          <form onSubmit={handleOkClick} className='popup-form-form' id='error-form-form'>
            <div className='popup-form-text' id='error-form-text'>{errorMessage}</div>
            <button type="submit" className="bob-btn-1" id='error-form-btn'>
              Okay
            </button>
          </form>
        </div>
      )}

    </div>

  );
}

export default GroupsPanel;
