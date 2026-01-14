import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';

export interface Employee {
  id: number;
  name: string;
  email: string;
  age: number;
  department: string;
  salary: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  // Mock data
  private mockEmployees: Employee[] = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', age: 32, department: 'Engineering', salary: 85000 },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', age: 28, department: 'Marketing', salary: 72000 },
    { id: 3, name: 'Bob Johnson', email: 'bob.johnson@example.com', age: 45, department: 'Sales', salary: 95000 },
    { id: 4, name: 'Alice Williams', email: 'alice.williams@example.com', age: 35, department: 'Engineering', salary: 92000 },
    { id: 5, name: 'Charlie Brown', email: 'charlie.brown@example.com', age: 29, department: 'Design', salary: 68000 },
    { id: 6, name: 'Diana Prince', email: 'diana.prince@example.com', age: 38, department: 'HR', salary: 78000 },
    { id: 7, name: 'Ethan Hunt', email: 'ethan.hunt@example.com', age: 42, department: 'Sales', salary: 105000 },
    { id: 8, name: 'Fiona Green', email: 'fiona.green@example.com', age: 31, department: 'Engineering', salary: 88000 },
    { id: 9, name: 'George Wilson', email: 'george.wilson@example.com', age: 26, department: 'Marketing', salary: 65000 },
    { id: 10, name: 'Hannah Lee', email: 'hannah.lee@example.com', age: 33, department: 'Design', salary: 71000 },
    { id: 11, name: 'Ian McKellen', email: 'ian.mckellen@example.com', age: 50, department: 'Engineering', salary: 110000 },
    { id: 12, name: 'Julia Roberts', email: 'julia.roberts@example.com', age: 39, department: 'Marketing', salary: 82000 },
    { id: 13, name: 'Kevin Hart', email: 'kevin.hart@example.com', age: 34, department: 'Sales', salary: 89000 },
    { id: 14, name: 'Laura Palmer', email: 'laura.palmer@example.com', age: 27, department: 'Design', salary: 69000 },
    { id: 15, name: 'Michael Scott', email: 'michael.scott@example.com', age: 44, department: 'HR', salary: 95000 }
  ];

  // Signals for state management
  employees = signal<Employee[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  // Simulate API call with delay and search parameters
  getEmployees(searchParams?: { name?: string; department?: string; salary?: number }): Observable<Employee[]> {
    let filteredEmployees = [...this.mockEmployees];

    // Apply filters if search params are provided
    if (searchParams) {
      if (searchParams.name) {
        const searchName = searchParams.name.toLowerCase();
        filteredEmployees = filteredEmployees.filter(emp =>
          emp.name.toLowerCase().includes(searchName)
        );
      }

      if (searchParams.department) {
        const searchDept = searchParams.department.toLowerCase();
        filteredEmployees = filteredEmployees.filter(emp =>
          emp.department.toLowerCase().includes(searchDept)
        );
      }

    }

    // Simulate network delay of 1 second
    return of(filteredEmployees).pipe(delay(1000));
  }

  // Load employees and update signals with optional search parameters
  loadEmployees(searchParams?: { name?: string; department?: string; salary?: number }) {
    this.loading.set(true);
    this.error.set(null);

    this.getEmployees(searchParams).subscribe({
      next: (data) => {
        this.employees.set(data);
        this.loading.set(false);
        console.log('Loaded employees from API:', data);
      },
      error: (err) => {
        this.error.set('Failed to load employees');
        this.loading.set(false);
        console.error('Error loading employees:', err);
      }
    });
  }

  // Delete employees by IDs
  deleteEmployees(ids: number[]): Observable<boolean> {
    // Simulate API call
    return of(true).pipe(
      delay(500),
      // In real implementation, this would be:
      // return this.http.post<boolean>('https://api.example.com/employees/delete', { ids })
    );
  }

  // Delete employees and update state
  deleteEmployeesFromState(ids: number[]) {
    this.loading.set(true);
    this.deleteEmployees(ids).subscribe({
      next: () => {
        // Remove deleted employees from mock data
        this.mockEmployees = this.mockEmployees.filter(emp => !ids.includes(emp.id));

        // Update employees signal by filtering out deleted ones
        const updatedEmployees = this.employees().filter(emp => !ids.includes(emp.id));
        this.employees.set(updatedEmployees);

        this.loading.set(false);
        console.log('Deleted employees with IDs:', ids);
      },
      error: (err) => {
        this.error.set('Failed to delete employees');
        this.loading.set(false);
        console.error('Error deleting employees:', err);
      }
    });
  }

  // Update employee
  updateEmployee(employee: Employee): Observable<Employee> {
    // Simulate API call
    return of(employee).pipe(
      delay(500),
      // In real implementation:
      // return this.http.put<Employee>(`https://api.example.com/employees/${employee.id}`, employee)
    );
  }

  // Update employee and refresh state
  updateEmployeeInState(employee: Employee) {
    this.loading.set(true);
    this.updateEmployee(employee).subscribe({
      next: (updatedEmployee) => {
        // Update in mock data
        const index = this.mockEmployees.findIndex(emp => emp.id === updatedEmployee.id);
        if (index !== -1) {
          this.mockEmployees[index] = updatedEmployee;
        }

        // Update in employees signal
        const updatedEmployees = this.employees().map(emp =>
          emp.id === updatedEmployee.id ? updatedEmployee : emp
        );
        this.employees.set(updatedEmployees);

        this.loading.set(false);
        console.log('Updated employee:', updatedEmployee);
      },
      error: (err) => {
        this.error.set('Failed to update employee');
        this.loading.set(false);
        console.error('Error updating employee:', err);
      }
    });
  }

  // You can also use a real API endpoint like this:
  // getEmployees(): Observable<Employee[]> {
  //   return this.http.get<Employee[]>('https://api.example.com/employees');
  // }
}
