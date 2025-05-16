import axios from 'axios';

// Get all notes
export const getAllNotes = async () => {
    try {
        const response = await axios.get('/notes');
        return response.data;
    } catch (error) {
        throw new Error('Error fetching notes: ' + error.message);
    }
};

// Get a single note by ID
export const getNoteById = async (noteId) => {
    try {
        const response = await axios.get(`/notes/${noteId}`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching note: ' + error.message);
    }
};

// Create a new note
export const createNote = async (noteData) => {
    try {
        const response = await axios.post('/notes', noteData);
        return response.data;
    } catch (error) {
        throw new Error('Error creating note: ' + error.message);
    }
};

// Update a note
export const updateNote = async (noteId, noteData) => {
    try {
        const response = await axios.put(`/notes/${noteId}`, noteData);
        return response.data;
    } catch (error) {
        throw new Error('Error updating note: ' + error.message);
    }
};

// Delete a note
export const deleteNote = async (noteId) => {
    try {
        const response = await axios.delete(`/notes/${noteId}`);
        return response.data;
    } catch (error) {
        throw new Error('Error deleting note: ' + error.message);
    }
}; 