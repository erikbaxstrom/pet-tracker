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

describe('pets routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  afterAll(() => {
    pool.end();
  });

  it('POST to /api/v1/pets should error out for un-authed user', async () => {
    //request
    // expect 403?
  });

  it('POST /api/v1/pets should create a new pet owned by the current user', async () => {
    // register and login
    const [agent] = await registerAndLogin();
    // define new pet
    const newPet = {
      name: 'Fido',
      breed: 'Dog',
      emergency_contact: '206-222-3333',
      vet: 'Happy Paws',
      notes: 'Allergic to sweet potato',
    };
    // post to the route w/ new pet
    const response = await agent.post('/api/v1/pets').send(newPet);
    // expect status 200 and response with newly created pet
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: expect.any(String),
      name: newPet.name,
      breed: newPet.breed,
      emergency_contact: newPet.emergency_contact,
      vet: newPet.vet,
      notes: newPet.notes,
    });
  });

  it('GET /api/v1/pets should return a list of pets owned by current user', async () => {
    const [agent] = await registerAndLogin();
    const newPet = {
      name: 'Sandy',
      breed: 'Cat',
      emergency_contact: '477-444-3333',
      vet: 'Mad Paws',
      notes: 'Allergic to peanuts',
    };
    await agent.post('/api/v1/pets').send(newPet);
    const resp = await agent.get('/api/v1/pets');
    expect(resp.status).toBe(200);
    expect(resp.body).toMatchInlineSnapshot(`
      Array [
        Object {
          "breed": "Cat",
          "emergency_contact": "477-444-3333",
          "id": "1",
          "name": "Sandy",
          "notes": "Allergic to peanuts",
          "vet": "Mad Paws",
        },
      ]
    `);
  });
});
