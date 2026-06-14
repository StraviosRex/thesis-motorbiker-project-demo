console.log('DATABASE_URL from process.env:');
console.log(process.env.DATABASE_URL);
console.log('\nFirst 50 characters:');
console.log(process.env.DATABASE_URL?.substring(0, 50));
