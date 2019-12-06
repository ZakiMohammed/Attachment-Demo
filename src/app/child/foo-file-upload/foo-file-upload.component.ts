import { Component, OnInit, ViewChild, ElementRef, Inject, Input } from '@angular/core';
import { HttpEventType, HttpEvent, HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subscription } from 'rxjs';
import { DeleteDialogComponent } from 'src/app/dialog/delete-dialog/delete-dialog.component';
import { DialogData } from 'src/app/models/dialog-data';

declare var window: any;

@Component({
  selector: 'app-foo-file-upload',
  templateUrl: './foo-file-upload.component.html',
  styleUrls: ['./foo-file-upload.component.css']
})
export class FooFileUploadComponent implements OnInit {

  //#region input
  @Input('title') title: string = 'Attachment';
  @Input('loading') loading: boolean = true;
  @Input('cancel') cancel: boolean = true;
  //#endregion

  //#region output
  //#endregion

  //#region declarations
  fileUploads: FileUpload[] = [];

  defaultImageUrl: string = './assets/imgs/default.png';
  url: string = 'https://localhost:44365/api/file/';

  currentIndex: number = -1;
  //#endregion

  //#region view child
  @ViewChild('fileUpload', { static: true }) fileUploadElement: ElementRef;
  //#endregion

  //#region ctor
  constructor(
    private httpClient: HttpClient,
    public dialog: MatDialog) { }
  //#endregion

  //#region life cycle
  ngOnInit() {
    this.httpClient.get(this.url + 'GetFiles').subscribe((response: any) => {
      if (response.status) {
        response.files.forEach(file => {
          this.fileUploads.push({
            guid: this.getGuid(),
            formData: null,
            file: null,
            link: file.url,
            uploaded: true,
            retry: false,
            loading: false,
            cancel: false,
            progress: 0,
            name: file.name,
            subscription$: null
          });
        });
      }
    });
  }
  //#endregion

  //#region events
  onUploadClick($event: any) {
    this.fileUploadElement.nativeElement.onchange = () => {
      for (const key in this.fileUploadElement.nativeElement.files) {
        const file = this.fileUploadElement.nativeElement.files[key];
        if (typeof (file) === 'object') {

          const formData = new FormData();
          formData.append('Upload', file);

          let found = this.fileUploads.find(i => i.name === file.name);
          if (found) {
             console.log(`😋 File "${found.name}" already exist`);
          } else {
            let newGuid = this.getGuid();
            this.fileUploads.push({
              guid: newGuid,
              loading: true,
              cancel: true,
              retry: false,
              uploaded: false,
              progress: 0,
              link: '',
              name: file.name,
              file: file,
              formData: formData,
              subscription$: null
            });

            let index = this.fileUploads.findIndex(i => i.guid === newGuid);
            if (this.isImage(this.fileUploads[index].name)) {
              const reader = new FileReader();          
              reader.onloadend = (() => {
                  this.fileUploads[index].link = <string>reader.result;
              });
              reader.readAsDataURL(this.fileUploads[index].file);
            }
          }
        }
      }

      this.fileUploadElement.nativeElement.value = '';

      this.fileUploads.forEach((fileUpload, index) => {
        if (!fileUpload.uploaded) {
          this.postFile(fileUpload);
        }
      });
    };
    this.fileUploadElement.nativeElement.click();
  }

  onDeleteClick($event: any, guid: number) {
    this.currentIndex = this.fileUploads.findIndex(i => i.guid === guid);

    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '500px',
      data: <DialogData>{ title: '', data: this.fileUploads[this.currentIndex], response: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fileUploads[this.currentIndex].loading = true;
        this.httpClient.delete(this.url + 'DeleteFile?fileName=' + this.fileUploads[this.currentIndex].name).subscribe((response: any) => {
          if (response.status) {
            this.fileUploads.splice(this.currentIndex, 1);
            this.currentIndex = -1;
          } else {
            console.log(response.status);
          }
        });
      }
    });
  }

  onDeleteAll($event: any) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '500px',
      data: <DialogData>{ title: 'all', data: this.fileUploads, response: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);

      if (result) {
        this.httpClient.delete(this.url + 'DeleteAllFile').subscribe((response: any) => {
          if (response.status) {
            this.fileUploads = [];
          } else {
            console.log(response.status);
          }
        });
      }
    });
  }

  onDownloadClick($event: any, guid: number) {
    let fileCard = this.fileUploads.find(i => i.guid === guid);
    this.forceDownload(fileCard.link, fileCard.name);
  }

  onDownloadAll($event: any) {
    this.fileUploads.forEach((fileUpload, index) => {
      if (fileUpload.link !== this.defaultImageUrl) {
        this.forceDownload(fileUpload.link, fileUpload.name);
      }
    });
  }

  onRetryClick($event: any, fileUpload: FileUpload) {

    let index = this.fileUploads.findIndex(i => i.name === fileUpload.name);

    this.fileUploads[index].loading = true;
    this.fileUploads[index].retry = false;
    this.fileUploads[index].cancel = true;

    this.postFile(fileUpload);
  }

  onCancelClick($event: any, guid: number) {
    let index = this.fileUploads.findIndex(i => i.guid === guid);
    this.fileUploads[index].subscription$.unsubscribe();
    this.fileUploads.splice(index, 1);

  }
  //#endregion

  //#region methods
  postFile(fileUpload: FileUpload) {

    let index = this.fileUploads.findIndex(i => i.guid === fileUpload.guid);

    this.fileUploads[index].subscription$ = this.httpClient.post(this.url + 'UploadFile', fileUpload.formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe((event: HttpEvent<any>) => {

      switch (event.type) {
        case HttpEventType.UploadProgress:
          if (this.fileUploads[index]) {
            this.fileUploads[index].progress = Math.round(event.loaded / event.total * 100);
          }
          break;
        case HttpEventType.Response:

          index = this.fileUploads.findIndex(i => i.guid === fileUpload.guid);

          let response = event.body;

          if (this.fileUploads[index]) {
            if (response.status) {
              this.fileUploads[index].loading = false;
              this.fileUploads[index].retry = false;
              this.fileUploads[index].cancel = false;
              this.fileUploads[index].uploaded = true;
              this.fileUploads[index].link = response.url;              
            } else {
              this.fileUploads[index].loading = false;
              this.fileUploads[index].cancel = true;
              this.fileUploads[index].retry = true;
            }

            this.fileUploads[index].progress = 0;
          }
      }

    });
  }

  forceDownload(url: string, fileName: string) {
    this.httpClient.get(this.url + 'GetPhysicalFile?fileName=' + fileName, { responseType: "blob" }).subscribe(response => {
      var urlCreator = window.URL || window.webkitURL;
      var imageUrl = urlCreator.createObjectURL(response);
      var tag = document.createElement('a');
      tag.href = imageUrl;
      tag.download = fileName;
      document.body.appendChild(tag);
      tag.click();
      document.body.removeChild(tag);
    });
  }

  isImage(link: string) {
    let extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.dib', '.jfif', '.tif', '.tiff'];
    let found = extensions.find(i => link.includes(i));
    return !!found;
  }

  getExtension(name: string) {
    if (name.length > 4) {
      if (name.includes('.')) {
        if (this.isImage(name)) {
          return 'Image';
        } else {
          return name.split('.')[1].toUpperCase() + ' File';
        }
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  getGuid() {
    let guid = Math.floor(Math.random() * 1000);
    let found = this.fileUploads.find(i => i.guid === guid);
    while (found) {
      guid = Math.floor(Math.random() * 1000);
    }
    return guid;
  }
  //#endregion

}

export class FileUpload {
  guid: number;
  retry: boolean;
  cancel: boolean;
  loading: boolean;
  uploaded: boolean;
  progress: number;
  link: string;
  name: string;
  formData: any;
  file: any;
  subscription$: Subscription;
}