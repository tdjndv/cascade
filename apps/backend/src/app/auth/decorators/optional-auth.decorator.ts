import { SetMetadata } from '@nestjs/common';

export const IS_OPTIONAL_KEY = 'isOptionalAuth';
export const OptionalAuth = () => SetMetadata(IS_OPTIONAL_KEY, true);
