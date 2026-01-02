import React from 'react';
import { View, Text } from 'react-native';

export default function Test() {
    console.log("Rendering Test Screen");
    return (
        <View style={{ flex: 1, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, color: 'white' }}>Test Route Works</Text>
        </View>
    );
}
