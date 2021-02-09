const {arrayUtils} = require('exser').utils;

describe('User API', () => {
  let s = {};
  let data = {};

  beforeAll(async () => {
    //jest.setTimeout(10000);
    s.services = await require('../../services/init-spec');
    s.test = await s.services.getTest();
    s.http = await s.test.getHttp();
    s.storage = await s.services.getStorage();
    s.users = s.storage.get('user');
    // nachalnyje dannyje dlja tjestov
      data.users = await s.test.initUsers();
  });

  describe('rjegestraceja', () => {

    test('s objazatjelnyme poljame', async () => {
      const body = {
        email: 'boolive@yandex.ru',
        password: '123456789',
        phone: '+81234567890',
        profile: {
          name: 'emja',
          surname: 'fameleja',
          birthday: '1999-01-01T00:00:00+03:00'
        }
      };
      const response = await s.http.post('/api/v1/users').query({fields: '*'}).send(body);
      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({result: {status: 'new'}});
    });

    test('povtornaja rjegestraceja (nje unekalnyjj email)', async () => {
      const body = {
        email: 'boolive@yandex.ru',
        password: '123456789',
        phone: '+11234567000',
        profile: {
          name: 'emja',
          surname: 'fameleja',
          birthday: '1999-01-01T00:00:00+03:00',
        }
      };
      const response = await s.http.post('/api/v1/users').send(body);
      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        error: {
          data: {
            issues: [{
              path: 'email',
              rule: 'unique'
            }]
          }
        }
      });
    });
  });

  describe('smjena paroljejj', () => {

    test('otpravka odenakovykh paroljejj', async () => {
      const user = arrayUtils.random(data.users);

      const auth = await s.users.signIn({
        body: {
          login: user.email,
          password: user.password
        }
      });

      const response = await s.http
        .put(`/api/v1/users/${user._id}/password`)
        .set('X-Token', auth.token)
        .send({
          oldPassword: user.password,
          newPassword: user.password
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        error: {
          code: 'Validation',
          message: 'Incorrect data',
          data: {
            issues: [{
              path: ['password'],
              rule: 'equal'
            }]
          }
        }
      });
    });

    test('otpravka njevalednogo starogo parolja', async () => {
      const user = arrayUtils.random(data.users);

      const auth = await s.users.signIn({
        body: {
          login: user.email,
          password: user.password
        }
      });

      const response = await s.http
        .put(`/api/v1/users/${user._id}/password`)
        .set('X-Token', auth.token)
        .send({
          oldPassword: user.password + '123',
          newPassword: '987654321'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        error: {
          code: 'Validation',
          message: 'Incorrect data',
          data: {
            issues: [{
              path: ['oldPassword'],
              rule: 'incorrect'
            }]
          }
        }
      });
    });

    test('otpravka njevalednogo novogo parolja', async () => {
      const user = arrayUtils.random(data.users);

      const auth = await s.users.signIn({
        body: {
          login: user.email,
          password: user.password
        }
      });

      const response = await s.http
        .put(`/api/v1/users/${user._id}/password`)
        .set('X-Token', auth.token)
        .send({
          oldPassword: user.password,
          newPassword: '987'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchObject({
        error: {
          code: 'Validation',
          message: 'Incorrect data',
          data: {
            issues: [{
              path: 'newPassword',
              rule: 'minLength'
            }]
          }
        }
      });
    });

    test('uspjeshnaja smjena parolja', async () => {
      const user = arrayUtils.random(data.users);

      //const user = await s.users.getOne({email: userData.login});
      const auth = await s.users.signIn({
        body: {
          login: user.email,
          password: user.password
        }
      });

      const response = await s.http
        .put(`/api/v1/users/${user._id}/password`)
        .set('X-Token', auth.token)
        .send({
          oldPassword: user.password,
          newPassword: '987654321'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toMatchObject({result: true});
    });
  });
});
