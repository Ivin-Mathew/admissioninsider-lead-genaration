"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface Note {
  id: string;
  note_text: string;
  created_at: string;
  counselor_id: string;
  counselor_name?: string;
}

interface ApplicationNotesProps {
  applicationId: string;
}

export default function ApplicationNotes({ applicationId }: ApplicationNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Fetch notes for the application
  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("application_notes")
        .select(`
          id,
          note_text,
          created_at,
          counselor_id,
          profiles!counselor_id(id, role)
        `)
        .eq("application_id", applicationId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to include counselor email
      const notesWithCounselor = await Promise.all(
        data.map(async (note) => {
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(note.counselor_id);
          return {
            ...note,
            counselor_name: userData?.user?.email || "Unknown Counselor"
          };
        })
      );

      setNotes(notesWithCounselor);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new note
  const addNote = async () => {
    if (!newNote.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("application_notes")
        .insert([
          {
            application_id: applicationId,
            counselor_id: user.id,
            note_text: newNote.trim(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Add the new note to the list with counselor info
      const newNoteWithCounselor = {
        ...data,
        counselor_name: user.email,
      };

      setNotes([newNoteWithCounselor, ...notes]);
      setNewNote("");
      toast.success("Note added successfully");
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [applicationId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Application Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new note */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a note about this application..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
          />
          <Button
            onClick={addNote}
            disabled={!newNote.trim() || isSubmitting}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isSubmitting ? "Adding..." : "Add Note"}
          </Button>
        </div>

        {/* Notes list */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full mx-auto"></div>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No notes yet. Add the first note above.
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="border rounded-lg p-3 bg-gray-50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {note.counselor_name}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatDate(note.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {note.note_text}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
