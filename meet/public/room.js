// Room functionality with WebRTC
class VideoCallApp {
    constructor() {
        this.socket = io();
        this.localStream = null;
        this.peers = new Map();
        this.roomId = this.getRoomIdFromURL();
        this.userId = null;
        this.userName = sessionStorage.getItem('userName') || '';
        this.isAudioEnabled = true;
        this.isVideoEnabled = true;
        this.isScreenSharing = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.checkMediaPermissions();
    }

    getRoomIdFromURL() {
        const path = window.location.pathname;
        return path.split('/room/')[1];
    }

    initializeElements() {
        // Video elements
        this.localVideo = document.getElementById('localVideo');
        this.videoGrid = document.getElementById('videoGrid');
        this.previewVideo = document.getElementById('previewVideo');
        
        // Control elements
        this.toggleAudioBtn = document.getElementById('toggleAudio');
        this.toggleVideoBtn = document.getElementById('toggleVideo');
        this.shareScreenBtn = document.getElementById('shareScreen');
        this.hangUpBtn = document.getElementById('hangUp');
        
        // Modal elements
        this.joinModal = document.getElementById('joinModal');
        this.displayNameInput = document.getElementById('displayName');
        this.joinMeetingBtn = document.getElementById('joinMeeting');
        
        // Chat elements
        this.chatSection = document.getElementById('chatSection');
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendMessageBtn = document.getElementById('sendMessage');
        this.toggleChatBtn = document.getElementById('toggleChat');
        this.closeChatBtn = document.getElementById('closeChat');
        
        // Header elements
        this.roomIdSpan = document.getElementById('roomId');
        this.copyRoomIdBtn = document.getElementById('copyRoomId');
        this.leaveRoomBtn = document.getElementById('leaveRoom');
        
        // Set room ID in header
        this.roomIdSpan.textContent = this.roomId;
    }

    setupEventListeners() {
        // Control buttons
        this.toggleAudioBtn.addEventListener('click', () => this.toggleAudio());
        this.toggleVideoBtn.addEventListener('click', () => this.toggleVideo());
        this.shareScreenBtn.addEventListener('click', () => this.toggleScreenShare());
        this.hangUpBtn.addEventListener('click', () => this.leaveRoom());
        this.leaveRoomBtn.addEventListener('click', () => this.leaveRoom());
        
        // Modal and join
        this.joinMeetingBtn.addEventListener('click', () => this.joinRoom());
        this.displayNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinRoom();
        });
        
        // Chat functionality
        this.toggleChatBtn.addEventListener('click', () => this.toggleChat());
        this.closeChatBtn.addEventListener('click', () => this.closeChat());
        this.sendMessageBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        // Copy room ID
        this.copyRoomIdBtn.addEventListener('click', () => this.copyRoomId());
        
        // Socket events
        this.setupSocketListeners();
        
        // Preview controls
        document.getElementById('previewToggleAudio').addEventListener('click', () => {
            this.isAudioEnabled = !this.isAudioEnabled;
            this.updatePreviewControls();
        });
        
        document.getElementById('previewToggleVideo').addEventListener('click', () => {
            this.isVideoEnabled = !this.isVideoEnabled;
            this.updatePreviewControls();
        });
    }

    setupSocketListeners() {
        this.socket.on('joined-room', ({ roomId, userId, users }) => {
            this.userId = userId;
            this.hideJoinModal();
            this.showNotification('Successfully joined the meeting!', 'success');
            
            // Connect to existing users
            users.forEach(user => {
                if (user.id !== userId) {
                    this.createPeerConnection(user.id, true);
                }
            });
        });

        this.socket.on('user-joined', (user) => {
            this.showNotification(`${user.name} joined the meeting`, 'info');
            this.createPeerConnection(user.id, false);
        });

        this.socket.on('user-left', ({ userId }) => {
            this.removePeer(userId);
        });

        this.socket.on('offer', async ({ offer, senderUserId }) => {
            const peerConnection = this.peers.get(senderUserId);
            if (peerConnection) {
                await peerConnection.setRemoteDescription(offer);
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                this.socket.emit('answer', { answer, targetUserId: senderUserId });
            }
        });

        this.socket.on('answer', async ({ answer, senderUserId }) => {
            const peerConnection = this.peers.get(senderUserId);
            if (peerConnection) {
                await peerConnection.setRemoteDescription(answer);
            }
        });

        this.socket.on('ice-candidate', async ({ candidate, senderUserId }) => {
            const peerConnection = this.peers.get(senderUserId);
            if (peerConnection) {
                await peerConnection.addIceCandidate(candidate);
            }
        });

        this.socket.on('user-audio-toggle', ({ userId, isAudioEnabled }) => {
            this.updateUserAudioIndicator(userId, isAudioEnabled);
        });

        this.socket.on('user-video-toggle', ({ userId, isVideoEnabled }) => {
            this.updateUserVideoDisplay(userId, isVideoEnabled);
        });

        this.socket.on('chat-message', (message) => {
            this.displayChatMessage(message);
        });
    }

    async checkMediaPermissions() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            this.previewVideo.srcObject = stream;
            this.displayNameInput.value = this.userName;
            this.showJoinModal();
            
            // Stop preview stream
            stream.getTracks().forEach(track => track.stop());
        } catch (error) {
            console.error('Error accessing media devices:', error);
            this.showNotification('Camera/microphone access required', 'error');
        }
    }

    async getLocalStream() {
        try {
            const constraints = {
                video: this.isVideoEnabled,
                audio: this.isAudioEnabled
            };
            
            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.localVideo.srcObject = this.localStream;
            
            return this.localStream;
        } catch (error) {
            console.error('Error accessing media:', error);
            this.showNotification('Failed to access camera/microphone', 'error');
            throw error;
        }
    }

    async joinRoom() {
        const displayName = this.displayNameInput.value.trim();
        if (!displayName) {
            this.showNotification('Please enter your name', 'error');
            return;
        }

        try {
            await this.getLocalStream();
            this.userName = displayName;
            sessionStorage.setItem('userName', displayName);
            
            this.socket.emit('join-room', {
                roomId: this.roomId,
                userName: this.userName
            });
            
            this.updateControlButtons();
        } catch (error) {
            this.showNotification('Failed to join room', 'error');
        }
    }

    createPeerConnection(userId, isInitiator) {
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };

        const peerConnection = new RTCPeerConnection(configuration);
        this.peers.set(userId, peerConnection);

        // Add local stream tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, this.localStream);
            });
        }

        // Handle remote stream
        peerConnection.ontrack = (event) => {
            this.handleRemoteStream(userId, event.streams[0]);
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit('ice-candidate', {
                    candidate: event.candidate,
                    targetUserId: userId
                });
            }
        };

        // Create offer if initiator
        if (isInitiator) {
            this.createOffer(userId, peerConnection);
        }

        return peerConnection;
    }

    async createOffer(userId, peerConnection) {
        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            this.socket.emit('offer', { offer, targetUserId: userId });
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    }

    handleRemoteStream(userId, stream) {
        const existingVideo = document.getElementById(`video-${userId}`);
        if (existingVideo) {
            existingVideo.srcObject = stream;
            return;
        }

        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container remote';
        videoContainer.innerHTML = `
            <video id="video-${userId}" autoplay playsinline></video>
            <div class="video-overlay">
                <span class="user-name">User ${userId.slice(0, 8)}</span>
                <div class="video-controls">
                    <span class="audio-indicator" id="audio-${userId}">
                        <i class="fas fa-microphone"></i>
                    </span>
                </div>
            </div>
        `;

        this.videoGrid.appendChild(videoContainer);
        document.getElementById(`video-${userId}`).srcObject = stream;
    }

    removePeer(userId) {
        const peerConnection = this.peers.get(userId);
        if (peerConnection) {
            peerConnection.close();
            this.peers.delete(userId);
        }

        const videoContainer = document.getElementById(`video-${userId}`)?.parentElement;
        if (videoContainer) {
            videoContainer.remove();
        }

        this.showNotification('A participant left the meeting', 'info');
    }

    toggleAudio() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                this.isAudioEnabled = audioTrack.enabled;
                this.updateControlButtons();
                
                this.socket.emit('toggle-audio', { isAudioEnabled: this.isAudioEnabled });
                
                const indicator = document.getElementById('localAudioIndicator');
                if (this.isAudioEnabled) {
                    indicator.classList.remove('muted');
                } else {
                    indicator.classList.add('muted');
                }
            }
        }
    }

    toggleVideo() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                this.isVideoEnabled = videoTrack.enabled;
                this.updateControlButtons();
                
                this.socket.emit('toggle-video', { isVideoEnabled: this.isVideoEnabled });
            }
        }
    }

    async toggleScreenShare() {
        try {
            if (!this.isScreenSharing) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true
                });
                
                // Replace video track in all peer connections
                const videoTrack = screenStream.getVideoTracks()[0];
                this.peers.forEach(peerConnection => {
                    const sender = peerConnection.getSenders().find(s => 
                        s.track && s.track.kind === 'video'
                    );
                    if (sender) {
                        sender.replaceTrack(videoTrack);
                    }
                });
                
                // Update local video
                this.localVideo.srcObject = screenStream;
                this.isScreenSharing = true;
                
                // Handle screen share end
                videoTrack.onended = () => {
                    this.stopScreenShare();
                };
                
                this.socket.emit('start-screen-share');
                this.showNotification('Screen sharing started', 'success');
                
            } else {
                this.stopScreenShare();
            }
            
            this.updateControlButtons();
        } catch (error) {
            console.error('Error toggling screen share:', error);
            this.showNotification('Failed to share screen', 'error');
        }
    }

    async stopScreenShare() {
        try {
            // Get camera stream back
            const cameraStream = await navigator.mediaDevices.getUserMedia({
                video: this.isVideoEnabled,
                audio: this.isAudioEnabled
            });
            
            // Replace screen share track with camera track
            const videoTrack = cameraStream.getVideoTracks()[0];
            this.peers.forEach(peerConnection => {
                const sender = peerConnection.getSenders().find(s => 
                    s.track && s.track.kind === 'video'
                );
                if (sender) {
                    sender.replaceTrack(videoTrack);
                }
            });
            
            // Update local stream and video
            this.localStream = cameraStream;
            this.localVideo.srcObject = cameraStream;
            this.isScreenSharing = false;
            
            this.socket.emit('stop-screen-share');
            this.showNotification('Screen sharing stopped', 'info');
        } catch (error) {
            console.error('Error stopping screen share:', error);
        }
    }

    updateControlButtons() {
        // Audio button
        if (this.isAudioEnabled) {
            this.toggleAudioBtn.classList.remove('active');
            this.toggleAudioBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        } else {
            this.toggleAudioBtn.classList.add('active');
            this.toggleAudioBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        }
        
        // Video button
        if (this.isVideoEnabled) {
            this.toggleVideoBtn.classList.remove('active');
            this.toggleVideoBtn.innerHTML = '<i class="fas fa-video"></i>';
        } else {
            this.toggleVideoBtn.classList.add('active');
            this.toggleVideoBtn.innerHTML = '<i class="fas fa-video-slash"></i>';
        }
        
        // Screen share button
        if (this.isScreenSharing) {
            this.shareScreenBtn.classList.add('active');
            this.shareScreenBtn.innerHTML = '<i class="fas fa-stop"></i>';
        } else {
            this.shareScreenBtn.classList.remove('active');
            this.shareScreenBtn.innerHTML = '<i class="fas fa-desktop"></i>';
        }
    }

    updatePreviewControls() {
        const audioBtn = document.getElementById('previewToggleAudio');
        const videoBtn = document.getElementById('previewToggleVideo');
        
        if (this.isAudioEnabled) {
            audioBtn.classList.remove('active');
            audioBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        } else {
            audioBtn.classList.add('active');
            audioBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        }
        
        if (this.isVideoEnabled) {
            videoBtn.classList.remove('active');
            videoBtn.innerHTML = '<i class="fas fa-video"></i>';
        } else {
            videoBtn.classList.add('active');
            videoBtn.innerHTML = '<i class="fas fa-video-slash"></i>';
        }
    }

    updateUserAudioIndicator(userId, isAudioEnabled) {
        const indicator = document.getElementById(`audio-${userId}`);
        if (indicator) {
            if (isAudioEnabled) {
                indicator.classList.remove('muted');
                indicator.innerHTML = '<i class="fas fa-microphone"></i>';
            } else {
                indicator.classList.add('muted');
                indicator.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            }
        }
    }

    updateUserVideoDisplay(userId, isVideoEnabled) {
        const video = document.getElementById(`video-${userId}`);
        if (video) {
            video.style.display = isVideoEnabled ? 'block' : 'none';
        }
    }

    // Chat functionality
    toggleChat() {
        this.chatSection.classList.toggle('active');
    }

    closeChat() {
        this.chatSection.classList.remove('active');
    }

    sendMessage() {
        const message = this.messageInput.value.trim();
        if (message) {
            this.socket.emit('chat-message', { message });
            this.messageInput.value = '';
        }
    }

    displayChatMessage(messageData) {
        const messageDiv = document.createElement('div');
        const isOwnMessage = messageData.userId === this.userId;
        
        messageDiv.className = `chat-message ${isOwnMessage ? 'own' : 'other'}`;
        
        if (!isOwnMessage) {
            messageDiv.innerHTML = `
                <div class="message-info">${messageData.userName}</div>
                <div>${this.escapeHtml(messageData.message)}</div>
            `;
        } else {
            messageDiv.innerHTML = `<div>${this.escapeHtml(messageData.message)}</div>`;
        }
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        // Show notification if chat is closed and it's not own message
        if (!this.chatSection.classList.contains('active') && !isOwnMessage) {
            this.showNotification(`New message from ${messageData.userName}`, 'info');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Utility functions
    copyRoomId() {
        navigator.clipboard.writeText(this.roomId).then(() => {
            this.showNotification('Room ID copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy room ID', 'error');
        });
    }

    leaveRoom() {
        if (confirm('Are you sure you want to leave the meeting?')) {
            // Stop local stream
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => track.stop());
            }
            
            // Close all peer connections
            this.peers.forEach(peerConnection => {
                peerConnection.close();
            });
            
            // Disconnect socket
            this.socket.disconnect();
            
            // Redirect to home
            window.location.href = '/';
        }
    }

    showJoinModal() {
        this.joinModal.classList.add('active');
    }

    hideJoinModal() {
        this.joinModal.classList.remove('active');
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        const icon = notification.querySelector('i');
        
        notificationText.textContent = message;
        notification.className = `notification ${type}`;
        
        // Set appropriate icon
        if (type === 'error') {
            icon.className = 'fas fa-exclamation-triangle';
        } else if (type === 'success') {
            icon.className = 'fas fa-check-circle';
        } else {
            icon.className = 'fas fa-info-circle';
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }

    // Handle browser events
    handleBeforeUnload() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        this.socket.disconnect();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new VideoCallApp();
    
    // Handle page unload
    window.addEventListener('beforeunload', () => {
        app.handleBeforeUnload();
    });
    
    // Handle visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Optionally pause video when tab is hidden
            console.log('Tab hidden');
        } else {
            // Resume video when tab is visible
            console.log('Tab visible');
        }
    });
    
    // Handle window resize for responsive layout
    window.addEventListener('resize', () => {
        // Adjust video grid layout if needed
        const videoGrid = document.getElementById('videoGrid');
        const containers = videoGrid.querySelectorAll('.video-container');
        
        if (containers.length <= 1) {
            videoGrid.style.gridTemplateColumns = '1fr';
        } else if (containers.length <= 4) {
            videoGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
            videoGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        }
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Only handle shortcuts when not typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(e.key.toLowerCase()) {
            case 'm':
                // Toggle microphone
                app.toggleAudio();
                e.preventDefault();
                break;
            case 'v':
                // Toggle video
                app.toggleVideo();
                e.preventDefault();
                break;
            case 'c':
                // Toggle chat
                app.toggleChat();
                e.preventDefault();
                break;
            case 'escape':
                // Close chat if open
                if (app.chatSection.classList.contains('active')) {
                    app.closeChat();
                }
                break;
        }
    });
    
    // Add connection quality monitoring
    setInterval(() => {
        app.peers.forEach(async (peerConnection, userId) => {
            try {
                const stats = await peerConnection.getStats();
                let bytesReceived = 0;
                let bytesSent = 0;
                
                stats.forEach(report => {
                    if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
                        bytesReceived += report.bytesReceived || 0;
                    }
                    if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
                        bytesSent += report.bytesSent || 0;
                    }
                });
                
                // You can use this data to show connection quality indicators
                console.log(`Connection with ${userId}: Received: ${bytesReceived}, Sent: ${bytesSent}`);
            } catch (error) {
                console.error('Error getting connection stats:', error);
            }
        });
    }, 5000);
});