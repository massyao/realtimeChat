import params from '@utils/query-params';
import Common from '@api/common';

export default class Users extends Common {
  /**
   * @param api {AxiosInstance}  axios
   * @param path {String} 
   */
  constructor(api, path = 'users') {
    super(api, path);
  }

  /**
   * @param search {Object} 
   * @param fields {String} 
   * @param limit {Number} 
   * @param skip {Number} 
   * @param path {String} 
   * @param other {Object} 
   * @returns {Promise}
   */
  getList({
    search,
    fields = 'items(*), count, allCount, newCount, confirmCount, rejectCount',
    limit = 20,
    skip = 0,
    path,
    ...other
  }) {
    return super.getList({ search, fields, limit, skip, path, ...other });
  }

  /**
   * @return {Promise}
   */
  current({ fields = '*', ...other }) {
    return this.http.get(`/api/v1/${this.path}/self`, { params: params({ fields, ...other }) });
  }

  /**
   * @param login
   * @param password
   * @param remember
   * @param fields
   * @param other
   * @returns {Promise}
   */
  login({ login, password, remember = false, fields = '*', ...other }) {
    // Mock request
    // return Promise.resolve({ data: { result: { user: { _id: 123 }, token: '123456' } } });
    return this.http.post(
      `/api/v1/users/sign`,
      { login, password, remember },
      { params: params({ fields, ...other }) },
    );
  }

  /**
   * @returns {Promise}
   */
  logout() {
    return this.http.delete(`/api/v1/users/sign`);
  }

  registration({ profile = {}, ...rest }) {
    return this.http.post(`/api/v1/users`, { profile, ...rest });
  }

  resetPassword({ login }) {
    return this.http.post(`/api/v1/users/password`, { login });
  }
}
