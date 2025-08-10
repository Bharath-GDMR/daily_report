
        // Project data structure
        const project = {
            startDate: '2025-08-05',
            endDate: '2025-08-14',
            totalBudget: '₹7,20,000'
        };
        let projectData = {
            phases: [
                {
                    id: 'planning',
                    name: 'Planning & Procurement',
                    color: 'bar-planning',
                    tasks: [
                        {
                            id: 'site-survey',
                            name: 'Site Survey & Measurement',
                            duration: 1,
                            startDate: '2025-08-05',
                            assignee: 'Yasir',
                            status: 'completed',
                            description: 'Complete site survey and finalize measurements'
                        },
                        {
                            id: 'material-procurement',
                            name: 'Material Procurement',
                            duration: 3,
                            startDate: '2025-08-06',
                            assignee: 'Signage and Carpentry',
                            status: 'completed',
                            description: 'Source ply, LEDs, vinyl, and other materials'
                        },
                        {
                            id: 'design-finalization',
                            name: 'Design Finalization',
                            duration: 1,
                            startDate: '2025-08-05',
                            assignee: 'Kaviyaa, Arshad, Diya & Divya',
                            status: 'completed',
                            description: 'Finalize all design elements and layouts'
                        },
                        {
                            id: 'detailed-drawing',
                            name: 'Working Drawing',
                            duration: 1,
                            startDate: '2025-08-05',
                            assignee: 'Bharath and Akhil',
                            status: 'completed',
                            description: 'Working Drawings post Design Finalization'
                        },
                        {
                            id: 'hostesses-for-event',
                            name: 'Hostesses for Event',
                            duration: 1,
                            startDate: '2025-08-08',
                            assignee: 'Prithivi and Githi',
                            status: 'in-progress',
                            description: 'Find and finalize hostesses for the event'
                        },
                        {
                            id: 'freebie-jar',
                            name: 'Freebie Jar',
                            duration: 1,
                            startDate: '2025-08-08',
                            assignee: 'Yasir',
                            status: 'pending',
                            description: 'To visit market and get some freebie jars and containers'
                        }
                    ]
                },
                {
                    id: 'construction',
                    name: 'Construction & Setup',
                    color: 'bar-construction',
                    tasks: [
                        {
                            id: 'flooring',
                            name: 'Flooring Installation',
                            duration: 2,
                            startDate: '2025-08-08',
                            assignee: 'Carpentry',
                            status: 'in-progress',
                            description: 'Install base flooring and cladding'
                        },
                        {
                            id: 'fabrication',
                            name: 'Off-site Fabrication',
                            duration: 5,
                            startDate: '2025-08-09',
                            assignee: 'Carpentry',
                            status: 'in-progress',
                            description: 'Fabricate podiums, walls, and structures'
                        },
                        {
                            id: 'installation',
                            name: 'On-site Installation',
                            duration: 2,
                            startDate: '2025-08-13',
                            assignee: 'Carpentry',
                            status: 'pending',
                            description: 'Install fabricated elements on site'
                        }
                    ]
                },
                {
                    id: 'electrical',
                    name: 'Electrical & LED Work',
                    color: 'bar-electrical',
                    tasks: [
                        {
                            id: 'led-installation',
                            name: 'LED Strip Installation',
                            duration: 2,
                            startDate: '2025-08-13',
                            assignee: 'Carpentry',
                            status: 'in-progress',
                            description: 'Install LED strips around podiums and displays'
                        },
                        {
                            id: 'electrical-testing',
                            name: 'Electrical Testing',
                            duration: 2,
                            startDate: '2025-08-13',
                            assignee: 'Carpentry',
                            status: 'in-progress',
                            description: 'Test all electrical connections and safety checks'
                        }
                    ]
                },
                {
                    id: 'finishing',
                    name: 'Finishing & Handover',
                    color: 'bar-finishing',
                    tasks: [
                        {
                            id: 'vinyl-work',
                            name: 'Vinyl Printing & Application',
                            duration: 2,
                            startDate: '2025-08-13',
                            assignee: 'WoW',
                            status: 'in-progress',
                            description: 'Print and apply vinyl graphics'
                        },
                        {
                            id: 'final-finishing',
                            name: 'Final Finishing & Touch-ups',
                            duration: 2,
                            startDate: '2025-08-13',
                            assignee: 'Carpentry',
                            status: 'pending',
                            description: 'Complete all finishing work and touch-ups'
                        },
                        {
                            id: 'handover',
                            name: 'Client Handover',
                            duration: 1,
                            startDate: '2025-08-14',
                            assignee: 'Bharath',
                            status: 'pending',
                            description: 'Final walkthrough and project handover'
                        }
                    ]
                }
            ]
        };

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('project-start').textContent = formatDate(project.startDate);
            document.getElementById('project-end').textContent = formatDate(project.endDate);
            renderWBS();
            renderGanttChart();
            updateOverviewStats();
            updateDaysRemaining();
        });

        // Tab switching functionality
        function switchTab(tabName) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab content and mark tab as active
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
        }

        // Render Work Breakdown Structure
        function renderWBS() {
            const container = document.getElementById('wbs-container');
            container.innerHTML = '';

            projectData.phases.forEach(phase => {
                const phaseDiv = document.createElement('div');
                phaseDiv.className = 'phase';
                phaseDiv.innerHTML = `
                    <div class="phase-header" onclick="togglePhase('${phase.id}')">
                        <span>📋 ${phase.name}</span>
                        <span class="expand-icon">▼</span>
                    </div>
                    <div class="phase-tasks" id="phase-${phase.id}">
                        ${phase.tasks.map(task => `
                            <div class="task">
                                <div class="task-header">
                                    <div class="task-title">${task.name}</div>
                                    <div class="task-status-container">
                                        <div class="task-status status-${task.status}" onclick="toggleStatusDropdown(event, '${phase.id}', '${task.id}')">
                                            ${task.status.replace('-', ' ').toUpperCase()}
                                        </div>
                                        <div class="status-dropdown" id="status-dropdown-${phase.id}-${task.id}">
                                            <div class="status-option" onclick="updateTaskStatus('${phase.id}', '${task.id}', 'pending')">Pending</div>
                                            <div class="status-option" onclick="updateTaskStatus('${phase.id}', '${task.id}', 'in-progress')">In Progress</div>
                                            <div class="status-option" onclick="updateTaskStatus('${phase.id}', '${task.id}', 'completed')">Completed</div>
                                            <div class="status-option" onclick="updateTaskStatus('${phase.id}', '${task.id}', 'delayed')">Delayed</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="task-details">
                                    <div class="detail-item">
                                        <div class="detail-label">Duration</div>
                                        <div class="detail-value">${task.duration} day${task.duration > 1 ? 's' : ''}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Start Date</div>
                                        <div class="detail-value">${formatDate(task.startDate)}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Assignee</div>
                                        <div class="detail-value">${task.assignee}</div>
                                    </div>
                                    <div class="detail-item">
                                        <div class="detail-label">Description</div>
                                        <div class="detail-value">${task.description}</div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
                container.appendChild(phaseDiv);
            });
        }

        // Toggle phase expansion
        function togglePhase(phaseId) {
            const phaseElement = document.querySelector(`#phase-${phaseId}`).parentElement;
            phaseElement.classList.toggle('expanded');
        }

        // Toggle status dropdown
        function toggleStatusDropdown(event, phaseId, taskId) {
            event.stopPropagation();
            const dropdown = document.getElementById(`status-dropdown-${phaseId}-${taskId}`);
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        }

        // Update task status
        function updateTaskStatus(phaseId, taskId, newStatus) {
            const expandedPhaseIds = Array.from(document.querySelectorAll('.phase.expanded'))
                .map(phaseElement => phaseElement.querySelector('.phase-tasks').id.replace('phase-', ''));

            const phase = projectData.phases.find(p => p.id === phaseId);
            const task = phase.tasks.find(t => t.id === taskId);
            task.status = newStatus;

            renderWBS();
            renderGanttChart();
            updateOverviewStats();

            expandedPhaseIds.forEach(id => {
                const phaseElement = document.querySelector(`#phase-${id}`).parentElement;
                if (phaseElement) {
                    phaseElement.classList.add('expanded');
                }
            });
        }

        // Render Gantt Chart
        function renderGanttChart() {
            const table = document.getElementById('gantt-chart');
            const dates = generateDateRange(project.startDate, project.endDate);
            
            let html = `
                <tr>
                    <th class="task-name">Task</th>
                    <th>Phase</th>
                    <th>Duration</th>
                    <th>Assignee</th>
                    ${dates.map(date => `<th>${formatDateShort(date)}</th>`).join('')}
                </tr>
            `;
            
            projectData.phases.forEach(phase => {
                phase.tasks.forEach(task => {
                    const taskDates = generateTaskDateRange(task.startDate, task.duration);
                    html += `
                        <tr>
                            <td class="task-name">${task.name}</td>
                            <td>${phase.name}</td>
                            <td>${task.duration}d</td>
                            <td>${task.assignee}</td>
                            ${dates.map(date => {
                                const isTaskDate = taskDates.includes(date);
                                return `<td>${isTaskDate ? `<div class="gantt-bar status-${task.status}"></div>` : ''}</td>`;
                            }).join('')}
                        </tr>
                    `;
                });
            });
            
            table.innerHTML = html;
        }

        // Generate date range
        function generateDateRange(startDate, endDate) {
            const dates = [];
            const current = new Date(startDate);
            const end = new Date(endDate);
            
            while (current <= end) {
                dates.push(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
            }
            
            return dates;
        }

        // Generate task date range
        function generateTaskDateRange(startDate, duration) {
            const dates = [];
            const current = new Date(startDate);
            
            for (let i = 0; i < duration; i++) {
                dates.push(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
            }
            
            return dates;
        }

        // Format date
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
            });
        }

        // Format date short
        function formatDateShort(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                month: 'numeric', 
                day: 'numeric'
            });
        }

        // Update overview statistics
        function updateOverviewStats() {
            let totalTasks = 0;
            let completedTasks = 0;
            let delayedTasks = 0;
            let onTrackTasks = 0;

            projectData.phases.forEach(phase => {
                phase.tasks.forEach(task => {
                    totalTasks++;
                    switch(task.status) {
                        case 'completed':
                            completedTasks++;
                            break;
                        case 'delayed':
                            delayedTasks++;
                            break;
                        case 'in-progress':
                        case 'pending':
                            onTrackTasks++;
                            break;
                    }
                });
            });

            const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            document.getElementById('overall-progress').textContent = overallProgress + '%';
            document.getElementById('completed-tasks').textContent = completedTasks;
            document.getElementById('delayed-tasks').textContent = delayedTasks;
            document.getElementById('ontrack-tasks').textContent = onTrackTasks;

            // Save to localStorage for other pages
            const projectStatus = {
                overallProgress,
                completedTasks,
                delayedTasks,
                onTrackTasks,
                status: 'In Progress'
            };
            localStorage.setItem('projectStatus', JSON.stringify(projectStatus));
        }

        // Update days remaining
        function updateDaysRemaining() {
            const today = new Date();
            const endDate = new Date(project.endDate);
            const timeDiff = endDate.getTime() - today.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            document.getElementById('days-remaining').textContent = Math.max(0, daysDiff);
        }

        // Modal functionality
        function openAddTaskModal() {
            document.getElementById('taskModal').style.display = 'block';
        }

        function closeAddTaskModal() {
            document.getElementById('taskModal').style.display = 'none';
            document.getElementById('taskForm').reset();
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('taskModal');
            if (event.target === modal) {
                closeAddTaskModal();
            }
        }

        // Handle form submission
        document.getElementById('taskForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const taskName = document.getElementById('taskName').value;
            const taskPhase = document.getElementById('taskPhase').value;
            const taskDuration = parseInt(document.getElementById('taskDuration').value);
            const taskAssignee = document.getElementById('taskAssignee').value;
            const taskDescription = document.getElementById('taskDescription').value;

            // Find the phase and add the new task
            const phase = projectData.phases.find(p => p.id === taskPhase);
            const newTask = {
                id: taskName.toLowerCase().replace(/\s+/g, '-'),
                name: taskName,
                duration: taskDuration,
                startDate: '2025-08-05', // Default start date
                assignee: taskAssignee,
                status: 'pending',
                description: taskDescription
            };

            phase.tasks.push(newTask);
            
            // Re-render the views
            renderWBS();
            renderGanttChart();
            updateOverviewStats();
            
            // Close the modal
            closeAddTaskModal();
            
            // Show success message (you could enhance this with a toast notification)
            alert('Task added successfully!');
        });

        // Auto-expand first phase on load  
        setTimeout(() => {
            const firstPhase = document.querySelector('.phase');
            if (firstPhase) {
                firstPhase.classList.add('expanded');
            }
        }, 500);