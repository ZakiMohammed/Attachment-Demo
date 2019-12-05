import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  url: string = environment.apiUrl + 'file/';

  constructor(private httpClient: HttpClient) { }

  getAll(): Observable<any> {
    return this.httpClient.get(this.url + 'GetFiles');
  }

  getPhysicalFile(fileName: string): Observable<any> {
    return this.httpClient.get(this.url + 'GetPhysicalFile?fileName=' + fileName, { responseType: "blob" });
  }

  upload(file: any): Observable<any> {
    return this.httpClient.post(this.url + 'UploadFile', file, {
      reportProgress: true,
      observe: 'events'
    });
  }

  delete(fileName: string) {
    return this.httpClient.delete(this.url + 'DeleteFile?fileName=' + fileName);
  }

  deleteAll() {
    return this.httpClient.delete(this.url + 'DeleteAllFile');
  }
  
}
