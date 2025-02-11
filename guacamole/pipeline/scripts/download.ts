import fs from 'node:fs';
import https from 'https';

// add ids of the races you want to process:
const data = JSON.parse(fs.readFileSync('../data/viralmind.race_sessions.json', 'utf8'));
const ids: string[] = data.map((item: any) => item._id.$oid);
// or
// const ids = [ '6791da5569961c80693c7629' ];

// Retry wrapper
const withRetry = async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === retries - 1) throw e;
      console.log(`Retry attempt ${i + 1}/${retries}`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
};

// viralmind api - get task prompts
const get_events = async (id: string) => {
  const filepath = `../data/${id}.events.json`;
  if (fs.existsSync(filepath)) {
    console.log(`[${id}] Events exist`);
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  }

  return new Promise((resolve, reject) => {
    const req = https.get(`https://viralmind.ai/api/races/export?sessionId=${id}`, (resp) => {
      let data = '';
      resp.on('data', (chunk) => (data += chunk));
      resp.on('end', () => {
        try {
          const events = JSON.parse(data);
          fs.writeFileSync(filepath, JSON.stringify(events, null, 2));
          console.log(`[${id}] Events downloaded`);
          resolve(events);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.setTimeout(10000); // 10s timeout
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
};

// viralmind api - get session recording
const downloadGuar = (recording_id: string) =>
  new Promise((resolve) => {
    const filepath = `../data/${recording_id}.guac`;
    let data = Buffer.from([]);

    if (fs.existsSync(filepath)) {
      console.log(`[${recording_id}] Guac exists`);
      return resolve(true);
    }

    console.log(`[${recording_id}] Downloading...`);
    https
      .get(`https://training-gym.s3.us-east-2.amazonaws.com/recording-${recording_id}`, (resp) => {
        if (resp.statusCode === 403) {
          console.log(`[${recording_id}] 403 error`);
          return resolve(false);
        }

        resp.on('data', (chunk) => (data = Buffer.concat([data, chunk])));
        resp.on('end', () => {
          if (data.includes('AccessDenied')) {
            console.log(`[${recording_id}] Access denied`);
            return resolve(false);
          }
          fs.writeFileSync(filepath, data);
          console.log(`[${recording_id}] Downloaded ${data.length} bytes`);
          resolve(true);
        });
      })
      .on('error', () => {
        console.log(`[${recording_id}] Network error`);
        resolve(false);
      });
  });

// .guac -> .m4v
const encodeVideo = (id: string) =>
  new Promise(async (resolve, reject) => {
    const outPath = `../data/${id}.guac.m4v`;
    if (fs.existsSync(outPath)) return resolve(true);

    const proc = Bun.spawn(['guacenc', '-s', '1280x800', '-r', '6000000', `../data/${id}.guac`], {
      stdout: 'pipe',
      stderr: 'pipe'
    });

    // Handle stdout using ReadableStream
    proc.stdout
      ?.getReader()
      .read()
      .then(function process({ done, value }) {
        if (done) return;
        if (value) console.log(new TextDecoder().decode(value));
        return proc.stdout?.getReader().read().then(process);
      });

    // Handle stderr using ReadableStream
    proc.stderr
      ?.getReader()
      .read()
      .then(function process({ done, value }) {
        if (done) return;
        if (value) console.error(new TextDecoder().decode(value));
        return proc.stderr?.getReader().read().then(process);
      });

    // Handle process completion
    await proc.exited // Bun provides a promise for process completion
      .then((code) => (code === 0 ? resolve(true) : reject(code)));
  });

const processBatch = async (batch: string[]) => {
  return Promise.all(
    batch.map(async (id: string) => {
      try {
        await withRetry(() => get_events(id));
        if (await downloadGuar(id)) {
          await encodeVideo(id);
        }
      } catch (e) {
        console.error(`[${id}] Failed:`, e.message);
      }
    })
  );
};

console.log('loaded %d ids', ids.length);

(async () => {
  const batchSize = 5;
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    console.log(`Processing batch ${i / batchSize + 1}/${Math.ceil(ids.length / batchSize)}`);
    await processBatch(batch);
  }
})();
