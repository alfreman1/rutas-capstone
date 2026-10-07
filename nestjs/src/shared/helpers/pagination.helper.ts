import { PaginationMeta, PaginatedResult } from '../application/dto/paginated-result.dto';

export class PaginationHelper {
  static createPaginatedResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResult<T> {
    const totalPages = Math.ceil(total / limit);

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return new PaginatedResult(data, meta);
  }

  static getSkipTake(page: number, limit: number) {
    const take = limit;
    const skip = (page - 1) * limit;
    return { skip, take };
  }
}
