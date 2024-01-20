import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../Firebase'; // Adjust this import path as necessary
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { auth } from '../Firebase';
import './GroupsPanel.css';


function GroupsPanel() {
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showGroupPreview, setShowGroupPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("discover");
  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [yourGroups, setYourGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDetails, setNewGroupDetails] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();



  useEffect(() => {
    const fetchGroups = async () => {
      const groupsCol = collection(db, 'Groups');
      const groupSnapshot = await getDocs(groupsCol);
      const groupList = groupSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(groupList);
    };

    const fetchCategories = async () => {
      const categoriesCol = collection(db, 'GroupCategories');
      const categoriesSnapshot = await getDocs(categoriesCol);
      const categoriesList = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(categoriesList);
    };

    const fetchYourGroups = async () => {

      const userGroupsRef = collection(db, 'UsersToGroup');
      const q = query(userGroupsRef, where('userID', '==', "r0REBxcblDPtRejhJSjYv7Tu7QX2"));
      const userGroupsSnapshot = await getDocs(q);
      const groupIDs = userGroupsSnapshot.docs.map(doc => doc.data().groupID);

      const groupsRef = collection(db, 'Groups');
      const allGroupsSnapshot = await getDocs(groupsRef);
      const filteredGroups = allGroupsSnapshot.docs
        .filter(doc => groupIDs.includes(doc.id))
        .map(doc => ({ id: doc.id, ...doc.data() }));

      setYourGroups(filteredGroups);

    };

    fetchCategories();
    fetchGroups();
    fetchYourGroups();
  }, []);


  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateGroupClick = () => {

    setShowAddGroup(true);
  };


  const handleSubmitNewGroup = async (e) => {

    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'Groups'), {
        name: newGroupName,
        details: newGroupDetails,
        imageUrl: '/brainwave.png', // Replace with actual image path or logic
        category: newGroupCategory
      });

      const groupsCol = collection(db, 'Groups');
      const groupSnapshot = await getDocs(groupsCol);
      const groupList = groupSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(groupList);

      setNewGroupName('');
      setNewGroupDetails('');
      setShowAddGroup(false);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
    setIsSubmitting(false);
  };



  const handleGroupClick = (groupName) => {

    setSelectedGroup(groupName);
    setShowGroupPreview(true);
    //navigate(`/GroupPreview/${groupName}`);
  };

  const handleJoinGroup = async (e) => {

    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'UsersToGroup'), {
        groupID: selectedGroup.id,
        userID: auth.currentUser.uid
      });

    } catch (error) {
      console.error('Error adding document: ', error);
    }
    setIsSubmitting(false);
    setSelectedGroup(null);
    setShowGroupPreview(false);

    const fetchYourGroups = async () => {

      const userGroupsRef = collection(db, 'UsersToGroup');
      const q = query(userGroupsRef, where('userID', '==', "r0REBxcblDPtRejhJSjYv7Tu7QX2"));
      const userGroupsSnapshot = await getDocs(q);
      const groupIDs = userGroupsSnapshot.docs.map(doc => doc.data().groupID);

      const groupsRef = collection(db, 'Groups');
      const allGroupsSnapshot = await getDocs(groupsRef);
      const filteredGroups = allGroupsSnapshot.docs
        .filter(doc => groupIDs.includes(doc.id))
        .map(doc => ({ id: doc.id, ...doc.data() }));

      setYourGroups(filteredGroups);

    };

    fetchYourGroups();

  }

  const handleYourGroupClick = (group) => {
    navigate(`/GroupPage/${group.name}`);
  }

  const handleYourGroupsClick = () => {

    //fetchYourGroups();
    setActiveTab("your");
  };

  const handleDiscoverGroupsClick = () => {
    setActiveTab("discover");
  };

  const handleCategoryClick = (categoryName) => {

    setActiveTab(categoryName);

  };



  return (
    <div classsName="page">
      <div className="groups-panel">

        <div className="search-container">
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-bar"
          />
          <button className="filter-button"> <img src='/filter.png' className='filter-image' />Filter</button>
        </div>
        <div classs="group-btns-container">
          <button className="your-groups-btn" onClick={handleYourGroupsClick}>Your Groups</button>
          <button className="discover-groups-btn" onClick={handleDiscoverGroupsClick}>Discover Groups</button>
          <button className="create-group-btn" onClick={handleCreateGroupClick}>Create Group</button>
        </div>
        <div class="white-line"></div>

        {activeTab === 'discover' && (
          <div>
            <div className="categories-container">
              <h2>Discover groups by category!</h2>
              <div className="categories-grid">
                {categories.map((category) => (
                  <div key={category.id} className="category-preview" onClick={() => handleCategoryClick(category.category)}>
                    <img src={category.imageUrl} alt={category.category} className="category-image" />
                    <h3 className="category-name">{category.category}</h3>
                  </div>
                ))}
              </div>
            </div>

            <div className="groups-container">
              <h2>Or join recommended groups!</h2>
              <div className="group-grid">
                {groups.filter(group =>
                  group.name && typeof group.name === 'string' &&
                  group.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).map(group => (
                  <div
                    key={group.name}
                    className="group-preview"
                    onClick={() => handleGroupClick(group)}
                  >
                    <img src={group.imageUrl} alt={group.name} className="groups-image" />
                    <h3 className="groups-name">{group.name}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'your' && (

          <div>
            <div className="groups-container">
              <h2>Your groups: {console.log(yourGroups.length)} {console.log(auth.currentUser.userID)}</h2>
              <div className="group-grid">
                {yourGroups.filter(group => group.name.toLowerCase().includes(searchTerm.toLowerCase())).map(group => (
                  <div
                    key={group.name}
                    className="group-preview"
                    onClick={() => handleYourGroupClick(group)}
                  >
                    <img src={group.imageUrl} alt={group.name} className="groups-image" />
                    <h3 className="groups-name">{group.name}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>

        )}

        {activeTab !== 'discover' && activeTab !== 'your' && (

          <div>

            <img src={categories.filter(category => category.category === activeTab)[0].imageUrl} alt={categories.filter(category => category.category === activeTab)[0].category} className="category-banner-image" />
            <h1 className="category-banner-name">{activeTab}</h1>
            <button className="return-btn" onClick={handleDiscoverGroupsClick}>Back</button>

            <h2>Discover the category's trending groups!</h2>

            <div className="group-grid">
              {groups.filter(group => group.name.toLowerCase().includes(searchTerm.toLowerCase()) && group.category === activeTab.toLowerCase()).map(group => (
                <div
                  key={group.name}
                  className="group-preview"
                  onClick={() => handleGroupClick(group)}
                >
                  <img src={group.imageUrl} alt={group.name} className="groups-image" />
                  <h3 className="groups-name">{group.name}</h3>
                </div>
              ))}
            </div>

          </div>

        )}

        {showAddGroup && (
          <div className="new-group-form">
            <form onSubmit={handleSubmitNewGroup}>

              <img src={'/brainwave.png'} alt={'brainwave'} className="create-group-image" />
              <button claassName="close-button" onClick={() => setShowAddGroup(false)}>X</button>
              <input
                type="text"
                placeholder="Group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                disabled={isSubmitting}
              />
              <textarea
                placeholder="Group details"
                value={newGroupDetails}
                onChange={(e) => setNewGroupDetails(e.target.value)}
                disabled={isSubmitting}
              ></textarea>
              <textarea
                placeholder="Group Category"
                value={newGroupCategory}
                onChange={(e) => setNewGroupCategory(e.target.value)}
                disabled={isSubmitting}
              ></textarea>
              <button type="submit" disabled={isSubmitting}>Create Group</button>
            </form>
          </div>
        )}

        {showGroupPreview && (
          <div className="group-preview-form">

            <form onSubmit={handleJoinGroup}>

              <img src={selectedGroup.imageUrl} alt={selectedGroup.name} className='create-group-image' />

              <button claassName="close-button" onClick={() => setShowGroupPreview(false)}>X</button>

              <h3>{selectedGroup.name}</h3>
              <p>{selectedGroup.description}</p>

              <button type="submit" disabled={isSubmitting}>Join</button>

            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupsPanel;
