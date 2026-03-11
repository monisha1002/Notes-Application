document.addEventListener('DOMContentLoaded', () => {
    const noteForm = document.getElementById('note-form');
    const noteTitleInput = document.getElementById('note-title');
    const noteContentInput = document.getElementById('note-content');
    const notesList = document.getElementById('notes-list');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');
    let currentNoteId = null;

    // Function to show/hide loading spinner
    const toggleLoading = (show) => {
        if (show) {
            loadingSpinner.classList.remove('d-none');
        } else {
            loadingSpinner.classList.add('d-none');
        }
    };

    // Function to show/hide error message
    const toggleError = (show) => {
        if (show) {
            errorMessage.classList.remove('d-none');
        } else {
            errorMessage.classList.add('d-none');
        }
    };

    // Function to fetch and display notes
    const fetchNotes = async () => {
        toggleLoading(true);
        toggleError(false);
        notesList.innerHTML = ''; // Clear existing notes

        try {
            const response = await fetch('/notes');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const notes = await response.json();
            
            if (notes.length === 0) {
                notesList.innerHTML = '<p class="text-center col-12">No notes yet. Add one above!</p>';
            } else {
                notes.forEach(note => {
                    const noteCard = `
                        <div class="col">
                            <div class="card note-card h-100 shadow-sm" data-id="${note.id}" data-title="${note.title}" data-content="${note.content}">
                                <div class="card-body">
                                    <h5 class="card-title">${note.title}</h5>
                                    <p class="card-text note-content">${note.content}</p>
                                    <button class="btn btn-danger btn-sm delete-note-btn" data-id="${note.id}">Delete</button>
                                </div>
                            </div>
                        </div>
                    `;
                    notesList.insertAdjacentHTML('beforeend', noteCard);
                });
                // Add event listeners for delete buttons
                document.querySelectorAll('.delete-note-btn').forEach(button => {
                    button.addEventListener('click', handleDeleteNote);
                });
                // Add event listeners for edit
                document.querySelectorAll('.note-card').forEach(card => {
                    card.addEventListener('click', handleEditNote);
                });
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            toggleError(true);
        } finally {
            toggleLoading(false);
        }
    };

    // Function to handle adding/updating a note
    noteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = noteTitleInput.value;
        const content = noteContentInput.value;
        const noteData = { title, content, id: currentNoteId };

        try {
            const response = await fetch('/notes', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(noteData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            noteTitleInput.value = '';
            noteContentInput.value = '';
            currentNoteId = null;
            noteForm.querySelector('button[type="submit"]').textContent = 'Save Note';
            fetchNotes(); // Refresh notes list
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Failed to save note. Please try again.');
        }
    });

    // Function to handle deleting a note
    const handleDeleteNote = async (event) => {
        event.stopPropagation();
        const noteId = event.target.dataset.id;
        if (!confirm('Are you sure you want to delete this note?')) {
            return;
        }

        try {
            const response = await fetch(`/notes/${noteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            fetchNotes(); // Refresh notes list
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('Failed to delete note. Please try again.');
        }
    };
    
    // Function to handle editing a note
    const handleEditNote = (event) => {
        const card = event.currentTarget;
        currentNoteId = card.dataset.id;
        noteTitleInput.value = card.dataset.title;
        noteContentInput.value = card.dataset.content;
        noteForm.querySelector('button[type="submit"]').textContent = 'Update Note';
    };


    // Initial fetch of notes when the page loads
    fetchNotes();
});
