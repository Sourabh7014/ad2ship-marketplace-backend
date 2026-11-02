import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  status: boolean;
  message: string;
  data: T;
  auth_token?: string;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((res) => {
        // If the controller already returned our standard shape with boolean status and data, pass it through
        if (
          res &&
          typeof res === 'object' &&
          typeof (res as any).status === 'boolean' &&
          'data' in (res as any)
        ) {
          return res;
        }

        // Handle case where controller returns data + message or auth_token
        const { data, message, auth_token, meta, ...rest } = (res || {}) as any;

        if (data !== undefined || message !== undefined || auth_token !== undefined) {
          return {
            status: true,
            message: message || 'Success',
            data: data !== undefined ? data : rest,
            ...(auth_token ? { auth_token } : {}),
            ...(meta ? { meta } : {}),
          };
        }

        return {
          status: true,
          message: 'Success',
          data: res ?? null,
        };
      }),
    );
  }
}

