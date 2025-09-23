# Mood Predictor - Daily Mood Analyser 

A full-stack web application that allows users to journal their daily thoughts and receive an ML-based prediction of their underlying mood, helping them track their mental well-being over time.



##  About The Project

This project is a multi-service application designed to provide a seamless user experience for journaling and mood analysis. It leverages a modern tech stack, including a React frontend, a Node.js backend, a PostgreSQL database, and a dedicated Python machine learning service for text classification. The entire application is architected for cloud deployment.

##  Features

* **User Authentication:** Secure user registration and login system.
* **CRUD Functionality:** Create, read, update, and delete journal entries.
* **ML-Based Predictions:** Each journal entry is analyzed by a machine learning model to predict the user's mood (e.g., `stressed`, `depressed`, `normal`).
* **Data Visualization:** View mood history and trends through interactive charts and a calendar view.
* **Responsive Design:** A clean and modern user interface built with Tailwind CSS that works on all devices.

---

<<<<<<< HEAD
##  Tech Stack & Architecture
=======
## Tech Stack & Architecture
>>>>>>> d5fcb1d856ea68c8a80480408d42f0bc533045a8

This project is composed of three main services and a database, all communicating via REST APIs.

#### Tech Stack
* **Frontend:** React, Vite, Tailwind CSS, `react-router-dom`
* **Backend:** Node.js, Express.js, Axios
* **ML Service:** Python, FastAPI, PyTorch, Transformers (from Hugging Face)
* **Database:** PostgreSQL (hosted on Supabase)

#### Architecture Diagram
[ Frontend (React) on Render ] <-----> [ Backend (Node.js) on Render ]
|
|
V
[ ML Service (Python/FastAPI) on Hugging Face Spaces ]
^
|
|
[ Database (PostgreSQL) on Supabase ] <---------
##  Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have the following installed on your machine:
* Node.js (v18 or later)
* npm
* Python (v3.9 or later) & pip
* Git

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/AravindN20/daily-mood-analyser.git](https://github.com/AravindN20/daily-mood-analyser.git)
    cd daily-mood-analyser
    ```

2.  **Setup the Backend:**
    * Navigate to the backend folder: `cd backend`
    * Create a `.env` file and add your environment variables (see the Environment Variables section below).
    * Install dependencies: `npm install`
    * Navigate back to the root: `cd ..`

3.  **Setup the Frontend:**
    * Navigate to the frontend folder: `cd frontend`
    * Install dependencies: `npm install`
    * Navigate back to the root: `cd ..`

4.  **Setup the ML Service:**
    * Navigate to your ML service folder.
    * It's recommended to create a Python virtual environment:
        ```bash
        python -m venv venv
        source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
        ```
    * Install Python dependencies: `pip install -r requirements.txt`

---

##  Running the Application Locally

You will need to run the three services in **three separate terminals** from the project's root directory.

1.  **Start the ML Service:**
    ```bash
    # In terminal 1, from the folder containing ai_service.py
    uvicorn ai_service:app --reload
    ```

2.  **Start the Backend Server:**
    ```bash
    # In terminal 2, from the backend folder
    nodemon server.js
    ```

3.  **Start the Frontend App:**
    ```bash
    # In terminal 3, from the frontend folder
    npm run dev
    ```

---

##  Environment Variables

You need to create a `.env` file inside your `backend` folder to run the application locally.

**File: `backend/.env`**
```env
# Supabase Database URL (use the connection pooler string)
DATABASE_URL="postgresql://..."

# URL for the locally running ML service
AI_SERVICE_URL="[http://127.0.0.1:8000](http://127.0.0.1:8000)"

# URL for the locally running frontend (for CORS)
FRONTEND_URL="http://localhost:5173" # Or whatever port Vite uses
