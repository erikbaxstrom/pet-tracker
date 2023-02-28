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
          "emergency_contact": "477-444-3333",
          "id": "1",
          "name": "Sandy",
          "notes": "Allergic to peanuts",
          "vet": "Mad Paws",
        },
      ]
    `);
  });

  it('GET /api/v1/pets/:id should return an individual pet', async () => {
    const [agent] = await registerAndLogin();
    const newPet = {
      name: 'Bob',
      breed: 'Cat',
      emergency_contact: '477-444-3333',
      vet: 'Dad Paws',
      notes: 'Allergic to peanuts',
    };
    await agent.post('/api/v1/pets').send(newPet);

    const resp = await agent.get('/api/v1/pets/1');
    expect(resp.status).toBe(200);
    expect(resp.body).toMatchInlineSnapshot(`
      Object {
        "emergency_contact": "477-444-3333",
        "id": "1",
        "name": "Bob",
        "notes": "Allergic to peanuts",
        "vet": "Dad Paws",
      }
    `);
  });

  it('PUT /api/v1/pets/:id should allow users to update a pet if they are the owner', async () => {
    const [agent] = await registerAndLogin();
    const newPet = {
      name: 'Tilly',
      breed: 'Dog',
      emergency_contact: '477-555-3333',
      vet: 'Dad Paws',
      notes: 'Allergic to peanuts',
    };
    await agent.post('/api/v1/pets').send(newPet);
    const resp1 = await agent.get('/api/v1/pets/1');
    expect(resp1.body.id).toBe('1');

    const resp = await agent.put('/api/v1/pets/1').send({
      name: 'Tilly',
      breed: 'Dog',
      emergency_contact: '477-555-3333',
      vet: 'Daddy Paws',
      notes: 'Allergic to peanuts',
    });
    expect(resp.status).toBe(200);
    expect(resp.body).toEqual({
      id: '1',
      name: expect.any(String),
      breed: expect.any(String),
      emergency_contact: expect.any(String),
      vet: 'Daddy Paws',
      notes: expect.any(String),
    });
  });

  it('POST /api/v1/pets/:id/owners/ should add an owner to a pet', async () => {
    const [agent] = await registerAndLogin();
    const newPet = {
      name: 'Willy',
      breed: 'Dog',
      emergency_contact: '477-555-3333',
      vet: 'Four Paws',
      notes: 'Loves his rubber ducky',
    };
    await agent.post('/api/v1/pets').send(newPet);
    const resp1 = await agent.get('/api/v1/pets/1');
    expect(resp1.body.id).toBe('1');
    // create user new@email.com
    const newUser = {
      email: 'new@email.com',
      password: '12345',
    };
    await registerAndLogin(newUser);

    // call the route
    const resp = await agent
      .post('/api/v1/pets/1/owners/')
      .send({ email: 'new@email.com' });
    expect(resp.status).toBe(200);
    expect(resp.body).toEqual({
      id: '2',
      email: 'new@email.com',
    });
  });

  it('GET /api/v1/pets/:id/owners/ should return a list of owners for that pet, excluding the user who submitted the request', async () => {
    // make user
    const [agent] = await registerAndLogin();
    //make pet
    const newPet = {
      name: 'Billy',
      breed: 'Cat',
      emergency_contact: '477-555-3333',
      vet: 'Nine Lives',
      notes: 'Loves cheese',
    };
    await agent.post('/api/v1/pets').send(newPet);
    const resp1 = await agent.get('/api/v1/pets/1');
    expect(resp1.body.id).toBe('1');
    // add user to pet
    // create user new@email.com
    const newUser = {
      email: 'new@email.com',
      password: '12345',
    };
    await registerAndLogin(newUser);

    // call the route
    const resp = await agent
      .post('/api/v1/pets/1/owners/')
      .send({ email: 'new@email.com' });
    expect(resp.status).toBe(200);
    // call get. should return added user
    const getResp = await agent.get('/api/vi/pets/1/owners/');
    expect(getResp.status).toBe(200);
    expect(getResp.body).toMatchInlineSnapshot();
  });
});
