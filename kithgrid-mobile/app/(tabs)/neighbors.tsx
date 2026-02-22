import { View, Text, StyleSheet } from 'react-native';

export default function NeighborsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Neighbors Directory</Text>
            <Text style={styles.subtitle}>Connect with your community.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    }
});
