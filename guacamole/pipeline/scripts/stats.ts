import fs from 'node:fs';

const TOTAL_SESSIONS = 754;
const data = JSON.parse(fs.readFileSync('../data/viralmind.race_sessions.json', 'utf8'));
const SCALE_FACTOR = TOTAL_SESSIONS / data.length;

// Training Gym Usage Stats
const uniqueUsers = Math.round(new Set(data.map((session) => session.address)).size * SCALE_FACTOR);

// Challenge popularity
const challengeCounts = data.reduce((acc, session) => {
  acc[session.challenge] = (acc[session.challenge] || 0) + 1;
  return acc;
}, {});

const sortedChallenges = Object.entries(challengeCounts)
  .sort(([, a], [, b]) => b - a)
  .map(([challenge, count]) => `${challenge}: ${Math.round(count * SCALE_FACTOR)}`);

// Training Data Stats
let textPrompts = 0;
let videoMinutes = 0;
let keyboardEvents = 0;
let mouseEvents = 0;
let rewardEvents = 0;
let totalRewards = 0;

data.forEach((session) => {
  // Input: Text prompts
  const eventsPath = `../data/${session._id.$oid}.events.json`;
  if (fs.existsSync(eventsPath)) {
    const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
    textPrompts += events.events.length;
    events.events.forEach((event) => {
      if (event.type === 'reward') {
        rewardEvents++;
        if (event.metadata?.rewardValue) {
          totalRewards += event.metadata.rewardValue;
        }
      }
    });
  }

  // Input: Video duration
  const start = new Date(session.created_at.$date).getTime();
  const end = new Date(session.updated_at.$date).getTime();
  videoMinutes += (end - start) / (1000 * 60);

  // Output: Input events from guac recordings
  const guacFile = `../data/${session._id.$oid}.guac`;
  if (fs.existsSync(guacFile)) {
    try {
      // Read file in chunks to handle large files
      const content = fs.readFileSync(guacFile);
      const instructions = content.toString('utf8').split(';');

      instructions.forEach((instruction) => {
        if (!instruction.trim()) return;
        const parts = instruction.trim().split(',');
        if (parts.length === 0) return;

        // Simple opcode extraction
        const opMatch = parts[0].match(/^\d+\.(\w+)/);
        if (!opMatch) return;
        const opcode = opMatch[1];

        if (opcode === 'key') keyboardEvents++;
        else if (opcode === 'mouse') mouseEvents++;
      });
    } catch (e) {
      console.error(`Error processing ${guacFile}:`, e.message);
    }
  }
});

// Scale everything up
textPrompts = Math.round(textPrompts * SCALE_FACTOR);
videoMinutes = Math.round(videoMinutes * SCALE_FACTOR);
keyboardEvents = Math.round(keyboardEvents * SCALE_FACTOR);
mouseEvents = Math.round(mouseEvents * SCALE_FACTOR);
rewardEvents = Math.round(rewardEvents * SCALE_FACTOR);
totalRewards = Math.round(totalRewards * SCALE_FACTOR);

console.log('\n=== Training Gym Usage ===');
console.log(`Sessions: ${TOTAL_SESSIONS}`);
console.log(`Unique Users: ${uniqueUsers}`);

console.log('\nChallenge Distribution:');
sortedChallenges.forEach((c) => {
  const [name, count] = c.split(':');
  console.log(`${name.trim()}: ${count.trim()}`);
});

console.log('\n=== Rewards Data ===');
console.log(`• ${rewardEvents.toLocaleString()} reward events`);
console.log(`• ${totalRewards.toLocaleString()} total $VIRAL rewards`);

console.log('\n=== Training Data ===');
console.log('Input:');
console.log(`• ${textPrompts.toLocaleString()} text prompts`);
console.log(`• ${videoMinutes.toLocaleString()} minutes of video`);

console.log('\nOutput (User Actions):');
console.log(`• ${keyboardEvents.toLocaleString()} keyboard events`);
console.log(`• ${mouseEvents.toLocaleString()} mouse events`);
console.log(`• ${(keyboardEvents + mouseEvents).toLocaleString()} total user actions`);
