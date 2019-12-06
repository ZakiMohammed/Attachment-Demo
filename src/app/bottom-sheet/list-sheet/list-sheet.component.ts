import { Component, OnInit } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material';

@Component({
  selector: 'app-list-sheet',
  templateUrl: './list-sheet.component.html',
  styleUrls: ['./list-sheet.component.css']
})
export class ListSheetComponent implements OnInit {

  constructor(private _bottomSheetRef: MatBottomSheetRef<ListSheetComponent>) {}

  ngOnInit() {
  }

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

}
