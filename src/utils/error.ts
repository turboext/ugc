import { ResponseStatus } from './response';

export class StatusedError extends Error {
    public status: Exclude<ResponseStatus, ResponseStatus.OK>;
}
