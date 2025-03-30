# Gym API

## Overview

The Gym API provides endpoints for generating training quests and checking progress on those quests. It uses AI to convert high-level skills into concrete tasks and to evaluate task completion based on screenshots.

## Base Path

```
/api/gym
```

## Endpoints

### POST /quest

Generates a new training quest based on the provided prompt and installed applications.

#### Request Body

- `address` (required): The wallet address of the user
- `prompt` (required): The pool prompt containing skills and subtasks
- `installed_applications` (optional): List of applications installed on the user's system

#### Response

A JSON object containing the generated quest:

- `task_id`: Unique identifier for the task
- `title`: Short action summary (3-4 words)
- `original_instruction`: The raw instruction text
- `concrete_scenario`: Specific context using real-world examples
- `objective`: One sentence with specific terms
- `relevant_applications`: Array of applications relevant to the task
- `subgoals`: Array of concise, specific steps to complete the task

#### Authentication

No authentication required.

#### Error Responses

- `400 Bad Request`: Address and prompt are required
- `500 Internal Server Error`: Failed to create session
- `500 Internal Server Error`: Invalid session ID
- `500 Internal Server Error`: Failed to handle quest/hint request

#### Processing Details

1. Creates or retrieves a gym session for the user
2. Updates the session with the latest screenshot (if provided)
3. Generates an instruction list from the pool prompt
4. Selects a random instruction from the list
5. Uses AI to convert the instruction into a concrete task with subgoals
6. Returns the generated quest data

### POST /progress

Checks the progress of a quest based on recent screenshots.

#### Request Body

- `quest` (required): The quest object containing subgoals
- `screenshots` (required): Array of screenshot URLs to analyze

#### Response

A JSON object containing:

- `completed_subgoals`: Array of booleans indicating which subgoals have been completed
- `completed_objectives`: Number of completed subgoals

#### Authentication

No authentication required.

#### Error Responses

- `400 Bad Request`: Screenshots array is required
- `400 Bad Request`: Valid quest object with subgoals is required
- `500 Internal Server Error`: Failed to check progress

#### Processing Details

1. Takes up to the last 5 screenshots provided
2. Uses AI to analyze the screenshots and determine which subgoals have been completed
3. Returns an array of booleans indicating completion status for each subgoal
4. Counts and returns the total number of completed objectives
