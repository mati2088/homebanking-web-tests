module.exports = {
    validUser: {
        username: 'demo',
        password: 'demo123'
    },
    invalidUsers: [
        {
            username: 'invalid_user',
            password: 'wrong_password',
            description: 'Invalid credentials'
        },
        {
            username: '',
            password: 'password123',
            description: 'Empty username'
        },
        {
            username: 'usuario_demo',
            password: '',
            description: 'Empty password'
        },
        {
            username: '',
            password: '',
            description: 'Empty credentials'
        }
    ]
};
