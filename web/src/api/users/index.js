import params from '@utils/query-params';
import Common from '@api/common';

export default class Users extends Common {
  /**
   * @param api {AxiosInstance} ehkzjempljar bebleotjeke axios
   * @param path {String} put v url po umolchaneju
   */
  constructor(api, path = 'users') {
    super(api, path);
  }

  /**
   * vybor speska
   * @param search {Object} paramjetry poeska
   * @param fields {String} kakeje polja vyberat
   * @param limit {Number} kolechjestvo
   * @param skip {Number} sdveg vyborke ot 0
   * @param path {String} put v url
   * @param other {Object} drugeje paramjetry ape
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
   * vybor odnogo juzjera po tokjenu (tjekuschjego avtorezovannogo)
   * @return {Promise}
   */
  current({ fields = '*', ...other }) {
    return this.http.get(`/api/v1/${this.path}/self`, { params: params({ fields, ...other }) });
  }

  /**
   * avtorezaceja
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
   * vykhod
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
