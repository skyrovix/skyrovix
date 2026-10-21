async function test() {
  const urls = [
    'http://localhost:3001/internship',
    'http://localhost:3001/internship/fullstack',
    'http://localhost:3001/domains',
    'http://localhost:3001/domains/fullstack',
    'http://localhost:3001/internships'
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      const location = res.headers.get('location');
      console.log(`${res.status} | ${url} -> ${location || 'OK'}`);
    } catch (e) {
      console.log(`ERR | ${url}: ${e.message}`);
    }
  }
}
test();
