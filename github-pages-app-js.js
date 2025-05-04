// Configuration
const LOCAL_STORAGE_KEY = 'dpd_user_id';
const TOPICS_STORAGE_KEY = 'dpd_topics';

// State management
let debateTopics = [];
let currentFilter = 'all';
let isLoading = true;
let userId = localStorage.getItem(LOCAL_STORAGE_KEY) || generateUserId();

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Find all required DOM elements
    const topicsList = document.getElementById('topics-list');
    const filterButtons = document.querySelectorAll('.filter-button');
    const topicForm = document.getElementById('topic-form');
    const newTopicSuccess = document.getElementById('new-topic-success');
    const newTopicNotice = document.getElementById('new-topic-notice');
    const loadingElement = document.getElementById('loading');

    // Generate a random user ID for anonymous tracking if none exists
    function generateUserId() {
        const newId = 'user_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem(LOCAL_STORAGE_KEY, newId);
        return newId;
    }

    // Get formatted date
    function formatDate(date) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    }

    // Capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Load topics from localStorage or use sample data
    function loadTopics() {
        const storedTopics = localStorage.getItem(TOPICS_STORAGE_KEY);
        if (storedTopics) {
            return JSON.parse(storedTopics);
        } else {
            // Return sample data if nothing in localStorage
            return getSampleTopics();
        }
    }

    // Save topics to localStorage
    function saveTopics(topics) {
        localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(topics));
    }

    // API Helpers
    async function fetchTopics() {
        try {
            isLoading = true;
            updateLoadingState();
            
            // Simulate network latency
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Load from localStorage or sample data
            debateTopics = loadTopics();
            
            isLoading = false;
            updateLoadingState();
            renderTopics();
            
        } catch (error) {
            console.error('Error fetching topics:', error);
            isLoading = false;
            updateLoadingState();
            topicsList.innerHTML = `<p class="error">Failed to load topics. Please try again later.</p>`;
        }
    }

    async function createTopic(topicData) {
        try {
            // Simulate server response time
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Create a new topic with current timestamp as ID
            const newTopic = {
                id: Date.now(),
                ...topicData,
                date: new Date().toISOString(),
                replies: []
            };
            
            // Add to local data
            debateTopics.unshift(newTopic);
            
            // Save to localStorage
            saveTopics(debateTopics);
            
            // Show success and re-render
            showElement(newTopicSuccess, 3000);
            renderTopics();
            return true;
            
        } catch (error) {
            console.error('Error creating topic:', error);
            return false;
        }
    }

    async function createReply(topicId, replyData) {
        try {
            // Simulate server response time
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Create a new reply with current timestamp
            const newReply = {
                id: Date.now(),
                ...replyData,
                date: new Date().toISOString()
            };
            
            // Find and update the topic in local data
            const topicIndex = debateTopics.findIndex(topic => topic.id === topicId);
            if (topicIndex !== -1) {
                debateTopics[topicIndex].replies.push(newReply);
                
                // Save to localStorage
                saveTopics(debateTopics);
                
                renderTopics();
                return true;
            }
            return false;
            
        } catch (error) {
            console.error('Error creating reply:', error);
            return false;
        }
    }

    // UI Helpers
    function updateLoadingState() {
        if (isLoading) {
            loadingElement.style.display = 'flex';
            topicsList.style.display = 'none';
        } else {
            loadingElement.style.display = 'none';
            topicsList.style.display = 'block';
        }
    }

    function showElement(element, duration = 0) {
        element.style.display = 'block';
        if (duration > 0) {
            setTimeout(() => {
                element.style.display = 'none';
            }, duration);
        }
    }

    // Create a reply element
    function createReplyElement(reply) {
        const replyElement = document.createElement('div');
        replyElement.className = 'reply';
        
        const replyAuthor = document.createElement('div');
        replyAuthor.className = 'reply-author';
        replyAuthor.textContent = `${reply.author} • ${formatDate(reply.date)}`;
        
        const replyContent = document.createElement('div');
        replyContent.className = 'reply-content';
        replyContent.textContent = reply.content;
        
        replyElement.appendChild(replyAuthor);
        replyElement.appendChild(replyContent);
        
        return replyElement;
    }

    // Submit a reply
    async function submitReply(event, topicId, replyFormElement) {
        event.preventDefault();
        
        const usernameInput = replyFormElement.querySelector('input[type="text"]');
        const contentInput = replyFormElement.querySelector('textarea');
        const noticeElement = replyFormElement.querySelector('.reply-notice');
        const successElement = replyFormElement.querySelector('.reply-success');
        
        const username = usernameInput.value.trim() || 'Anonymous';
        const content = contentInput.value.trim();
        
        if (!content) {
            showElement(noticeElement, 3000);
            return;
        }
        
        // Create reply data
        const replyData = {
            author: username,
            content: content
        };
        
        // Submit to API
        const success = await createReply(topicId, replyData);
        
        if (success) {
            // Clear form and hide
            usernameInput.value = '';
            contentInput.value = '';
            replyFormElement.style.display = 'none';
            
            // Show success message
            showElement(successElement, 3000);
        } else {
            alert('Failed to post reply. Please try again.');
        }
    }

    // Render all topics based on current filter
    function renderTopics() {
        // Clear existing topics
        topicsList.innerHTML = '';
        
        // Filter topics if needed
        const filteredTopics = currentFilter === 'all' 
            ? debateTopics 
            : debateTopics.filter(topic => topic.category === currentFilter);
        
        // Handle no topics case
        if (filteredTopics.length === 0) {
            topicsList.innerHTML = '<p>No topics in this category yet. Be the first to post one!</p>';
            return;
        }
        
        // Loop through topics and create elements
        filteredTopics.forEach(topic => {
            // Create main topic container
            const topicElement = document.createElement('div');
            topicElement.className = 'topic';
            topicElement.dataset.id = topic.id;
            topicElement.dataset.category = topic.category;
            
            // Create topic header
            const topicHeader = document.createElement('div');
            topicHeader.className = 'topic-header';
            
            const topicTitle = document.createElement('div');
            topicTitle.className = 'topic-title';
            topicTitle.textContent = topic.title;
            
            const topicAuthor = document.createElement('div');
            topicAuthor.className = 'topic-author';
            topicAuthor.textContent = `Posted by: ${topic.author} on ${formatDate(topic.date)}`;
            
            topicHeader.appendChild(topicTitle);
            topicHeader.appendChild(topicAuthor);
            
            // Create topic content
            const topicContent = document.createElement('div');
            topicContent.className = 'topic-content';
            topicContent.textContent = topic.content;
            
            // Create topic footer
            const topicFooter = document.createElement('div');
            topicFooter.className = 'topic-footer';
            
            const categorySpan = document.createElement('span');
            categorySpan.textContent = `Category: ${capitalizeFirstLetter(topic.category)}`;
            
            const replyCount = document.createElement('span');
            replyCount.textContent = `${topic.replies.length} ${topic.replies.length === 1 ? 'reply' : 'replies'}`;
            
            topicFooter.appendChild(categorySpan);
            topicFooter.appendChild(replyCount);
            
            // Add reply button
            const replyButton = document.createElement('button');
            replyButton.className = 'reply-button';
            replyButton.textContent = 'Reply';
            replyButton.dataset.topicId = topic.id;
            
            // Create replies container
            const repliesContainer = document.createElement('div');
            repliesContainer.className = 'replies';
            
            // Add existing replies
            topic.replies.forEach(reply => {
                const replyElement = createReplyElement(reply);
                repliesContainer.appendChild(replyElement);
            });
            
            // Create reply form
            const replyForm = document.createElement('form');
            replyForm.className = 'reply-form';
            replyForm.id = `reply-form-${topic.id}`;
            
            const replySuccess = document.createElement('div');
            replySuccess.className = 'success reply-success';
            replySuccess.textContent = 'Reply posted successfully!';
            
            const replyNotice = document.createElement('div');
            replyNotice.className = 'notice reply-notice';
            replyNotice.textContent = 'Please enter your reply.';
            
            const replyUsernameDiv = document.createElement('div');
            const replyUsernameLabel = document.createElement('label');
            replyUsernameLabel.textContent = 'Display Name (optional):';
            replyUsernameLabel.setAttribute('for', `reply-username-${topic.id}`);
            
            const replyUsernameInput = document.createElement('input');
            replyUsernameInput.type = 'text';
            replyUsernameInput.id = `reply-username-${topic.id}`;
            replyUsernameInput.placeholder = 'Anonymous';
            
            replyUsernameDiv.appendChild(replyUsernameLabel);
            replyUsernameDiv.appendChild(replyUsernameInput);
            
            const replyContentDiv = document.createElement('div');
            const replyContentLabel = document.createElement('label');
            replyContentLabel.textContent = 'Your Response:';
            replyContentLabel.setAttribute('for', `reply-content-${topic.id}`);
            
            const replyContentInput = document.createElement('textarea');
            replyContentInput.id = `reply-content-${topic.id}`;
            replyContentInput.rows = 3;
            replyContentInput.required = true;
            
            replyContentDiv.appendChild(replyContentLabel);
            replyContentDiv.appendChild(replyContentInput);
            
            const replySubmitButton = document.createElement('button');
            replySubmitButton.type = 'submit';
            replySubmitButton.textContent = 'Post Reply';
            
            replyForm.appendChild(replySuccess);
            replyForm.appendChild(replyNotice);
            replyForm.appendChild(replyUsernameDiv);
            replyForm.appendChild(replyContentDiv);
            replyForm.appendChild(replySubmitButton);
            
            // Assemble topic element
            topicElement.appendChild(topicHeader);
            topicElement.appendChild(topicContent);
            topicElement.appendChild(topicFooter);
            topicElement.appendChild(replyButton);
            topicElement.appendChild(repliesContainer);
            topicElement.appendChild(replyForm);
            
            // Add to topics list
            topicsList.appendChild(topicElement);
            
            // Add event listeners
            replyButton.addEventListener('click', () => {
                const form = document.getElementById(`reply-form-${topic.id}`);
                form.style.display = form.style.display === 'flex' ? 'none' : 'flex';
            });
            
            replyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                submitReply(e, topic.id, replyForm);
            });
        });
    }

    // Post a new topic
    async function submitNewTopic(event) {
        event.preventDefault();
        
        const usernameInput = document.getElementById('username');
        const titleInput = document.getElementById('topic-title');
        const contentInput = document.getElementById('topic-content');
        const categorySelect = document.getElementById('topic-category');
        
        const username = usernameInput.value.trim() || 'Anonymous';
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const category = categorySelect.value;
        
        // Validate inputs
        if (!title || !content) {
            showElement(newTopicNotice, 3000);
            return;
        }
        
        // Create topic data
        const topicData = {
            title,
            content,
            author: username,
            category
        };
        
        // Submit to API
        const success = await createTopic(topicData);
        
        if (success) {
            // Reset form
            usernameInput.value = '';
            titleInput.value = '';
            contentInput.value = '';
            
            // Scroll to topics section
            document.querySelector('.topics-container').scrollIntoView({ behavior: 'smooth' });
        } else {
            alert('Failed to post topic. Please try again.');
        }
    }

    // Sample data for demo purposes
    function getSampleTopics() {
        return [
            {
                id: 1,
                title: "Should Social Media Be Regulated Like Public Utilities?",
                content: "As social media platforms continue to dominate our communication landscape, should they be regulated like public utilities? These platforms now serve essential communication functions in society, but they're run by private companies with profit motives. Does this create conflicts of interest that harm the public good?",
                author: "Moderator",
                category: "politics",
                date: "2025-04-28T12:00:00Z",
                replies: [
                    {
                        id: 101,
                        author: "DebateEnthusiast",
                        content: "I believe regulation is necessary. These platforms have become too central to public discourse to remain unregulated. When a private company controls what is essentially the modern public square, there needs to be oversight.",
                        date: "2025-04-29T09:15:00Z"
                    },
                    {
                        id: 102,
                        author: "FreeMarket42",
                        content: "Disagree strongly. Government regulation would stifle innovation and potentially lead to censorship issues. The market will correct problems if users demand better practices.",
                        date: "2025-04-30T14:22:00Z"
                    }
                ]
            },
            {
                id: 2,
                title: "Is AI Art Really Art?",
                content: "With the rise of AI-generated images, music, and writing, we need to reconsider what constitutes 'art.' Does art require human intention, emotion, and experience? Or can something created by an algorithm based on patterns from human art still be considered legitimate art?",
                author: "ArtPhilosopher",
                category: "society",
                date: "2025-05-01T08:30:00Z",
                replies: [
                    {
                        id: 201,
                        author: "TraditionalistView",
                        content: "Art is fundamentally human expression. While AI can create interesting images, they lack the lived experience and emotional intent that gives art its depth and meaning.",
                        date: "2025-05-01T10:45:00Z"
                    }
                ]
            },
            {
                id: 3,
                title: "Should High School Education Focus More on Practical Skills?",
                content: "Many students graduate high school without basic financial literacy, home economics skills, or career preparation. Should schools reduce focus on traditional academic subjects to make room for more practical life skills?",
                author: "EducationReformer",
                category: "education",
                date: "2025-05-02T15:20:00Z",
                replies: []
            }
        ];
    }

    // Set up event listeners
    // Fetch topics from localStorage/sample data
    fetchTopics();
    
    // Set up topic form submission
    topicForm.addEventListener('submit', submitNewTopic);
    
    // Set up filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Update current filter
            currentFilter = button.dataset.filter;
            
            // Re-render topics
            renderTopics();
        });
    });
});
