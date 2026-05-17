# Chakri Lagbe - Job Finding Platform

Chakri Lagbe is a comprehensive job aggregator platform designed to help users discover job opportunities across multiple tech companies in a single place. The platform enables users to stay updated with the latest job postings in a faster and simplified manner, eliminating unproductive scrolling on social sites. The platform features automated job scraping, personalized job alerts, detailed job listings, and company profiles. With future plan of adding user accounts, resume quality checks, interview preparation, and many more. Chakri Lagbe aims to be the go-to destination for job seekers in the tech industry.

![Chakri Lagbe Platform](client/src/assets/taka.png)

## 🌟 Features

### 📋 Job Search & Discovery

- **Smart Search System**: Search jobs by keywords, skills, or roles with real-time filtering
- **Advanced Filtering**: Filter job listings by company, sort by relevance, recency, or deadline
- **Paginated Results**: Browse through job listings with smooth pagination
- **Job Details**: View comprehensive job information including:
  - Position details and company information
  - Required skills and programming languages
  - Experience level requirements
  - Job type (Full-time, Part-time, Remote, Hybrid)
  - Application deadlines with urgency indicators
  - Salary information (when available)
  - Benefits and perks

### 🔔 Job Alerts System

- **Email Notifications**: Subscribe to receive daily job alerts
- **Verification Process**: Secure email verification system ensures valid subscribers
- **Personalized Alerts**: Get notified about new job postings that match your interests
- **Unsubscribe Option**: Easily opt out of job alerts at any time

### 🏢 Company Profiles

- **Company Directory**: Browse and search through tech companies
- **Filtering Options**: Filter companies by category, name, or number of open positions
- **Company Details**: View detailed information about each company including:
  - Company description and background
  - Current open positions
  - Establishment date
  - Company size and location
  - Website link and contact information

### 🔄 Automated Job Scraping

- **Multi-source Scraping**: Automatically collects jobs from multiple company career pages
- **Regular Updates**: Jobs database updated multiple times daily through scheduled scraping
- **Data Processing**: AI-powered text extraction for consistent job data formatting
- **Active Monitoring**: System monitors job postings to ensure only active listings are shown

### 📱 User Experience

- **Responsive Design**: Fully responsive interface works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, intuitive interface with visually appealing job cards
- **Quick Application**: Direct links to apply for jobs on company websites
- **Job Statistics**: Real-time statistics showing total jobs, companies, and locations
- **Social Sharing**: Easily share job listings with others

## 🛠️ Technology Stack

### Frontend

- **Framework**: React with React Router for navigation
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React hooks for local state management
- **HTTP Client**: Axios for API requests
- **Build Tool**: Vite for fast development and optimized builds
- **Analytics**: Vercel Analytics for user insights

### Backend

- **Server**: Express.js for API endpoints
- **Database**: MongoDB for storing jobs, companies, and user data
- **Job Scraping**: Custom spiders with Python
- **Text Processing**: LLM-powered text extraction for job descriptions
- **Scheduled Tasks**: Cron jobs for regular data updates and email alerts
- **Email Service**: Nodemailer for sending job alerts
- **Compression**: Response compression for faster API responses

### Deployment

- **Frontend Hosting**: Vercel
- **Backend Hosting**: render

## 📦 Project Structure

The project is organized into two main directories:

### Client

```
client/
├── public/            # Public assets
├── src/
│   ├── assets/        # Images and static files
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Main application pages
│   ├── subpages/      # Secondary page components
│   └── utils/         # Utility functions and helpers
```

### Server

```
server/
├── job-searcher/      # Python scraping module with Scrapy
│   ├── jobsearcher/   # Scrapy project
│   │   ├── ai/        # AI text processing
│   │   ├── spiders/   # Job scraping spiders
├── src/
│   ├── controller/    # API controllers
│   ├── db/            # Database connection
│   ├── routers/       # API routes
│   ├── services/      # Business logic services
│   └── utils/         # Utility functions
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.8+)
- MongoDB

### Installation

#### Client Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create .env file with:
VITE_BACKEND_URL=http://localhost:3000/api

# Start development server
npm run dev
```

#### Server Setup

```bash
# Navigate to server directory
cd server

# Install Node.js dependencies
npm install

# Install Python dependencies
cd job-searcher
pip install -r requirements.txt

# Create .env file with:
PORT=3000
MONGODB_URI=your_mongodb_connection_string
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
FRONTEND_URL=http://localhost:5173

# Start development server
npm run dev
```

## 📄 API Endpoints

### Jobs API

- `GET /api/jobs`: Get paginated job listings
- `GET /api/jobs/:id`: Get job by ID
- `GET /api/jobs/search`: Search for jobs by keywords

### Companies API

- `GET /api/companies`: Get list of companies
- `GET /api/companies/:id`: Get company details

### Statistics API

- `GET /api/stat`: Get overall job statistics
- `GET /api/stat/companies`: Get list of companies for filtering

### Email Subscription API

- `POST /api/email/subscribe`: Subscribe to job alerts
- `POST /api/email/verify`: Verify email subscription
- `GET /api/email/unsubscribe`: Unsubscribe from job alerts

## 💡 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- All the companies whose job listings are featured
