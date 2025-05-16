import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserContext } from '../../context/userContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faPlus, faTrash, faStickyNote, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { getAllNotes, createNote, updateNote, deleteNote } from '../services/notesService';
import '../assets/styles/notes.css';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import debounce from 'lodash.debounce';

export default function Notes() {
  const { user } = useContext(UserContext);
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  
  // Modal animation timing
  const modalAnimationTimeout = useRef(null);

  // Fetch all notes
  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const fetchedNotes = await getAllNotes();
      setNotes(fetchedNotes);
      
      // Set the first note as active if there are notes and no active note
      if (fetchedNotes.length > 0 && !activeNote) {
        setActiveNote(fetchedNotes[0]);
      }
      
      setIsLoading(false);
    } catch (error) {
      toast.error('Failed to fetch notes');
      setIsLoading(false);
    }
  };

  // Create a new note
  const handleCreateNote = async () => {
    try {
      const newNote = await createNote({
        title: 'Untitled Note',
        content: '',
        fontFamily: 'Arial',
        fontSize: 14
      });
      
      setNotes(prevNotes => [newNote, ...prevNotes]);
      setActiveNote(newNote);
      toast.success('New note created');
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  // Handle note selection
  const handleNoteSelect = (note) => {
    setActiveNote(note);
  };

  // Handle note title change
  const handleTitleChange = (e) => {
    const updatedNote = { ...activeNote, title: e.target.value };
    setActiveNote(updatedNote);
    debouncedSaveNote(updatedNote);
  };

  // Handle note content change
  const handleContentChange = (e) => {
    const updatedNote = { ...activeNote, content: e.target.value };
    setActiveNote(updatedNote);
    debouncedSaveNote(updatedNote);
  };

  // Handle font family change
  const handleFontFamilyChange = (e) => {
    const updatedNote = { ...activeNote, fontFamily: e.target.value };
    setActiveNote(updatedNote);
    debouncedSaveNote(updatedNote);
  };

  // Handle font size change
  const handleFontSizeChange = (e) => {
    const updatedNote = { ...activeNote, fontSize: parseInt(e.target.value) };
    setActiveNote(updatedNote);
    debouncedSaveNote(updatedNote);
  };

  // Save note to server (debounced to prevent too many requests)
  const saveNote = async (note) => {
    try {
      const savedNote = await updateNote(note._id, note);
      setNotes(prevNotes => 
        prevNotes.map(n => n._id === savedNote._id ? savedNote : n)
      );
    } catch (error) {
      toast.error('Failed to save note');
    }
  };

  // Create a debounced version of saveNote
  const debouncedSaveNote = useCallback(debounce(saveNote, 1000), []);

  // Open delete confirmation modal
  const openDeleteModal = (noteId) => {
    setNoteToDelete(noteId);
    setShowDeleteModal(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    // Use timeout to allow exit animation to complete
    clearTimeout(modalAnimationTimeout.current);
    setShowDeleteModal(false);
    
    modalAnimationTimeout.current = setTimeout(() => {
      setNoteToDelete(null);
    }, 300); // Match transition time in CSS
  };

  // Confirm note deletion
  const confirmDeleteNote = async () => {
    try {
      await deleteNote(noteToDelete);
      
      setNotes(prevNotes => prevNotes.filter(note => note._id !== noteToDelete));
      
      if (activeNote && activeNote._id === noteToDelete) {
        const remainingNotes = notes.filter(note => note._id !== noteToDelete);
        setActiveNote(remainingNotes.length > 0 ? remainingNotes[0] : null);
      }
      
      toast.success('Note deleted');
      closeDeleteModal();
    } catch (error) {
      toast.error('Failed to delete note');
      closeDeleteModal();
    }
  };

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes();
    
    // Cleanup on unmount
    return () => {
      clearTimeout(modalAnimationTimeout.current);
    };
  }, []);

  // Cancel debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSaveNote.cancel();
    };
  }, [debouncedSaveNote]);

  // Format date for display
  const formatDate = (date) => {
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  };

  return (
    <div className="notes-container">
      {/* Sidebar Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={faBars} />
      </button>
      
      {/* Notes Sidebar */}
      <div className={`notes-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="notes-sidebar-header">
          <h2 className="notes-sidebar-title">Notes</h2>
          <button className="add-note-btn" onClick={handleCreateNote}>
            <FontAwesomeIcon icon={faPlus} /> New
          </button>
        </div>
        
        <div className="notes-list">
          {isLoading ? (
            <div className="text-center p-3">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="text-center p-3">No notes found</div>
          ) : (
            notes.map(note => (
              <div 
                key={note._id} 
                className={`note-item ${activeNote && activeNote._id === note._id ? 'active' : ''}`}
                onClick={() => handleNoteSelect(note)}
              >
                <h3 className="note-item-title">{note.title}</h3>
                <p className="note-item-date">
                  {formatDate(note.updatedAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Notes Canvas */}
      <div className="notes-canvas">
        {!activeNote ? (
          <div className="no-notes-selected">
            <FontAwesomeIcon icon={faStickyNote} className="no-notes-icon" />
            <p>Select a note or create a new one</p>
          </div>
        ) : (
          <>
            <div className="note-toolbar">
              <select 
                className="toolbar-select" 
                value={activeNote.fontFamily}
                onChange={handleFontFamilyChange}
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
              </select>
              
              <select 
                className="toolbar-select" 
                value={activeNote.fontSize}
                onChange={handleFontSizeChange}
              >
                <option value="10">10</option>
                <option value="12">12</option>
                <option value="14">14</option>
                <option value="16">16</option>
                <option value="18">18</option>
                <option value="20">20</option>
                <option value="24">24</option>
              </select>
              
              <button 
                className="btn btn-danger ml-auto"
                onClick={() => openDeleteModal(activeNote._id)}
              >
                <FontAwesomeIcon icon={faTrash} /> Delete
              </button>
            </div>
            
            <input 
              type="text" 
              className="note-title-input"
              value={activeNote.title}
              onChange={handleTitleChange}
              placeholder="Note title"
            />
            
            <textarea 
              className="note-content"
              value={activeNote.content}
              onChange={handleContentChange}
              placeholder="Start typing your note here..."
              style={{ 
                fontFamily: activeNote.fontFamily, 
                fontSize: `${activeNote.fontSize}px` 
              }}
            ></textarea>
          </>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      <div className={`modal-overlay ${showDeleteModal ? 'show' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <FontAwesomeIcon icon={faExclamationTriangle} className="modal-icon" />
            <h3 className="modal-title">Delete Note</h3>
          </div>
          <div className="modal-message">
            Are you sure you want to delete this note? This action cannot be undone.
          </div>
          <div className="modal-actions">
            <button className="modal-btn modal-btn-cancel" onClick={closeDeleteModal}>
              Cancel
            </button>
            <button className="modal-btn modal-btn-delete" onClick={confirmDeleteNote}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
