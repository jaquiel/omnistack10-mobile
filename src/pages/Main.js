import React, { useState, useEffect } from 'react'
import { StyleSheet, Image, View, Text, TextInput, TouchableOpacity } from 'react-native'
import MapView, { Marker, Callout } from 'react-native-maps'
import { requestPermissionsAsync, getCurrentPositionAsync } from 'expo-location'
import { MaterialIcons } from '@expo/vector-icons'
import api from '../services/api'
import { connect, disconnect, subscribeToNewDevelopers } from '../services/socket'

export default function Main({ navigation }) {
    const [developers, setDevelopers] = useState([])
    const [currentRegion, setCurrentRegion] = useState(null)
    const [techs, setTechs] = useState('')

    useEffect(()=>{
        
        async function loadInitialPosition(){
            const { granted } = await requestPermissionsAsync()
    
            if (granted) {
                const { coords } = await getCurrentPositionAsync({
                    enableHighAccuracy: true,
                })
    
                const { latitude, longitude } = coords

                setCurrentRegion({
                    latitude: latitude, 
                    longitude: longitude, 
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.04,
                })
            }
        }

        loadInitialPosition()
    },[])

    useEffect(() =>{
        subscribeToNewDevelopers(developer => setDevelopers([...developers, developer]))
    }, [developers])


    function setupWebSocket(){

        disconnect()

        const { latitude, longitude } = currentRegion

        connect(
            latitude, 
            longitude,
            techs,
        )
    }

    async function loadDevelopers(){
        const { latitude, longitude } = currentRegion

        let response

        if (techs.length !==0){

            response = await api.get('/search', {
                params: {
                    latitude, 
                    longitude,
                    techs,
                }
            })
        
            setDevelopers(response.data.developers)

        } else {

            response = await api.get('/developers', {})
           
            setDevelopers(response.data)
        }

    }

    function handleRegionChanged(region){
        setCurrentRegion(region)
    }

    if (!currentRegion){
        return null
    }

    return(
        <>
            <MapView 
                onRegionChangeComplete={handleRegionChanged} 
                initialRegion={currentRegion} 
                style={styles.map}
            >
            {
                developers.map(developer => (

                    <Marker 
                        key={developer._id}
                        coordinate={{ 
                                      latitude: developer.location.coordinates[1], 
                                      longitude: developer.location.coordinates[0] }
                                    }
                    >
                    <Image style={styles.avatar} source={{ uri: developer.avatar_url }} />
                    <Callout onPress={()=>{
                        navigation.navigate('Profile', { github_username: developer.github_username} )
                    }}>
                        <View style={styles.callout}>
                            <Text style={styles.name}>{developer.name}</Text>
                            <Text style={styles.bio}>{developer.bio}</Text>
                            <Text style={styles.techs}>{developer.techs.join(', ')}</Text>
                        </View>
                    </Callout>
                </Marker>

                ))
            }

            </MapView>
            <View style={styles.searchForm}>
                <TextInput 
                    style={styles.searchInput}
                    placeholder="Buscar desenvolvedores por tecnologia"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    autoCorrect={false}
                    value={techs}
                    onChangeText={setTechs}
                />

                <TouchableOpacity onPress={loadDevelopers} style={styles.loadButton}>
                    <MaterialIcons name="my-location" size={20} color='#FFF' />
                </TouchableOpacity>
            </View>
        </> 
    )
}
 
const styles = StyleSheet.create({
    map: {
        flex: 1,
    },
    
    avatar:{
        width: 54,
        height: 54,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#FFF',
    },

    callout: {
        width: 260,
    },

    name: {
        fontWeight: 'bold',
        fontSize: 16,
    },

    bio: {
        color: '#666',
        marginTop: 5,
    },

    techs: {
        marginTop: 5,
    },

    searchForm: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        zIndex: 5,
        flexDirection: 'row',
    },

    searchInput: {
        flex: 1,
        height: 50,
        backgroundColor: '#FFF',
        color: '#333',
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 4,
            height: 4,
        },
        elevation: 2,
    },

    loadButton: {
        width: 50,
        height: 50,
        backgroundColor: '#8E4DFF',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 15,
    },

})    