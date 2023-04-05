/* eslint-disable */
import type { Prisma, Example } from "@prisma/client";
import { useContext } from 'react';
import { RequestHandlerContext } from '@zenstackhq/react/runtime';
import { type RequestOptions } from '@zenstackhq/react/runtime/swr';
import * as request from '@zenstackhq/react/runtime/swr';

export function useExample() {
    const { endpoint } = useContext(RequestHandlerContext);
    const prefixesToMutate = [`${endpoint}/example/find`, `${endpoint}/example/aggregate`, `${endpoint}/example/count`, `${endpoint}/example/groupBy`];
    const mutate = request.getMutate(prefixesToMutate);

    async function create<T extends Prisma.ExampleCreateArgs>(args: Prisma.SelectSubset<T, Prisma.ExampleCreateArgs>) {
        try {
            return await request.post<Prisma.SelectSubset<T, Prisma.ExampleCreateArgs>, Prisma.CheckSelect<T, Example, Prisma.ExampleGetPayload<T>>>(`${endpoint}/example/create`, args, mutate);
        } catch (err: any) {
            if (err.info?.prisma && err.info?.code === 'P2004' && err.info?.reason === 'RESULT_NOT_READABLE') {
                // unable to readback data
                return undefined;
            } else {
                throw err;
            }
        }
    }

    function findMany<T extends Prisma.ExampleFindManyArgs>(args?: Prisma.SelectSubset<T, Prisma.ExampleFindManyArgs>, options?: RequestOptions<Array<Prisma.ExampleGetPayload<T>>>) {
        return request.get<Array<Prisma.ExampleGetPayload<T>>>(`${endpoint}/example/findMany`, args, options);
    }

    function findUnique<T extends Prisma.ExampleFindUniqueArgs>(args: Prisma.SelectSubset<T, Prisma.ExampleFindUniqueArgs>, options?: RequestOptions<Prisma.ExampleGetPayload<T>>) {
        return request.get<Prisma.ExampleGetPayload<T>>(`${endpoint}/example/findUnique`, args, options);
    }

    function findFirst<T extends Prisma.ExampleFindFirstArgs>(args: Prisma.SelectSubset<T, Prisma.ExampleFindFirstArgs>, options?: RequestOptions<Prisma.ExampleGetPayload<T>>) {
        return request.get<Prisma.ExampleGetPayload<T>>(`${endpoint}/example/findFirst`, args, options);
    }

    async function update<T extends Prisma.ExampleUpdateArgs>(args: Prisma.SelectSubset<T, Prisma.ExampleUpdateArgs>) {
        try {
            return await request.put<Prisma.SelectSubset<T, Prisma.ExampleUpdateArgs>, Prisma.ExampleGetPayload<T>>(`${endpoint}/example/update`, args, mutate);
        } catch (err: any) {
            if (err.info?.prisma && err.info?.code === 'P2004' && err.info?.reason === 'RESULT_NOT_READABLE') {
                // unable to readback data
                return undefined;
            } else {
                throw err;
            }
        }
    }

    async function updateMany<T extends Prisma.ExampleUpdateManyArgs>(args: Prisma.SelectSubset<T, Prisma.ExampleUpdateManyArgs>) {
        return await request.put<Prisma.SelectSubset<T, Prisma.ExampleUpdateManyArgs>, Prisma.BatchPayload>(`${endpoint}/example/updateMany`, args, mutate);
    }

    async function upsert<T extends Prisma.ExampleUpsertArgs>(args: Prisma.SelectSubset<T, Prisma.ExampleUpsertArgs>) {
        try {
            return await request.post<Prisma.SelectSubset<T, Prisma.ExampleUpsertArgs>, Prisma.ExampleGetPayload<T>>(`${endpoint}/example/upsert`, args, mutate);
        } catch (err: any) {
            if (err.info?.prisma && err.info?.code === 'P2004' && err.info?.reason === 'RESULT_NOT_READABLE') {
                // unable to readback data
                return undefined;
            } else {
                throw err;
            }
        }
    }

    async function del<T extends Prisma.ExampleDeleteArgs>(args: Prisma.SelectSubset<T, Prisma.ExampleDeleteArgs>) {
        try {
            return await request.del<Prisma.ExampleGetPayload<T>>(`${endpoint}/example/delete`, args, mutate);
        } catch (err: any) {
            if (err.info?.prisma && err.info?.code === 'P2004' && err.info?.reason === 'RESULT_NOT_READABLE') {
                // unable to readback data
                return undefined;
            } else {
                throw err;
            }
        }
    }

    async function deleteMany<T extends Prisma.ExampleDeleteManyArgs>(args?: Prisma.SelectSubset<T, Prisma.ExampleDeleteManyArgs>) {
        return await request.del<Prisma.BatchPayload>(`${endpoint}/example/deleteMany`, args, mutate);
    }

    function aggregate<T extends Prisma.ExampleAggregateArgs>(args: Prisma.Subset<T, Prisma.ExampleAggregateArgs>, options?: RequestOptions<Prisma.GetExampleAggregateType<T>>) {
        return request.get<Prisma.GetExampleAggregateType<T>>(`${endpoint}/example/aggregate`, args, options);
    }

    function groupBy<T extends Prisma.ExampleGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? { orderBy: Prisma.UserGroupByArgs['orderBy'] } : { orderBy?: Prisma.UserGroupByArgs['orderBy'] }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.TupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True
        ? `Error: "by" must not be empty.`
        : HavingValid extends Prisma.False
        ? {
            [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
            ]
        }[HavingFields]
        : 'take' extends Prisma.Keys<T>
        ? 'orderBy' extends Prisma.Keys<T>
        ? ByValid extends Prisma.True
        ? {}
        : {
            [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
        : 'skip' extends Prisma.Keys<T>
        ? 'orderBy' extends Prisma.Keys<T>
        ? ByValid extends Prisma.True
        ? {}
        : {
            [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
        : ByValid extends Prisma.True
        ? {}
        : {
            [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]>(args: Prisma.SubsetIntersection<T, Prisma.ExampleGroupByArgs, OrderByArg> & InputErrors, options?: RequestOptions<{} extends InputErrors ? Prisma.GetExampleGroupByPayload<T> : InputErrors>) {
        return request.get<{} extends InputErrors ? Prisma.GetExampleGroupByPayload<T> : InputErrors>(`${endpoint}/example/groupBy`, args, options);
    }

    function count<T extends Prisma.ExampleCountArgs>(args: Prisma.Subset<T, Prisma.ExampleCountArgs>, options?: RequestOptions<T extends { select: any; } ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], Prisma.ExampleCountAggregateOutputType> : number>) {
        return request.get<T extends { select: any; } ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], Prisma.ExampleCountAggregateOutputType> : number>(`${endpoint}/example/count`, args, options);
    }
    return { create, findMany, findUnique, findFirst, update, updateMany, upsert, del, deleteMany, aggregate, groupBy, count };
}
