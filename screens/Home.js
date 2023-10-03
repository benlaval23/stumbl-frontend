// screens/HowItWorks.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, SectionList, TouchableOpacity } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { getDoc, doc } from 'firebase/firestore'



const dummyConnections = [
  {
    primaryUserId: 'xxxx2',
    secondaryUserId: 'xxxx',
    secondaryUsername: 'Thomas Finch',
    distance: 1,
    timestamp: '01:01:2020'
  },
  {
    primaryUserId: 'xxxx3',
    secondaryUserId: 'xxxx',
    secondaryUsername: 'Henry Clark',
    distance: 2,
    timestamp: '01:01:2020'
  },
  {
    primaryUserId: 'xxxx4',
    secondaryUserId: 'xxxx',
    secondaryUsername: 'Charlie Stannard',
    distance: 10,
    timestamp: '01:01:2020'
  },
  {
    primaryUserId: 'xxxx1',
    secondaryUserId: 'xxxx',
    secondaryUsername: 'Hector forwood',
    distance: 20,
    timestamp: '01:01:2020'
  },
  {
    primaryUserId: 'xxxx1',
    secondaryUserId: 'xxxx',
    secondaryUsername: 'Hector forwood',
    distance: 20,
    timestamp: '01:01:2020'
  },
]

const Home = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [activeConnections, setActiveConnections] = useState([]);
  const [inactiveConnections, setInactiveConnections] = useState([]);


  const handleSignOut = () => {
    auth
    .signOut()
    .then(() => {
      navigation.replace('SignUp')
    })
    .catch(error => alert.apply(error.message))
  }

  const renderConnection = ({ item }) => (
    <TouchableOpacity style={styles.connectionItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.secondaryUsername.charAt(0)}</Text>
      </View>
      <View style={styles.connectionInfo}>
        <Text style={styles.connectionName}>{item.secondaryUsername}</Text>
        <Text style={styles.connectionMessage}>
          is {item.distance} km away from you. Send them a message to meet up!
        </Text>
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser?.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUserData();
  }, []); // This effect only runs once when the component is mounted

  useEffect(() => {
    if (user) {
      const maxDistance = user?.notificationSettings.rules.home;
      setActiveConnections(dummyConnections.filter(connection => connection.distance <= maxDistance));
      setInactiveConnections(dummyConnections.filter(connection => connection.distance > maxDistance));
    }
  }, [user]);


  return (
    <View style={styles.container}>
      <Text style={styles.explainer}>Logged in as {auth.currentUser?.phoneNumber} </Text>
      <Button title="Sign Out" onPress={handleSignOut}/>
     <View style={styles.bottomSheet}>
      <View style={styles.list} >
        <Text style={styles.subTitle} >Live Connections</Text>
        <FlatList
          data={activeConnections} // You might want to use activeConnections and inactiveConnections as you have defined above
          renderItem={renderConnection}
          keyExtractor={(item) => item.secondaryUserId}
        />
        </View>
        <View style={styles.list} >
          <Text style={styles.subTitle} >Connections</Text>
        <FlatList
          data={inactiveConnections} // You might want to use activeConnections and inactiveConnections as you have defined above
          renderItem={renderConnection}
          keyExtractor={(item) => item.secondaryUserId}
        />
        <Button title="Sign Out" onPress={handleSignOut}/>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    backgroundColor: '#313334',
  },
  explainer: {
    marginBottom: 10,
    textAlign: 'center',
    color: 'white',
  },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#B5EAD7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  connectionInfo: {
    flex: 1,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  connectionMessage: {
    fontSize: 14,
    color: '#777',
  },
  subTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#537d8d' // Color to match the invite button, for consistency.
  },
  list:{
    marginTop: 16,
  },
  bottomSheet: {
    backgroundColor: '#f0f0f0',
    bottom: 0,
    width: '100%',
    borderRadius: 16,
    height: '60%',
    position: 'absolute',  
    padding: 16,    
  }
});

export default Home;