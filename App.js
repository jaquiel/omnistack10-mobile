import React from 'react';
import { StatusBar } from 'react-native'

import { SafeAreaProvider } from 'react-native-safe-area-context';

import Routes from './src/routes'

import './src/config/StatusBarConfig'


const App = () => { 

    return(
            <SafeAreaProvider>
                <StatusBar barStyle="light-content" backgroundColor="#7D40E7" />
                <Routes /> 
            </SafeAreaProvider>
    )
} 

export default App