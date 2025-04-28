import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DashboardService } from './dahsboard.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class DashboardComponent {
  form: FormGroup;

  // Dropdown options
  jUnitsOptions = [
    'kg*m^2',
    'kgf*m^2 GD2',
    'kgf*m^2 WD2',
    'lbf*ft*s^2',
    'lbf*in*s^2',
    'ft*lbf*s^2',
    'in*lbf*s^2',
    'lbm*ft^2',
    'lbm*in^2'
  ];

  kUnitsOptions = [
    'N*m/rad',
    'kgg*m/rad',
    'lbf*ft/rad',
    'lbf*in/rad'
  ];

  dUnitsOptions = [
    'N*m*s/rad',
    'kgg*m*s/rad',
    'lbf*ft*s/rad',
    'lbf*in*s/rad'
  ];
  dtypeOptions=[
    '1',
    '2'
  ]
errorMessage: any;

constructor(private fb: FormBuilder, private http: HttpClient, private dashboardService: DashboardService) {
  this.form = this.fb.group({
    no_of_masses: [''],
    elnames: this.fb.array([]), // Initialize empty
    js: this.fb.array([]),      // Initialize empty
    ks: this.fb.array([]),      // Initialize empty
    ds: this.fb.array(Array.from({ length: 2 }, () => this.fb.control(null))),
    basicInfo: this.fb.group({
      name: [''],
      mva: [null],
      fnom: [null],
      p: [null],
      gen_type: [''],
      date: [null]
    }),
    units: this.fb.group({
      jUnits: [''],
      kUnits: [''],
      dUnits: ['']
    }),
    genExc: this.fb.group({
      gen: [null],
      exc: [null],
      dtype: ['']
    })
  });
}

ngOnInit() {
  this.setupFormListeners();
}

private setupFormListeners() {
  this.form.get('no_of_masses')?.valueChanges.subscribe(value => {
    const n = parseInt(value, 10);
    if (!isNaN(n) && n >= 1) {
      this.updateFormArrays(n);
    } else {
      this.clearFormArrays();
    }
  });
}

private updateFormArrays(n: number) {
  this.resizeFormArray(this.elnames, n, () => this.fb.control(''));
  this.resizeFormArray(this.js, n, () => this.fb.control(null));
  const ksLength = Math.max(n - 1, 0);
  this.resizeFormArray(this.ks, ksLength, () => this.fb.control(null));
}

private resizeFormArray(formArray: FormArray, newLength: number, createControl: () => FormControl) {
  const currentLength = formArray.length;
  if (newLength > currentLength) {
    for (let i = currentLength; i < newLength; i++) {
      formArray.push(createControl());
    }
  } else {
    for (let i = currentLength - 1; i >= newLength; i--) {
      formArray.removeAt(i);
    }
  }
}

private clearFormArrays() {
  this.elnames.clear();
  this.js.clear();
  this.ks.clear();
}


  get elnames() {
    return this.form.get('elnames') as FormArray;
  }

  get js() {
    return this.form.get('js') as FormArray;
  }
  get ks() {
    return this.form.get('ks') as FormArray;
  }
  get ds() {
    return this.form.get('ds') as FormArray;
  }
  getElnameControl(index: number): FormControl {
    return this.elnames.at(index) as FormControl;
  }

  getJControl(index: number): FormControl {
    return this.js.at(index) as FormControl;
  }
  getKControl(index: number): FormControl {
    return this.ks.at(index) as FormControl;
  }
  getDControl(index: number): FormControl {
    return this.ds.at(index) as FormControl;
  }
  onSubmit() {
    const formData = this.form.value;
    this.dashboardService.generateReport(formData).subscribe({
      next: (response: Blob) => {
        const filename = `${formData.basicInfo.name}_${new Date().toISOString()}.txt`;
        this.dashboardService.handleDownload(response, filename);
      },
      error: async (error) => {
        const errorMessage = await this.dashboardService.handleError(error);
        alert(`Error: ${errorMessage}`);
      }
    });
  }
}