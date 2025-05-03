# Deer Park Debate Club Forum

A responsive web application for hosting educational debates across multiple devices.

## Features

- Cross-device forum accessible on both mobile and desktop platforms
- Real-time updates of debate topics and replies
- Clean, responsive design with modern UI/UX
- Server-side storage for persistent data across sessions
- Categorized topics for organized discussions
- User-friendly interface with intuitive controls

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Deployment**: Ready for cloud platforms like Heroku, Vercel, or DigitalOcean

## Directory Structure

```
deer-park-debate-forum/
├── css/
│   └── styles.css
├── images/
│   └── favicon.svg
├── js/
│   └── app.js
├── server/
│   └── server.js
├── index.html
├── package.json
├── .env.example
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/deer-park-debate-forum.git
   cd deer-park-debate-forum
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment example file and configure:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your MongoDB connection string and other settings.

4. Start the server:
   ```bash
   npm start
   ```

5. Access the application:
   Open your browser and navigate to `http://localhost:3000`

### Development Mode

To run the server with automatic restarts on code changes:
```bash
npm run dev
```

## Deployment

### Heroku Deployment

1. Install the Heroku CLI and log in:
   ```bash
   npm install -g heroku
   heroku login
   ```

2. Create a new Heroku app:
   ```bash
   heroku create deer-park-debate
   ```

3. Set environment variables:
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_connection_string
   ```

4. Deploy the app:
   ```bash
   git push heroku main
   ```

### DigitalOcean App Platform

1. Create an account on DigitalOcean
2. From the dashboard, click "Create" and select "Apps"
3. Connect your GitHub repository
4. Configure environment variables in the settings
5. Deploy the app

## Customization

- Change the color scheme by editing CSS variables in `css/styles.css`
- Modify categories in the server model and frontend form
- Add authentication for user accounts (implementation required)

## License

MIT License - See LICENSE file for details.
