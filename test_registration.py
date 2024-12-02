import requests

SERVER_URL = 'http://localhost:5000'
session = requests.Session()

register_payload = {
    'username': 'testuser',
    'email': 'testuser@example.com',
    'password': 'testpassword',
    'age': 30,
    'gender': 'Male',
    'location': 'New York'
}
response = session.post(f'{SERVER_URL}/register', json=register_payload)
print('Register Response:', response.json())

login_payload = {
    'username': 'testuser',
    'password': 'testpassword'
}
response = session.post(f'{SERVER_URL}/login', json=login_payload)
print('Login Response:', response.json())

response = session.get(f'{SERVER_URL}/get_images')
print('Get Images Response:', response.json())

like_payload = {'liked_image': 1} 
response = session.post(f'{SERVER_URL}/like_image', json=like_payload)
print('Like Image Response:', response.json())

dislike_payload = {'disliked_image': 2} 
response = session.post(f'{SERVER_URL}/dislike_image', json=dislike_payload)
print('Dislike Image Response:', response.json())

response = session.post(f'{SERVER_URL}/logout')
print('Logout Response:', response.json())
