# 🌐 CareLink Bharat

<p align="center">
  <b>Voice-first AI-powered Digital Assistance Platform for Inclusive Access</b><br/>
  Enabling users to navigate digital workflows using voice, AI, and real-time guidance.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-Vite-blue?logo=react" />
  <img src="https://img.shields.io/badge/API-Groq-green" />
  <img src="https://img.shields.io/badge/Status-Active-success" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" />
</p>

---

## 📌 Overview

**CareLink Bharat** is a **voice-first intelligent web application** designed to simplify digital interactions, especially for users who benefit from guided, accessible interfaces.

It combines:
- 🎤 Voice input
- 🧠 AI reasoning (LLM)
- 📸 Vision-based verification
- 🧭 Step-by-step assistance

to create a **hands-free digital navigation experience**.

---

## ✨ Key Features

### 🎤 Voice-Driven Interaction
- Real-time speech recognition using Web Speech API
- Reduces dependency on typing
- Improves accessibility

### 🧠 AI-Powered Guidance
- Powered by Google Gemini (`gemini-1.5-flash`)
- Context-aware responses
- Structured step-by-step outputs

### 📸 Screen Verification (Vision AI)
- Captures user screen
- Sends to AI for contextual validation
- Enables intelligent feedback loops

### 🖥️ Interactive Dashboard
- Modular React components
- Clean UX for guided workflows
- Real-time updates

### 🗂️ Local History System
- Stores recent queries using localStorage
- Lightweight and fast retrieval

### 🌍 Multi-language Support
- Supports English and Hindi (`hi-IN`)
- Expandable for regional languages

---

## 🏗️ Architecture

```text
User (Voice/Text Input)
        │
        ▼
Frontend (React + Vite)
        │
        ├── Speech Recognition (Web Speech API)
        ├── Screenshot Capture
        │
        ▼
Groq API (LLM + Vision)
        │
        ▼
Processed Response (Steps / Guidance)
        │
        ▼
UI Rendering (Dashboard Components)
