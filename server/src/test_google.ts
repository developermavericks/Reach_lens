import googleIt from 'google-it';

async function test() {
    console.log("Testing google-it...");
    try {
        const results = await googleIt({ query: 'test', limit: 10, 'disableConsole': true }) as any;
        console.log("Results:", results.length);
        if (results.length > 0) {
            console.log("First result:", results[0]);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
