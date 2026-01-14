import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, ModuleRegistry, AllCommunityModule, themeQuartz, SelectionChangedEvent } from 'ag-grid-community';
import { EmployeeService } from '../services/employee.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [AgGridAngular, CommonModule, FormsModule],
  templateUrl: './data-grid.component.html',
  styleUrl: './data-grid.component.css'
})
export class DataGridComponent implements OnInit {
  // Modern dependency injection with inject()
  private employeeService = inject(EmployeeService);

  // Theme configuration (new v33+ Theming API)
  theme = themeQuartz;

  // Row selection configuration (new v32+ API)
  rowSelection: any = {
    mode: 'multiRow',
    checkboxes: true,
    headerCheckbox: true
  };

  // Search form signals
  searchName = signal('');
  searchDepartment = signal('');
  searchSalary = signal<number | null>(null);

  // Signals for reactive state management
  selectedRowsCount = signal(0);
  selectedRows = signal<any[]>([]);

  // Edit mode
  isEditMode = signal(false);
  editingEmployee = signal<any | null>(null);

  // Access service signals directly
  employees = this.employeeService.employees;
  loading = this.employeeService.loading;
  error = this.employeeService.error;

  // Computed signal example - derive values from other signals
  employeeCount = computed(() => this.employees().length);
  hasData = computed(() => this.employees().length > 0);

  // Handle selection change
  onSelectionChanged(event: SelectionChangedEvent) {
    const rows = event.api.getSelectedRows();
    this.selectedRows.set(rows);
    this.selectedRowsCount.set(rows.length);
    console.log('Selected rows:', rows);
    console.log('Total selected:', this.selectedRowsCount());
  }

  // Column definitions
  colDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Name', filter: true },
    { field: 'email', headerName: 'Email', filter: true },
    { field: 'age', headerName: 'Age', width: 100 },
    { field: 'department', headerName: 'Department', filter: true },
    { field: 'salary', headerName: 'Salary', valueFormatter: (params) => `$${params.value.toLocaleString()}` }
  ];

  // Default column definitions
  defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    flex: 1
  };

  ngOnInit() {
    this.employeeService.loadEmployees();
  }

  // Handle search
  onSearch() {
    const searchParams = {
      name: this.searchName(),
      department: this.searchDepartment(),
      salary: this.searchSalary() || undefined
    };

    console.log('Searching with params:', searchParams);
    this.employeeService.loadEmployees(searchParams);
  }

  // Clear search
  onClearSearch() {
    this.searchName.set('');
    this.searchDepartment.set('');
    this.searchSalary.set(null);
    this.employeeService.loadEmployees();
  }

  // Delete selected employees
  onDelete() {
    const selected = this.selectedRows();
    if (selected.length === 0) {
      alert('Please select at least one employee to delete');
      return;
    }

    const confirmed = confirm(`Are you sure you want to delete ${selected.length} employee(s)?`);
    if (confirmed) {
      const ids = selected.map(emp => emp.id);
      this.employeeService.deleteEmployeesFromState(ids);

      // Clear selection
      this.selectedRows.set([]);
      this.selectedRowsCount.set(0);
    }
  }

  // Edit selected employee
  onEdit() {
    const selected = this.selectedRows();
    if (selected.length === 0) {
      alert('Please select one employee to edit');
      return;
    }
    if (selected.length > 1) {
      alert('Please select only one employee to edit');
      return;
    }

    // Set edit mode and copy the employee data
    this.editingEmployee.set({ ...selected[0] });
    this.isEditMode.set(true);
  }

  // Cancel edit
  onCancelEdit() {
    this.isEditMode.set(false);
    this.editingEmployee.set(null);
  }

  // Save edited employee
  onSaveEdit() {
    const employee = this.editingEmployee();
    if (!employee) return;

    // Validate
    if (!employee.name || !employee.email || !employee.department) {
      alert('Please fill in all required fields');
      return;
    }

    this.employeeService.updateEmployeeInState(employee);
    this.isEditMode.set(false);
    this.editingEmployee.set(null);

    // Clear selection
    this.selectedRows.set([]);
    this.selectedRowsCount.set(0);
  }

  // Update editing employee field
  updateEditField(field: string, value: any) {
    const employee = this.editingEmployee();
    if (employee) {
      this.editingEmployee.set({ ...employee, [field]: value });
    }
  }
}
