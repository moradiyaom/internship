const axios = require('axios');

axios.post('http://localhost:5001/api/auth/login', {
  email: 'manager@restaurant.com',
  password: 'password123'
})
.then(response => {
  console.log('Success:', response.data);
})
.catch(error => {
  console.log('Error:', error.message);
  if (error.response) {
    console.log('Response:', error.response.data);
  }
});

