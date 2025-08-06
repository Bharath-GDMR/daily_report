let contacts = [];
let editingContactId = null;

// DOM elements
const searchInput = document.getElementById('searchInput');
const contactsList = document.getElementById('contactsList');
const noResults = document.getElementById('noResults');
const modal = document.getElementById('contactModal');
const form = document.getElementById('contactForm');
const modalTitle = document.getElementById('modalTitle');
const submitText = document.getElementById('submitText');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    fetchContacts();
    setupEventListeners();
});

function fetchContacts() {
    fetch('contacts.json')
        .then(response => response.json())
        .then(data => {
            contacts = data;
            renderContacts();
        })
        .catch(error => console.error('Error fetching contacts:', error));
}

function setupEventListeners() {
    searchInput.addEventListener('input', function() {
        renderContacts();
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveContact();
    });

    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function renderContacts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    let filteredContacts = contacts;

    if (searchTerm) {
        filteredContacts = contacts.filter(contact => 
            contact.name.toLowerCase().includes(searchTerm) ||
            (contact.phone && contact.phone.toLowerCase().includes(searchTerm)) ||
            (contact.email && contact.email.toLowerCase().includes(searchTerm)) ||
            (contact.address && contact.address.toLowerCase().includes(searchTerm)) ||
            (contact.keywords && contact.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm)))
        );
    }

    if (filteredContacts.length === 0) {
        contactsList.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    contactsList.style.display = 'block';
    noResults.style.display = 'none';

    contactsList.innerHTML = filteredContacts.map(contact => `
        <div class="contact-card">
            <div class="contact-header">
                <div class="contact-name">${escapeHtml(contact.name)}</div>
                <div class="contact-actions">
                    <button class="btn btn-primary" onclick="editContact(${contact.id})" style="padding: 8px 12px; font-size: 0.9rem;">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button class="btn btn-danger" onclick="deleteContact(${contact.id})">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="contact-info">
                ${contact.phone ? `
                    <div class="contact-item">
                        <svg class="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        <span>${escapeHtml(contact.phone)}</span>
                    </div>
                ` : ''}
                ${contact.email ? `
                    <div class="contact-item">
                        <svg class="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        <span>${escapeHtml(contact.email)}</span>
                    </div>
                ` : ''}
                ${contact.address ? `
                    <div class="contact-item">
                        <svg class="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span>${escapeHtml(contact.address)}</span>
                    </div>
                ` : ''}
            </div>
            ${contact.keywords && contact.keywords.length > 0 ? `
                <div class="keywords">
                    ${contact.keywords.map(keyword => `
                        <span class="keyword-tag">${escapeHtml(keyword)}</span>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function openAddModal() {
    editingContactId = null;
    modalTitle.textContent = 'Add New Contact';
    submitText.textContent = 'Add Contact';
    form.reset();
    modal.classList.add('active');
}

function editContact(id) {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;

    editingContactId = id;
    modalTitle.textContent = 'Edit Contact';
    submitText.textContent = 'Update Contact';

    document.getElementById('nameInput').value = contact.name;
    document.getElementById('phoneInput').value = contact.phone;
    document.getElementById('emailInput').value = contact.email;
    document.getElementById('addressInput').value = contact.address;
    document.getElementById('keywordsInput').value = contact.keywords.join(', ');

    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
    editingContactId = null;
    form.reset();
}

function saveContact() {
    const formData = {
        name: document.getElementById('nameInput').value.trim(),
        phone: document.getElementById('phoneInput').value.trim(),
        email: document.getElementById('emailInput').value.trim(),
        address: document.getElementById('addressInput').value.trim(),
        keywords: document.getElementById('keywordsInput').value
            .split(',')
            .map(k => k.trim())
            .filter(k => k.length > 0)
    };

    if (!formData.name) {
        alert('Name is required');
        return;
    }

    if (editingContactId) {
        // Update existing contact
        const index = contacts.findIndex(c => c.id === editingContactId);
        if (index !== -1) {
            contacts[index] = { ...contacts[index], ...formData };
        }
    } else {
        // Add new contact
        const newContact = {
            ...formData,
            id: Date.now()
        };
        contacts.push(newContact);
    }

    closeModal();
    renderContacts();
}

function deleteContact(id) {
    if (confirm('Are you sure you want to delete this contact?')) {
        contacts = contacts.filter(c => c.id !== id);
        renderContacts();
    }
}

function exportContacts() {
    const dataStr = JSON.stringify(contacts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contacts.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}