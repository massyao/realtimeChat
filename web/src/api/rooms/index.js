import params from '@utils/query-params';
import Common from '@api/common';

export default class Rooms extends Common {
  constructor(api, path = 'rooms') {
    super(api, path);
  }

  getList({ search, fields = 'items(*), count', limit = 20, skip = 0, ...other }) {
    return super.getList({ search, fields, limit, skip, ...other });
  }

  getOne({ id, fields = '*', ...other }) {
    return super.getOne({ id, fields, ...other });
  }
}
