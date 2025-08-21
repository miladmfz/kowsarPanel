import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { KowsarWebApiService } from '../../../services/KowsarWebApi.service';
@Component({
  selector: 'app-good-test',
  templateUrl: './good-test.component.html',
  styleUrls: ['./good-test.component.css']

})
export class GoodTestComponent implements OnInit {

  barcodeControl = new FormControl('');
  barcodeList: BarcodeItem[] = [];  // Array to hold objects with BarCodeId and BarCode properties
  selectedBarcode: BarcodeItem | null = null;

  constructor(private repo: KowsarWebApiService,
  ) { }


  ngOnInit(): void {
    this.fetchBarcodes();
  }

  fetchBarcodes(): void {
    this.repo.GetBarcodeList("100")
      .subscribe((data: any) => {
        this.barcodeList = data.Barcodes;  // Store the list of barcode objects
      });
  }

  addBarcode(): void {
    const newBarcodeValue = this.barcodeControl.value;
    if (newBarcodeValue && !this.barcodeList.some(b => b.BarCode === newBarcodeValue)) {
      const newBarcodeItem: BarcodeItem = {
        BarCodeId: Date.now().toString(), // Generating a temporary ID
        GoodRef: "100",
        BarCode: newBarcodeValue
      };
      this.barcodeList.push(newBarcodeItem);
      this.barcodeControl.reset();
    }
  }

  selectBarcode(barcode: BarcodeItem): void {
    this.barcodeControl.reset();
    this.selectedBarcode = barcode;
  }

  removeSelectedBarcode(): void {
    if (this.selectedBarcode) {
      this.barcodeList = this.barcodeList.filter(b => b.BarCodeId !== this.selectedBarcode?.BarCodeId);
      this.selectedBarcode = null;
    }
  }
  onInputChange(): void {
    this.selectedBarcode = null
    // Triggered on each input change to control the visibility of the "Add" button
    // No additional code is needed here if `*ngIf="barcodeControl.value"` is used in the template.
  }
}




interface BarcodeItem {
  BarCodeId: string;
  GoodRef: string;
  BarCode: string;
}



