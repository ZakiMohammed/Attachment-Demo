import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './modules/material/material.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MaterialFileUploadComponent } from './material-file-upload/material-file-upload.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { DeleteDialogComponent } from './dialog/delete-dialog/delete-dialog.component';
import { FooFileUploadComponent } from './child/foo-file-upload/foo-file-upload.component';
import { ListSheetComponent } from './bottom-sheet/list-sheet/list-sheet.component';

@NgModule({
  declarations: [
    AppComponent,
    MaterialFileUploadComponent,
    FileUploadComponent,
    DeleteDialogComponent,
    FooFileUploadComponent,
    ListSheetComponent
  ],
  entryComponents: [DeleteDialogComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
