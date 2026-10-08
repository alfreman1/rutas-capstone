import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResult } from '../../application/dto/paginated-result.dto';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data instanceof PaginatedResult) {
          return {
            success: true,
            data: data.data as any,
            meta: data.meta,
          };
        }
        
        return {
          success: true,
          data: data,
        };
      }),
    );
  }
}
