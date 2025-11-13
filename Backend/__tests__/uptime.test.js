import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 20, // Simulate 20 virtual users
  duration: '1m', // Run the test for 1 minute
};

export default function () {
  // Hit your server's simplest endpoint (the "hello world" one)
  const res = http.get(`${import.meta.env.VITE_FRONTEND_URL}`); 

  // Check that the server responded with 200 OK
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}


