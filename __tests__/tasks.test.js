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
      pet_id: newPet.id,
    };
    await agent.post('/api/v1/pets').send(newPet);
    const resp = await agent.get('/api/v1/pets/1');
    expect(resp.status).toBe(200);

    const resp2 = await agent.post('/api/v1/tasks/pet/1').send(task);
    expect(resp2.status).toBe(200);
    expect(resp2.body).toEqual({
      id: expect.any(String),
      description: expect.any(String),
      time: expect.any(String),
      note: expect.any(String),
      is_complete: expect.any(Boolean),
      pet_id: expect.any(String),
    });
  });

  it('GET /api/v1/tasks/:id should return an individual task', async () => {
    const [agent] = await registerAndLogin();
    // define new pet
    const newPet = {
      name: 'Brunksoop',
      breed: 'Dog',
      emergency_contact: '206-332-3333',
      vet: 'Pizza Paws',
      notes: 'hates to salty pasta',
    };
    // post to the route w/ new pet

    const task = {
      description: 'feed pup',
      time: '8:00pm',
      note: '*chefs kiss* soup',
      is_complete: false,
    };
    await agent.post('/api/v1/pets').send(newPet);
    await agent.get('/api/v1/pets/1');
    await agent.post('/api/v1/tasks/pet/1').send(task);

    const resp = await agent.get('/api/v1/tasks/1');
    expect(resp.status).toBe(200);
    expect(resp.body).toMatchInlineSnapshot(`
      Object {
        "description": "feed pup",
        "id": "1",
        "is_complete": false,
        "note": "*chefs kiss* soup",
        "pet_id": "1",
        "time": "8:00pm",
      }
    `);
  });

  it('GET /api/v1/tasks/pet/:id should return a list of tasks specific to a pet', async () => {
    const [agent] = await registerAndLogin();
    // define new pet
    const newPet = {
      name: 'DeBalto',
      breed: 'Dog',
      emergency_contact: '206-222-3333',
      vet: 'Colder Paws',
      notes: 'Allergic to sweet pasta',
    };
    // post to the route w/ new pet

    const task = {
      description: 'feed dogs',
      time: '6:00pm',
      note: 'bad soup',
      is_complete: false,
      pet_id: newPet.id,
    };
    await agent.post('/api/v1/pets').send(newPet);
    await agent.get('/api/v1/pets/1');
    await agent.post('/api/v1/tasks/pet/1').send(task);

    const resp3 = await agent.get('/api/v1/tasks/pet/1');
    expect(resp3.status).toBe(200);
    expect(resp3.body).toMatchInlineSnapshot(`
      Array [
        Object {
          "description": "feed dogs",
          "id": "1",
          "is_complete": false,
          "note": "bad soup",
          "pet_id": "1",
          "pet_name": "DeBalto",
          "time": "6:00pm",
        },
      ]
    `);
  });

  it('GET /api/v1/tasks should return a list of tasks associated with a user', async () => {
    const [agent] = await registerAndLogin();
    // define new pet
    const newPet = {
      name: 'DeBalto',
      breed: 'Dog',
      emergency_contact: '206-222-3333',
      vet: 'Colder Paws',
      notes: 'Allergic to sweet pasta',
    };
    // post to the route w/ new pet

    const task = {
      description: 'feed dogs',
      time: '6:00pm',
      note: 'bad soup',
      is_complete: false,
      pet_id: newPet.id,
    };
    await agent.post('/api/v1/pets').send(newPet);
    await agent.get('/api/v1/pets/1');
    await agent.post('/api/v1/tasks/pet/1').send(task);
    const resp = await agent.get('/api/v1/tasks');
    expect(resp.status).toBe(200);
    expect(resp.body).toMatchInlineSnapshot(`
      Array [
        Object {
          "description": "feed dogs",
          "id": "1",
          "is_complete": false,
          "note": "bad soup",
          "pet_id": "1",
          "pet_name": "DeBalto",
          "time": "6:00pm",
        },
      ]
    `);
  });

  it('PUT /api/v1/tasks/:id should update an existing task to complete', async () => {
    const [agent] = await registerAndLogin();
    // define new pet
    const newPet = {
      name: 'DeBralto',
      breed: 'Dog',
      emergency_contact: '206-332-3333',
      vet: 'Colder Paws',
      notes: 'Allergic to sour pasta',
    };
    // post to the route w/ new pet

    const task = {
      description: 'feed pup',
      time: '8:00pm',
      note: 'mid soup',
      is_complete: false,
    };
    await agent.post('/api/v1/pets').send(newPet);
    await agent.get('/api/v1/pets/1');
    await agent.post('/api/v1/tasks/pet/1').send(task);
    const resp = await agent.put('/api/v1/tasks/1').send({ is_complete: true });
    expect(resp.status).toBe(200);
    expect(resp.body).toEqual({
      ...task,
      id: expect.any(String),
      pet_id: expect.any(String),
      is_complete: true,
    });
  });

  it('DELETE /api/v1/tasks/:id should delete an existing task for authenticated users', async () => {
    const [agent] = await registerAndLogin();
    // define new pet
    const newPet = {
      name: 'DeBrunksi',
      breed: 'Dog',
      emergency_contact: '206-332-3333',
      vet: 'Pizza Paws',
      notes: 'loves to salty pasta',
    };
    // post to the route w/ new pet

    const task = {
      description: 'feed pup',
      time: '8:00pm',
      note: '*chefs kiss* soup',
      is_complete: false,
    };
    await agent.post('/api/v1/pets').send(newPet);
    await agent.get('/api/v1/pets/1');
    await agent.post('/api/v1/tasks/pet/1').send(task);

    const resp = await agent.delete('/api/v1/tasks/1');
    expect(resp.status).toBe(200);

    const newResp = await agent.get('/api/v1/tasks/1');
    expect(newResp.status).toBe(404);
  });
});
