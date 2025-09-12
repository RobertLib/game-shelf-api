import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

@ObjectType()
export class PageInfo {
  @Field(() => String, { nullable: true })
  startCursor?: string;

  @Field(() => String, { nullable: true })
  endCursor?: string;

  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Boolean)
  hasPreviousPage: boolean;
}

export function createEdgeType<T>(classRef: Type<T>) {
  @ObjectType(`${classRef.name}Edge`)
  class Edge {
    @Field(() => classRef)
    node: T;

    @Field(() => String)
    cursor: string;
  }
  return Edge;
}

export function createConnectionType<T>(classRef: Type<T>) {
  const EdgeType = createEdgeType(classRef);

  @ObjectType(`${classRef.name}Connection`)
  class Connection {
    @Field(() => [EdgeType])
    edges: InstanceType<typeof EdgeType>[];

    @Field(() => [classRef])
    nodes: T[];

    @Field(() => PageInfo)
    pageInfo: PageInfo;

    @Field(() => Int)
    totalCount: number;
  }
  return Connection;
}
