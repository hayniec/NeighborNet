import { View, Text, StyleSheet } from 'react-native';

export default function EventsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Events Calendar</Text>
            <Text style={styles.subtitle}>Upcoming local activities.</Text>
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
