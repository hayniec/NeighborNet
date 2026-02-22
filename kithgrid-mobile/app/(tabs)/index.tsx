import React from 'react';
import { StyleSheet, View, Text, ScrollView, Button } from 'react-native';
import { EventCard } from '../../components/EventCard';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function DashboardScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      <Text style={styles.sectionTitle}>Upcoming Events</Text>

      <EventCard
        title="Community Association Meeting"
        date="Oct 15, 2026"
        time="7:00 PM"
        location="Clubhouse Main Hall"
        imageUrl="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=600&auto=format&fit=crop"
      />

      <EventCard
        title="Neighborhood Watch Training"
        date="Oct 20, 2026"
        time="6:00 PM"
        location="Zoom Virtual Call"
      />

      <Button title="Logout" color="#d9534f" onPress={() => supabase.auth.signOut()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  content: {
    padding: 20,
    paddingTop: 60, // Account for safe area
  },
  header: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '300',
    color: '#333',
  },
  emailText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 15,
  }
});
