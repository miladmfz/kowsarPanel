const { execSync } = require('child_process');

const builds = [
    'itmali',
    'itmaliIp',
    'qoqnooscoffee',
    'local'

];

console.log('🚀 Starting FULL build process...\n');

for (const item of builds) {
    console.log(`\n==============================`);
    console.log(`🚀 Building: ${item}`);
    console.log(`==============================\n`);

    try {
        execSync(`node build.js ${item}`, {
            stdio: 'inherit'
        });

        console.log(`✅ Finished: ${item}`);
    } catch (err) {
        console.log(`❌ Failed: ${item}`);
        process.exit(1);
    }
}

console.log('\n🎉 ALL BUILDS COMPLETED SUCCESSFULLY');