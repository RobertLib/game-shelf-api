import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PageInfo } from './pagination.dto';

export interface IPaginationArgs {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

export interface IEdge<T> {
  node: T;
  cursor: string;
}

export interface IConnection<T> {
  edges: IEdge<T>[];
  nodes: T[];
  pageInfo: PageInfo;
  totalCount: number;
}

@Injectable()
export class PaginationService {
  private encodeCursor(id: number): string {
    return Buffer.from(`cursor:${id}`).toString('base64');
  }

  private decodeCursor(cursor: string): number {
    if (!cursor) {
      throw new Error('Cursor cannot be empty');
    }

    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      if (!decoded.startsWith('cursor:')) {
        throw new Error('Invalid cursor format');
      }

      const id = decoded.replace('cursor:', '');
      const numId = parseInt(id, 10);
      if (isNaN(numId) || numId <= 0) {
        throw new Error('Invalid cursor format');
      }
      return numId;
    } catch {
      throw new Error(`Invalid cursor: ${cursor}`);
    }
  }

  private validatePaginationArgs(args: IPaginationArgs): void {
    const { first, last, after, before } = args;
    if (first && last) {
      throw new Error('Cannot specify both first and last');
    }
    if (after && before) {
      throw new Error('Cannot specify both after and before');
    }
  }

  public async paginate<T extends { id: number }>(
    baseQueryBuilder: SelectQueryBuilder<T>,
    args: IPaginationArgs,
    repository: Repository<T>,
    filterConditions?: (qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>,
  ): Promise<IConnection<T>> {
    this.validatePaginationArgs(args);

    const { first, after, last, before } = args;
    const limit = first || last || 10;
    const isForward = !!first || (!last && !before);

    // Clone the query builder to avoid modifying the original
    let queryBuilder = baseQueryBuilder.clone();

    // Apply cursor conditions
    if (after) {
      const afterId = this.decodeCursor(after);
      queryBuilder = queryBuilder.andWhere('entity.id > :afterId', { afterId });
    }
    if (before) {
      const beforeId = this.decodeCursor(before);
      queryBuilder = queryBuilder.andWhere('entity.id < :beforeId', {
        beforeId,
      });
    }

    // For cursor-based pagination, we always need to include id in ordering
    // If there's existing ordering, add id as secondary sort for consistent results
    const existingOrderBy = queryBuilder.expressionMap.orderBys;
    if (Object.keys(existingOrderBy).length === 0) {
      // No existing order, just sort by id
      queryBuilder = queryBuilder.orderBy(
        'entity.id',
        isForward ? 'ASC' : 'DESC',
      );
    } else {
      // Existing order, add id as tie-breaker
      queryBuilder = queryBuilder.addOrderBy(
        'entity.id',
        isForward ? 'ASC' : 'DESC',
      );
    }

    // Get one extra item to determine if there are more pages
    const entities = await queryBuilder.take(limit + 1).getMany();

    // Determine pagination info
    const hasMore = entities.length > limit;
    if (hasMore) {
      entities.pop(); // Remove the extra item
    }

    // If we're going backwards, reverse the results
    if (!isForward) {
      entities.reverse();
    }

    // Get total count for the connection
    let totalCountQuery = repository.createQueryBuilder('entity');
    if (filterConditions) {
      totalCountQuery = filterConditions(totalCountQuery);
    }
    const totalCount = await totalCountQuery.getCount();

    // Create edges
    const edges: IEdge<T>[] = entities.map((entity) => ({
      node: entity,
      cursor: this.encodeCursor(entity.id),
    }));

    // Create page info
    const pageInfo: PageInfo = {
      startCursor: edges.length > 0 ? edges[0].cursor : undefined,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : undefined,
      hasNextPage: isForward ? hasMore : !!after,
      hasPreviousPage: !isForward ? hasMore : !!before,
    };

    return {
      edges,
      nodes: entities,
      pageInfo,
      totalCount,
    };
  }
}
