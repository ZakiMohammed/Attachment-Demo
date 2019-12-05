import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { FileUpload } from '../models/file-upload';
import { environment } from 'src/environments/environment';
import { FileService } from '../services/file.service';
import { HttpEventType, HttpEvent } from '@angular/common/http';
import { MatDialog } from '@angular/material';
import { DeleteDialogComponent } from '../dialog/delete-dialog/delete-dialog.component';
import { DialogData } from '../models/dialog-data';

declare var window: any;

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {

  //#region declarations
  fileUploads: FileUpload[] = [];

  defaultImageUrl: string = './assets/imgs/default.png';

  currentIndex: number = -1;
  //#endregion

  //#region view child
  @ViewChild('fileUpload', { static: true }) fileUploadElement: ElementRef;
  //#endregion

  //#region ctor
  constructor(
    private fileService: FileService,
    public dialog: MatDialog) { }
  //#endregion

  //#region life cycle
  ngOnInit() {
    this.fileService.getAll().subscribe((response: any) => {
      if (response.status) {
        response.files.forEach(file => {
          this.fileUploads.push({
            file: null,
            link: file.url,
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

          this.fileUploads.push({
            loading: true,
            cancel: true,
            retry: false,
            progress: 0,
            link: this.defaultImageUrl,
            name: file.name,
            file: formData,
            subscription$: null
          });
        }
      }

      this.fileUploadElement.nativeElement.value = '';

      this.fileUploads.forEach((fileUpload, index) => {
        if (fileUpload.link === this.defaultImageUrl) {
          this.postFile(fileUpload);
        }

        // setTimeout(() => {
        //   this.fileUploads[index].loading = false;
        //   this.fileUploads[index].link = 'xyz';
        // }, Math.round(Math.random() * 3000));
      });
    };
    this.fileUploadElement.nativeElement.click();
  }

  onDeleteClick($event: any, index: number) {
    this.currentIndex = index;

    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '500px',
      data: <DialogData>{ title: '', data: this.fileUploads[this.currentIndex], response: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fileUploads[this.currentIndex].loading = true;
        this.fileService.delete(this.fileUploads[this.currentIndex].name).subscribe((response: any) => {
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
        this.fileService.deleteAll().subscribe((response: any) => {
          if (response.status) {
            this.fileUploads = [];        
          } else {
            console.log(response.status);
          }
        });
      }
    });
  }

  onDownloadClick($event: any, index: number) {
    let fileCard = this.fileUploads[index];
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

  onCancelClick($event: any, index: number) {
    this.fileUploads[index].subscription$.unsubscribe();
    this.fileUploads[index].subscription$ = null;

    this.fileUploads.splice(index, 1);
    
  }
  //#endregion

  //#region methods
  postFile(fileUpload: FileUpload) {

    let index = this.fileUploads.findIndex(i => i.name === fileUpload.name);

    this.fileUploads[index].subscription$ = this.fileService.upload(fileUpload.file).subscribe((event: HttpEvent<any>) => {

      switch (event.type) {
        case HttpEventType.UploadProgress:
          if (this.fileUploads[index]) {
            this.fileUploads[index].progress = Math.round(event.loaded / event.total * 100);
          }
          break;
        case HttpEventType.Response:

          index = this.fileUploads.findIndex(i => i.name === fileUpload.name);

          let response = event.body;

          if (this.fileUploads[index]) {
            if (response.status) {
              this.fileUploads[index].loading = false;
              this.fileUploads[index].retry = false;
              this.fileUploads[index].cancel = false;
              this.fileUploads[index].link = response.url;
            } else {
              this.fileUploads[index].loading = false;
              this.fileUploads[index].cancel = false;
              this.fileUploads[index].retry = true;
            }

            this.fileUploads[index].progress = 0;
          }
      }

    });
  }

  forceDownload(url: string, fileName: string) {
    this.fileService.getPhysicalFile(fileName).subscribe(response => {
      var urlCreator = window.URL || window.webkitURL;
      var imageUrl = urlCreator.createObjectURL(response);
      var tag = document.createElement('a');
      tag.href = imageUrl;
      tag.download = fileName;
      document.body.appendChild(tag);
      tag.click();
      document.body.removeChild(tag);
    });

    // var xhr = new XMLHttpRequest();
    // xhr.open("GET", 'https://localhost:44365/api/file/GetPhysicalFile?fileName=' + fileName, true);
    // xhr.responseType = "blob";
    // xhr.onload = function(){
    //     var urlCreator = window.URL || window.webkitURL;
    //     var imageUrl = urlCreator.createObjectURL(this.response);
    //     var tag = document.createElement('a');
    //     tag.href = imageUrl;
    //     tag.download = fileName;
    //     document.body.appendChild(tag);
    //     tag.click();
    //     document.body.removeChild(tag);
    // }
    // xhr.send();
  }

  isImage(link: string) {
    let extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.dib', '.jfif', '.tif', '.tiff'];
    let found = extensions.find(i => link.includes(i));
    return !!found;
  }
  //#endregion

}
