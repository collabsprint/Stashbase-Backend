import { Model } from 'sequelize';

interface PaginationOptions {
  page?: number;
  pageSize?: number;
  include?: any[];
  where?: any;
  order?: any[];
}

interface PaginationResult {
  data: any[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

async function paginate(model: any, options: PaginationOptions): Promise<PaginationResult | false> {
  try {
    const { page = 1, pageSize = 10, include = [], where = {}, order = [] } = options;
    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const { rows: data, count: total } = await model.findAndCountAll({
      where,
      include,
      order,
      limit,
      offset,
      distinct: true
    });

    if (total > 0) {
      return {
        data: data,
        total: total,
        currentPage: parseInt(String(page)),
        totalPages: Math.ceil(total / pageSize),
        pageSize: pageSize,
      };
    }

    return false;
  } catch (error) {
    console.error((error as any)?.message);
    throw error;
  }
}

export default paginate;
