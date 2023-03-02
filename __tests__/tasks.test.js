const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');

// Dummy user for testing
const mockUser = {
  email: 'test@example.com',
  password: '12345',
};

const registerAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? mockUser.password;

  // Create an "agent" that gives us the ability
  // to store cookies between requests in a test
  const agent = request.agent(app);

  // Create a user to sign in with
  const user = await UserService.create({ ...mockUser, ...userProps });

  // ...then sign in
  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({ email, password });
  return [agent, user];
};

describe('tasks routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  afterAll(() => {
    pool.end();
  });

  it('POST /api/v1/pets/:id/tasks should add a new task specific to a pet', async () => {
    const [agent] = await registerAndLogin();
    // define new pet
    const newPet = {
      name: 'Balto',
      breed: 'Dog',
      emergency_contact: '206-222-3333',
      vet: 'Cold Paws',
      notes: 'Allergic to sweet pasta',
    };
    // post to the route w/ new pet

    const task = {
      description: 'feed cats',
      time: '6:00pm',
      note: 'good soup',
      is_complete: false,
    };
    await agent.post('/api/v1/pets').send(newPet);
    const resp = await agent.get('/api/v1/pets/1');
    expect(resp.status).toBe(200);

    const resp2 = await agent.post('/api/v1/pets/1/tasks').send(task);
    expect(resp2.status).toBe(200);
    expect(resp2.body).toEqual({
      id: expect.any(String),
      description: expect.any(String),
      time: expect.any(String),
      note: expect.any(String),
      is_complete: expect.any(Boolean),
    });
  });
});
