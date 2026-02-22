import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function MenuScreen() {
    const { user } = useAuth();

    const menuItems = [
        { name: "Marketplace", icon: "shopping", family: "MaterialCommunityIcons" },
        { name: "Service Pros", icon: "wrench", family: "MaterialCommunityIcons" },
        { name: "Local Guide", icon: "map-marker", family: "MaterialCommunityIcons" },
        { name: "Community Resources", icon: "folder-open", family: "MaterialCommunityIcons" },
        { name: "Emergency", icon: "alert-circle", family: "Feather", color: "#d9534f" },
        { name: "Settings", icon: "settings", family: "Feather" },
        { name: "Admin Console", icon: "shield-check", family: "MaterialCommunityIcons" },
    ];

    return (
        <ScrollView style={styles.container}>
            {menuItems.map((item, index) => (
                <Pressable key={index} style={styles.menuItem}>
                    {item.family === 'MaterialCommunityIcons' ? (
                        <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color || "#444"} style={styles.icon} />
                    ) : (
                        <Feather name={item.icon as any} size={24} color={item.color || "#444"} style={styles.icon} />
                    )}
                    <Text style={[styles.menuText, item.color ? { color: item.color } : {}]}>{item.name}</Text>
                </Pressable>
            ))}

            <Pressable style={[styles.menuItem, styles.logoutItem]} onPress={() => supabase.auth.signOut()}>
                <Feather name="log-out" size={24} color="#d9534f" style={styles.icon} />
                <Text style={[styles.menuText, { color: '#d9534f' }]}>Sign Out</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        paddingTop: 40,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    icon: {
        marginRight: 15,
    },
    menuText: {
        fontSize: 18,
        color: '#333',
        fontWeight: '500',
    },
    logoutItem: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    }
});
