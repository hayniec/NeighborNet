import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';

interface EventCardProps {
    title: string;
    date: string;
    time: string;
    location: string;
    imageUrl?: string;
    onPress?: () => void;
}

export function EventCard({ title, date, time, location, imageUrl, onPress }: EventCardProps) {
    return (
        <Pressable style={styles.card} onPress={onPress}>
            {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.image} />
            ) : (
                <View style={styles.placeholderImage}>
                    <Text style={styles.placeholderText}>No Image</Text>
                </View>
            )}
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                    {title}
                </Text>
                <Text style={styles.details}>{date} • {time}</Text>
                <Text style={styles.location} numberOfLines={1}>
                    {location}
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        elevation: 3, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    image: {
        width: '100%',
        height: 150,
    },
    placeholderImage: {
        width: '100%',
        height: 150,
        backgroundColor: '#e1e1e1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#888',
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222',
        marginBottom: 8,
    },
    details: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    location: {
        fontSize: 14,
        color: '#444',
    },
});
