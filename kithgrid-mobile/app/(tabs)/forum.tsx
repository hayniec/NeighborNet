import { View, Text, StyleSheet } from 'react-native';

export default function ForumScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Community Forum</Text>
            <Text style={styles.subtitle}>Check back soon for discussions.</Text>
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
