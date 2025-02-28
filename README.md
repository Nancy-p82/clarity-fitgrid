# FitGrid
A social fitness dApp that connects users based on similar fitness goals, built on the Stacks blockchain.

## Features
- Create fitness profiles with goals and preferences
- Find and connect with users who have similar fitness goals
- Track fitness achievements and milestones
- Earn reputation points through verified activities
- Group challenges and social interactions

## Setup and Installation
1. Clone the repository
2. Install Clarinet
3. Run `clarinet check` to verify contracts
4. Run `clarinet test` to execute test suite 

## Usage Examples
```clarity
;; Create a fitness profile
(contract-call? .fitgrid create-profile "John" "Running" u3 "5k training")

;; Find matching users
(contract-call? .fitgrid find-matches 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)

;; Log fitness activity
(contract-call? .fitgrid log-activity u60 "Running" u5)
```

## Dependencies
- Clarity language
- Clarinet for testing and deployment
