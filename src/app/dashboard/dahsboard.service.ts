import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) { }

  generateReport(formData: any) {
    return this.http.post('http://localhost:5000/api/endpoint', formData, {
      responseType: 'blob'
    });
  }

  handleDownload(blob: Blob, filename: string) {
    saveAs(blob, filename);
  }

  async handleError(error: any) {
    try {
      const errorText = await error.error.text();
      const errorMessage = JSON.parse(errorText).message;
      return errorMessage;
    } catch (e) {
      return 'Unknown error occurred';
    }
  }
}