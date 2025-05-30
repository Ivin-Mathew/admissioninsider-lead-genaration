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
  notes?: Note[];
  onNotesUpdate?: () => void;
}

export default function ApplicationNotes({ applicationId, notes: initialNotes = [], onNotesUpdate }: ApplicationNotesProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Update notes when initialNotes prop changes
  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  // Add a new note
  const addNote = async () => {
    if (!newNote.trim() || !user) return;

    setIsSubmitting(true);
    try {
      // Create new note object
      const newNoteObj = {
        id: crypto.randomUUID(),
        note_text: newNote.trim(),
        created_at: new Date().toISOString(),
        counselor_id: user.id,
        counselor_name: user.email,
      };

      // Get current notes from the application
      const { data: currentApp, error: fetchError } = await supabase
        .from("applications")
        .select("notes")
        .eq("application_id", applicationId)
        .single();

      if (fetchError) throw fetchError;

      // Update the notes array
      const updatedNotes = [newNoteObj, ...(currentApp.notes || [])];

      // Update the application with new notes
      const { error: updateError } = await supabase
        .from("applications")
        .update({
          notes: updatedNotes,
          updated_at: new Date().toISOString()
        })
        .eq("application_id", applicationId);

      if (updateError) throw updateError;

      setNotes(updatedNotes);
      setNewNote("");
      toast.success("Note added successfully");

      // Call the callback to refresh parent component
      if (onNotesUpdate) {
        onNotesUpdate();
      }
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    } finally {
      setIsSubmitting(false);
    }
  };



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
          {notes.length === 0 ? (
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
