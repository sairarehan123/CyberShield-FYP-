# CyberShield — FYP

AI-powered mobile app for cybersecurity behavior assessment and personalized guidance.
Supervisor: Naurin Farooq Khan

## Current Status (SeBIS Module)
- Full 16-item SeBIS questionnaire implemented
- Scoring engine with correct reverse-scoring
- Results saved per user, with re-assessment comparison (before/after)
- Script to generate 500 fake test users for validation

## Files
- `sebis_scoring.py` — scoring engine (turns 16 answers into subscale scores)
- `sebis_assessment.py` — questionnaire + saving results + comparing re-attempts
- `generate_fake_users.py` — generates 500 fake users to test scoring at scale

## How to Run
1. Put all files in the same folder
2. Run `sebis_assessment.py` to take the
