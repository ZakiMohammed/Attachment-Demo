import { Subscription } from 'rxjs';

export class FileUpload {
    retry: boolean;
    cancel: boolean;
    loading: boolean;
    progress: number;
    link: string;
    name: string;
    file: any;
    subscription$: Subscription;
}