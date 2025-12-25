
import { MoodLogEntry, Message, Conversation } from '../types';
import { supabase } from '../lib/supabase';

export const cloudService = {
  // Save a mood entry to the Supabase cloud
  saveMoodEntry: async (entry: MoodLogEntry): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('mood_logs')
      .upsert({
        user_id: user.id,
        date: entry.date,
        mood: entry.mood,
        energy: entry.energy,
        score: entry.score
      }, { onConflict: 'user_id,date' });

    if (error) throw error;
  },

  // Fetch all user mood logs from Supabase
  getMoodLogs: async (): Promise<MoodLogEntry[]> => {
    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .order('date', { ascending: true });

    if (error) return [];
    return data.map(item => ({
      date: item.date,
      mood: item.mood,
      energy: item.energy,
      score: item.score
    }));
  },

  // Chat History Methods
  createConversation: async (title: string): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, title })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  getConversations: async (): Promise<Conversation[]> => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];
    return data;
  },

  saveMessage: async (msg: Message, conversationId: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        mood_state: msg.mood_state
      });

    if (error) throw error;
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (error) return [];
    return data.map(m => ({
      ...m,
      timestamp: new Date(m.timestamp)
    }));
  },

  clearAllData: async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('mood_logs').delete().eq('user_id', user.id);
    await supabase.from('messages').delete().eq('user_id', user.id);
    await supabase.from('conversations').delete().eq('user_id', user.id);
  }
};
